---
id: concept-compiler-pass
type: knowledge_node
node_type: concept
title: Compiler Pass
status: evergreen
tags: [knowledge, compiler, pass]
aliases:
  - 编译器 Pass
related:
  related_to:
    - [[MLIR Pass Pipeline]]
  depends_on:
    - [[IR Transformation]]
  supports:
    - [[MLIR Pass Pipeline Mental Model]]
  contradicts: []
  used_by:
    - [[MLIR Pass Infrastructure First Reading]]
created: 2026-06-19
updated: 2026-06-19
---

# Compiler Pass

## Definition

Compiler pass 是编译器中对 IR 执行 analysis 或 transformation 的基本单元。

A compiler pass is a unit that performs analysis or transformation over an intermediate representation.

## Mental Model

把 pass 看成一个带约束的 IR 函数：

```text
IR_before + analysis + options -> IR_after + preserved/invalidated analyses
```

## Why It Matters

Scheduler、memory planner、lowering、canonicalization 通常都以 pass 或 pass pipeline 的形式进入编译器。

## Compiler Relevance

- Pass boundary 决定 transformation 的职责边界。
- Pass invariant 决定 correctness。
- Pass pipeline 决定 optimization ordering。

## Key Tradeoffs

- 单个 pass 简单 vs pipeline 复杂。
- pass 粒度细方便组合，但调试成本更高。
- pass 粒度粗方便优化全局上下文，但复用性差。

## Examples

- Canonicalization pass
- Dialect conversion pass
- CSE pass
- Lowering pass

## Related Concepts

- [[MLIR Pass Pipeline]]
- [[IR Transformation]]

## Open Questions

- 一个 scheduler 应该作为独立 pass，还是嵌入 lowering pipeline？
- memory planner 应该依赖哪个 IR 层级的信息？

## References

- [[MLIR Pass Infrastructure First Reading]]
