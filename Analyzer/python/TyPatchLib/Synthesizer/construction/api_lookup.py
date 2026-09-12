"""Lookup kernel function definitions by name from a kernel source tree.

Uses ripgrep/grep to find function definitions quickly without tree-sitter.
Returns the first matching definition (signature + first ~15 lines of body).
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Optional

_HAS_RG = shutil.which("rg") is not None


def _grep_definition(func_name: str, kernel_root: Path) -> Optional[str]:
    """Find the definition of func_name in kernel_root via grep."""
    # Pattern: function definition opening line, e.g. `int kfree(` or `void kfree(`
    # We look for lines where the function name is followed by `(` at start of a C definition
    # Match any line that starts a function definition: optional qualifiers + return type + name + (
    pattern = rf"^(?:(?:static|inline|extern|__always_inline|__must_check)\s+)*[a-zA-Z_][a-zA-Z0-9_ *]*\b{func_name}\s*\("
    # Prefer ripgrep to bound full-tree definition lookup latency.
    if _HAS_RG:
        search_cmd = ["rg", "-l", "-m1", "--glob", "*.c", "--glob", "*.h", pattern, "."]
    else:
        search_cmd = ["grep", "-rn", "--include=*.c", "--include=*.h", "-l", "-m1", "-E", pattern]
    try:
        result = subprocess.run(
            search_cmd,
            cwd=str(kernel_root),
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None

    files = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if not files:
        return None

    # Take first matching file, find the line number
    try:
        result2 = subprocess.run(
            ["grep", "-n", "-m1", "-E", pattern, files[0]],
            cwd=str(kernel_root),
            capture_output=True,
            text=True,
            timeout=5,
        )
    except subprocess.TimeoutExpired:
        return None

    if not result2.stdout.strip():
        return None

    first_line = result2.stdout.splitlines()[0]
    lineno = int(first_line.split(":")[0])

    # Read up to 20 lines from that point
    try:
        src_lines = (kernel_root / files[0]).read_text(errors="replace").splitlines()
    except OSError:
        return None

    snippet_lines = src_lines[lineno - 1 : lineno + 20]
    # Trim to closing brace depth=0 or 20 lines
    depth = 0
    seen_body = False
    end = len(snippet_lines)
    for i, l in enumerate(snippet_lines):
        depth += l.count("{") - l.count("}")
        if "{" in l:
            seen_body = True
        if seen_body and i > 0 and depth <= 0:
            end = i + 1
            break

    snippet = "\n".join(snippet_lines[:end])
    return f"// {files[0]}:{lineno}\n{snippet}"


def lookup_api_definitions(func_names: list[str], kernel_root: Path, max_funcs: int = 6) -> str:
    """Return a markdown block with definitions of the most relevant functions.

    Skips common well-known functions (kfree, kmalloc etc.) whose semantics the
    model already knows, and focuses on domain-specific ones.
    """
    _SKIP = {
        "kfree", "kmalloc", "kzalloc", "kcalloc", "kvfree", "vfree",
        "vmalloc", "kstrdup", "kmemdup", "devm_kzalloc", "devm_kmalloc",
        "printk", "pr_err", "pr_info", "dev_err", "dev_info",
        "spin_lock", "spin_unlock", "mutex_lock", "mutex_unlock",
        "WARN_ON", "BUG_ON", "return", "if", "else",
    }
    candidates = [f for f in func_names if f not in _SKIP and len(f) > 4][:max_funcs]

    if not candidates:
        return ""

    parts = []
    for name in candidates:
        defn = _grep_definition(name, kernel_root)
        if defn:
            parts.append(f"### `{name}`\n```c\n{defn}\n```")

    if not parts:
        return ""
    return "## Key API definitions (from kernel source)\n\n" + "\n\n".join(parts)
