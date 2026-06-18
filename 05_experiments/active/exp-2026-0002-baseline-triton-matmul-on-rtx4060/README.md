# Baseline Triton Matmul on RTX4060

## Goal

建立第一个真实 compiler experiment baseline：在 RTX4060 上运行 Triton matmul microbenchmark，并记录可复现的环境、输入、编译参数、raw result 和分析结论。

Build the first real compiler experiment baseline: run a Triton matmul microbenchmark on RTX4060 and record reproducible environment, inputs, compiler parameters, raw results, and analysis.

这个实验的重点不是刷出最高 TFLOPS，而是建立后续 scheduler / memory planner 实验的 baseline protocol。

The goal is not to maximize TFLOPS. The goal is to establish a baseline protocol for future scheduler and memory planner experiments.

## Hypothesis

不同 Triton schedule meta-parameters，如 block size、num warps 和 num stages，会显著影响 latency、TFLOPS、register pressure 和 shared memory usage。

Different Triton schedule meta-parameters, such as block size, num warps, and num stages, can significantly affect latency, TFLOPS, register pressure, and shared memory usage.

## How to Run

```bash
./run.sh
```

当前 `run.sh` 只是实验骨架。正式 benchmark 接入后，应执行：

```text
collect environment
-> run Triton matmul benchmark
-> save raw result
-> optionally dump IR/PTX
-> summarize result
```

## Artifacts

- `metadata.yaml`
- `env.txt`
- `inputs/`
- `configs/`
- `dumps/`
- `profiles/`
- `results/`
- `analysis.md`

## Reproducibility Checklist

- [ ] Git commit recorded
- [ ] Git dirty state recorded
- [ ] Environment recorded
- [ ] GPU and CUDA recorded
- [ ] Input shapes recorded
- [ ] Commands recorded
- [ ] Raw results preserved
- [ ] Analysis written

## Experiment Variables

Independent variables:

- matrix shape: M, N, K
- dtype: fp16 / bf16 / fp32
- block size: BLOCK_M, BLOCK_N, BLOCK_K
- `num_warps`
- `num_stages`

Dependent metrics:

- latency_ms
- TFLOPS
- bandwidth_gbps
- register_count, if available
- shared_memory_bytes, if available
- occupancy, if profiler data is available

## Initial Shape Plan

Start small and boring:

```text
M=N=K=1024, dtype=fp16
M=N=K=2048, dtype=fp16
M=4096, N=4096, K=1024, dtype=fp16
```

Do not expand the matrix zoo until the result format is stable.

## Related Notes

- [[Triton Compiler Architecture Reading]]
- [[Triton Compilation Pipeline]]
- [[GPU Occupancy]]
- [[Memory Hierarchy]]
