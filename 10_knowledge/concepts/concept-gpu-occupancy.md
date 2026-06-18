---
id: concept-gpu-occupancy
type: knowledge_node
node_type: concept
title: GPU Occupancy
status: evergreen
tags: [knowledge, gpu, performance]
aliases:
  - Occupancy
  - GPU 占用率
related:
  related_to:
    - [[Memory Hierarchy]]
  depends_on: []
  supports:
    - [[Triton Compiler Architecture Reading]]
  contradicts: []
  used_by: []
created: 2026-06-19
updated: 2026-06-19
---

# GPU Occupancy

## Definition

GPU occupancy 通常指一个 SM 上活跃 warps 与硬件最大可活跃 warps 的比例。

GPU occupancy usually refers to the ratio of active warps on an SM to the hardware maximum number of active warps.

## Mental Model

Occupancy 是隐藏 latency 的资源条件之一，但不是性能的唯一目标。

Occupancy helps hide latency, but higher occupancy does not automatically mean better performance.

## Why It Matters

Scheduler 和 memory planner 的选择会影响 register usage、shared memory usage 和 active warps，从而影响 occupancy。

## Compiler Relevance

- tile size 影响 register pressure。
- shared memory allocation 影响 blocks per SM。
- pipeline stages 影响 latency hiding 和 resource usage。

## Key Tradeoffs

- 更大 tile 可能提高 arithmetic intensity，但降低 occupancy。
- 更多 pipeline stages 可能提高吞吐，但增加 register/shared memory 压力。
- 高 occupancy 可能掩盖 memory latency，但不解决 bandwidth bottleneck。

## Examples

- Triton `num_warps`
- Triton `num_stages`
- CUDA block size

## Related Concepts

- [[Memory Hierarchy]]
- [[Triton Compilation Pipeline]]

## Open Questions

- RTX4060 上哪些 Triton matmul config 最容易受 occupancy 限制？
- 对 scheduler prototype 来说，occupancy 应该作为 hard constraint 还是 cost feature？

## References

- [[Triton Compiler Architecture Reading]]
