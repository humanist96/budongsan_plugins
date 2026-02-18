#!/bin/bash
# Sync markdown files from docs/ to content/tutorials/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$(dirname "$PROJECT_DIR")/docs"
CONTENT_DIR="$PROJECT_DIR/content/tutorials"

mkdir -p "$CONTENT_DIR"

if [ -d "$DOCS_DIR" ]; then
  for f in "$DOCS_DIR"/튜터리얼*.md; do
    if [ -f "$f" ]; then
      cp "$f" "$CONTENT_DIR/"
    fi
  done
  echo "Synced tutorial files from $DOCS_DIR to $CONTENT_DIR"
else
  echo "Warning: docs directory not found at $DOCS_DIR"
fi
