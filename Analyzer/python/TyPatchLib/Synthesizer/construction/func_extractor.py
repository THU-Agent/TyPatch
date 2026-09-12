from __future__ import annotations
import re
from dataclasses import dataclass
from typing import Any, List, Optional


@dataclass
class CFunction:
    name: str
    start_line: int  # 1-based
    end_line: int    # 1-based, inclusive
    text: str


# A C function-definition header: optional storage class / return type tokens,
# followed by a name, '(' ... ')', optional attributes, then '{' starting the body.
_HEADER_RE = re.compile(
    r"""
    ^                              # at start of line
    (?P<header>
        (?:[A-Za-z_][\w\s\*]*?)     # return-type tokens
        \b(?P<name>[A-Za-z_]\w*)    # function name
        \s*\(                       # opening paren
        [^;]*?                      # parameter list (no semicolons)
        \)
        [^\{;]*                     # optional attributes etc., no ;
    )
    \{                              # opening brace of body
    """,
    re.VERBOSE | re.MULTILINE,
)


def _scan_functions(src: str) -> List[CFunction]:
    funcs: List[CFunction] = []
    for m in _HEADER_RE.finditer(src):
        body_open = m.end() - 1  # position of '{'
        depth = 0
        i = body_open
        n = len(src)
        in_str = False
        in_chr = False
        in_line_cmt = False
        in_blk_cmt = False
        while i < n:
            c = src[i]
            nx = src[i + 1] if i + 1 < n else ""
            if in_line_cmt:
                if c == "\n":
                    in_line_cmt = False
            elif in_blk_cmt:
                if c == "*" and nx == "/":
                    in_blk_cmt = False
                    i += 1
            elif in_str:
                if c == "\\" and nx:
                    i += 1
                elif c == '"':
                    in_str = False
            elif in_chr:
                if c == "\\" and nx:
                    i += 1
                elif c == "'":
                    in_chr = False
            else:
                if c == "/" and nx == "/":
                    in_line_cmt = True
                    i += 1
                elif c == "/" and nx == "*":
                    in_blk_cmt = True
                    i += 1
                elif c == '"':
                    in_str = True
                elif c == "'":
                    in_chr = True
                elif c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        start_off = m.start()
                        end_off = i
                        start_line = src.count("\n", 0, start_off) + 1
                        end_line = src.count("\n", 0, end_off) + 1
                        funcs.append(CFunction(
                            name=m.group("name"),
                            start_line=start_line,
                            end_line=end_line,
                            text=src[start_off:end_off + 1],
                        ))
                        break
            i += 1
    return funcs


def extract_function_at_line(src: str, line: int) -> Optional[CFunction]:
    for f in _scan_functions(src):
        if f.start_line <= line <= f.end_line:
            return f
    return None


_HUNK_RANGE_RE = re.compile(
    r"^@@ -(?P<old_start>\d+)(?:,\d+)? \+(?P<new_start>\d+)(?:,\d+)? @@"
)


def _diff_file_path(header: str, prefix: str) -> str:
    path = header.split("\t", 1)[0]
    if path == "/dev/null":
        return ""
    return path.removeprefix(prefix)


def find_changed_function_bodies(patch: Any) -> list[tuple[str, str, str]]:
    """Find functions enclosing changed lines, preferring their pre-fix body."""
    bodies: list[tuple[str, str, str]] = []
    seen: set[tuple[str, str]] = set()
    before_functions: dict[str, dict[str, CFunction]] = {}

    def add_function(path: str, function: CFunction, text: str) -> None:
        key = (path, function.name)
        if path and key not in seen:
            seen.add(key)
            bodies.append((path, function.name, text))

    def before_function(path: str, name: str) -> CFunction | None:
        if path not in before_functions:
            before_functions[path] = {
                function.name: function
                for function in _scan_functions(patch.file_before.get(path, ""))
            }
        return before_functions[path].get(name)

    before_path = ""
    after_path = ""
    lines = patch.diff.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        if line.startswith("--- "):
            before_path = _diff_file_path(line[4:], "a/")
        elif line.startswith("+++ "):
            after_path = _diff_file_path(line[4:], "b/")
        else:
            hunk = _HUNK_RANGE_RE.match(line)
            if not hunk:
                index += 1
                continue

            old_line = int(hunk.group("old_start"))
            new_line = int(hunk.group("new_start"))
            index += 1
            while index < len(lines):
                hunk_line = lines[index]
                if hunk_line.startswith("@@") or hunk_line.startswith("diff --git "):
                    break
                # File headers are outside hunk bodies. Here every '-'/'+'
                # line is source, including diff renderings of '--i'/'++i'.
                if hunk_line.startswith("-"):
                    function = extract_function_at_line(
                        patch.file_before.get(before_path, ""), old_line
                    )
                    if function:
                        add_function(before_path, function, function.text)
                    old_line += 1
                elif hunk_line.startswith("+"):
                    function = extract_function_at_line(
                        patch.file_after.get(after_path, ""), new_line
                    )
                    if function:
                        previous = before_function(before_path, function.name)
                        add_function(
                            before_path or after_path,
                            previous or function,
                            (previous or function).text,
                        )
                    new_line += 1
                elif hunk_line.startswith(" "):
                    old_line += 1
                    new_line += 1
                # "\\ No newline at end of file" is not source and must not
                # advance either hunk-side line counter.
                index += 1
            continue
        index += 1
    return bodies


def find_changed_function_names_at_lines(patch: Any) -> List[str]:
    """Return changed function names resolved from hunk source line numbers."""
    names: List[str] = []
    for _path, name, _body in find_changed_function_bodies(patch):
        if name not in names:
            names.append(name)
    return names


_HUNK_HEADER_RE = re.compile(
    r"^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@\s*(?P<ctx>.*)$",
    re.MULTILINE,
)
_NAME_FROM_CTX_RE = re.compile(r"\b([A-Za-z_]\w*)\s*\(")


def find_changed_function_names(diff_text: str) -> List[str]:
    names: List[str] = []
    for m in _HUNK_HEADER_RE.finditer(diff_text):
        ctx = m.group("ctx")
        m2 = _NAME_FROM_CTX_RE.search(ctx)
        if m2 and m2.group(1) not in names:
            names.append(m2.group(1))
    return names
