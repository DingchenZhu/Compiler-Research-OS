---
name: compiler-research-os-workflow
description: Use this skill when managing Compiler Research OS workflows across remote Linux experiments, paper reading, source reading, research ideas, architecture notes, personal reflections, weekly/monthly reviews, and data synchronization into the local Markdown/Git/Obsidian OS.
---

# Compiler Research OS Workflow

Use this skill to operate the user's Compiler Research OS as a research system, not a passive note collection.

## Core Rule

Every meaningful item should connect to at least one of:

- `Problem`
- `Hypothesis`
- `Experiment`
- `Source Reading`
- `Paper`
- `Architecture Decision`
- `Knowledge Node`
- `Output`

If a note has no connection, either link it, triage it, or leave it in `00_inbox/`.

## Default Operating Loop

```text
Plan locally
-> Run or read deeply
-> Capture evidence
-> Sync artifacts
-> Analyze
-> Extract durable knowledge
-> Decide next action
```

## When Starting Work

1. Read today's daily log in `01_daily/YYYY/`.
2. Identify the active focus from `12_roadmap/skill_tree.md` and current weekly/monthly notes.
3. Pick one track only: paper, source reading, experiment, architecture, or reflection.
4. Update the relevant note before doing broad exploration.

## Workflow References

Read only the reference needed for the task:

- Remote Linux experiments and artifact sync: `references/remote-experiment-sync.md`
- Experiment design and execution: `references/experiment-workflow.md`
- Paper reading and literature workflow: `references/paper-reading-workflow.md`
- Research idea pipeline: `references/research-idea-workflow.md`
- Architecture research and ADR workflow: `references/architecture-workflow.md`
- Personal thinking, reflection, and review workflow: `references/reflection-review-workflow.md`

## File Placement

- Daily work: `01_daily/YYYY/`
- Papers: `02_papers/`
- Source reading: `03_source_reading/`
- Research ideas: `04_research/ideas/`
- Experiments: `05_experiments/`
- Project links: `06_projects/`
- Architecture decisions: `07_architecture/`
- Outputs: `08_outputs/`
- Templates: `09_templates/`
- Durable knowledge: `10_knowledge/`
- Agent prompts: `11_agents/`
- Roadmap: `12_roadmap/`
- Skills: `13_skills/`

## Synchronization Policy

The OS is the source of truth for research evidence and reasoning, not necessarily for all raw artifacts.

Commit to Git:

- Markdown notes
- YAML metadata
- small CSV results
- command logs
- environment summaries
- compact IR/PTX snippets
- analysis and conclusions

Do not commit by default:

- large profiler reports
- build directories
- binaries
- model weights
- conda/venv environments
- long raw traces

Record large artifact paths in metadata instead.

## AI Behavior

When using this skill:

- Prefer updating existing notes over creating duplicates.
- Preserve YAML frontmatter and wikilinks.
- Mark uncertainty explicitly.
- Never invent benchmark results, paper claims, source behavior, commits, or profiler data.
- Separate facts, hypotheses, interpretations, and decisions.
- Keep bilingual output when useful: Chinese first, English for key terms and summaries.

