#!/bin/bash
# usage: ./render.sh <Composition> <out.mp4> [extra remotion args]   — retries when the headless browser doesn't answer (machine busy)
cd "$(dirname "$0")"
comp="$1"; out="$2"; shift 2
for n in 1 2 3 4; do
  if npx remotion render src/index.ts "$comp" "$out" --concurrency=3 --timeout=120000 --log=error "$@" > out/render.log 2>&1; then
    echo "ok (attempt $n)"; exit 0
  fi
  grep -v "^    at " out/render.log | head -3
  sleep 3
done
exit 1
