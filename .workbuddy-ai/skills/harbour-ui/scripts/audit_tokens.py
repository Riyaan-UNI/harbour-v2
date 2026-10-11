#!/usr/bin/env python3
"""Read-only audit for Harbour token discipline.

Scans source files for values that the Harbour Design Spec bans outside the
token file:

  * raw colours - hex, rgb(), rgba(), hsl(), hsla()
  * px values other than 1px (the only permitted use of px)

This script only reads files. It never writes, deletes, or makes network
calls. Findings are printed as `path:line:col  rule  snippet` and the exit
code is 1 when anything is found, so it can gate a build.

Usage:
    python audit_tokens.py [paths...] [--token-file PATH] [--json]

Defaults: scan `src`, treat `src/styles/tokens.css` as the token file.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

SCAN_SUFFIXES = {".css", ".scss", ".sass", ".less", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".html", ".vue", ".svelte"}
SKIP_DIRS = {"node_modules", "dist", "build", ".git", "coverage", ".vite", ".next", ".turbo", "out"}

RULES = (
    ("raw-hex", re.compile(r"#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")),
    ("raw-color-fn", re.compile(r"\b(?:rgba?|hsla?)\s*\(", re.IGNORECASE)),
    ("px-value", re.compile(r"(?<![\w.-])(\d*\.?\d+)px\b", re.IGNORECASE)),
)

ALLOWED_PX = {"1px"}


def iter_files(paths: list[Path]):
    for root in paths:
        if root.is_file():
            if root.suffix.lower() in SCAN_SUFFIXES:
                yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for name in filenames:
                candidate = Path(dirpath) / name
                if candidate.suffix.lower() in SCAN_SUFFIXES:
                    yield candidate


def scan_file(path: Path, token_file: Path | None) -> list[dict]:
    if token_file is not None:
        try:
            if path.resolve() == token_file.resolve():
                return []
        except OSError:
            pass

    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return [{"path": str(path), "line": 0, "col": 0, "rule": "read-error", "snippet": str(exc)}]

    findings: list[dict] = []
    for lineno, line in enumerate(text.splitlines(), start=1):
        for rule, pattern in RULES:
            for match in pattern.finditer(line):
                token = match.group(0)
                if rule == "px-value" and token.lower() in ALLOWED_PX:
                    continue
                findings.append(
                    {
                        "path": str(path),
                        "line": lineno,
                        "col": match.start() + 1,
                        "rule": rule,
                        "snippet": line.strip()[:120],
                    }
                )
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Audit Harbour source files for banned raw values.")
    parser.add_argument("paths", nargs="*", default=["src"], help="Files or directories to scan (default: src)")
    parser.add_argument("--token-file", default="src/styles/tokens.css", help="Token file exempt from the colour rules")
    parser.add_argument("--json", action="store_true", help="Emit findings as JSON")
    args = parser.parse_args(argv)

    roots = [Path(p) for p in args.paths]
    missing = [str(p) for p in roots if not p.exists()]
    if missing:
        print(f"warning: path not found: {', '.join(missing)}", file=sys.stderr)

    token_file = Path(args.token_file)
    token_file = token_file if token_file.exists() else None

    findings: list[dict] = []
    for path in iter_files(roots):
        findings.extend(scan_file(path, token_file))

    if args.json:
        print(json.dumps(findings, indent=2))
    else:
        for item in findings:
            print(f"{item['path']}:{item['line']}:{item['col']}  {item['rule']}  {item['snippet']}")
        if findings:
            by_rule: dict[str, int] = {}
            for item in findings:
                by_rule[item["rule"]] = by_rule.get(item["rule"], 0) + 1
            summary = ", ".join(f"{rule}={count}" for rule, count in sorted(by_rule.items()))
            print(f"\n{len(findings)} finding(s): {summary}", file=sys.stderr)
        else:
            print("clean: no banned raw values found", file=sys.stderr)

    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
