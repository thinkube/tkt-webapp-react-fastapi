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

# Install dependencies if needed.
#
# The cache belongs to the machine running the install, never to the
# repository: a cache under the shared checkout is written by every node
# that ever tested this app — on this platform that means both amd64 and
# arm64 — and npm reads it back as a corrupt tree ("Cannot read properties
# of null (reading 'edgesOut')"). npm's own default, or npm_config_cache
# from the environment, is where it goes.
if [ -f package-lock.json ]; then
    echo "Installing dependencies with npm ci..."
    npm ci
else
    echo "Installing dependencies with npm install..."
    npm install
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
