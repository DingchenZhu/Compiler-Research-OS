---
id: concept-triton-compilation-pipeline
type: knowledge_node
node_type: concept
title: Triton Compilation Pipeline
status: evergreen
tags: [knowledge, triton, gpu-compiler]
aliases:
  - Triton 编译流水线
related:
  related_to:
    - [[MLIR Pass Pipeline]]
    - [[Memory Hierarchy]]
    - [[GPU Occupancy]]
  depends_on:
    - [[Compiler Pass]]
    - [[IR Transformation]]
  supports:
    - [[Triton Compiler Architecture Reading]]
  contradicts: []
  used_by: []
created: 2026-06-19
updated: 2026-06-19
---

# Triton Compilation Pipeline

## Definition

Triton compilation pipeline 是 Triton 将 Python DSL 表达的 tensor program 转换为 GPU 可执行代码的编译路径。

The Triton compilation pipeline transforms tensor programs written in the Triton Python DSL into executable GPU code.

## Mental Model

初始心智模型，待源码和实验验证：

```text
Python DSL
-> Triton IR
-> optimization / layout / scheduling related passes
-> LLVM-related lowering
-> PTX / binary
```

## Why It Matters

Triton 是研究 AI compiler architecture 的高价值样本，因为它把用户可控 schedule meta-parameters 和 compiler internal lowering 连接在一起。

## Compiler Relevance

- Scheduler design 可以从 Triton meta-parameters 和 pass pipeline 中获得启发。
- Memory planner design 可以观察 Triton 如何表达 block-level memory behavior。
- Experiment system 可以用 Triton benchmark 作为第一批可执行实验。

## Key Tradeoffs

- DSL 简洁性 vs schedule 表达能力。
- 用户显式 meta-parameter vs compiler 自动优化。
- target-specific optimization vs architecture portability。

## Examples

- matmul kernel
- fused elementwise kernel
- attention microkernel

## Related Concepts

- [[MLIR Pass Pipeline]]
- [[GPU Occupancy]]
- [[Memory Hierarchy]]

## Open Questions

- Triton 中哪些 pass 对 scheduler / memory planner 最关键？
- 哪些 optimization 是用户参数控制，哪些是 compiler 自动完成？

## References

- [[Triton Compiler Architecture Reading]]
