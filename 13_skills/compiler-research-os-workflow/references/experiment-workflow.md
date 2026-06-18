# Experiment Workflow

## Purpose

Use this for designing, running, recording, and analyzing compiler experiments.

## Experiment Lifecycle

```text
Question
-> Hypothesis
-> Baseline
-> Variables
-> Metrics
-> Run Plan
-> Execution
-> Raw Results
-> Analysis
-> Conclusion
-> Next Experiment
```

## Design Rules

- Start from a testable hypothesis.
- Change one major variable at a time when possible.
- Always define baseline before optimization.
- Record failure as data.
- Do not create performance claims from incomplete runs.

## Required Files

```text
05_experiments/active/exp-YYYY-NNNN-name/
├── metadata.yaml
├── README.md
├── run.sh
├── env.txt
├── commands.sh
├── inputs/
├── configs/
├── dumps/
├── profiles/
├── results/
└── analysis.md
```

## Required Metadata

- experiment ID
- title
- status
- related idea / hypothesis / paper
- project repo
- git commit
- dirty state
- OS
- Python
- CUDA
- driver
- GPU
- compiler versions
- input shapes
- compiler flags
- metrics
- artifact paths

## Analysis Discipline

Use this separation:

```text
Facts: measured numbers, exact commands, environment
Interpretation: plausible explanations
Hypotheses: claims needing more experiments
Decision: what to do next
```

Never let interpretation masquerade as fact. Tiny dragon, big fire. Keep it leashed.

## Completion Standard

An experiment is complete only when:

- raw results exist
- metadata is filled
- environment is recorded
- commands are reproducible
- analysis states whether the hypothesis is supported
- next action is explicit

