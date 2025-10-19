#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the correct Node version
nvm use 22.14.0 2>/dev/null || nvm install 22.14.0

# Run the actual dev command
exec npm run dev:internal