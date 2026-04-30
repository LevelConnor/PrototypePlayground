#!/bin/bash

# ────────────────────────────────────────────────────────────────
# Publish prototype hub
# Double-click this file to commit and push all changes to GitHub.
# After ~60 seconds, your changes will be live on the site.
# ────────────────────────────────────────────────────────────────

# Move into the folder this script lives in
cd "$(dirname "$0")"

clear
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Publishing prototype hub..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Show what's about to be published
echo "Changes to publish:"
echo ""
git status --short
echo ""

# Bail early if nothing has changed
if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to publish. No files have changed."
  echo ""
  echo "Press any key to close..."
  read -n 1
  exit 0
fi

# Ask for a commit message
echo "What did you change? (one line, then press enter)"
read -r MESSAGE

if [ -z "$MESSAGE" ]; then
  MESSAGE="Update prototypes"
fi

echo ""
echo "Staging changes..."
git add .

echo "Committing..."
git commit -m "$MESSAGE"

echo "Pushing to GitHub..."
git push

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Done. Your changes will be live in ~60 seconds."
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Press any key to close..."
read -n 1
