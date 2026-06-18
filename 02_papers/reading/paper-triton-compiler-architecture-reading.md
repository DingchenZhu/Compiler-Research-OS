---
id: paper-triton-compiler-architecture-reading
type: paper
title: Triton Compiler Architecture Reading
authors: []
year:
venue:
status: reading
topics: [triton, gpu-compiler, compiler-architecture, scheduler, memory]
pdf:
code:
tags: [paper, triton, gpu-compiler]
aliases:
  - Triton 编译器架构阅读
related:
  concepts:
    - [[Triton Compilation Pipeline]]
    - [[GPU Occupancy]]
    - [[Memory Hierarchy]]
  projects:
    - [[Compiler Research OS]]
  ideas:
    - [[MLIR Pass Pipeline Mental Model]]
  experiments:
    - [[MVP Smoke Test Experiment]]
created: 2026-06-19
updated: 2026-06-19
---

# Triton Compiler Architecture Reading

## One-line Summary

Triton 是一个面向 GPU tensor program 的编译器栈，核心价值在于把高层 Python DSL 映射到可优化的中间表示和目标 GPU 代码。

Triton is a GPU tensor program compiler stack that maps a high-level Python DSL into optimizable intermediate representations and target GPU code.

## Problem

手写 CUDA kernel 成本高，传统框架难以同时兼顾生产力和接近手写 kernel 的性能。Triton 试图在 DSL、compiler IR、schedule 和 codegen 之间找到一个工程可用的平衡。

Writing CUDA kernels by hand is expensive. Traditional frameworks struggle to combine productivity with near-handwritten performance. Triton tries to balance DSL design, compiler IR, scheduling, and code generation.

## Key Idea

用 block-level tensor program abstraction 表达 GPU kernel，并通过 compiler pipeline 进行 lowering、optimization 和 target-specific code generation。

Use a block-level tensor program abstraction for GPU kernels, then lower and optimize it through a compiler pipeline toward target-specific code generation.

## Method

本阅读卡暂不假设具体论文结论，优先建立架构阅读框架：

1. Python DSL 层表达 computation。
2. Frontend 生成 Triton IR。
3. 中间层执行 canonicalization、optimization、layout / memory / scheduling 相关 transformation。
4. Lowering 到 LLVM / PTX 相关路径。
5. 通过 benchmark 和 profiler 验证 schedule 与 memory decision。

## Compiler / Architecture Relevance

与我的长期目标直接相关：

- Scheduler Optimization: tile、num warps、num stages、pipeline strategy。
- Memory Optimization: shared memory、register pressure、memory coalescing、layout。
- Compiler Architecture: DSL -> IR -> optimization -> lowering -> codegen。
- Hardware-Compiler Co-design: GPU resource constraints shape compiler decisions。

## Claims

当前不写强 claim，只记录待验证问题：

- Triton 的 block-level abstraction 是否足够表达主流 tensor kernels？
- Triton 的编译路径中，哪些阶段最影响 scheduler decision？
- 用户可见 meta-parameters 和 compiler internal decisions 的边界在哪里？

## Evidence

待通过源码阅读、官方文档、实验和 profiler 结果补充。

## Limitations

- 如果只读 tutorial，容易忽略 compiler pipeline 的真实复杂度。
- 如果只看 benchmark，容易忽略 IR 和 lowering 约束。
- RTX4060 资源有限，不能直接外推到 A/H 系列 GPU。

## Reproduction Plan

第一阶段只做最小复现：

1. 跑通 Triton matmul baseline。
2. 记录 shape、dtype、num warps、num stages、block size。
3. dump IR / PTX，如果环境支持。
4. 对比至少两组 schedule config。
5. 记录 latency、TFLOPS、register/shared memory 信息。

## Related Work

- CUDA programming model
- MLIR lowering infrastructure
- TVM schedule / TensorIR
- TensorRT kernel optimization

## Personal Takeaways

Triton 应该作为“AI compiler architecture 的可执行样本”来读，而不只是作为一个 kernel DSL 来用。

Triton should be read as an executable sample of AI compiler architecture, not merely as a kernel DSL.

## Follow-up Ideas

- [[MLIR Pass Pipeline Mental Model]]
- Baseline Triton Matmul on RTX4060
- Shared-memory-aware schedule exploration
