---
id: problem-understanding-compiler-transformation-pipelines
type: knowledge_node
node_type: problem
title: Understanding Compiler Transformation Pipelines
status: active
tags: [knowledge, problem, compiler-architecture, mlir]
aliases:
  - Understanding Compiler Transformation Pipelines
  - 理解编译器变换流水线
related:
  related_to:
    - [[MLIR Pass Pipeline]]
    - [[Compiler Pass]]
    - [[IR Transformation]]
  supports:
    - [[MLIR Pass Pipeline Mental Model]]
created: 2026-06-23
updated: 2026-06-23
---

# Understanding Compiler Transformation Pipelines

## Definition

理解编译器变换流水线，指的是能解释一个程序表示如何经过多个 analysis、rewrite、conversion、lowering 和 codegen 阶段逐步变成目标代码。

Understanding compiler transformation pipelines means being able to explain how a program representation moves through analysis, rewriting, conversion, lowering, and code generation stages.

## Why It Matters

Scheduler、memory planner、dialect design 和 codegen 都不是孤立模块。它们的有效性取决于所在 IR 层级、pipeline 顺序、可见信息和必须维护的 invariants。

## Compiler Relevance

- Pass ordering affects correctness and optimization opportunity.
- IR abstraction level determines what information a pass can use.
- Lowering boundaries decide where scheduler and memory planner decisions should live.
- Failed transformations are often architecture boundary problems, not just local bugs.

## Open Questions

- MLIR nested pass pipeline 的最小阅读路径是什么？
- Scheduler 应该在哪个 IR 层级做决策？
- Memory planner 应该依赖 high-level tensor semantics 还是 low-level buffer information？

## Related Notes

- [[MLIR Pass Pipeline Mental Model]]
- [[MLIR Pass Infrastructure First Reading]]
- [[Triton Compiler Architecture Reading]]

