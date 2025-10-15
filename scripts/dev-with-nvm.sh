#!/bin/bash

# Wrapper script for npm run dev that properly loads nvm
# This ensures the correct Node.js version is used even when called via npm

# Load nvm function
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Check if we have .nvmrc and nvm is available
if [ -f ".nvmrc" ] && command -v nvm &> /dev/null; then
    echo "🔄 Loading Node.js version from .nvmrc..."
    nvm use
    
    # If the version isn't installed, install it
    if [ $? -ne 0 ]; then
        echo "📦 Installing required Node.js version..."
        nvm install
        nvm use
    fi
fi

# Now run the actual dev script
exec ./dev-start.sh