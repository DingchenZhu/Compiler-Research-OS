#!/usr/bin/env python3
"""Create a Markdown note from a Compiler Research OS template."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

TEMPLATE_BY_TYPE = {
    "daily": "daily_log.md",
    "daily_log": "daily_log.md",
    "paper": "paper_note.md",
    "source": "source_reading.md",
    "source_reading": "source_reading.md",
    "idea": "research_idea.md",
    "research_idea": "research_idea.md",
    "experiment": "experiment_record.md",
    "failed_experiment": "failed_experiment.md",
    "adr": "adr.md",
    "weekly": "weekly_report.md",
    "weekly_report": "weekly_report.md",
    "monthly": "monthly_review.md",
    "monthly_review": "monthly_review.md",
    "technical_share": "technical_share.md",
    "project": "project_note.md",
    "knowledge": "knowledge_node.md",
    "knowledge_node": "knowledge_node.md",
}

DEST_BY_TYPE = {
    "daily": "01_daily/{year}",
    "daily_log": "01_daily/{year}",
    "paper": "02_papers/reading",
    "source": "03_source_reading/reading_maps",
    "source_reading": "03_source_reading/reading_maps",
    "idea": "04_research/ideas",
    "research_idea": "04_research/ideas",
    "experiment": "05_experiments/active",
    "failed_experiment": "05_experiments/failed",
    "adr": "07_architecture/adr",
    "weekly": "01_daily/weekly",
    "weekly_report": "01_daily/weekly",
    "monthly": "01_daily/monthly",
    "monthly_review": "01_daily/monthly",
    "technical_share": "08_outputs/talks",
    "project": "06_projects",
    "knowledge": "10_knowledge/concepts",
    "knowledge_node": "10_knowledge/concepts",
}


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return slug or "untitled"


def next_number(prefix: str, directory: Path) -> str:
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d{{4}})")
    highest = 0
    if directory.exists():
        for path in directory.glob(f"{prefix}-*.md"):
            match = pattern.match(path.stem)
            if match:
                highest = max(highest, int(match.group(1)))
    return f"{highest + 1:04d}"


def build_id(note_type: str, title: str, today: dt.date, dest: Path) -> str:
    if note_type in {"daily", "daily_log"}:
        return f"daily-{today.isoformat()}"
    if note_type in {"weekly", "weekly_report"}:
        iso = today.isocalendar()
        return f"weekly-{iso.year}-W{iso.week:02d}"
    if note_type in {"monthly", "monthly_review"}:
        return f"monthly-{today:%Y-%m}"
    if note_type in {"idea", "research_idea"}:
        return f"idea-{today.year}-{next_number(f'idea-{today.year}', dest)}"
    if note_type == "experiment":
        return f"exp-{today.year}-{next_number(f'exp-{today.year}', dest)}"
    if note_type == "failed_experiment":
        return f"fail-{today.year}-{next_number(f'fail-{today.year}', dest)}"
    if note_type == "adr":
        return f"adr-{today.year}-{next_number(f'adr-{today.year}', dest)}"
    if note_type == "paper":
        return f"paper-{slugify(title)}"
    if note_type in {"source", "source_reading"}:
        return f"src-{slugify(title)}"
    if note_type in {"knowledge", "knowledge_node"}:
        return f"concept-{slugify(title)}"
    if note_type == "project":
        return f"project-{slugify(title)}"
    if note_type == "technical_share":
        return f"talk-{today.year}-{next_number(f'talk-{today.year}', dest)}"
    return slugify(title)


def replace_common_fields(content: str, note_id: str, title: str, today: dt.date) -> str:
    date_text = today.isoformat()
    iso = today.isocalendar()
    token_replacements = {
        "YYYY-MM-DD": date_text,
        "YYYY-MM": f"{today:%Y-%m}",
        "YYYY-WNN": f"{iso.year}-W{iso.week:02d}",
        "YYYY-NNNN": note_id.split("-", 1)[1] if "-" in note_id else note_id,
    }
    for old, new in token_replacements.items():
        content = content.replace(old, new)

    title_headings = {
        "# Paper Title": f"# {title}",
        "# Source Reading": f"# {title}",
        "# Research Idea": f"# {title}",
        "# Experiment": f"# {title}",
        "# ADR: Title": f"# ADR: {title}",
        "# Technical Share": f"# {title}",
        "# Project": f"# {title}",
        "# Knowledge Node": f"# {title}",
    }

    lines = []
    in_frontmatter = False
    for index, line in enumerate(content.splitlines()):
        if index == 0 and line == "---":
            in_frontmatter = True
            lines.append(line)
            continue
        if in_frontmatter and line == "---":
            in_frontmatter = False
            lines.append(line)
            continue
        if in_frontmatter and line.startswith("id: "):
            lines.append(f"id: {note_id}")
            continue
        if in_frontmatter and (line == "title:" or line.startswith("title: ")):
            lines.append(f"title: {title}")
            continue
        lines.append(title_headings.get(line, line))

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("type", choices=sorted(TEMPLATE_BY_TYPE))
    parser.add_argument("title")
    parser.add_argument("--output-dir", help="Override destination directory.")
    parser.add_argument("--force", action="store_true", help="Overwrite an existing note.")
    args = parser.parse_args()

    today = dt.date.today()
    template_path = ROOT / "09_templates" / TEMPLATE_BY_TYPE[args.type]
    if not template_path.exists():
        raise SystemExit(f"Missing template: {template_path}")

    dest_template = args.output_dir or DEST_BY_TYPE[args.type]
    dest_dir = ROOT / dest_template.format(year=today.year)
    dest_dir.mkdir(parents=True, exist_ok=True)

    note_id = build_id(args.type, args.title, today, dest_dir)
    output_path = dest_dir / f"{note_id}.md"
    if output_path.exists() and not args.force:
        raise SystemExit(f"Refusing to overwrite existing note: {output_path}")

    content = template_path.read_text(encoding="utf-8")
    content = replace_common_fields(content, note_id, args.title, today)
    output_path.write_text(content, encoding="utf-8")
    try:
        print(output_path.relative_to(ROOT))
    except ValueError:
        print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
