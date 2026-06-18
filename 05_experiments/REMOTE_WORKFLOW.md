---
id: remote-experiment-workflow
type: workflow
title: Remote Experiment Workflow
status: active
tags: [workflow, experiment, remote-sync]
created: 2026-06-19
updated: 2026-06-19
related:
  skills:
    - [[compiler-research-os-workflow]]
---

# Remote Experiment Workflow

## Core Pattern

```text
Plan locally
-> Run remotely
-> Sync evidence
-> Analyze locally
-> Extract knowledge
```

## Linux Host Responsibility

- Build LLVM / MLIR / Triton / CUDA experiments.
- Run benchmark and profiler.
- Produce portable artifacts.
- Record exact environment and command.

## Compiler Research OS Responsibility

- Store metadata, summaries, raw small results, analysis, and decisions.
- Link experiment to paper, source reading, idea, and knowledge nodes.
- Preserve evidence trail.

## Recommended Layout

Linux host:

```text
~/work/Compiler-Research-OS
~/work/compiler-experiments
~/work/llvm-project
~/work/triton
~/work/artifacts
```

Local machine:

```text
/Users/schropim/new-ws/Compiler-Research-OS
```

## Sync Options

Preferred:

```bash
git pull
git add 05_experiments 03_source_reading 04_research 10_knowledge
git commit -m "Add experiment result: exp-YYYY-NNNN"
git push
```

Fast artifact pull:

```bash
rsync -avz user@linux-host:~/work/Compiler-Research-OS/05_experiments/active/exp-YYYY-NNNN-name/ ./05_experiments/active/exp-YYYY-NNNN-name/
```

## Git Policy

Commit:

- Markdown
- YAML
- small CSV
- summaries
- commands
- environment
- compact IR/PTX

Keep remote:

- build trees
- large traces
- Nsight reports
- cubin archives
- binaries
- model weights

