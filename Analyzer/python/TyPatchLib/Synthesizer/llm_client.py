from __future__ import annotations
import json
import os
import re
import time
import urllib.parse
from typing import Any, Callable, Dict, List, Optional, Protocol, Tuple

# Global token usage tracker.
# Field mapping to the caller-facing schema: input=prompt_tokens,
# output=completion_tokens, total=total_tokens, cache=cached_tokens.
# cached_tokens stays 0 when the provider does not report a cache figure;
# it is never fabricated.
_usage_stats = {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "cached_tokens": 0,
    "total_tokens": 0,
    "calls": 0,
}
_provider_receipts: List[Dict[str, Any]] = []


def get_usage_stats() -> dict:
    """Return accumulated token usage since process start."""
    return dict(_usage_stats)


def get_provider_receipts(start: int = 0) -> list[dict[str, Any]]:
    """Return sanitized provider receipts accumulated since *start*."""
    return [dict(item) for item in _provider_receipts[start:]]


def get_provider_receipt_count() -> int:
    return len(_provider_receipts)


def reset_usage_stats() -> None:
    """Reset accumulated token usage."""
    _usage_stats["prompt_tokens"] = 0
    _usage_stats["completion_tokens"] = 0
    _usage_stats["cached_tokens"] = 0
    _usage_stats["total_tokens"] = 0
    _usage_stats["calls"] = 0
    _provider_receipts.clear()


Message = Dict[str, str]
TextCompleter = Callable[[List[Message]], str]
JSONCompleter = Callable[[List[Message], Dict[str, Any]], Any]


class LLMBase(Protocol):
    def complete_text(self, messages: List[Message]) -> str:
        ...

    def complete_json(self, messages: List[Message], schema: Dict[str, Any]) -> Any:
        ...


class LLMError(RuntimeError):
    """Raised when the SDK is unavailable or returns malformed output."""


def _record_anthropic_usage(response: Any, *, elapsed_ms: int) -> None:
    """Record a sanitized native Anthropic Messages API receipt."""
    usage = getattr(response, "usage", None)
    input_tokens = int(getattr(usage, "input_tokens", 0) or 0)
    cache_creation = int(
        getattr(usage, "cache_creation_input_tokens", 0) or 0
    )
    cache_read = int(getattr(usage, "cache_read_input_tokens", 0) or 0)
    output_tokens = int(getattr(usage, "output_tokens", 0) or 0)
    prompt_tokens = input_tokens + cache_creation + cache_read

    _usage_stats["calls"] += 1
    _usage_stats["prompt_tokens"] += prompt_tokens
    _usage_stats["completion_tokens"] += output_tokens
    _usage_stats["cached_tokens"] += cache_read
    _usage_stats["total_tokens"] += prompt_tokens + output_tokens

    _provider_receipts.append(
        {
            "provider": "anthropic_messages",
            "model": str(getattr(response, "model", "") or ""),
            "duration_ms": elapsed_ms,
            "stop_reason": str(getattr(response, "stop_reason", "") or ""),
            # The native response contains token accounting but no price.
            # Keep this explicitly unknown rather than fabricating a zero.
            "cost_usd": None,
            "usage": {
                "input_tokens": input_tokens,
                "cache_creation_input_tokens": cache_creation,
                "cache_read_input_tokens": cache_read,
                "output_tokens": output_tokens,
                "total_input_tokens": prompt_tokens,
                "total_tokens": prompt_tokens + output_tokens,
            },
            "service_tier": str(getattr(usage, "service_tier", "") or ""),
        }
    )


