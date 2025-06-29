#!/usr/bin/env bash
set -euo pipefail

# Build an executable jar and run it.
# Prefers project wrapper if present.
if [[ -x "./gradlew" ]]; then
  echo "Building jar with Gradle wrapper..."
  ./gradlew bootJar
else
  echo "Building jar with system Gradle..."
  gradle bootJar
fi

echo "Launching jar..."
java -jar build/libs/flowsheets-0.0.1-SNAPSHOT.jar "$@"