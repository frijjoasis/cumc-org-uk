#!/bin/bash

# CUMC Development Startup Script
# This script starts both the React frontend and Node.js backend in development mode

echo "🏔️  Starting CUMC Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the cumc-org-uk root directory"
    exit 1
fi

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    echo "🔧 Loaded nvm"
fi

# Check if .nvmrc exists and try to use it
if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    echo "📄 Found .nvmrc specifying: $REQUIRED_VERSION"
    
    if command -v nvm &> /dev/null; then
        echo "🔄 Attempting to switch to Node.js $REQUIRED_VERSION using nvm..."
        nvm use
        if [ $? -eq 0 ]; then
            echo "✅ Successfully switched to Node.js $REQUIRED_VERSION"
        else
            echo "⚠️  Failed to switch to $REQUIRED_VERSION. Trying to install..."
            nvm install $REQUIRED_VERSION
            nvm use $REQUIRED_VERSION
        fi
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "📥 Please install Node.js v16.14.2"
    echo "💡 Recommended: Use nvm to manage Node versions:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   source ~/.bashrc"
    echo "   nvm install 16.14.2"
    echo "   nvm use 16.14.2"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
REQUIRED_VERSION="v16.14.2"

echo "📦 Current Node.js version: $NODE_VERSION"

if [ "$NODE_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "⚠️  Warning: Expected Node.js $REQUIRED_VERSION, but found $NODE_VERSION"
    
    if command -v nvm &> /dev/null; then
        echo "🔄 Attempting to auto-fix with nvm..."
        nvm install 16.14.2 2>/dev/null || true
        nvm use 16.14.2
        
        # Re-check version after nvm use
        NODE_VERSION=$(node -v)
        if [ "$NODE_VERSION" = "$REQUIRED_VERSION" ]; then
            echo "✅ Successfully switched to Node.js $REQUIRED_VERSION"
        else
            echo "❌ Failed to switch to correct version automatically"
            echo "💡 Please run manually:"
            echo "   nvm install 16.14.2"
            echo "   nvm use 16.14.2"
            echo "   npm run dev"
            exit 1
        fi
    else
        echo "💡 To fix this, install nvm and switch versions:"
        echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "   source ~/.bashrc"
        echo "   nvm install 16.14.2"
        echo "   nvm use 16.14.2"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 Stopping. Please switch to Node.js v16.14.2 first."
            exit 1
        fi
    fi
else
    echo "✅ Node.js version is correct!"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Load environment variables from .env.development if it exists
if [ -f ".env.development" ]; then
    echo "📄 Loading environment from .env.development"
    export $(cat .env.development | grep -v '^#' | xargs)
fi

# Start the backend server with development environment variables
echo "🚀 Starting backend server..."
cd server

# Set development environment variables for admin bypass
export NODE_ENV=development
export DEV_ADMIN_BYPASS=true

echo "🔓 Development admin bypass enabled"
echo "💡 You can access admin features without login!"
echo "   - Visit: http://localhost:5000/api/auth/dev-login to auto-login"
echo "   - Or use committee management directly"

npm start &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 2

# Start the frontend client  
echo "🎨 Starting frontend client..."
cd client
npm start &
CLIENT_PID=$!
cd ..

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "💾 Database: $DATABASE_URL"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait