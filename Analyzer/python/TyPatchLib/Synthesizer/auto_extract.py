"""Automatically extract allocator and deallocator APIs from patch diffs.

The extractor intentionally uses local diff structure rather than global
hardcoded allowlists:

* Allocators are inferred when a variable assigned from a function call in a
  hunk is later guarded by a newly added NULL / ERR_PTR-style check.
* Deallocators are inferred when a call is removed or moved inside a hunk.
* API-name families are used only to classify calls found in the patch.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, Sequence


ExtractedApis = dict[str, list[str]]
_IDENT = r"[A-Za-z_]\w*"
_VAR_EXPR = rf"{_IDENT}(?:(?:\s*(?:->|\.)\s*){_IDENT}|\s*\[[^\]]+\])*"

_ASSIGN_CALL_RE = re.compile(
    rf"(?P<var>{_VAR_EXPR})\s*(?<![=!<>])=(?![=])\s*"
    rf"(?:\([^)]+\)\s*)*(?P<func>{_IDENT})\s*\("
)
_BANG_CHECK_RE = re.compile(rf"!\s*(?P<var>{_VAR_EXPR})(?!\s*\()")
_NULL_RHS_CHECK_RE = re.compile(
    rf"(?P<var>{_VAR_EXPR})\s*(?:==|!=)\s*NULL\b"
)
_NULL_LHS_CHECK_RE = re.compile(
    rf"\bNULL\s*(?:==|!=)\s*(?P<var>{_VAR_EXPR})"
)
_ERR_CHECK_RE = re.compile(
    rf"\b(?:IS_ERR_OR_NULL|IS_ERR)\s*\(\s*(?P<var>{_VAR_EXPR})\s*\)"
)
_CALL_RE = re.compile(rf"\b(?P<func>{_IDENT})\s*\(")


# Functions/macros that commonly appear in fixes but are neither allocation nor
# deallocation APIs.  Allocator detection explicitly rejects these names.
EXCLUDE: frozenset[str] = frozenset(
    {
        "ALIGN",
        "ARRAY_SIZE",
        "BIT",
        "BUILD_BUG_ON",
        "BUG",
        "BUG_ON",
        "DIV_ROUND_UP",
        "ERR_CAST",
        "ERR_PTR",
        "FIELD_GET",
        "FIELD_PREP",
        "GENMASK",
        "IS_ALIGNED",
        "IS_ENABLED",
        "IS_ERR",
        "IS_ERR_OR_NULL",
        "IS_REACHABLE",
        "IS_ERR_VALUE",
        "PTR_ERR",
        "PTR_ERR_OR_ZERO",
        "WARN",
        "WARN_ON",
        "WARN_ONCE",
        "WARN_ON_ONCE",
        "container_of",
        "do_div",
        "for",
        "if",
        "likely",
        "max",
        "min",
        "offsetof",
        "pr_alert",
        "pr_crit",
        "pr_debug",
        "pr_err",
        "pr_info",
        "pr_notice",
        "pr_warn",
        "printk",
        "return",
        "sizeof",
        "switch",
        "typeof",
        "unlikely",
        "while",
    }
)

_EXCLUDE_PREFIXES: tuple[str, ...] = (
    "__trace_",
    "atomic_",
    "bitmap_",
    "clear_bit",
    "dev_alert",
    "dev_crit",
    "dev_dbg",
    "dev_err",
    "dev_info",
    "dev_notice",
    "dev_warn",
    "hlist_",
    "ida_",
    "idr_",
    "init_",
    "list_",
    "lockdep_",
    "might_",
    "mutex_",
    "netdev_dbg",
    "netdev_err",
    "netdev_info",
    "netdev_warn",
    "pr_",
    "raw_spin_",
    "rb_",
    "refcount_",
    "spin_",
    "test_bit",
    "trace_",
    "xa_",
    "xas_",
)

_STATUS_VARS: frozenset[str] = frozenset(
    {"err", "error", "rc", "res", "result", "ret", "retval", "status"}
)


# Action-specific registries used to classify calls found in a patch.
ALLOCATOR_SUB_FAMILIES: dict[str, tuple[str, ...]] = {
    "devm_managed": (
        "devm_kzalloc", "devm_kcalloc", "devm_kmalloc", "devm_kstrdup",
        "devm_kasprintf", "devm_kmemdup",
    ),
    "raw_heap": (
        "kmalloc", "kzalloc", "kcalloc", "__kmalloc", "kmalloc_array",
        "kstrdup", "kstrndup", "kmemdup", "krealloc",
    ),
    "vmalloc": (
        "vmalloc", "vzalloc", "vmalloc_user", "__vmalloc",
        "kvmalloc", "kvzalloc", "kvcalloc", "kvmalloc_array",
    ),
    "slab_cache": (
        "kmem_cache_alloc", "kmem_cache_zalloc", "kmem_cache_alloc_node",
    ),
    "page": (
        "__get_free_pages", "get_zeroed_page", "__get_free_page",
        "alloc_pages", "alloc_page",
    ),
    "dma": (
        "dma_alloc_coherent", "dma_pool_alloc", "dma_pool_zalloc",
        "pci_alloc_consistent",
    ),
}

DEALLOCATOR_API_FAMILIES: tuple[tuple[str, ...], ...] = (
    (
        "kfree",
        "kfree_const",
        "kfree_rcu",
        "kfree_sensitive",
        "kvfree",
        "kvfree_atomic",
        "kvfree_rcu",
        "kvfree_sensitive",
        "vfree",
        "devm_kfree",
    ),
    ("kmem_cache_free", "kmem_cache_free_bulk"),
    (
        "__free_page",
        "__free_pages",
        "free_page",
        "free_pages",
        "free_pages_exact",
        "put_page",
    ),
    (
        "dma_free_attrs",
        "dma_free_coherent",
        "dma_free_noncoherent",
        "dma_free_wc",
        "dma_pool_free",
        "dmam_free_coherent",
        "pci_free_consistent",
        "pci_pool_free",
    ),
    (
        "consume_skb",
        "dev_kfree_skb_any",
        "dev_kfree_skb_irq",
        "kfree_skb",
        "skb_free_datagram",
        # skb_queue_purge operates on queue internals, not the queue pointer itself
    ),
    ("free_netdev",),
    ("usb_free_urb",),
    (
        "drm_framebuffer_put",
        "drm_gem_object_free",
        "drm_gem_object_put",
        "drm_gem_object_put_locked",
        "drm_gem_object_put_unlocked",
        "drm_gem_object_release",
    ),
    (
        "dput",
        "fput",
        "iput",
        # kobject_put, kref_put, module_put, of_node_put, put_device are refcount
        # decrements, not memory-release functions — excluded from CallFree expansion
        "sockfd_put",
    ),
    (
        "dma_unmap_page",
        "dma_unmap_sg",
        "dma_unmap_single",
        "iounmap",
        "kunmap",
        "kunmap_atomic",
        "kunmap_local",
        "pci_iounmap",
    ),
    (
        "class_destroy",
        "device_destroy",
        "destroy_workqueue",
        "platform_device_unregister",
        "unregister_chrdev",
        "unregister_netdev",
    ),
)

_KNOWN_ALLOCATOR_NAMES: frozenset[str] = frozenset(
    name for family in ALLOCATOR_SUB_FAMILIES.values() for name in family
)
_KNOWN_DEALLOCATOR_NAMES: frozenset[str] = frozenset(
    name for family in DEALLOCATOR_API_FAMILIES for name in family
)

_ALLOC_HINTS: tuple[str, ...] = (
    "alloc",
    "asprintf",
    "calloc",
    "malloc",
    "memdup",
    "realloc",
    "strdup",
    "strndup",
    "zalloc",
)

_DEALLOC_HINTS: tuple[str, ...] = (
    "cleanup",
    "close",
    "deinit",
    "del",
    "delete",
    "destroy",
    "detach",
    "dispose",
    "drop",
    "exit",
    "fini",
    "free",
    "put",
    "release",
    "remove",
    "unmap",
    "unregister",
)


@dataclass(frozen=True)
class _HunkLine:
    prefix: str
    text: str


def extract_from_patch(diff: str) -> ExtractedApis:
    """Extract raw allocator and deallocator function names from a patch diff.

    Parameters
    ----------
    diff:
        Unified diff text.  Markdown-wrapped diffs are accepted as long as they
        contain standard ``@@`` hunk headers.

    Returns
    -------
    dict
        ``{"allocators": [...], "deallocators": [...]}`` with sorted,
        de-duplicated raw function names.
    """
    allocators: set[str] = set()
    deallocators: set[str] = set()

    for hunk in _iter_hunks(diff):
        checked_vars = _checked_vars_in_added_lines(hunk)
        if checked_vars:
            assignments = _assignment_calls_in_allocator_scope(hunk)
            for checked_var in checked_vars:
                if _is_status_var(checked_var):
                    continue
                for func in assignments.get(checked_var, ()):
                    if not _is_excluded(func):
                        allocators.add(func)

        removed_calls = _calls_in_lines(hunk, prefixes={"-"})
        added_calls = _calls_in_lines(hunk, prefixes={"+"})

        for func in removed_calls & added_calls:
            if _is_deallocator_candidate(func):
                deallocators.add(func)

        for func in removed_calls - added_calls:
            if _is_deallocator_candidate(func):
                deallocators.add(func)

    return {
        "allocators": sorted(allocators),
        "deallocators": sorted(deallocators),
    }


def _iter_hunks(diff: str) -> Iterable[list[_HunkLine]]:
    current: list[_HunkLine] | None = None
    for raw_line in diff.splitlines():
        if raw_line.startswith("@@"):
            if current is not None:
                yield current
            current = []
            continue

        if current is None:
            continue
        if not raw_line or raw_line.startswith("\\ No newline"):
            continue
        if raw_line.startswith(("diff --git", "index ", "--- ", "+++ ", "```")):
            continue

        prefix = raw_line[0]
        if prefix in {" ", "+", "-"}:
            current.append(_HunkLine(prefix=prefix, text=raw_line[1:]))

    if current is not None:
        yield current


def _assignment_calls_in_allocator_scope(
    hunk: Sequence[_HunkLine],
) -> dict[str, set[str]]:
    assignments: dict[str, set[str]] = {}
    for line in hunk:
        if line.prefix not in {" ", "+"}:
            continue
        for var, func in _extract_assignment_calls(line.text):
            assignments.setdefault(var, set()).add(func)
    return assignments


def _checked_vars_in_added_lines(hunk: Sequence[_HunkLine]) -> set[str]:
    checked_vars: set[str] = set()
    for line in hunk:
        if line.prefix != "+":
            continue
        checked_vars.update(_extract_checked_vars(line.text))
    return checked_vars


def _extract_assignment_calls(line: str) -> Iterable[tuple[str, str]]:
    for match in _ASSIGN_CALL_RE.finditer(line):
        func = match.group("func")
        if _is_excluded(func):
            continue
        yield _normalize_var(match.group("var")), func


def _extract_checked_vars(line: str) -> set[str]:
    vars_found: set[str] = set()
    for regex in (
        _ERR_CHECK_RE,
        _NULL_RHS_CHECK_RE,
        _NULL_LHS_CHECK_RE,
        _BANG_CHECK_RE,
    ):
        for match in regex.finditer(line):
            vars_found.add(_normalize_var(match.group("var")))
    return vars_found


def _calls_in_lines(
    hunk: Sequence[_HunkLine],
    *,
    prefixes: set[str],
) -> set[str]:
    calls: set[str] = set()
    for line in hunk:
        if line.prefix not in prefixes:
            continue
        for match in _CALL_RE.finditer(line.text):
            func = match.group("func")
            if not _is_excluded(func):
                calls.add(func)
    return calls


def _normalize_var(expr: str) -> str:
    normalized = expr.strip().rstrip(";,")
    normalized = normalized.lstrip("&*").strip()
    return re.sub(r"\s+", "", normalized)


def _is_status_var(var: str) -> bool:
    return var in _STATUS_VARS or var.split("->")[-1].split(".")[-1] in _STATUS_VARS


def _is_excluded(func: str) -> bool:
    if func in EXCLUDE:
        return True
    return any(func.startswith(prefix) for prefix in _EXCLUDE_PREFIXES)


def _is_allocator_name(func: str) -> bool:
    if func in _KNOWN_ALLOCATOR_NAMES:
        return True
    tokens = _name_tokens(func)
    return any(hint in tokens or func.endswith(hint) for hint in _ALLOC_HINTS)


def _is_deallocator_name(func: str) -> bool:
    if func in _KNOWN_DEALLOCATOR_NAMES:
        return True
    tokens = _name_tokens(func)
    return any(hint in tokens or func.endswith(hint) for hint in _DEALLOC_HINTS)


def _is_deallocator_candidate(func: str) -> bool:
    if _is_excluded(func) or _is_allocator_name(func):
        return False
    return _is_deallocator_name(func)


def _name_tokens(name: str) -> set[str]:
    parts: list[str] = []
    for chunk in name.split("_"):
        parts.extend(re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+", chunk))
    return {part.lower() for part in parts if part}
