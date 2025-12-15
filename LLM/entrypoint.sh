#!/bin/sh
set -eu

MODELS_FILE="/app/models.txt"

echo "Starting LLM entrypoint test script..."

if [ -f "$MODELS_FILE" ]; then
  while read -r model; do
    [ -z "$model" ] && continue
    echo "Found model in file: $model"
  done < "$MODELS_FILE"
else
  echo "ERROR: $MODELS_FILE not found!"
fi

echo "Test script finished."


# Exec the CMD passed from Dockerfile or Compose
exec "$@"