---
id: idea-2026-0001
type: research_idea
title: MLIR Pass Pipeline Mental Model
status: seed
maturity: 1
topics: [mlir, pass-pipeline, compiler-architecture]
tags: [research-idea, mlir, compiler-architecture]
aliases:
  - MLIR Pass 心智模型
derived_from:
  - [[2026-06-19 Daily Log]]
related:
  problems:
    - [[Understanding Compiler Transformation Pipelines]]
  hypotheses: []
  experiments:
    - [[MVP Smoke Test Experiment]]
  projects:
    - [[Compiler Research OS]]
  papers:
    - [[Triton Compiler Architecture Reading]]
created: 2026-06-19
updated: 2026-06-19
---

# MLIR Pass Pipeline Mental Model

## Observation

很多 compiler 学习会卡在“知道有 pass，但不知道 pass 在系统中如何被组织、调度、约束和组合”。

Many compiler learning paths get stuck at knowing that passes exist, without understanding how passes are organized, scheduled, constrained, and composed inside the compiler.

## Problem

如果没有 MLIR pass pipeline 的心智模型，很难进一步设计 Dialect、Lowering、Scheduler 或 Memory Planner。

Without a pass pipeline mental model, it is difficult to design dialects, lowering flows, schedulers, or memory planners.

## Hypothesis

如果从一个具体 pass 出发，追踪 registration、pipeline construction、operation traversal、IR rewrite 和 failure propagation，就能建立一个可复用的 pass reading framework。

If I start from one concrete pass and trace registration, pipeline construction, operation traversal, IR rewrite, and failure propagation, I can build a reusable framework for reading compiler passes.

## Why It Matters

- Scheduler 通常不是孤立算法，而是 pass pipeline 中某个 transformation 或 analysis 的一部分。
- Memory planner 依赖 IR 层级、liveness、aliasing 和 lowering boundary。
- Compiler architecture 判断来自对 pipeline boundary 和 invariant 的理解。

## Related Work

- MLIR official documentation / MLIR 官方文档
- LLVM pass infrastructure / LLVM Pass 基础设施
- Triton compiler pipeline / Triton 编译流水线

## Possible Approach

1. 选择一个简单 MLIR pass。
2. 找到 pass registration。
3. 找到 pass pipeline 中的入口。
4. 阅读 pass 如何遍历 Operation。
5. 记录 before/after IR。
6. 提取 correctness invariant。
7. 产出一篇 source reading note 和一个 knowledge node。

## Minimal Experiment

构造一个小 MLIR IR 文件，运行目标 pass，保存 before/after IR，并记录：

- command
- pass pipeline
- input IR
- output IR
- failure case

## Risks

- 只读代码不跑 IR，容易形成虚假的理解。
- 过早深入 MLIR 全局架构，导致第一周失焦。
- 混淆“代码事实”和“架构推断”。

## Expected Output

- [[MLIR Pass Infrastructure First Reading]]
- [[MLIR Pass Pipeline]]
- 一个最小 pass before/after IR 实验。

## Next Action

选择第一个 MLIR pass 文件，并创建对应 source reading note。
