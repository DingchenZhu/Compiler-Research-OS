# Compiler Research OS

Compiler Research OS is a local-first, Markdown-first workspace for long-term compiler research, source reading, experiment management, architecture design, and AI-assisted reflection.

It is designed for GPU compiler work across LLVM, MLIR, Triton, CUDA, TileLang, TVM, scheduler optimization, memory planning, and hardware-compiler co-design.

## Principles

- Git first: every meaningful change should be reviewable.
- Markdown first: notes remain readable without special tools.
- Local first: no database or web service is required.
- Obsidian compatible: wikilinks, tags, and YAML frontmatter are first-class.
- AI native: structure notes so Codex and other agents can read, update, and reason over them.
- Experiment driven: research ideas should eventually connect to reproducible experiments.
- Architecture oriented: the system exists to build compiler architect judgment, not to collect links.

## Directory Map

```text
00_inbox/           Raw notes, links, questions, and tasks before triage
01_daily/           Daily logs, weekly reports, and monthly reviews
02_papers/          Paper notes, paper cards, related work, and reading queues
03_source_reading/  LLVM, MLIR, Triton, CUDA, TileLang, and TVM reading notes
04_research/        Ideas, problems, hypotheses, claims, drafts, and research threads
05_experiments/     Reproducible experiments, failures, reports, and benchmark suites
06_projects/        Project notes that link to implementation repositories
07_architecture/    ADRs, proposals, reviews, design docs, and principles
08_outputs/         Blogs, talks, papers, tech reports, and open-source docs
09_templates/       Markdown templates with YAML frontmatter
10_knowledge/       Concepts, systems, problems, principles, and world model
11_agents/          Agent prompts, task records, outputs, logs, and guardrails
12_roadmap/         Yearly, quarterly, and monthly plans plus skill tree
scripts/            Local helper scripts for notes and experiments
```

## Daily Workflow

1. Create or update today's note in `01_daily/YYYY/`.
2. Pick one deep task: paper, source reading, experiment, or prototype.
3. Capture questions, decisions, and links while working.
4. Move durable knowledge into `10_knowledge/`.
5. Link ideas, experiments, papers, and source notes with wikilinks.

## Research Workflow

```text
Observation
-> Problem
-> Hypothesis
-> Related Work
-> Experiment Design
-> Prototype
-> Result
-> Analysis
-> Limitation
-> Paper Claim
-> Paper Draft
-> Artifact
-> Open Source
```

## Experiment Workflow

Each experiment should include:

- `metadata.yaml`
- `README.md`
- `run.sh`
- `inputs/`
- `configs/`
- `dumps/`
- `profiles/`
- `results/`
- `analysis.md`
- `artifacts/`

Every experiment should record git commit, environment, GPU, CUDA, input shape, compiler flags, raw results, and conclusion.

## AI Agent Usage

Agent prompts live in `11_agents/prompts/`. Agents should:

- Read YAML frontmatter first.
- Prefer linked evidence over unsupported inference.
- Mark uncertainty explicitly.
- Never invent papers, results, commits, or benchmark numbers.
- Preserve the distinction between facts, hypotheses, and conclusions.

## Naming

Recommended IDs:

```text
daily-YYYY-MM-DD
weekly-YYYY-WNN
monthly-YYYY-MM
paper-short-title-year
src-system-topic
idea-YYYY-NNNN
exp-YYYY-NNNN
fail-YYYY-NNNN
adr-YYYY-NNNN
concept-name
project-name
```

## Getting Started

Create a daily note:

```bash
python scripts/new_note.py daily "Daily Log"
```

Create a research idea:

```bash
python scripts/new_note.py research_idea "Shared Memory Aware Scheduler"
```

Create an experiment:

```bash
python scripts/new_experiment.py "Baseline Triton Matmul Schedule Benchmark"
```

