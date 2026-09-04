#!/bin/sh
# run_tests.sh - Run the frontend tests.
#
#   ./run_tests.sh              the whole suite, with lint and coverage (CI)
#   ./run_tests.sh <file>       one test file, and nothing else
#
# Thinkube Tandem runs single files this way, on a tree it has provisioned.

set -e

# One file: run it and stop.
if [ -n "$1" ]; then
    exec npx vitest run "$1"
fi

echo "Running frontend tests..."

# Install dependencies if needed. The cache lives beside the workspace in
# CI and in the user's own home anywhere else, so this script runs the same
# on a developer's machine as it does in the pipeline.
CACHE_ARGS=""
if [ -w /workspace ] || mkdir -p /workspace/.cache/npm 2>/dev/null; then
    CACHE_ARGS="--cache /workspace/.cache/npm"
fi
if [ -f package-lock.json ]; then
    echo "Installing dependencies with npm ci..."
    npm ci $CACHE_ARGS
else
    echo "Installing dependencies with npm install..."
    npm install $CACHE_ARGS
fi

# Type check
echo "\nRunning TypeScript check..."
npx tsc --noEmit

# Run linter
echo "\nRunning linter..."
npm run lint || echo "Linting issues found (non-blocking)"

# Run tests
echo "\nRunning unit tests..."
npm run test
echo "Tests passed successfully!"

# Run coverage report
echo "\nChecking test coverage..."
npm run test:coverage || echo "Coverage report not available"

echo "\nAll tests completed!"