class AnthropicMessagesLLM:
    """Native Anthropic Messages API transport for rule synthesis."""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str = "claude-opus-4-8",
        timeout: float = 600.0,
        effort: str = "max",
        max_tokens: int = 32000,
        max_retries: int = 2,
        client: Any = None,
    ):
        if client is None:
            try:
                import anthropic  # type: ignore
            except ImportError as exc:
                raise LLMError(
                    "anthropic package not importable; install anthropic>=0.96"
                ) from exc
            client = anthropic.Anthropic(
                base_url=base_url.rstrip("/"),
                api_key=api_key,
                timeout=timeout,
                max_retries=max_retries,
            )
        self.client = client
        self.model = model
        self.timeout = timeout
        self.effort = effort
        self.max_tokens = max_tokens

    @classmethod
    def from_env(cls) -> "AnthropicMessagesLLM":
        api_key = os.environ.get("ANTHROPIC_API_KEY") or os.environ.get(
            "ANTHROPIC_AUTH_TOKEN"
        )
        base_url = os.environ.get("ANTHROPIC_BASE_URL")
        if not api_key:
            raise LLMError("ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN is required")
        if not base_url:
            raise LLMError("ANTHROPIC_BASE_URL is required")
        return cls(
            base_url=base_url,
            api_key=api_key,
            model=os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-8"),
            timeout=float(os.environ.get("ANTHROPIC_TIMEOUT_SEC", "600")),
            effort=os.environ.get("ANTHROPIC_EFFORT", "max"),
            max_tokens=int(os.environ.get("ANTHROPIC_MAX_TOKENS", "32000")),
            max_retries=int(os.environ.get("ANTHROPIC_MAX_RETRIES", "2")),
        )

    @staticmethod
    def _split_messages(messages: List[Message]) -> tuple[str, list[dict[str, str]]]:
        system_parts: List[str] = []
        conversation: list[dict[str, str]] = []
        for message in messages:
            role = str(message.get("role", "user"))
            content = message.get("content", "")
            text = content if isinstance(content, str) else str(content)
            if role == "system":
                system_parts.append(text)
            else:
                api_role = "assistant" if role == "assistant" else "user"
                if conversation and conversation[-1]["role"] == api_role:
                    conversation[-1]["content"] += "\n\n" + text
                else:
                    conversation.append({"role": api_role, "content": text})
        if not conversation:
            conversation.append({"role": "user", "content": "Continue."})
        return "\n\n".join(system_parts), conversation

    def _invoke(
        self,
        messages: List[Message],
        *,
        schema: Optional[Dict[str, Any]] = None,
    ) -> Any:
        system_prompt, conversation = self._split_messages(messages)
        if schema is not None:
            system_prompt += (
                "\n\nIMPORTANT: Return ONLY valid JSON matching this JSON "
                "Schema. Do not include prose, markdown fences, comments, or "
                "reasoning text.\nJSON Schema:\n"
                + json.dumps(schema, separators=(",", ":"))
            )
        kwargs: Dict[str, Any] = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "messages": conversation,
            "output_config": {"effort": self.effort},
        }
        if system_prompt:
            # Only the constant system/schema prefix is cached; the commit
            # patch remains ordinary per-request input.
            kwargs["system"] = [
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral", "ttl": "1h"},
                }
            ]
        started = time.monotonic()
        try:
            response = self.client.messages.create(**kwargs)
        except Exception as exc:
            detail = re.sub(
                r'(?i)(request_id|session_id|uuid)["\\:= ]+[A-Za-z0-9_-]+',
                r"\1=<redacted>",
                str(exc),
            )[-1000:]
            raise LLMError(f"Anthropic Messages API failed: {detail}") from exc
        elapsed_ms = int((time.monotonic() - started) * 1000)
        resolved_model = str(getattr(response, "model", "") or "")
        if resolved_model != self.model:
            raise LLMError(
                "Anthropic model receipt mismatch: requested "
                f"{self.model!r}, observed {resolved_model!r}"
            )
        _record_anthropic_usage(response, elapsed_ms=elapsed_ms)
        return response

    @staticmethod
    def _text(response: Any) -> str:
        parts = [
            str(getattr(block, "text", ""))
            for block in (getattr(response, "content", None) or [])
            if getattr(block, "type", None) == "text"
        ]
        text = "".join(parts)
        if not text.strip():
            raise LLMError("Anthropic Messages API returned no text content")
        return text

    def complete_text(self, messages: List[Message]) -> str:
        return self._text(self._invoke(messages))

    def complete_json(self, messages: List[Message], schema: Dict[str, Any]) -> Any:
        raw = self._text(self._invoke(messages, schema=schema))
        return _parse_json_text(raw, error_context="Anthropic JSON instruction")


def _normalize_openai_base_url(base_url: Optional[str]) -> Optional[str]:
    """Accept either an SDK base URL or a copied endpoint URL from .env files."""
    if not base_url:
        return base_url
    normalized = base_url.rstrip("/")
    for suffix in ("/chat/completions", "/responses"):
        if normalized.endswith(suffix):
            normalized = normalized[: -len(suffix)]
            break
    parsed = urllib.parse.urlparse(normalized)
    if parsed.scheme and parsed.netloc and parsed.path in {"", "/"}:
        return normalized + "/v1"
    return normalized


def _get_openai_class() -> Any:
    try:
        import openai  # type: ignore
    except ImportError as exc:
        raise LLMError(
            "openai package not importable; install it with `pip install 'openai>=1.0'`"
        ) from exc
    if openai is None:
        raise LLMError("openai package not importable (sys.modules entry is None)")
    return openai.OpenAI


def _join_content_blocks(blocks: List[Any]) -> str:
    parts: List[str] = []
    for block in blocks:
        if isinstance(block, str):
            parts.append(block)
            continue
        if isinstance(block, dict):
            text = block.get("text") or block.get("content")
            if isinstance(text, str):
                parts.append(text)
            continue
        text = getattr(block, "text", None) or getattr(block, "content", None)
        if isinstance(text, str):
            parts.append(text)
    return "\n".join(parts)


def _is_retryable_llm_error(exc: Exception) -> bool:
    text = str(exc).lower()
    return any(
        token in text
        for token in (
            "429",
            "500",
            "502",
            "503",
            "504",
            "rate limit",
            "temporarily unavailable",
            "connection error",
            "connection reset",
            "connection aborted",
            "remote protocol error",
            "timeout",
            "timed out",
        )
    )


def _is_retryable_responses_body_error(exc: Exception) -> bool:
    text = str(exc).lower()
    return any(
        token in text
        for token in (
            "empty content",
            "invalid json",
            "json decode",
            "jsondecodeerror",
            "expecting value",
            "could not parse",
            "failed to parse",
        )
    )


def _field(obj: Any, name: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(name, default)
    return getattr(obj, name, default)


_INVALID_JSON_ESCAPE_RE = re.compile(r'\\([^"\\/bfnrtu])')


def repair_invalid_json_escapes(text: str) -> str:
    """Drop backslashes before invalid JSON escape chars (e.g. LLM-emitted \\*).

    Valid escapes (\\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX) are preserved.
    """
    return _INVALID_JSON_ESCAPE_RE.sub(r'\1', text)


def _loads_tolerant(text: str) -> Any:
    """json.loads with a second attempt after repairing invalid escapes."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return json.loads(repair_invalid_json_escapes(text))


def _match_balanced_object(text: str, start: int) -> int:
    """Return the index just past the balanced {...} beginning at text[start].

    Brace counting is string-aware (ignores braces inside JSON string literals,
    respecting backslash escapes). Returns -1 if the object never closes.
    """
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        c = text[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
    return -1


def _iter_balanced_objects(text: str):
    """Yield every balanced {...} substring in *text* (attempting a match from
    each opening brace).

    Matching from every '{' — rather than only depth-0 positions — survives
    reasoning models that emit a markdown heading + JSON + trailing prose
    (GPT-5.5 on the /responses gateway), where the answer object is neither at
    end-of-string nor fenced, and a stray unmatched brace in the prose must not
    shadow the real object.
    """
    i = 0
    n = len(text)
    while i < n:
        if text[i] == "{":
            end = _match_balanced_object(text, i)
            if end != -1:
                yield text[i:end]
        i += 1


def _parse_json_text(raw: str, *, error_context: str = "json_schema") -> Any:
    try:
        return _loads_tolerant(raw)
    except json.JSONDecodeError:
        import re
        # Strip reasoning model thinking tags (e.g. MiniMax-M3 <think>...</think>)
        stripped = re.sub(r'<think>[\s\S]*?</think>\s*', '', raw).strip()
        if stripped:
            try:
                return _loads_tolerant(stripped)
            except json.JSONDecodeError:
                pass
        # Reasoning models may wrap JSON in prose. Extract the last object/array.
        m = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])\s*$', stripped or raw)
        if m:
            try:
                return _loads_tolerant(m.group(1))
            except json.JSONDecodeError:
                pass
        # Try any fenced code block.
        m2 = re.search(r'```(?:json)?\s*([\s\S]*?)```', raw)
        if m2:
            try:
                return _loads_tolerant(m2.group(1).strip())
            except json.JSONDecodeError:
                pass
        # Balanced-brace scan: reasoning models (GPT-5.5 on /responses) emit a
        # markdown heading + JSON + trailing prose, so the answer object is not
        # anchored to end-of-string and the fenced/greedy strategies miss it.
        # Collect every top-level {...} that parses and keep the largest dict
        # (the full answer object, not a nested fragment).
        best: Any = None
        best_len = -1
        for cand in _iter_balanced_objects(stripped or raw):
            try:
                obj = _loads_tolerant(cand)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict) and len(cand) > best_len:
                best, best_len = obj, len(cand)
        if best is not None:
            return best
        if raw.lstrip().lower().startswith("<!doctype html") or raw.lstrip().lower().startswith("<html"):
            raise LLMError(
                "LLM endpoint returned HTML; check OPENAI_BASE_URL/BASE_URL "
                "and use an OpenAI-compatible API base such as .../v1"
            )
        raise LLMError(f"non-JSON despite {error_context}: {raw[:200]}")


def _responses_input(messages: List[Message]) -> List[Dict[str, str]]:
    converted: List[Dict[str, str]] = []
    for message in messages:
        content = message.get("content", "")
        converted.append({
            "role": message.get("role", "user"),
            "content": content if isinstance(content, str) else str(content),
        })
    return converted


def _messages_with_json_instruction(
    messages: List[Message],
    schema: Dict[str, Any],
) -> List[Message]:
    copied = [dict(message) for message in messages]
    schema_text = json.dumps(schema, separators=(",", ":"))
    instruction = (
        "\n\nIMPORTANT: Return ONLY valid JSON matching this JSON Schema. "
        "Do not include prose, markdown fences, comments, or reasoning text.\n"
        f"JSON Schema:\n{schema_text}"
    )
    for idx in range(len(copied) - 1, -1, -1):
        if copied[idx].get("role") == "user":
            copied[idx]["content"] = copied[idx].get("content", "") + instruction
            return copied
    copied.append({"role": "user", "content": instruction.strip()})
    return copied


def _responses_text(resp: Any) -> str:
    parts: List[str] = []
    output = _field(resp, "output") or []
    if not isinstance(output, (list, tuple)):
        output = []
    for item in output:
        if _field(item, "type") != "message":
            continue
        content = _field(item, "content") or []
        if not isinstance(content, (list, tuple)):
            continue
        for block in content:
            if _field(block, "type") != "output_text":
                continue
            text = _field(block, "text")
            if isinstance(text, str):
                parts.append(text)
    if parts:
        return "".join(parts)
    output_text = _field(resp, "output_text")
    return output_text if isinstance(output_text, str) else ""


def _extract_cached_tokens(usage: Any) -> int:
    """Read cached/prompt-cache-hit tokens across OpenAI-compatible providers.

    Returns 0 when the provider reports no cache figure; the value is never
    fabricated. Handles OpenAI/DashScope (``prompt_tokens_details.cached_tokens``)
    and DeepSeek (``prompt_cache_hit_tokens``).
    """
    if usage is None:
        return 0
    details = _field(usage, "prompt_tokens_details")
    if details is not None:
        cached = _field(details, "cached_tokens")
        if cached:
            return int(cached)
    hit = _field(usage, "prompt_cache_hit_tokens")
    if hit:
        return int(hit)
    return 0


def _record_responses_usage(resp: Any) -> None:
    _usage_stats["calls"] += 1
    usage = _field(resp, "usage")
    if usage is None:
        return
    prompt_tokens = _field(usage, "prompt_tokens")
    if prompt_tokens is None:
        prompt_tokens = _field(usage, "input_tokens", 0)
    completion_tokens = _field(usage, "completion_tokens")
    if completion_tokens is None:
        completion_tokens = _field(usage, "output_tokens", 0)
    _usage_stats["prompt_tokens"] += prompt_tokens or 0
    _usage_stats["completion_tokens"] += completion_tokens or 0
    _usage_stats["cached_tokens"] += _extract_cached_tokens(usage)
    _usage_stats["total_tokens"] += _field(usage, "total_tokens", 0) or 0


def make_openai_completers(
    *,
    base_url: Optional[str] = None,
    api_key: Optional[str] = None,
    model: str = "gpt-4o-mini",
    temperature: float = 0.0,
    seed: Optional[int] = 42,
    timeout: float = 120.0,
    max_retries: int = 2,
    retry_backoff: float = 2.0,
    reasoning_effort: Optional[str] = None,
    api_style: str = "chat",
    stream: bool = False,
) -> Tuple[TextCompleter, JSONCompleter]:
    """Build text and JSON completers backed by the OpenAI SDK.

    ``reasoning_effort`` (when set) is forwarded to the API. Some reasoning
    models behind OpenAI-compatible gateways only surface the final message
    content at lower effort levels (heavy reasoning can leave content empty),
    so this knob lets a caller cap effort to keep responses usable.

    ``api_style`` selects the transport: ``"chat"`` (default) uses
    ``chat.completions``; ``"responses"`` uses the native ``/responses`` endpoint
    (needed for gateways that only serialize the message output item when the
    model emits no reasoning content — see ``_create_responses_completion``).
    """
    api_style = (api_style or "chat").strip().lower()
    if api_style not in {"chat", "responses"}:
        raise LLMError("OPENAI_API_STYLE must be 'chat' or 'responses'")

    openai_cls = _get_openai_class()
    base_url = _normalize_openai_base_url(base_url)
    client = openai_cls(base_url=base_url, api_key=api_key, timeout=timeout)

    def _content(resp: Any) -> str:
        content: Any = None
        try:
            if isinstance(resp, str):
                content = resp
            elif isinstance(resp, dict):
                choices = resp.get("choices") or []
                if choices:
                    message = choices[0].get("message", {})
                    content = message.get("content") or message.get("reasoning_content")
                else:
                    content = resp.get("output_text")
            else:
                choices = getattr(resp, "choices", None)
                if choices:
                    msg = choices[0].message
                    content = msg.content or getattr(msg, "reasoning_content", None)
                else:
                    content = getattr(resp, "output_text", None)
        except (AttributeError, IndexError, KeyError, TypeError) as exc:
            raise LLMError(
                f"invalid chat completion response shape: {type(resp).__name__}"
            ) from exc
        if content is None:
            raise LLMError(f"LLM returned empty content: {type(resp).__name__}")
        if isinstance(content, list):
            content = _join_content_blocks(content)
        if not isinstance(content, str):
            raise LLMError(
                f"LLM returned non-text content: {type(content).__name__}"
            )
        return content

    def _consume_stream(resp: Any) -> Dict[str, Any]:
        # Accumulate a streamed chat completion into a plain dict shaped like a
        # non-streamed response so the rest of the pipeline is unchanged. Some
        # OpenAI-compatible gateways (e.g. ryugroup) require stream=true and
        # reject non-streamed calls with HTTP 400 "Stream must be set to true".
        content_parts: List[str] = []
        reasoning_parts: List[str] = []
        usage_dict: Optional[Dict[str, Any]] = None
        for chunk in resp:
            u = getattr(chunk, "usage", None)
            if u is not None:
                usage_dict = {
                    "prompt_tokens": getattr(u, "prompt_tokens", 0) or 0,
                    "completion_tokens": getattr(u, "completion_tokens", 0) or 0,
                    "cached_tokens": _extract_cached_tokens(u),
                    "total_tokens": getattr(u, "total_tokens", 0) or 0,
                }
            choices = getattr(chunk, "choices", None) or []
            if not choices:
                continue
            delta = getattr(choices[0], "delta", None)
            if delta is None:
                continue
            piece = getattr(delta, "content", None)
            if piece:
                content_parts.append(piece)
            rpiece = getattr(delta, "reasoning_content", None)
            if rpiece:
                reasoning_parts.append(rpiece)
        message: Dict[str, Any] = {"content": "".join(content_parts)}
        if reasoning_parts and not content_parts:
            message["reasoning_content"] = "".join(reasoning_parts)
        out: Dict[str, Any] = {"choices": [{"message": message}]}
        if usage_dict is not None:
            out["usage"] = usage_dict
        return out

    def _create_chat_completion(kwargs: Dict[str, Any]) -> Any:
        for attempt in range(max_retries + 1):
            try:
                resp = client.chat.completions.create(**kwargs)
                if kwargs.get("stream"):
                    resp = _consume_stream(resp)
                # Track token usage
                _usage_stats["calls"] += 1
                usage = getattr(resp, "usage", None)
                if usage:
                    _usage_stats["prompt_tokens"] += getattr(usage, "prompt_tokens", 0) or 0
                    _usage_stats["completion_tokens"] += getattr(usage, "completion_tokens", 0) or 0
                    _usage_stats["cached_tokens"] += _extract_cached_tokens(usage)
                    _usage_stats["total_tokens"] += getattr(usage, "total_tokens", 0) or 0
                elif isinstance(resp, dict) and "usage" in resp:
                    u = resp["usage"]
                    _usage_stats["prompt_tokens"] += u.get("prompt_tokens", 0)
                    _usage_stats["completion_tokens"] += u.get("completion_tokens", 0)
                    _usage_stats["cached_tokens"] += _extract_cached_tokens(u)
                    _usage_stats["total_tokens"] += u.get("total_tokens", 0)
                return resp
            except Exception as exc:
                if attempt >= max_retries or not _is_retryable_llm_error(exc):
                    raise
                time.sleep(retry_backoff * (2 ** attempt))
        raise LLMError("unreachable retry state")

    def _create_responses_completion(messages: List[Message]) -> str:
        body: Dict[str, Any] = {
            "model": model,
            "input": _responses_input(messages),
            # This gateway loses the message output as soon as reasoning items
            # appear, so cap effort to keep content serializable. temperature/seed
            # are intentionally omitted (reasoning models often reject them).
            "reasoning": {"effort": reasoning_effort or "low"},
        }
        for attempt in range(max_retries + 1):
            try:
                resp = client.post("/responses", cast_to=object, body=body)
                _record_responses_usage(resp)
                content = _responses_text(resp)
                if content.strip():
                    return content
                raise LLMError("LLM returned empty content: responses")
            except Exception as exc:
                if attempt >= max_retries or not (
                    _is_retryable_llm_error(exc)
                    or _is_retryable_responses_body_error(exc)
                ):
                    raise
                time.sleep(retry_backoff * (2 ** attempt))
        raise LLMError("unreachable retry state")

    def complete_text(messages: List[Message]) -> str:
        if api_style == "responses":
            try:
                return _create_responses_completion(messages)
            except LLMError:
                raise
            except Exception as exc:
                raise LLMError(str(exc)) from exc
        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if stream:
            kwargs["stream"] = True
            kwargs["stream_options"] = {"include_usage": True}
        if seed is not None:
            kwargs["seed"] = seed
        if reasoning_effort:
            kwargs.setdefault("extra_body", {})["reasoning_effort"] = reasoning_effort
        try:
            return _content(_create_chat_completion(kwargs))
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc)) from exc

    def complete_json(messages: List[Message], schema: Dict[str, Any]) -> Any:
        if api_style == "responses":
            # /responses on this gateway does not honor json_schema response
            # format; ask for JSON in-prompt and parse tolerantly.
            try:
                raw = _create_responses_completion(
                    _messages_with_json_instruction(messages, schema)
                )
                return _parse_json_text(raw, error_context="responses JSON instruction")
            except LLMError:
                raise
            except Exception as exc:
                raise LLMError(str(exc)) from exc

        # DeepSeek's official API accepts json_schema with HTTP 200 but does
        # NOT enforce it — the model emits wrong-schema JSON (observed:
        # sub-structure objects, or {"verdict": ..., "fix_hint": ...} with the
        # remaining required keys dropped). Route it to json_object mode with
        # the schema stated in-prompt, which DeepSeek does honor.
        if "deepseek" in model.lower():
            request_messages = _messages_with_json_instruction(messages, schema)
            response_format: Dict[str, Any] = {"type": "json_object"}
        else:
            request_messages = messages
            response_format = {
                "type": "json_schema",
                "json_schema": {
                    "name": "synth_output",
                    "strict": False,
                    "schema": schema,
                },
            }
        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": request_messages,
            "temperature": temperature,
            "response_format": response_format,
        }
        if stream:
            kwargs["stream"] = True
            kwargs["stream_options"] = {"include_usage": True}
        # For reasoning models, split thinking from content
        if "minimax" in model.lower() or "MiniMax" in model:
            kwargs["extra_body"] = {"reasoning_split": True}
        if seed is not None:
            kwargs["seed"] = seed
        if reasoning_effort:
            kwargs.setdefault("extra_body", {})["reasoning_effort"] = reasoning_effort
        try:
            raw = _content(_create_chat_completion(kwargs))
        except Exception as exc:
            exc_str = str(exc)
            # Fallback: some providers (e.g. DeepSeek) don't support json_schema
            # response_format — retry without it and extract JSON from text.
            if "response_format" in exc_str or ("400" in exc_str and "unavailable" in exc_str):
                fallback_kwargs = {k: v for k, v in kwargs.items() if k != "response_format"}
                try:
                    raw = _content(_create_chat_completion(fallback_kwargs))
                except Exception as exc2:
                    raise LLMError(str(exc2)) from exc2
            else:
                raise LLMError(exc_str) from exc
        return _parse_json_text(raw)

    return complete_text, complete_json


def make_openai_completers_from_env() -> Tuple[TextCompleter, JSONCompleter]:
    """Construct completers from OPENAI_* environment variables."""
    seed_env = os.environ.get("OPENAI_SEED", "42")
    seed = None if seed_env == "" else int(seed_env)
    return make_openai_completers(
        base_url=os.environ.get("OPENAI_BASE_URL") or None,
        api_key=os.environ.get("OPENAI_API_KEY"),
        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        temperature=float(os.environ.get("OPENAI_TEMPERATURE", "0")),
        seed=seed,
        timeout=float(os.environ.get("OPENAI_TIMEOUT_SEC", "120")),
        max_retries=int(os.environ.get("OPENAI_MAX_RETRIES", "2")),
        retry_backoff=float(os.environ.get("OPENAI_RETRY_BACKOFF_SEC", "2")),
        reasoning_effort=os.environ.get("OPENAI_REASONING_EFFORT") or None,
        api_style=os.environ.get("OPENAI_API_STYLE", "chat"),
        stream=os.environ.get("OPENAI_STREAM", "").strip().lower() in {"1", "true", "yes"},
    )


class OpenAILLM:
    """LLM interface used by structured-rule synthesis."""

    def __init__(
        self,
        *,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: str = "gpt-4o-mini",
        temperature: float = 0.0,
        seed: Optional[int] = 42,
        timeout: float = 120.0,
        max_retries: int = 2,
        retry_backoff: float = 2.0,
        reasoning_effort: Optional[str] = None,
        api_style: str = "chat",
        stream: bool = False,
    ):
        self._complete_text, self._complete_json = make_openai_completers(
            base_url=base_url,
            api_key=api_key,
            model=model,
            temperature=temperature,
            seed=seed,
            timeout=timeout,
            max_retries=max_retries,
            retry_backoff=retry_backoff,
            reasoning_effort=reasoning_effort,
            api_style=api_style,
            stream=stream,
        )

    @classmethod
    def from_env(cls) -> "OpenAILLM":
        seed_env = os.environ.get("OPENAI_SEED", "42")
        seed = None if seed_env == "" else int(seed_env)
        return cls(
            base_url=os.environ.get("OPENAI_BASE_URL") or None,
            api_key=os.environ.get("OPENAI_API_KEY"),
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=float(os.environ.get("OPENAI_TEMPERATURE", "0")),
            seed=seed,
            timeout=float(os.environ.get("OPENAI_TIMEOUT_SEC", "120")),
            max_retries=int(os.environ.get("OPENAI_MAX_RETRIES", "2")),
            retry_backoff=float(os.environ.get("OPENAI_RETRY_BACKOFF_SEC", "2")),
            reasoning_effort=os.environ.get("OPENAI_REASONING_EFFORT") or None,
            api_style=os.environ.get("OPENAI_API_STYLE", "chat"),
            stream=os.environ.get("OPENAI_STREAM", "").strip().lower() in {"1", "true", "yes"},
        )

    def complete_text(self, messages: List[Message]) -> str:
        return self._complete_text(messages)

    def complete_json(self, messages: List[Message], schema: Dict[str, Any]) -> Any:
        return self._complete_json(messages, schema)
