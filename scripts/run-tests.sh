#!/usr/bin/env bash
set -euo pipefail

# Run the project test suite.
if [[ -x "./gradlew" ]]; then
  echo "Running tests with Gradle wrapper..."
  ./gradlew test
else
  echo "Running tests with system Gradle..."
  gradle test
fi