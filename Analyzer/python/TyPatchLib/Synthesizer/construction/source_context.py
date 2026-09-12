"""Bounded kernel macro/wrapper context for rule synthesis.

The existing API lookup is intentionally function-oriented.  This module adds
the source forms that are otherwise invisible to the model: function-like
macros, short wrapper bodies, and DEFINE_FREE-backed ``__free(name)`` cleanup.

Resolution is deterministic and deliberately local.  It searches the pre-fix
touched files plus a bounded transitive closure of their included headers,
rather than walking the entire kernel tree once per symbol.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import hashlib
from pathlib import Path
import re
from typing import Any, Iterable, Optional

from .func_extractor import CFunction, _scan_functions, find_changed_function_bodies


CONTEXT_HEADING = "## Resolved macro and wrapper source context"

# Prompt-growth limits are module constants because they define the synthesis
# context contract.
MAX_SEED_SYMBOLS = 32
MAX_INCLUDE_DEPTH = 3
MAX_SOURCE_FILES = 192
MAX_ROOT_ENTRIES = 6
MAX_TOTAL_ENTRIES = 12
MAX_CALLEES_PER_ROOT = 4
MAX_WRAPPER_LINES = 24
MAX_ENTRY_LINES = 48
MAX_ENTRY_CHARS = 2800
MAX_CONTEXT_CHARS = 12000

_CALL_RE = re.compile(r"\b([A-Za-z_]\w*)\s*\(")
_INCLUDE_RE = re.compile(
    r'(?m)^[ \t]*#[ \t]*include[ \t]+(?P<open>[<"])(?P<path>[^>"]+)[>"]'
)
_MACRO_START_RE = re.compile(
    r"^[ \t]*#[ \t]*define[ \t]+(?P<name>[A-Za-z_]\w*)"
    r"(?=[ \t(]|$)"
)
_FREE_USE_RE = re.compile(
    r"\b(?P<var>[A-Za-z_]\w*)[ \t]+__free[ \t]*"
    r"\([ \t]*(?P<name>[A-Za-z_]\w*)[ \t]*\)"
)
_DEFINE_FREE_RE = re.compile(r"\bDEFINE_FREE[ \t]*\(")

_NON_CALLEES = {
    "BUILD_BUG_ON",
    "ARRAY_SIZE",
    "IS_ENABLED",
    "WARN_ON",
    "WARN_ON_ONCE",
    "BUG_ON",
    "DEFINE_FREE",
    "__free",
    "__cleanup",
    "alignof",
    "defined",
    "for",
    "if",
    "return",
    "sizeof",
    "static_assert",
    "switch",
    "typeof",
    "while",
}


@dataclass(frozen=True)
class SourceDocument:
    path: str
    text: str
    depth: int


@dataclass(frozen=True)
class LocatedSnippet:
    symbol: str
    path: str
    line: int
    text: str


@dataclass(frozen=True)
class SourceContextEntry:
    kind: str
    symbol: str
    path: str
    line: int
    relation: str
    text: str


@dataclass(frozen=True)
class ResolvedSourceContext:
    block: str = ""
    entries: tuple[SourceContextEntry, ...] = ()
    seed_count: int = 0
    source_file_count: int = 0
    omitted_entry_count: int = 0

    @property
    def triggered(self) -> bool:
        return bool(self.entries)

    @property
    def char_count(self) -> int:
        return len(self.block)

    @property
    def root_entry_count(self) -> int:
        return sum(
            not entry.kind.startswith("callee")
            for entry in self.entries
        )

    @property
    def evidence_texts(self) -> tuple[str, ...]:
        # Use the exact rendered block as grounding evidence.  This prevents a
        # prompt-visible resolved callee from being rejected by a narrower,
        # separately reconstructed grounding corpus.
        return (self.block,) if self.block else ()


EMPTY_SOURCE_CONTEXT = ResolvedSourceContext()


def _ordered_unique(values: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def _call_names(text: str) -> list[str]:
    return _ordered_unique(
        match.group(1)
        for match in _CALL_RE.finditer(text)
        if match.group(1) not in _NON_CALLEES
        and not match.group(1).startswith("__builtin_")
    )


def _bounded_text(text: str) -> str:
    lines = text.strip().splitlines()
    truncated = False
    if len(lines) > MAX_ENTRY_LINES:
        lines = lines[: MAX_ENTRY_LINES - 1]
        truncated = True
    result = "\n".join(lines)
    if len(result) > MAX_ENTRY_CHARS:
        result = result[: MAX_ENTRY_CHARS - 32].rstrip()
        truncated = True
    if truncated:
        result += "\n/* ... source context truncated ... */"
    return result


class KernelSourceResolver:
    """Resolve symbols from a bounded touched-file/include source closure."""

    def __init__(self, kernel_root: Path):
        self.kernel_root = Path(kernel_root)
        self._file_text_cache: dict[str, Optional[str]] = {}
        self._function_cache: dict[str, tuple[CFunction, ...]] = {}

    def _read_relative(self, relative_path: str) -> Optional[str]:
        normalized = Path(relative_path)
        if normalized.is_absolute() or ".." in normalized.parts:
            return None
        key = normalized.as_posix()
        if key in self._file_text_cache:
            return self._file_text_cache[key]
        path = self.kernel_root / normalized
        try:
            text = path.read_text(errors="replace") if path.is_file() else None
        except OSError:
            text = None
        self._file_text_cache[key] = text
        return text

    def _include_candidates(
        self,
        include_path: str,
        *,
        quoted: bool,
        including_path: str,
    ) -> list[str]:
        candidates: list[str] = []
        if quoted:
            parent = Path(including_path).parent
            candidates.append((parent / include_path).as_posix())
        candidates.extend(
            [
                include_path,
                (Path("include") / include_path).as_posix(),
            ]
        )
        return _ordered_unique(candidates)

    def _resolve_include(
        self,
        include_path: str,
        *,
        quoted: bool,
        including_path: str,
    ) -> Optional[tuple[str, str]]:
        for candidate in self._include_candidates(
            include_path,
            quoted=quoted,
            including_path=including_path,
        ):
            text = self._read_relative(candidate)
            if text is not None:
                return candidate, text
        return None

    def documents_for_patch(self, patch: Any) -> list[SourceDocument]:
        documents: list[SourceDocument] = []
        queued: list[SourceDocument] = []
        seen_paths: set[str] = set()

        for path in patch.touched_files:
            text = patch.file_before.get(path, "") or patch.file_after.get(path, "")
            if not text or path in seen_paths:
                continue
            seen_paths.add(path)
            doc = SourceDocument(path=path, text=text, depth=0)
            documents.append(doc)
            queued.append(doc)

        queue_index = 0
        while (
            queue_index < len(queued)
            and len(documents) < MAX_SOURCE_FILES
        ):
            document = queued[queue_index]
            queue_index += 1
            if document.depth >= MAX_INCLUDE_DEPTH:
                continue
            for match in _INCLUDE_RE.finditer(document.text):
                resolved = self._resolve_include(
                    match.group("path"),
                    quoted=match.group("open") == '"',
                    including_path=document.path,
                )
                if resolved is None:
                    continue
                path, text = resolved
                if path in seen_paths:
                    continue
                seen_paths.add(path)
                included = SourceDocument(
                    path=path,
                    text=text,
                    depth=document.depth + 1,
                )
                documents.append(included)
                queued.append(included)
                if len(documents) >= MAX_SOURCE_FILES:
                    break
        return documents

    def _functions(self, document: SourceDocument) -> tuple[CFunction, ...]:
        # A path can only occur once in a closure; kernel-root file contents
        # are stable for the duration of one synthesis process.
        text_digest = hashlib.sha256(document.text.encode()).hexdigest()
        cache_key = f"{document.path}\0{text_digest}"
        cached = self._function_cache.get(cache_key)
        if cached is None:
            cached = tuple(_scan_functions(document.text))
            self._function_cache[cache_key] = cached
        return cached

    def find_function(
        self,
        name: str,
        documents: list[SourceDocument],
    ) -> Optional[LocatedSnippet]:
        for document in documents:
            for function in self._functions(document):
                if function.name == name:
                    return LocatedSnippet(
                        symbol=name,
                        path=document.path,
                        line=function.start_line,
                        text=function.text,
                    )
        return None

    def find_macro(
        self,
        name: str,
        documents: list[SourceDocument],
    ) -> Optional[LocatedSnippet]:
        for document in documents:
            lines = document.text.splitlines()
            for index, line in enumerate(lines):
                match = _MACRO_START_RE.match(line)
                if not match or match.group("name") != name:
                    continue
                end = index
                while (
                    end + 1 < len(lines)
                    and lines[end].rstrip().endswith("\\")
                ):
                    end += 1
                return LocatedSnippet(
                    symbol=name,
                    path=document.path,
                    line=index + 1,
                    text="\n".join(lines[index : end + 1]),
                )
        return None

    def find_declaration(
        self,
        name: str,
        documents: list[SourceDocument],
    ) -> Optional[LocatedSnippet]:
        pattern = re.compile(
            rf"^[ \t]*(?:(?:extern|static|inline|__always_inline|"
            rf"__must_check)[ \t]+)*[A-Za-z_][A-Za-z0-9_ \t*]*"
            rf"\b{re.escape(name)}[ \t]*\("
        )
        for document in documents:
            lines = document.text.splitlines()
            for index, line in enumerate(lines):
                if not pattern.search(line):
                    continue
                statement = [line]
                end = index
                while (
                    ";" not in statement[-1]
                    and end + 1 < len(lines)
                    and len(statement) < 10
                ):
                    end += 1
                    statement.append(lines[end])
                text = "\n".join(statement)
                if ";" not in text or "{" in text or line.lstrip().startswith("#"):
                    continue
                return LocatedSnippet(
                    symbol=name,
                    path=document.path,
                    line=index + 1,
                    text=text,
                )
        return None

    def find_define_free(
        self,
        name: str,
        documents: list[SourceDocument],
    ) -> Optional[LocatedSnippet]:
        for document in documents:
            for match in _DEFINE_FREE_RE.finditer(document.text):
                invocation = _balanced_invocation(document.text, match.start())
                if invocation is None:
                    continue
                text, _end = invocation
                args = _split_top_level_args(
                    text[text.find("(") + 1 : text.rfind(")")]
                )
                if len(args) < 3 or args[0].strip() != name:
                    continue
                line = document.text.count("\n", 0, match.start()) + 1
                return LocatedSnippet(
                    symbol=name,
                    path=document.path,
                    line=line,
                    text=text.strip(),
                )
        return None


@lru_cache(maxsize=4)
def _resolver_for(kernel_root: str) -> KernelSourceResolver:
    return KernelSourceResolver(Path(kernel_root))


def _balanced_invocation(text: str, start: int) -> Optional[tuple[str, int]]:
    open_index = text.find("(", start)
    if open_index < 0:
        return None
    depth = 0
    in_string: Optional[str] = None
    escaped = False
    for index in range(open_index, len(text)):
        char = text[index]
        if in_string is not None:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == in_string:
                in_string = None
            continue
        if char in {'"', "'"}:
            in_string = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return text[start : index + 1], index + 1
    return None


def _split_top_level_args(text: str) -> list[str]:
    args: list[str] = []
    start = 0
    depth = 0
    in_string: Optional[str] = None
    escaped = False
    for index, char in enumerate(text):
        if in_string is not None:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == in_string:
                in_string = None
            continue
        if char in {'"', "'"}:
            in_string = char
        elif char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        elif char == "," and depth == 0:
            args.append(text[start:index].strip())
            start = index + 1
    args.append(text[start:].strip())
    return args


def _free_expansion(snippet: LocatedSnippet, variable: str) -> tuple[str, list[str]]:
    args = _split_top_level_args(
        snippet.text[snippet.text.find("(") + 1 : snippet.text.rfind(")")]
    )
    if len(args) < 3:
        return snippet.text, []
    name, type_text = args[0].strip(), args[1].strip()
    expression = ",".join(args[2:]).strip()
    callees = _call_names(expression)
    rendered = "\n".join(
        [
            snippet.text,
            "",
            f"/* deterministic expansion of __free({name}) */",
            f"static inline void __free_{name}(void *p)",
            "{",
            f"\t{type_text} _T = *({type_text} *)p;",
            f"\t{expression};",
            "}",
            f"/* annotated variable: {variable}; scope exit calls "
            f"__free_{name}(&{variable}) */",
            (
                "/* real cleanup callee(s): "
                + (", ".join(callees) if callees else "none resolved")
                + " */"
            ),
        ]
    )
    return rendered, callees


def _short_wrapper(
    function: LocatedSnippet,
) -> Optional[list[str]]:
    lines = function.text.splitlines()
    if len(lines) > MAX_WRAPPER_LINES:
        return None
    callees = [
        callee
        for callee in _call_names(function.text)
        if callee != function.symbol
    ]
    return callees or None


def _entry_section(entry: SourceContextEntry) -> str:
    return "\n".join(
        [
            f"### {entry.kind} `{entry.symbol}`",
            f"Source: `{entry.path}:{entry.line}`",
            f"Relation: {entry.relation}",
            "```c",
            _bounded_text(entry.text),
            "```",
        ]
    )


def _recursive_entry(
    resolver: KernelSourceResolver,
    callee: str,
    root_symbol: str,
    documents: list[SourceDocument],
) -> Optional[SourceContextEntry]:
    function = resolver.find_function(callee, documents)
    if function is not None:
        return SourceContextEntry(
            kind="callee function",
            symbol=callee,
            path=function.path,
            line=function.line,
            relation=f"one-level callee of `{root_symbol}`",
            text=function.text,
        )
    macro = resolver.find_macro(callee, documents)
    if macro is not None:
        return SourceContextEntry(
            kind="callee macro",
            symbol=callee,
            path=macro.path,
            line=macro.line,
            relation=f"one-level callee of `{root_symbol}`",
            text=macro.text,
        )
    declaration = resolver.find_declaration(callee, documents)
    if declaration is not None:
        return SourceContextEntry(
            kind="callee declaration",
            symbol=callee,
            path=declaration.path,
            line=declaration.line,
            relation=f"one-level callee of `{root_symbol}`",
            text=declaration.text,
        )
    return None


def build_source_context(
    patch: Any,
    kernel_root: Optional[Path],
    *,
    resolver: Optional[KernelSourceResolver] = None,
) -> ResolvedSourceContext:
    """Build one bounded prompt/grounding block for a patch."""

    if kernel_root is None or not Path(kernel_root).is_dir():
        return EMPTY_SOURCE_CONTEXT
    active_resolver = resolver or _resolver_for(str(Path(kernel_root).resolve()))
    documents = active_resolver.documents_for_patch(patch)
    if not documents:
        return EMPTY_SOURCE_CONTEXT

    changed_bodies = find_changed_function_bodies(patch)
    changed_function_names = {name for _path, name, _body in changed_bodies}
    seed_texts = [patch.diff]
    seed_texts.extend(body for _path, _name, body in changed_bodies)
    cleanup_uses: list[tuple[str, str]] = []
    for text in seed_texts:
        for match in _FREE_USE_RE.finditer(text):
            pair = (match.group("name"), match.group("var"))
            if pair not in cleanup_uses:
                cleanup_uses.append(pair)

    seeds = _ordered_unique(
        name
        for text in seed_texts
        for name in _call_names(text)
        if name not in changed_function_names
    )[:MAX_SEED_SYMBOLS]

    candidate_entries: list[SourceContextEntry] = []
    root_count = 0
    seen_entry_keys: set[tuple[str, str, int]] = set()

    def add_entry(entry: SourceContextEntry) -> bool:
        key = (entry.symbol, entry.path, entry.line)
        if key in seen_entry_keys or len(candidate_entries) >= MAX_TOTAL_ENTRIES:
            return False
        seen_entry_keys.add(key)
        candidate_entries.append(entry)
        return True

    def add_recursive(callees: Iterable[str], root_symbol: str) -> None:
        for callee in _ordered_unique(callees)[:MAX_CALLEES_PER_ROOT]:
            if len(candidate_entries) >= MAX_TOTAL_ENTRIES:
                return
            entry = _recursive_entry(
                active_resolver,
                callee,
                root_symbol,
                documents,
            )
            if entry is not None:
                add_entry(entry)

    # Cleanup attributes are the most semantically lossy source form, so they
    # have deterministic priority over ordinary macro/wrapper roots.
    for name, variable in cleanup_uses:
        if root_count >= MAX_ROOT_ENTRIES:
            break
        definition = active_resolver.find_define_free(name, documents)
        if definition is None:
            continue
        expanded, callees = _free_expansion(definition, variable)
        root = SourceContextEntry(
            kind="DEFINE_FREE cleanup",
            symbol=name,
            path=definition.path,
            line=definition.line,
            relation=f"`{variable} __free({name})` in patch context",
            text=expanded,
        )
        added = add_entry(root)
        if added:
            root_count += 1
        add_recursive(callees, name)

    for name in seeds:
        if root_count >= MAX_ROOT_ENTRIES or len(candidate_entries) >= MAX_TOTAL_ENTRIES:
            break
        if any(name == cleanup_name for cleanup_name, _var in cleanup_uses):
            continue
        macro = active_resolver.find_macro(name, documents)
        if macro is not None:
            callees = [
                callee for callee in _call_names(macro.text) if callee != name
            ]
            # Constant-only macros do not hide an event binding and add no
            # useful lifecycle context.
            if not callees:
                continue
            root = SourceContextEntry(
                kind="function-like macro",
                symbol=name,
                path=macro.path,
                line=macro.line,
                relation="invoked by patch or pre-fix changed function",
                text=macro.text,
            )
            added = add_entry(root)
            if added:
                root_count += 1
            add_recursive(callees, name)
            continue

        function = active_resolver.find_function(name, documents)
        if function is None:
            continue
        callees = _short_wrapper(function)
        if not callees:
            continue
        root = SourceContextEntry(
            kind="short wrapper function",
            symbol=name,
            path=function.path,
            line=function.line,
            relation="invoked by patch or pre-fix changed function",
            text=function.text,
        )
        added = add_entry(root)
        if added:
            root_count += 1
        add_recursive(callees, name)

    if not candidate_entries:
        return ResolvedSourceContext(
            seed_count=len(seeds),
            source_file_count=len(documents),
        )

    prefix = "\n".join(
        [
            CONTEXT_HEADING,
            "",
            (
                "Deterministically resolved from pre-fix touched files and "
                "their bounded include closure. Bind events to the real callee "
                "or cleanup object shown here, not merely to macro spelling."
            ),
        ]
    )
    rendered_sections: list[str] = []
    included_entries: list[SourceContextEntry] = []
    omitted = 0
    current_length = len(prefix)
    for entry in candidate_entries:
        section = _entry_section(entry)
        added_length = 2 + len(section)
        if current_length + added_length > MAX_CONTEXT_CHARS:
            omitted += 1
            continue
        rendered_sections.append(section)
        included_entries.append(entry)
        current_length += added_length
    omitted = len(candidate_entries) - len(included_entries)

    block = prefix
    if rendered_sections:
        block += "\n\n" + "\n\n".join(rendered_sections)
    if omitted:
        footer = f"\n\n<!-- {omitted} resolved entries omitted by character budget -->"
        if len(block) + len(footer) <= MAX_CONTEXT_CHARS:
            block += footer

    return ResolvedSourceContext(
        block=block,
        entries=tuple(included_entries),
        seed_count=len(seeds),
        source_file_count=len(documents),
        omitted_entry_count=omitted,
    )
