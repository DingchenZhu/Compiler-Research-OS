# Compiler Research OS

Compiler Research OS is a local-first, Markdown-first workspace for long-term compiler research, source reading, experiment management, architecture design, and AI-assisted reflection.

Compiler Research OS 是一个本地优先、Markdown 优先的个人研究操作系统，用来长期管理编译器学习、源码阅读、论文阅读、实验复现、架构设计和 AI Agent 协作。

It is designed for GPU compiler work across LLVM, MLIR, Triton, CUDA, TileLang, TVM, scheduler optimization, memory planning, and hardware-compiler co-design.

当前阶段的核心目标不是把资料收集全，而是建立一个可以每天推进、每周复盘、每月沉淀的工作循环。

## MVP Launch Focus

第一阶段聚焦一个足够小但足够关键的主题：

```text
MLIR Pass Infrastructure
-> Triton Compilation Pipeline
-> GPU Scheduler / Memory Planner Mental Model
```

本周建议目标：

- 读懂一个 MLIR pass 的入口、pipeline 位置和 rewrite 逻辑。
- 建立 Triton compiler architecture 的第一张架构阅读卡。
- 跑通一个最小 benchmark 或 smoke experiment。
- 抽取 5 个 durable knowledge nodes。
- 写一份 weekly report，明确下一周的实验方向。

First-week goal:

- Understand one MLIR pass end to end.
- Build a first Triton compiler architecture reading note.
- Run one minimal benchmark or smoke experiment.
- Extract five durable knowledge nodes.
- Write one weekly report with a concrete next experiment.

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

日常节奏建议：

```text
10 min  打开 daily log，确定今日 focus
70 min  深度任务：源码 / 论文 / 实验 / 原型，只选一个
25 min  记录理解、问题、链接、代码位置
15 min  维护知识库：frontmatter、wikilink、next action
```

每天只追求一个真实推进。不要让系统维护吞掉研究本体。

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

## First Batch Materials

当前已经创建的第一批材料：

- `01_daily/2026/daily-2026-06-19.md`: 今日启动记录 / launch daily log
- `04_research/ideas/idea-2026-0001-mlir-pass-pipeline-mental-model.md`: 第一个 research idea
- `03_source_reading/mlir/src-mlir-pass-infrastructure-first-reading.md`: 第一个源码阅读计划
- `02_papers/reading/paper-triton-compiler-architecture-reading.md`: Triton compiler architecture 阅读卡
- `10_knowledge/concepts/`: 第一批 compiler knowledge nodes
- `05_experiments/active/exp-2026-0001-mvp-smoke-test-experiment/`: MVP smoke experiment skeleton
