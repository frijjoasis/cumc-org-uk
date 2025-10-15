# CUMC Website

Code repository for cumc.org.uk

## ⚠️ Important: Node.js Version

This project requires **Node.js v16.14.2**. Seriously, other versions will cause issues.

### Setting up Node

Use nvm to manage your Node versions:

```bash
# Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use the correct version
nvm install 16.14.2
nvm use 16.14.2
```

If `npm run dev` shows the wrong Node version:

```bash
source ~/.nvm/nvm.sh
nvm use 16.14.2
npm run dev
```

## Getting Started

### Quick Setup

The easiest way to get everything running:

```bash
npm run dev
```

This starts both the frontend and backend with automatic Node version checking.

### Manual Setup

If you prefer doing it step by step:

```bash
# Backend
cd server && npm install && npm start

# Frontend (in a new terminal)
cd client && npm install && npm start
```

## Database Setup

### First Time Setup

Run this command to get the database ready:

```bash
./scripts/db-setup.sh init
```

This will:

- Start the PostgreSQL Docker container
- Create the database schema using Sequelize
- Seed the database with committee roles and historical data

### Database Commands

```bash
./scripts/db-setup.sh init     # First-time setup
./scripts/db-setup.sh start    # Start the database
./scripts/db-setup.sh stop     # Stop the database
./scripts/db-setup.sh reset    # Reset everything (deletes all data!)
./scripts/db-setup.sh seed     # Re-run seed files
./scripts/db-setup.sh status   # Check database status
```

## Environment Variables

The project uses `.env.development` for local development with these defaults:

- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://cumc_dev:dev_password@localhost:5432/cumc_dev`)
- `NODE_ENV` - Environment mode (default: `development`)
- `DEV_ADMIN_BYPASS` - Skip authentication in dev mode (default: `true`)
- `SECRET` - Session cookie secret (change this in production!)

For production, create a `.env` file in `/server` with:

- `PORT` - Express server port (default: 5000)
- `GOOGLE_ID`, `GOOGLE_SECRET` - OAuth2 credentials from Google API
- `PAYPAL_ID`, `PAYPAL_SECRET` - PayPal API credentials

## Available Commands

### `npm run dev`

Recommended for development. Starts both frontend and backend with version checking.

### `npm start`

Starts only the backend server.

### `npm test`

Runs the test suite in interactive watch mode.

### `npm run build`

Builds the production-ready app in the `build` folder. The build is minified and optimized for deployment.

### `npm run eject`

⚠️ **Warning: This is permanent!** Ejects from Create React App and gives you full control over webpack, Babel, ESLint, etc. You probably don't need this unless you know what you're doing.
