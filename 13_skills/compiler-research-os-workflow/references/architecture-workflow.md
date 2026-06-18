# Architecture Workflow

## Purpose

Use this for architecture design, ADRs, compiler design proposals, and reviews.

## Architecture Objects

- ADR: concrete decision with context and consequences
- Proposal: larger design still under exploration
- Review: critique of an existing design
- Principle: durable design judgment

## Design Flow

```text
Context
-> Requirements
-> Constraints
-> Alternatives
-> Decision
-> Consequences
-> Validation
-> Revisit Condition
```

## Compiler Architecture Review Checklist

Check:

- abstraction boundary
- IR ownership
- transformation invariants
- analysis dependencies
- pass ordering
- target assumptions
- memory model
- scheduler interface
- test strategy
- failure modes
- performance risks

## ADR Completion Standard

An ADR is complete when:

- decision is explicit
- alternatives are documented
- consequences are honest
- validation plan exists
- revisit condition is written

## Output Links

Architecture notes should link to:

- project notes
- experiments
- source reading
- research ideas
- knowledge nodes

