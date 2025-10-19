# CUMC Development Scripts Guide

This document explains all available npm scripts for the CUMC project.

## Quick Start

```bash
# Development mode (both frontend and backend with hot reload)
npm run dev

# Build everything for production
npm run build

# Run production build
npm start
```

## Root Level Scripts

### Development
- `npm run dev` - Start both client and server in development mode using the dev.sh script
- `npm run dev:internal` - Internal command used by dev.sh (runs concurrently)
- `npm run server` - Start only the backend server in dev mode
- `npm run server:dev` - Same as above
- `npm run client` - Start only the frontend client in dev mode

### Production
- `npm start` - Run the production build (requires building first)
- `npm run start:prod` - Same as above (runs compiled JavaScript from dist/)
- `npm run start:dev` - Start server in development mode with ts-node

### Building
- `npm run build` - Build both server and client for production
- `npm run build:server` - Build only the server (TypeScript → JavaScript)
- `npm run build:client` - Build only the client (React app)
- `npm run server:build` - Alias for build:server
- `npm run client:build` - Alias for build:client

### Installation
- `npm run install:all` - Install dependencies for root, server, and client

## Server Scripts (from /server directory)

### Development
- `npm start` - Start server with ts-node (development mode)
- `npm run dev` - Same as start
- `npm run dev:watch` - Start with auto-reload on file changes (requires nodemon)

### Production
- `npm run start:prod` - Run compiled JavaScript from dist/

### Building & Type Checking
- `npm run build` - Compile TypeScript to JavaScript (outputs to dist/)
- `npm run build:watch` - Compile with watch mode (rebuilds on changes)
- `npm run type-check` - Check types without emitting files
- `npm run clean` - Remove the dist/ directory

## Development Workflow

### First Time Setup
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Day-to-Day Development
```bash
# Start development environment
npm run dev

# This will:
# - Check Node.js version (v22.14.0)
# - Start backend server on port 5000 (with ts-node)
# - Start frontend client on port 3000
# - Auto-reload on file changes
```

### Type Checking During Development
```bash
# In the server directory
cd server
npm run type-check
```

### Building for Production
```bash
# Build everything
npm run build

# Or build individually
npm run build:server  # TypeScript → JavaScript
npm run build:client  # React → optimized bundle

# Run production build
npm start
```

### Server-Only Development
```bash
# Start just the backend
npm run server:dev

# Or with auto-reload (needs nodemon)
cd server
npm run dev:watch
```

### Client-Only Development
```bash
# Start just the frontend
npm run client
```

## Environment Setup

### Required Node.js Version
- **v22.14.0** (specified in `.nvmrc`)

### Using the correct Node version
```bash
# The dev.sh script automatically handles this, but manually:
nvm use 22.14.0

# Or install if needed
nvm install 22.14.0
nvm use 22.14.0
```

### Environment Variables
- Development: `.env.development` (root level)
- Server: `server/.env` (loaded by dotenv)

## Script Files

### dev.sh
Simple wrapper that:
- Loads nvm
- Uses correct Node.js version
- Runs `npm run dev:internal`

### dev-start.sh
Comprehensive development startup script that:
- Checks Node.js version
- Loads environment variables from `.env.development`
- Starts both servers
- Sets up cleanup on exit
- Provides helpful error messages

## Troubleshooting

### "Port already in use" error
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeScript compilation errors
```bash
# Check types without running
cd server
npm run type-check

# Clean and rebuild
npm run clean
npm run build
```

### Module not found errors
```bash
# Reinstall all dependencies
npm run install:all
```

### Wrong Node.js version
```bash
# Use dev.sh which handles this automatically
npm run dev

# Or manually
nvm use 22.14.0
```

## Production Deployment

### Heroku
The `heroku-postbuild` script runs automatically:
```bash
npm run heroku-postbuild
```

This will:
1. Install all dependencies (root, server, client)
2. Build the server (TypeScript → JavaScript)
3. Build the client (React → optimized bundle)

### Manual Production Deployment
```bash
# Build everything
npm run build

# Run in production mode
NODE_ENV=production npm start
```

## Additional Notes

- The server uses **ts-node** for development (no build step needed)
- The server uses **tsc** for production builds (outputs to `server/dist/`)
- The client is a standard **Create React App**
- Both servers support hot reloading in development mode
- Use `Ctrl+C` to stop development servers gracefully
