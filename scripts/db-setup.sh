#!/bin/bash

# CUMC Database Setup Script
# This script handles the complete setup of the development database including:
# - Starting Docker PostgreSQL container
# - Creating database schema via Sequelize
# - Seeding initial data

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.development"
DOCKER_COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
SEEDS_DIR="${PROJECT_ROOT}/server/database/seeds"

# Database connection info from .env.development
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="cumc_dev"
DB_USER="cumc_dev"
DB_PASSWORD="dev_password"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_info "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if container is healthy
wait_for_db() {
    print_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec cumc-dev-db pg_isready -U "$DB_USER" > /dev/null 2>&1; then
            print_success "Database is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done

    print_error "Database failed to become ready after $max_attempts seconds"
    return 1
}

# Function to start Docker containers
start_docker() {
    print_info "Starting Docker containers..."

    if ! [ -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "docker-compose.yml not found at $DOCKER_COMPOSE_FILE"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    docker-compose up -d

    if [ $? -eq 0 ]; then
        print_success "Docker containers started"
    else
        print_error "Failed to start Docker containers"
        exit 1
    fi
}

# Function to stop Docker containers
stop_docker() {
    print_info "Stopping Docker containers..."
    cd "$PROJECT_ROOT"
    docker-compose down
    print_success "Docker containers stopped"
}

# Function to reset database (drop and recreate)
reset_database() {
    print_warning "Resetting database (this will delete all data)..."

    # Drop and recreate database
    docker exec cumc-dev-db psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
    docker exec cumc-dev-db psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    if [ $? -eq 0 ]; then
        print_success "Database reset complete"
    else
        print_error "Failed to reset database"
        exit 1
    fi
}

# Function to run Sequelize sync (creates tables)
run_sequelize_sync() {
    print_info "Creating database schema via Sequelize..."

    cd "$PROJECT_ROOT/server"

    # Create a temporary Node.js script in the server directory to run sequelize sync
    cat > ./cumc-db-sync-temp.js << 'EOF'
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const { init } = require('./database/database');

async function syncDatabase() {
    try {
        console.log('Initializing database connection...');
        await init();
        console.log('Database schema created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

syncDatabase();
EOF

    # Run the sync script
    node ./cumc-db-sync-temp.js

    local exit_code=$?
    
    # Clean up the temporary file
    rm -f ./cumc-db-sync-temp.js

    if [ $exit_code -eq 0 ]; then
        print_success "Database schema created"
    else
        print_error "Failed to create database schema"
        exit 1
    fi
}

# Function to run seed files
run_seeds() {
    print_info "Running seed files..."

    if ! [ -d "$SEEDS_DIR" ]; then
        print_warning "Seeds directory not found at $SEEDS_DIR, skipping seeds"
        return 0
    fi

    # Count SQL files
    local seed_count=$(find "$SEEDS_DIR" -name "*.sql" -type f | wc -l)
    
    if [ $seed_count -eq 0 ]; then
        print_warning "No seed files found in $SEEDS_DIR"
        return 0
    fi

    # Run each SQL file in order (sorted by filename)
    for seed_file in "$SEEDS_DIR"/*.sql; do
        if [ -f "$seed_file" ]; then
            local filename=$(basename "$seed_file")
            print_info "Running seed: $filename"

            PGPASSWORD="$DB_PASSWORD" docker exec -i cumc-dev-db psql -U "$DB_USER" -d "$DB_NAME" < "$seed_file"

            if [ $? -eq 0 ]; then
                print_success "Seed $filename completed"
            else
                print_error "Failed to run seed $filename"
                exit 1
            fi
        fi
    done

    print_success "All seeds completed"
}

# Function to show database status
show_status() {
    print_info "Database Status"
    echo ""

    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q '^cumc-dev-db$'; then
        print_success "Container: Running"

        # Check if database is ready
        if docker exec cumc-dev-db pg_isready -U "$DB_USER" > /dev/null 2>&1; then
            print_success "Database: Ready"

            # Show table counts
            echo ""
            print_info "Table statistics:"
            docker exec cumc-dev-db psql -U "$DB_USER" -d "$DB_NAME" -c "
                SELECT
                    tablename,
                    (SELECT COUNT(*) FROM \"$DB_NAME\".public.\"\" || tablename || '\"') as row_count
                FROM pg_tables
                WHERE schemaname = 'public'
                ORDER BY tablename;
            " 2>/dev/null || print_warning "Could not fetch table statistics"
        else
            print_warning "Database: Not ready"
        fi
    else
        print_warning "Container: Not running"
    fi
}

# Function to show help
show_help() {
    cat << EOF
CUMC Database Setup Script

Usage: $0 [COMMAND]

Commands:
    init        Complete setup (start Docker, create schema, run seeds)
    start       Start Docker containers only
    stop        Stop Docker containers
    reset       Reset database (drop all data and recreate)
    seed        Run seed files only (requires database to be initialized)
    status      Show database status
    help        Show this help message

Examples:
    $0 init          # Full setup for first time
    $0 reset         # Reset database and re-run seeds
    $0 seed          # Re-run seeds without resetting
    $0 status        # Check database status

Environment:
    Database: $DB_NAME
    User: $DB_USER
    Host: $DB_HOST
    Port: $DB_PORT
EOF
}

# Main script logic
main() {
    local command="${1:-help}"

    case "$command" in
        init)
            print_info "Starting complete database initialization..."
            check_docker
            start_docker
            wait_for_db
            reset_database
            run_sequelize_sync
            run_seeds
            print_success "Database initialization complete!"
            echo ""
            show_status
            ;;
        start)
            check_docker
            start_docker
            wait_for_db
            print_success "Database started successfully"
            ;;
        stop)
            stop_docker
            ;;
        reset)
            print_warning "This will delete all data in the database!"
            read -p "Are you sure? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                check_docker
                # Make sure container is running
                if ! docker ps --format '{{.Names}}' | grep -q '^cumc-dev-db$'; then
                    start_docker
                    wait_for_db
                fi
                reset_database
                run_sequelize_sync
                run_seeds
                print_success "Database reset complete!"
                echo ""
                show_status
            else
                print_info "Reset cancelled"
            fi
            ;;
        seed)
            check_docker
            if ! docker ps --format '{{.Names}}' | grep -q '^cumc-dev-db$'; then
                print_error "Database container is not running. Run '$0 start' first."
                exit 1
            fi
            run_seeds
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"