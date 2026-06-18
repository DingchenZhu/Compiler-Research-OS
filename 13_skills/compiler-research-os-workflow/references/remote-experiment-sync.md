# Remote Experiment Sync Workflow

## Purpose

Use this when experiments run on another Linux host but results must be synchronized into Compiler Research OS.

Core pattern:

```text
Mac / local OS: plan, organize, analyze, write
Linux host: build, run, profile, export artifacts
Git / rsync: sync evidence back
```

## Recommended Host Layout

On Linux:

```text
~/work/Compiler-Research-OS       # Markdown OS clone
~/work/compiler-experiments       # runnable experiment code
~/work/llvm-project               # LLVM / MLIR source and build
~/work/triton                     # Triton source and environment
~/work/artifacts                  # large non-git artifacts
```

On local machine:

```text
Compiler-Research-OS              # Obsidian + writing + analysis
```

## Preferred Sync Mode: Git

Use Git for small and meaningful research artifacts:

```bash
cd ~/work/Compiler-Research-OS
git pull
# update 05_experiments/... from the Linux run
git add 05_experiments 03_source_reading 04_research 10_knowledge
git commit -m "Add experiment result: exp-YYYY-NNNN"
git push
```

Local machine:

```bash
git pull
```

## Fast Pull Mode: rsync

Use `rsync` when the Linux host has results but should not commit:

```bash
rsync -avz \
  user@linux-host:~/work/Compiler-Research-OS/05_experiments/active/exp-YYYY-NNNN-name/ \
  ./05_experiments/active/exp-YYYY-NNNN-name/
```

## Artifact Policy

Put into Git:

- `metadata.yaml`
- `README.md`
- `analysis.md`
- `results/summary.md`
- small `results/raw.csv`
- `env.txt`
- `commands.sh`
- small IR/PTX snippets

Keep remote and reference by path:

- large Nsight reports
- full traces
- binaries
- cubin archives
- build trees
- model weights
- large logs

Metadata example:

```yaml
artifacts:
  remote_host: linux-gpu-01
  remote_project_path: ~/work/compiler-experiments
  remote_artifact_path: ~/work/artifacts/exp-2026-0002
  raw_csv: results/raw.csv
  summary: results/summary.md
  nsight_report: remote:~/work/artifacts/exp-2026-0002/profile.nsys-rep
```

## Remote Run Checklist

Before running:

- Pull latest OS repo.
- Confirm experiment ID.
- Confirm code repo and commit.
- Confirm environment path.
- Record expected shapes and flags.

After running:

- Save raw result.
- Save environment.
- Save exact command.
- Save summary.
- Update analysis with facts only.
- Sync or commit results.

