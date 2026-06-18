---
id: skill-tree
type: roadmap
title: Compiler Architect Skill Tree
status: active
tags: [roadmap, skill-tree]
created: 2026-06-19
updated: 2026-06-19
---

# Compiler Architect Skill Tree

这棵技能树不是 checklist，而是你的 Compiler Architect 成长地图。每个节点都应该逐渐连接到 paper note、source reading note、experiment record 和 architecture decision。

This skill tree is not a checklist. It is a map that should gradually connect papers, source reading, experiments, and architecture decisions.

## Current Quarter Focus

- MLIR Pass Infrastructure / MLIR Pass 基础设施
- Triton Compilation Pipeline / Triton 编译流水线
- GPU Performance Mental Model / GPU 性能心智模型
- Reproducible Experiment Workflow / 可复现实验流程

## Compiler Foundations

- LLVM IR / LLVM 中间表示
- MLIR infrastructure / MLIR 基础设施
- Pass design / Pass 设计
- Dataflow analysis / 数据流分析
- Lowering pipelines / 降级流水线
- Code generation / 代码生成

### First Milestones

- 能解释 operation、region、block、value 的关系。
- 能说明一个 MLIR pass 如何注册、运行和修改 IR。
- 能读懂一个 before/after IR transformation。
- 能判断一个 pass 的 correctness invariant。

## GPU Architecture

- SIMT execution / SIMT 执行模型
- Warp scheduling / Warp 调度
- Memory hierarchy / 存储层次
- Occupancy / 占用率
- Register pressure / 寄存器压力
- Shared memory / 共享内存
- Tensor cores / Tensor Core

### First Milestones

- 能解释 occupancy、register pressure、shared memory 三者的 tradeoff。
- 能从 profiler 指标推断一个 kernel 的主要瓶颈。
- 能把 GPU 资源约束映射回 compiler scheduling decision。

## AI Compiler

- Triton
- TensorRT
- TVM
- TileLang
- vLLM
- SGLang

### First Milestones

- 能画出 Triton 从 Python DSL 到 LLVM/PTX 的粗粒度路径。
- 能说明 TensorRT、TVM、Triton 的定位差异。
- 能识别 vLLM/SGLang 中 compiler/runtime 边界。

## Scheduler Optimization

- Search spaces / 搜索空间
- Cost models / 代价模型
- Pipeline scheduling / 流水调度
- Tiling / 分块
- Fusion / 融合
- Resource constraints / 资源约束

### First Milestones

- 定义一个最小 scheduling unit。
- 写出一个 baseline cost model。
- 用一个实验比较两种 tile/schedule 配置。

## Memory Optimization

- Buffer lifetime / Buffer 生命周期
- Memory planning / 内存规划
- Layout / 数据布局
- Reuse / 复用
- Shared memory allocation / 共享内存分配
- Bandwidth modeling / 带宽建模

### First Milestones

- 能从 IR 或 schedule 中提取 tensor lifetime。
- 能解释 buffer reuse 的 correctness condition。
- 能设计一个小型 shared memory planning 实验。

## Research Capability

- Paper reading / 论文阅读
- Related work synthesis / 相关工作综合
- Hypothesis design / 假设设计
- Reproducible experiment / 可复现实验
- Artifact building / Artifact 构建
- Technical writing / 技术写作

### First Milestones

- 每篇论文输出 problem、method、evidence、limitation、reproduction plan。
- 每个 idea 都能追踪 derived_from、tested_by、supports 或 invalidates。
- 每个实验都保留 metadata、env、command、raw result、analysis。
