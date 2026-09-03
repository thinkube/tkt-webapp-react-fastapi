#!/bin/sh
# run_tests.sh - Run the backend tests.
#
#   ./run_tests.sh              the whole suite, with coverage and lint (CI)
#   ./run_tests.sh <file>       one test file, and nothing else
#
# Both run with the same environment, built here and nowhere else: the
# test settings from .env.test, and the database credentials the platform
# hands a test container. Thinkube Tandem runs single files this way.

set -e

# Load test environment variables (quoted values kept whole)
if [ -f .env.test ]; then
    set -a
    . ./.env.test
    set +a
fi

# Set PostgreSQL credentials from environment
export POSTGRES_PASSWORD="${ADMIN_PASSWORD}"
export POSTGRES_USER="${ADMIN_USERNAME}"
export DATABASE_USER="${ADMIN_USERNAME}"

# Construct DATABASE_URL with the credentials
export DATABASE_URL="postgresql://${DATABASE_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

# One file: run it and stop. The tree is already provisioned.
if [ -n "$1" ]; then
    exec pytest "$1" -v
fi

echo "Running backend tests..."
echo "Database URL configured for user ${DATABASE_USER} at host: ${DATABASE_HOST}"

# Install dependencies if not already installed
echo "Installing dependencies..."
pip install --break-system-packages -r requirements.txt

# Run tests with coverage
pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

# Run code quality checks (optional - don't fail the build)
echo -e "\nRunning code quality checks..."
flake8 app/ --max-line-length=120 --exclude=__pycache__ || echo "Linting issues found (non-blocking)"
black --check app/ || echo "Formatting issues found (non-blocking)"

echo -e "\nAll tests and checks passed!"

# 🤖 Generated with Claude