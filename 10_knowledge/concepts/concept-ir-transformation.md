---
id: concept-ir-transformation
type: knowledge_node
node_type: concept
title: IR Transformation
status: evergreen
tags: [knowledge, compiler, ir]
aliases:
  - IR 变换
related:
  related_to:
    - [[Compiler Pass]]
    - [[MLIR Pass Pipeline]]
  depends_on: []
  supports:
    - [[MLIR Pass Pipeline Mental Model]]
  contradicts: []
  used_by:
    - [[MLIR Pass Infrastructure First Reading]]
created: 2026-06-19
updated: 2026-06-19
---

# IR Transformation

## Definition

IR transformation 是在保持语义或按目标语义转换的前提下，对中间表示进行结构变化的过程。

IR transformation changes the structure of an intermediate representation while preserving semantics or lowering it toward target semantics.

## Mental Model

```text
semantic intent
-> IR pattern
-> rewrite rule
-> legality check
-> transformed IR
```

## Why It Matters

Compiler 的核心工作不是“生成代码”这么简单，而是在多个 IR 层级之间不断重写、降低和优化。

## Compiler Relevance

- Scheduler transformation 可能改变 execution order。
- Memory transformation 可能改变 allocation、layout 或 reuse。
- Lowering transformation 改变 abstraction level。

## Key Tradeoffs

- 保留高层语义 vs 暴露底层优化机会。
- 局部 rewrite 简单 vs 全局 optimization 更强。
- transformation correctness 往往比 performance 更难保证。

## Examples

- loop tiling
- operation fusion
- bufferization
- dialect conversion
- layout rewrite

## Related Concepts

- [[Compiler Pass]]
- [[MLIR Pass Pipeline]]

## Open Questions

- 如何为一个 transformation 写最小但有效的测试？
- 哪些 transformation 应该保留 source-level debug 信息？

## References

- [[MLIR Pass Infrastructure First Reading]]
