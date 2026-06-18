#!/usr/bin/env python3
"""Create a reproducible experiment skeleton for Compiler Research OS."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return slug or "untitled"


def next_experiment_id(year: int, directory: Path) -> str:
    pattern = re.compile(rf"^exp-{year}-(\d{{4}})")
    highest = 0
    if directory.exists():
        for path in directory.glob(f"exp-{year}-*"):
            match = pattern.match(path.name)
            if match:
                highest = max(highest, int(match.group(1)))
    return f"exp-{year}-{highest + 1:04d}"


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise SystemExit(f"Refusing to overwrite existing file: {path}")
    path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("title")
    parser.add_argument("--project", default="")
    parser.add_argument("--gpu", default="")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    today = dt.date.today()
    active_dir = ROOT / "05_experiments" / "active"
    active_dir.mkdir(parents=True, exist_ok=True)
    exp_id = next_experiment_id(today.year, active_dir)
    exp_dir = active_dir / f"{exp_id}-{slugify(args.title)}"
    if exp_dir.exists() and not args.force:
        raise SystemExit(f"Experiment already exists: {exp_dir}")

    for subdir in [
        "inputs",
        "configs",
        "dumps/ir",
        "dumps/ptx",
        "dumps/cubin",
        "profiles/nsight",
        "profiles/logs",
        "results",
        "artifacts",
    ]:
        (exp_dir / subdir).mkdir(parents=True, exist_ok=True)

    metadata = f"""id: {exp_id}
title: {args.title}
status: planned
created: {today.isoformat()}
updated: {today.isoformat()}
owner: me

project:
  name: {args.project}
  repo:
  commit:
  dirty:

environment:
  os:
  python:
  cuda:
  driver:
  gpu: {args.gpu}
  gpu_memory:
  compiler:
  triton:
  llvm:

inputs:
  model:
  shapes: []
  dtype:

compiler_config:
  flags: []
  num_warps:
  num_stages:
  block_size:

artifacts:
  ir_dump: dumps/ir/
  ptx_dump: dumps/ptx/
  cubin_dump: dumps/cubin/
  profiler: profiles/

metrics:
  - latency_ms
  - tflops
  - bandwidth_gbps
  - occupancy
  - register_count
  - shared_memory_bytes

related:
  idea:
  hypothesis:
  paper:
"""

    readme = f"""# {args.title}

## Goal

## Hypothesis

## How to Run

```bash
./run.sh
```

## Artifacts

- `metadata.yaml`
- `env.txt`
- `inputs/`
- `configs/`
- `dumps/`
- `profiles/`
- `results/`
- `analysis.md`

## Reproducibility Checklist

- [ ] Git commit recorded
- [ ] Git dirty state recorded
- [ ] Environment recorded
- [ ] GPU and CUDA recorded
- [ ] Input shapes recorded
- [ ] Commands recorded
- [ ] Raw results preserved
- [ ] Analysis written
"""

    run_sh = """#!/usr/bin/env bash
set -euo pipefail

EXP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$EXP_DIR"

echo "[exp] collecting environment"
{
  date
  uname -a
  python --version || true
  if command -v nvidia-smi >/dev/null 2>&1; then
    nvidia-smi
  else
    echo "nvidia-smi: not available"
  fi
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git rev-parse HEAD
    git status --short
  else
    echo "git: not a repository"
  fi
} > env.txt

echo "[exp] add benchmark command here"
echo "No benchmark command configured yet." | tee results/raw.txt
"""

    analysis = """# Analysis

## Question

## Hypothesis

## Evidence

## Interpretation

## Surprises

## Failure Modes

## Confidence

## Conclusion

## Next Experiment
"""

    result_summary = """# Result Summary

## Summary Table

## Best Case

## Worst Case

## Baseline Comparison

## Raw Files

## Notes
"""

    shapes = """shapes: []
"""

    config = """compiler_config:
  flags: []
benchmark:
  warmup:
  repeat:
  seed:
"""

    write_file(exp_dir / "metadata.yaml", metadata, args.force)
    write_file(exp_dir / "README.md", readme, args.force)
    write_file(exp_dir / "run.sh", run_sh, args.force)
    (exp_dir / "run.sh").chmod(0o755)
    write_file(exp_dir / "analysis.md", analysis, args.force)
    write_file(exp_dir / "results" / "summary.md", result_summary, args.force)
    write_file(exp_dir / "inputs" / "shapes.yaml", shapes, args.force)
    write_file(exp_dir / "configs" / "config.yaml", config, args.force)

    print(exp_dir.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
