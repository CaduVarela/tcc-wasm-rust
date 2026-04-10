#!/usr/bin/env bash
set -euo pipefail

N=${FIBONACCI_N:-40}
WARMUP=${WARMUP_RUNS:-10}
RUNS=${BENCH_RUNS:-50}
OUTPUT=/results/native.json

hyperfine \
  --warmup "$WARMUP" \
  --runs "$RUNS" \
  --export-json "$OUTPUT" \
  "/usr/local/bin/fibonacci $N"

echo "Results saved to $OUTPUT"
cat "$OUTPUT"
