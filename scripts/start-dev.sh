#!/usr/bin/env bash
set -euo pipefail

# Run the application in development mode.
# Prefers project wrapper if present, otherwise falls back to system Gradle.
REQUIRED_GRADLE_VERSION="7.6"

version_lt() {
  [ "$1" != "$2" ] && [ "$(printf '%s\n%s' "$1" "$2" | sort -V | head -n1)" = "$1" ]
}

if [[ -x "./gradlew" ]]; then
  echo "Using project Gradle wrapper..."
  ./gradlew bootRun "$@"
else
  if ! command -v gradle >/dev/null 2>&1; then
    echo "Gradle not found. Please install Gradle ${REQUIRED_GRADLE_VERSION}+ or generate the Gradle wrapper by running:"
    echo "  gradle wrapper --gradle-version ${REQUIRED_GRADLE_VERSION}"
    exit 1
  fi
  gradle_version=$(gradle --version 2>/dev/null | awk '/Gradle/{print $2}' | head -n1)
  if version_lt "$gradle_version" "$REQUIRED_GRADLE_VERSION"; then
    echo "Detected Gradle version ${gradle_version} is too old. Please install Gradle ${REQUIRED_GRADLE_VERSION}+ or generate the Gradle wrapper:"
    echo "  gradle wrapper --gradle-version ${REQUIRED_GRADLE_VERSION}"
    exit 1
  fi
  echo "Using system Gradle ${gradle_version}..."
  gradle bootRun "$@"
fi