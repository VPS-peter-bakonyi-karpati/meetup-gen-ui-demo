#!/usr/bin/env bash
# Installs the npm dependencies of all apps (api, chat, website).
set -euo pipefail

cd "$(dirname "$0")"

for app in api chat website; do
    echo "Installing ${app}..."
    (cd "$app" && npm install)
done
