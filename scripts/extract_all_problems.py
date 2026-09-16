# -*- coding: utf-8 -*-
"""
Rebuilds src/data/pdfProblems.{json,js} from ALL 11 official PDFs in pdf/.

Supersedes rebuild_problems.py, which parsed only the 9 addition-table
categories and carried l4-1 / l4-2 over from the previous JSON (leaving them
at 67/77 of the required 130/150). This script also parses the level-4
multiplication pages, so every category is derived from its PDF.

Two sheet formats are handled:
  * Addition tables  — column blocks headed "A1 # A2 # ..." (also B/C).
                       Each column is one problem; rows are the floors.
  * Multiplication   — lines of "Opé N  a x b = ......" (level 4, page 2).
                       Opé numbers restart per group, so problems are
                       classified by operand shape (1x2 / 1x3 / 2x2) and
                       ordered by Opé number within each group.

Level-4 output order follows the official sheet: multiplication first
(1x2 -> 1x3 -> 2x2), then the مركب addition tables (A then B).

Usage:  python scripts/extract_all_problems.py
"""
import json
import re
import sys
from pathlib import Path

import pypdf

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
JSON_OUT = ROOT / "src" / "data" / "pdfProblems.json"
JS_OUT = ROOT / "src" / "data" / "pdfProblems.js"

PDF_MAP = {
    "prep": "تحضيري.pdf",
    "l1-1": "م1ف1.pdf",
    "l1-2": "م1ف2.pdf",
    "l1-3": "م1ف3.pdf",
    "l1-4": "م1ف4.pdf",
    "l2-1": "م2ف1.pdf",
    "l2-2": "م2ف2.pdf",
    "l3-1": "م3ف1.pdf",
    "l3-2": "م3ف2.pdf",
    "l4-1": "م4ف1.pdf",
    "l4-2": "م4ف2.pdf",
}

# Expected multiplication composition per official federation table.
MUL_EXPECTED = {
    "l4-1": {"1x2": 40, "1x3": 40, "2x2": 20},
    "l4-2": {"1x2": 40, "1x3": 40, "2x2": 30},
}

STAGE_BY_PREFIX = {
    "A": ("units", "آحاد (وحدات)"),
    "B": ("tens", "عشرات"),
    "C": ("hundreds", "مئات"),
}

MUL_LABEL = {
    "1x2": "ضرب: رقم × رقمين",
    "1x3": "ضرب: رقم × 3 أرقام",
    "2x2": "ضرب: رقمين × رقمين",
}

ID_RE = re.compile(r"\b([ABC]\d+)\b")
MUL_RE = re.compile(r"Opé\s*(\d+)\s+(\d+)\s*[x×]\s*(\d+)")


def pdf_text(path):
    reader = pypdf.PdfReader(str(path))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def parse_addition(text):
    """Column-block addition tables -> list of problem dicts, A then B then C."""
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    problems = {}
    order = []
    i = 0
    while i < len(lines):
        ids = ID_RE.findall(lines[i])
        if len(ids) < 5:
            i += 1
            continue

        cols = len(ids)
        i += 1
        rows = []
        while i < len(lines):
            line = lines[i]
            if line.startswith("=") or "بالتوفيق" in line or len(ID_RE.findall(line)) >= 5:
                break
            tokens = line.split()
            # Leading token is the floor number when present.
            if len(tokens) == cols + 1 and tokens[0].isdigit():
                tokens = tokens[1:]
            if len(tokens) == cols:
                try:
                    rows.append([int(t) for t in tokens])
                except ValueError:
                    pass
            i += 1

        for col, pid in enumerate(ids):
            if pid in problems:  # defensive: never overwrite a parsed column
                continue
            values = [r[col] for r in rows]
            stage, label = STAGE_BY_PREFIX[pid[0]]
            problems[pid] = {
                "id": pid,
                "stage": stage,
                "stageLabel": label,
                "numbers": [{"val": abs(v), "sign": 1 if v >= 0 else -1} for v in values],
                "correctAnswer": sum(values),
                "isMultiplication": False,
            }
            order.append(pid)

    def by_prefix(p):
        return [problems[i] for i in order if i.startswith(p)]

    return by_prefix("A") + by_prefix("B") + by_prefix("C")


def parse_multiplication(text):
    """'Opé N a x b' lines -> {shape: {ope_number: (a, b)}}."""
    groups = {}
    for m in MUL_RE.finditer(text):
        num, a, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        shape = f"{len(str(a))}x{len(str(b))}"
        groups.setdefault(shape, {})
        # Opé numbers are unique within a shape; keep the first occurrence.
        groups[shape].setdefault(num, (a, b))
    return groups


def build_multiplication(groups, expected, cat):
    """Flatten to the official order 1x2 -> 1x3 -> 2x2, warning on any shortfall."""
    out = []
    for shape in ("1x2", "1x3", "2x2"):
        found = groups.get(shape, {})
        want = expected[shape]
        if len(found) != want:
            print(f"    WARNING {cat}: {shape} has {len(found)} operations, expected {want}")
        for num in sorted(found):
            a, b = found[num]
            out.append({
                "id": f"Ope{num}_{shape}",
                "stage": "mul",
                "stageLabel": MUL_LABEL[shape],
                "numbers": [{"val": a, "sign": 1}, {"val": b, "sign": 1}],
                "correctAnswer": a * b,
                "isMultiplication": True,
                "text": f"{a} × {b}",
            })
    for shape in sorted(set(groups) - {"1x2", "1x3", "2x2"}):
        print(f"    WARNING {cat}: unexpected operand shape {shape} ({len(groups[shape])} ops) — skipped")
    return out


def main():
    data = {}
    print("Parsing PDFs\n" + "=" * 62)
    for cat, filename in PDF_MAP.items():
        path = ROOT / "pdf" / filename
        if not path.exists():
            print(f"  SKIP {cat}: {filename} not found")
            continue

        text = pdf_text(path)
        additions = parse_addition(text)

        if cat in MUL_EXPECTED:
            mul = build_multiplication(parse_multiplication(text), MUL_EXPECTED[cat], cat)
            # Official sheet order: multiplication first, then مركب tables.
            problems = mul + additions
            breakdown = f"mul={len(mul)} add={len(additions)}"
        else:
            problems = additions
            counts = {}
            for p in problems:
                counts[p["stage"]] = counts.get(p["stage"], 0) + 1
            breakdown = " ".join(f"{k}={v}" for k, v in counts.items())

        data[cat] = problems
        print(f"  {cat:6} {filename:14} -> {len(problems):>3} problems   ({breakdown})")

    JSON_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "// Auto-generated from the official PDFs in pdf/ — DO NOT EDIT MANUALLY",
        "// Regenerate with: python scripts/extract_all_problems.py",
        "// Each key is a category ID (prep, l1-1, ... l4-2) from src/data/levels.js",
        "",
        "export const pdfProblems = {",
    ]
    for key, problems in data.items():
        lines.append(f'  "{key}": [')
        for p in problems:
            lines.append("    " + json.dumps(p, ensure_ascii=False, separators=(",", ":")) + ",")
        lines.append("  ],")
    lines.append("};")
    lines.append("")
    JS_OUT.write_text("\n".join(lines), encoding="utf-8")

    total = sum(len(v) for v in data.values())
    print("=" * 62)
    print(f"Wrote {JSON_OUT.relative_to(ROOT)} and {JS_OUT.relative_to(ROOT)}")
    print(f"Categories: {len(data)}   Total problems: {total}")


if __name__ == "__main__":
    main()
