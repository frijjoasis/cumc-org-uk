# Scripts Directory

This directory contains utility scripts for the CUMC project.

## Database Setup Script

### Quick Reference

```bash
./db-setup.sh init     # First-time setup (start + reset + seed)
./db-setup.sh start    # Start database container
./db-setup.sh stop     # Stop database container
./db-setup.sh reset    # Reset database (WARNING: deletes data!)
./db-setup.sh seed     # Re-run seed files
./db-setup.sh status   # Show database status
./db-setup.sh help     # Show detailed help
```

### Common Workflows

**First Time Setup:**
```bash
./db-setup.sh init
```

**Start/Stop Daily:**
```bash
./db-setup.sh start   # Morning
./db-setup.sh stop    # Evening
```

**Fresh Start:**
```bash
./db-setup.sh reset   # Confirms before deleting
```

**Add New Seeds:**
```bash
# Create server/database/seeds/03-my-data.sql
./db-setup.sh seed
```

### Documentation

For complete documentation, see [DATABASE_SETUP.md](../DATABASE_SETUP.md)

## Development Script

### dev-with-nvm.sh

Starts both frontend and backend servers with automatic Node.js version management.

```bash
./dev-with-nvm.sh
```

This script:
- Loads nvm if available
- Switches to Node.js v16.14.2
- Starts server in background
- Starts client in foreground

Can also be run via:
```bash
npm run dev
```
