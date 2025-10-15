# CUMC Database Setup Guide

This guide explains how to set up and manage the CUMC development database.

## Overview

The database setup system includes:

- Docker PostgreSQL container for local development
- Sequelize ORM for schema management
- SQL seed files for initial data
- Automated setup script for easy management

## Prerequisites

- Docker and Docker Compose installed and running
- Node.js installed (see `.nvmrc` for required version)
- Basic terminal/command line knowledge

## Quick Start

### First Time Setup

Run the complete initialization process:

```bash
./scripts/db-setup.sh init
```

This will:

1. Start the PostgreSQL Docker container
2. Create the database schema (tables, relationships)
3. Seed the database with initial data (committee roles and historical data)

### Daily Usage

Start the database:

```bash
./scripts/db-setup.sh start
```

Stop the database:

```bash
./scripts/db-setup.sh stop
```

Check status:

```bash
./scripts/db-setup.sh status
```

## Database Commands

### `init` - Complete Setup

Performs a full database initialization. Use this for first-time setup.

```bash
./scripts/db-setup.sh init
```

### `start` - Start Database

Starts the Docker PostgreSQL container without modifying data.

```bash
./scripts/db-setup.sh start
```

### `stop` - Stop Database

### Port Already in Use

**Error**: Port 5432 is already in use.
Stops the Docker container. Data persists in Docker volumes.

```bash
./scripts/db-setup.sh stop
```

### `reset` - Reset Database

Drops all data and recreates the database with fresh schema and seeds.

**WARNING: This deletes all data!**

```bash
./scripts/db-setup.sh reset
```

You'll be prompted to confirm before data is deleted.

### `seed` - Re-run Seeds

Runs the seed files without resetting the database. Useful for adding new seed data.

```bash
./scripts/db-setup.sh seed
```

Note: Seed files use `ON CONFLICT DO NOTHING` to avoid duplicate entries.

### `status` - Show Status

Displays the current database status and table statistics.

```bash
./scripts/db-setup.sh status
```

## Database Configuration

### Connection Details

The development database connection is configured in `.env.development`:

```
DATABASE_URL=postgresql://cumc_dev:dev_password@localhost:5432/cumc_dev
NODE_ENV=development
```

### Docker Configuration

Docker settings are in `docker-compose.yml`:

- **Image**: PostgreSQL 15
- **Container Name**: cumc-dev-db
- **Port**: 5432 (mapped to localhost:5432)
- **Volume**: `postgres_data` (persists data between restarts)

## Database Schema

The schema is defined in Sequelize models located in `server/database/models/`:

### Committee Models

- **CommitteeRoles** (`server/database/models/committeeRole.js`)

  - Defines the committee role types (President, Secretary, etc.)
  - Includes role metadata (description, email alias, requirements)

- **Committee** (`server/database/models/committee.js`)
  - Stores committee member assignments
  - Links to CommitteeRoles via `role_id`
  - Includes historical data by year

### Other Models

- User
- Member
- Meet
- Signup
- Britrock

## Seed Data

Seed files are located in `server/database/seeds/` and run in alphabetical order:

### 01-committee-roles.sql

Populates the standard CUMC committee roles:

- Core Executive: President, Secretary, Treasurer
- Operational: Gear Secretary, Indoor/Outdoor Meets
- Specialized: Competitions, Social, Journal, Webmaster
- Welfare: Access & Welfare Officer

### 02-historical-committee.sql

Populates historical committee data from 2012-2025, including:

- All past committee members
- Role assignments by year
- Multiple members per role where applicable

## Troubleshooting

### Docker Not Running

**Error**: `Docker is not running. Please start Docker and try again.`

**Solution**: Start Docker Desktop or Docker daemon before running the setup script.

### Port Already in Use

**Error**: Port 5432 is already in use.

**Solution**:

1. Check if another PostgreSQL instance is running: `lsof -i :5432`
2. Stop other PostgreSQL services or change the port in `docker-compose.yml`

### Database Connection Failed

**Error**: Cannot connect to database.

**Solution**:

1. Ensure Docker container is running: `docker ps`
2. Check logs: `docker logs cumc-dev-db`
3. Verify connection string in `.env.development`

### Schema Sync Failed

**Error**: Error syncing database schema.

**Solution**:

1. Check that all model files are valid
2. Ensure Node.js dependencies are installed: `cd server && npm install`
3. Check database logs for specific errors

### Seed Files Failed

**Error**: Failed to run seed files.

**Solution**:

1. Ensure schema is created first (run `init` or `reset`)
2. Check SQL syntax in seed files
3. Verify role_id references exist in CommitteeRoles table

## Manual Database Access

### Using Docker Exec

Access PostgreSQL CLI:

```bash
docker exec -it cumc-dev-db psql -U cumc_dev -d cumc_dev
```

Run a query:

```bash
docker exec cumc-dev-db psql -U cumc_dev -d cumc_dev -c "SELECT * FROM \"CommitteeRoles\";"
```

### Using a Database Client

Connect with your preferred PostgreSQL client using:

- **Host**: localhost
- **Port**: 5432
- **Database**: cumc_dev
- **User**: cumc_dev
- **Password**: dev_password

## Development Workflow

### Adding New Seed Data

1. Create a new SQL file in `server/database/seeds/`
2. Use a numeric prefix to control order (e.g., `03-new-data.sql`)
3. Use `ON CONFLICT DO NOTHING` to make seeds idempotent
4. Run seeds: `./scripts/db-setup.sh seed`

### Modifying Schema

1. Update the Sequelize model in `server/database/models/`
2. Reset the database to apply changes: `./scripts/db-setup.sh reset`
3. Note: In production, you'll want proper migrations instead of reset

### Testing Fresh Setup

To test the complete setup process:

```bash
# Stop and remove everything
./scripts/db-setup.sh stop
docker volume rm cumc-org-uk_postgres_data

# Run fresh setup
./scripts/db-setup.sh init
```

## Production Considerations

This setup is for **development only**. For production:

1. Use proper database hosting (not Docker Compose)
2. Implement migration system (e.g., sequelize-cli)
3. Never commit production credentials
4. Use environment-specific configuration
5. Implement backup/restore procedures
6. Consider using database connection pooling

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

For issues or questions:

1. Check this documentation
2. Review the script output for specific error messages
3. Check Docker and PostgreSQL logs
4. Consult the Sequelize model definitions
