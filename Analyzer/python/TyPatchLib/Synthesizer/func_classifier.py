from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

from .construction.api_lookup import _grep_definition


DIRECT_FREE = "DIRECT_FREE"
REFCOUNT_PUT = "REFCOUNT_PUT"
QUEUE_PURGE = "QUEUE_PURGE"
RESOURCE_LOOKUP = "RESOURCE_LOOKUP"
UNKNOWN = "UNKNOWN"

_DIRECT = {
    "kfree", "kfree_const", "kfree_sensitive", "kfree_rcu",
    "kvfree", "kvfree_atomic", "kvfree_rcu", "kvfree_sensitive",
    "vfree", "devm_kfree", "kmem_cache_free", "kmem_cache_free_bulk",
    "free_netdev",
    # SKB release
    "kfree_skb", "kfree_skb_reason", "consume_skb",
    "dev_kfree_skb_any", "dev_kfree_skb_irq", "skb_free_datagram",
    # DMA release
    "dma_free_coherent", "dma_free_attrs", "dma_free_noncoherent",
    "dma_free_wc", "dmam_free_coherent", "pci_free_consistent",
    "dma_pool_free", "pci_pool_free",
}
_REF = {
    "kobject_put", "kref_put", "put_device", "of_node_put",
    "fwnode_handle_put", "module_put", "dev_put", "clk_put", "irq_put",
    "usb_free_urb", "v3d_job_cleanup",
}
_QUEUE = {"skb_queue_purge", "__skb_queue_purge", "skb_queue_purge_reason", "skb_queue_drain"}
_LOOKUP = {"platform_get_resource", "platform_get_resource_byname", "debugfs_lookup"}
_KNOWN = {
    **dict.fromkeys(_DIRECT, DIRECT_FREE),
    **dict.fromkeys(_REF, REFCOUNT_PUT),
    **dict.fromkeys(_QUEUE, QUEUE_PURGE),
    **dict.fromkeys(_LOOKUP, RESOURCE_LOOKUP),
    **dict.fromkeys({"kzalloc", "kmalloc", "vmalloc"}, UNKNOWN),
}


def _calls(body: str, names: set[str]) -> bool:
    return any(re.search(rf"\b{re.escape(name)}\s*\(", body) for name in names)


def _clean(body: str) -> str:
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    return re.sub(r"//.*", "", body)


@lru_cache(maxsize=512)
def classify_func(func_name: str, kernel_root: Path) -> str:
    if func_name in _KNOWN:
        return _KNOWN[func_name]

    name_l = func_name.lower()
    if "queue" in name_l and ("purge" in name_l or "drain" in name_l):
        return QUEUE_PURGE
    if "get_resource" in name_l or name_l.endswith("_lookup"):
        return RESOURCE_LOOKUP

    defn = _grep_definition(func_name, Path(kernel_root))
    if not defn:
        return UNKNOWN

    body = _clean(defn)
    if _calls(body, _QUEUE):
        return QUEUE_PURGE
    if _calls(body, _REF) or re.search(r"\b(?:kref_put|refcount_dec_and_test)\s*\(", body):
        return REFCOUNT_PUT
    if _calls(body, _DIRECT):
        return DIRECT_FREE
    if re.search(r"\bplatform_get_resource(?:_byname)?\s*\(", body):
        return RESOURCE_LOOKUP
    return UNKNOWN


def is_direct_memory_free(func_name: str, kernel_root: Optional[Path] = None) -> bool:
    if kernel_root is None:
        return _KNOWN.get(func_name) == DIRECT_FREE
    return classify_func(func_name, kernel_root) == DIRECT_FREE
