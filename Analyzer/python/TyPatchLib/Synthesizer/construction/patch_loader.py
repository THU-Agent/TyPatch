"""Load a kernel commit's diff and the before/after file contents."""

from __future__ import annotations

import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

_KERNEL_REMOTE_URL = (
    "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git"
)


@dataclass
class PatchInfo:
    commit: str
    message: str
    touched_files: List[str]
    diff: str
    file_before: Dict[str, str] = field(default_factory=dict)
    file_after: Dict[str, str] = field(default_factory=dict)


def _run_git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", *args],
        cwd=str(repo),
        text=True,
        errors="replace",
        stderr=subprocess.PIPE,
    )


def _commit_exists(repo: Path, sha: str) -> bool:
    try:
        _run_git(repo, "cat-file", "-e", f"{sha}^{{commit}}")
        return True
    except subprocess.CalledProcessError:
        return False


def _ensure_remote(repo: Path, name: str = "origin") -> None:
    """Add the kernel.org remote if not already present."""
    try:
        existing = _run_git(repo, "remote", "get-url", name).strip()
        if existing:
            return
    except subprocess.CalledProcessError:
        pass
    subprocess.run(
        ["git", "remote", "add", name, _KERNEL_REMOTE_URL],
        cwd=str(repo),
        check=False,
        capture_output=True,
    )


def _fetch_commit(repo: Path, sha: str) -> None:
    """Fetch a single commit (and its parent) from the kernel.org remote."""
    _ensure_remote(repo)
    subprocess.check_call(
        ["git", "fetch", "--depth=2", "origin", sha],
        cwd=str(repo),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )


def load_patch(commit: str, repo: Path) -> PatchInfo:
    repo = Path(repo)

    # Try to resolve locally first; fetch on demand if missing.
    try:
        full_sha = _run_git(repo, "rev-parse", commit).strip()
    except subprocess.CalledProcessError:
        full_sha = commit

    if not _commit_exists(repo, full_sha):
        _fetch_commit(repo, full_sha)
        full_sha = _run_git(repo, "rev-parse", full_sha).strip()

    message = _run_git(repo, "log", "-1", "--pretty=%B", full_sha)
    diff = _run_git(repo, "show", "--format=", "--no-color", "-U20", full_sha)

    touched = [
        line
        for line in _run_git(repo, "show", "--name-only", "--format=", full_sha).splitlines()
        if line.strip()
    ]

    file_before: Dict[str, str] = {}
    file_after: Dict[str, str] = {}
    parent = f"{full_sha}^"
    for path in touched:
        try:
            file_before[path] = _run_git(repo, "show", f"{parent}:{path}")
        except subprocess.CalledProcessError:
            # New file in this commit; no parent version.
            file_before[path] = ""
        try:
            file_after[path] = _run_git(repo, "show", f"{full_sha}:{path}")
        except subprocess.CalledProcessError:
            # File deleted in this commit.
            file_after[path] = ""

    return PatchInfo(
        commit=full_sha,
        message=message.strip(),
        touched_files=touched,
        diff=diff,
        file_before=file_before,
        file_after=file_after,
    )
