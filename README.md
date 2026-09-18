# CUMC Website

Code repository for cumc.org.uk

## ⚠️ Important: Node.js Version

This project requires **Node.js v20.x.x**. Seriously, other versions will cause issues.

### Setting up Node

Use nvm to manage your Node versions:

```bash
# Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use the correct version
nvm install 20
nvm use 20
```

If `npm run dev` shows the wrong Node version:

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm run dev
```

## Getting Started

### First Time Setup

Run:

```bash
npm install
```

Then follow the steps below.

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

Install docker via your preferred method. Then run this command to get the database ready:

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
- `SECRET` - Session cookie secret (change this in production!)
- `MEMBERSHIP_PRICE` - Membership fee (default: 30.00)
- `BRITROCK_PRICE` - Britrock fee (default: 12.00)
- `CURRENT_YEAR` - Current academic year (default: 2025-2026)
- `PREVIOUS_YEAR` - Previous academic year (default: 2024-2025)
- `FRONTEND_URL` - Frontend URL for redirects (default: `http://localhost:3000`)
- `PORT` - Express server port (default: 5000)
- `GOOGLE_ID`, `GOOGLE_SECRET` - OAuth2 credentials from Google API
- `PAYPAL_ID`, `PAYPAL_SECRET` - PayPal API credentials
- `WHATSAPP` - WhatsApp chat link (default: `chat dot whatsapp dot com slash awdasfgasdfgtestetsttdev`)

Copy it to `/sever/.env`. You can get test credentials from the respective service providers. These values are obviously different in the production environment.

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
