#!/usr/bin/env bash
set -euo pipefail

EXP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$EXP_DIR"

echo "[exp] collecting environment"
{
  date
  uname -a
  python --version || true
  if command -v nvidia-smi >/dev/null 2>&1; then
    nvidia-smi
  else
    echo "nvidia-smi: not available"
  fi
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git rev-parse HEAD
    git status --short
  else
    echo "git: not a repository"
  fi
} > env.txt

echo "[exp] add benchmark command here"
echo "No benchmark command configured yet." | tee results/raw.txt
