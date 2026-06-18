# Analysis

## Question

Triton matmul 在 RTX4060 上的 baseline performance 是什么？哪些 schedule meta-parameters 最先影响性能？

What is the baseline performance of Triton matmul on RTX4060? Which schedule meta-parameters affect performance first?

## Hypothesis

block size、num warps 和 num stages 会通过 occupancy、register pressure、shared memory usage 和 memory access behavior 影响 latency 与 TFLOPS。

Block size, num warps, and num stages affect latency and TFLOPS through occupancy, register pressure, shared memory usage, and memory access behavior.

## Evidence

待 benchmark 运行后填写。

To be filled after benchmark execution.

Expected evidence:

- raw latency table
- TFLOPS table
- schedule config table
- environment snapshot
- profiler or compiler resource report, if available

## Interpretation

待填写。注意区分：

- 数据事实 / measured facts
- 可能解释 / possible explanations
- 需要后续实验验证的推断 / hypotheses requiring follow-up experiments

## Surprises

待填写。

## Failure Modes

- benchmark 没有 warmup，导致 first-run overhead 污染结果。
- 没有固定 seed 或 input shape，导致结果不可比。
- 只看 TFLOPS，不看 register/shared memory/resource usage。
- 在 RTX4060 上得到的结论被错误外推到 A100/H100。

## Confidence

当前为低。实验尚未运行。

Low. The benchmark has not been run yet.

## Conclusion

待填写。

## Next Experiment

如果 baseline 跑通，下一步做 controlled schedule sweep：

```text
fixed shape
fixed dtype
vary one schedule parameter at a time
record latency/resource/profiler metrics
```
