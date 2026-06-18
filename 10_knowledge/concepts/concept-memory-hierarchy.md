---
id: concept-memory-hierarchy
type: knowledge_node
node_type: concept
title: Memory Hierarchy
status: evergreen
tags: [knowledge, gpu, memory]
aliases:
  - 存储层次
  - GPU Memory Hierarchy
related:
  related_to:
    - [[GPU Occupancy]]
  depends_on: []
  supports:
    - [[Triton Compiler Architecture Reading]]
  contradicts: []
  used_by: []
created: 2026-06-19
updated: 2026-06-19
---

# Memory Hierarchy

## Definition

Memory hierarchy 是 GPU 中不同存储层级的组合，包括 global memory、L2/cache、shared memory、register 等。

Memory hierarchy is the organization of different GPU memory levels, including global memory, caches, shared memory, and registers.

## Mental Model

编译器优化经常是在“把数据放到哪个层级、什么时候搬运、复用多少次”之间做权衡。

Compiler memory optimization often asks: where should data live, when should it move, and how many times can it be reused?

## Why It Matters

GPU kernel 性能常常受 memory bandwidth、memory latency、coalescing、shared memory bank conflict 和 register pressure 影响。

## Compiler Relevance

- Scheduler 决定数据复用窗口。
- Memory planner 决定 buffer lifetime 和 allocation。
- Layout 决定访问模式。
- Lowering 决定最终 memory instruction。

## Key Tradeoffs

- shared memory 复用 vs shared memory 容量。
- register reuse vs register pressure。
- coalesced global load vs layout transformation cost。

## Examples

- matmul tiling
- attention block scheduling
- shared memory staging

## Related Concepts

- [[GPU Occupancy]]
- [[Triton Compilation Pipeline]]

## Open Questions

- 在 RTX4060 上，哪些 memory 指标最值得作为第一阶段 profiler target？
- memory planner prototype 应该先建模 shared memory 还是 register pressure？

## References

- [[Triton Compiler Architecture Reading]]
