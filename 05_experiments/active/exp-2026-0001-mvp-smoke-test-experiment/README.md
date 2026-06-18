# MVP Smoke Test Experiment

## Goal

验证 Compiler Research OS 的 experiment skeleton 是否可用。

Validate whether the Compiler Research OS experiment skeleton is usable.

这个实验不是正式性能实验，不应该用于任何 compiler performance claim。它的价值在于确认实验目录、metadata、run script、env capture、result capture 和 analysis 文件是否完整。

This is not a performance experiment and should not support any compiler performance claim. Its value is to validate the experiment directory, metadata, run script, environment capture, result capture, and analysis structure.

## Hypothesis

如果一个实验目录包含 metadata、run.sh、env.txt、inputs、configs、results 和 analysis，那么后续真实实验可以复用这个结构并保持可复现。

If an experiment directory contains metadata, run.sh, env.txt, inputs, configs, results, and analysis, then future real experiments can reuse the structure and remain reproducible.

## How to Run

```bash
./run.sh
```

Expected behavior:

- collect basic environment into `env.txt`
- create or update `results/raw.txt`
- avoid failing when Git or `nvidia-smi` is unavailable

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
- [x] Environment recorded
- [ ] GPU and CUDA recorded
- [ ] Input shapes recorded
- [x] Commands recorded
- [x] Raw results preserved
- [ ] Analysis written

## Next Real Experiment

建议下一个正式实验：

```text
Baseline Triton Matmul on RTX4060
```

目标：

- 跑通一个最小 Triton matmul benchmark。
- 记录 shape、dtype、block size、num warps、num stages。
- 记录 latency / TFLOPS。
- 如果环境支持，保存 IR / PTX dump。
- 至少比较两组 schedule config。
