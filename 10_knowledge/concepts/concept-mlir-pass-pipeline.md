---
id: concept-mlir-pass-pipeline
type: knowledge_node
node_type: concept
title: MLIR Pass Pipeline
status: evergreen
tags: [knowledge, mlir, pass-pipeline]
aliases:
  - MLIR Pass Pipeline
  - MLIR Pass 流水线
related:
  related_to:
    - [[Compiler Pass]]
    - [[IR Transformation]]
  depends_on:
    - [[Compiler Pass]]
  supports:
    - [[MLIR Pass Pipeline Mental Model]]
  contradicts: []
  used_by:
    - [[MLIR Pass Infrastructure First Reading]]
created: 2026-06-19
updated: 2026-06-19
---

# MLIR Pass Pipeline

## Definition

MLIR pass pipeline 是一组按顺序或嵌套结构组织的 passes，用于逐步分析、规范化、转换和降低 IR。

An MLIR pass pipeline is an ordered or nested composition of passes that analyze, canonicalize, transform, and lower IR.

## Mental Model

```text
high-level IR
-> canonicalization
-> analysis
-> dialect conversion
-> optimization
-> lowering
-> target-specific IR/code
```

## Why It Matters

理解 pass pipeline 是理解 compiler architecture 的入口。很多性能和正确性问题不是单个 pass 的问题，而是 pipeline ordering 和 abstraction boundary 的问题。

## Compiler Relevance

- Dialect 设计必须考虑 lowering pipeline。
- Scheduler 必须知道它能看到哪些 IR 信息。
- Memory planner 必须知道 buffer lifetime 在哪个 IR 层级最清晰。

## Key Tradeoffs

- 早优化可能丢失高层语义。
- 晚优化可能错过低成本 transformation。
- pipeline 越灵活，debug 和 reproducibility 越重要。

## Examples

待源码阅读和实验补充。

## Related Concepts

- [[Compiler Pass]]
- [[IR Transformation]]

## Open Questions

- MLIR nested pass manager 如何影响 pipeline mental model？
- pass failure 和 verifier 在 pipeline 中如何交互？

## References

- [[MLIR Pass Infrastructure First Reading]]
