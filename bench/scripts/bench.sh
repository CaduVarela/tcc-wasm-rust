#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BENCH_DIR="$SCRIPT_DIR/.."

echo "=== Building and running benchmarks ==="
echo "Results will be written to: $BENCH_DIR/results/"

cd "$BENCH_DIR"

echo ""
echo "--- Building Docker images ---"
docker compose build

echo ""
echo "--- Running native benchmark ---"
docker compose run --rm native

echo ""
echo "--- Running WASM benchmark ---"
docker compose run --rm wasm

echo ""
echo "=== All benchmarks complete ==="
echo "Files in results/:"
ls -lh "$BENCH_DIR/results/"
