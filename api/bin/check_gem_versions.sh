#!/usr/bin/env bash
set -euo pipefail

LOCKFILE="api/Gemfile.lock"

# Exit early if api/Gemfile.lock is not staged for commit.
if ! git diff --cached --name-only --diff-filter=ACM | grep -qx "$LOCKFILE"; then
  exit 0
fi

if ! git show :"$LOCKFILE" >/dev/null 2>&1; then
  echo "Error: staged $LOCKFILE not found. Aborting commit." >&2
  exit 1
fi

# Maintain one gem:version per line in this list. These gems must be locked to
# the versions Ruby 3.3.4 (fullstaq) ships as default gems, because Passenger
# preloads the default-gem version before Bundler runs and a version mismatch
# raises Gem::LoadError on app spawn.
readarray -t locked_gems <<'GEMS'
base64:0.2.0
stringio:3.1.1
GEMS

errors=()
staged_lock=$(git show :"$LOCKFILE")

for entry in "${locked_gems[@]}"; do
  IFS=":" read -r gem version <<<"$entry"
  escaped_version=${version//./\\.}
  if ! grep -q "^    ${gem} (${escaped_version})$" <<<"$staged_lock"; then
    errors+=("- ${gem} ${version}")
  fi
done

if ((${#errors[@]})); then
  {
    echo "Error: $LOCKFILE must keep the following versions locked:";
    printf '%s\n' "${errors[@]}";
    echo "Please restore the listed gem entries before committing.";
  } >&2
  exit 1
fi
