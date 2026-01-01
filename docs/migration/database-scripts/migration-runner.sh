#!/bin/bash

# Compilar Database Migration Runner
# Automates the migration from Supabase to standalone PostgreSQL

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-compilar_prod}
DB_USER=${DB_USER:-compilar_user}
DB_PASSWORD=${DB_PASSWORD:-}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Database connection test
test_db_connection() {
    log_info "Testing database connection..."
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

# Run SQL file
run_sql_file() {
    local file="$1"
    local description="$2"

    if [ ! -f "$file" ]; then
        log_error "SQL file not found: $file"
        return 1
    fi

    log_info "Running $description..."
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed"
        return 1
    fi
}

# Verify migration step
verify_step() {
    local step="$1"
    local query="$2"
    local expected="$3"
    local description="$4"

    log_info "Verifying $description..."
    local result
    result=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>/dev/null | tr -d ' ')

    if [ "$result" = "$expected" ]; then
        log_success "$description verified"
        return 0
    else
        log_error "$description verification failed (expected: $expected, got: $result)"
        return 1
    fi
}

# Migration steps
run_extensions() {
    run_sql_file "$SCRIPT_DIR/00_extensions.sql" "extensions setup"
    verify_step "extensions" "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');" "2" "extensions installation"
}

run_schema() {
    run_sql_file "$SCRIPT_DIR/01_schema.sql" "schema creation"
    verify_step "schema" "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" "32" "table creation"
}

run_indexes() {
    run_sql_file "$SCRIPT_DIR/02_indexes.sql" "index creation"
    verify_step "indexes" "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" "50" "index creation"
}

run_triggers() {
    run_sql_file "$SCRIPT_DIR/03_triggers.sql" "trigger setup"
    verify_step "triggers" "SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%updated_at%';" "15" "trigger creation"
}

run_initial_data() {
    run_sql_file "$SCRIPT_DIR/04_initial_data.sql" "initial data seeding"
    verify_step "initial_data" "SELECT COUNT(*) FROM pilar_knowledge;" "10" "PILAR knowledge seeding"
}

run_migration_utils() {
    run_sql_file "$SCRIPT_DIR/05_migration_utils.sql" "migration utilities"
    verify_step "migration_utils" "SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'check_%';" "5" "utility functions"
}

run_rls_replacement() {
    run_sql_file "$SCRIPT_DIR/06_rls_replacement.sql" "RLS replacement functions"
    verify_step "rls_replacement" "SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'check_%_access';" "3" "authorization functions"
}

run_vector_setup() {
    if [ -f "$SCRIPT_DIR/07_vector_setup.sql" ]; then
        run_sql_file "$SCRIPT_DIR/07_vector_setup.sql" "vector extension setup"
        verify_step "vector_setup" "SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector';" "1" "vector extension"
    else
        log_warning "Vector setup file not found, skipping..."
    fi
}

run_partitioning() {
    if [ -f "$SCRIPT_DIR/08_partitioning.sql" ]; then
        run_sql_file "$SCRIPT_DIR/08_partitioning.sql" "table partitioning setup"
        verify_step "partitioning" "SELECT COUNT(*) FROM pg_inherits WHERE inhparent IN (SELECT oid FROM pg_class WHERE relname = 'user_analytics');" "12" "partitioning setup"
    else
        log_warning "Partitioning setup file not found, skipping..."
    fi
}

# Data migration functions
backup_existing_data() {
    local backup_file="$1"
    log_info "Creating database backup: $backup_file"
    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        log_success "Backup created successfully"
        return 0
    else
        log_error "Backup creation failed"
        return 1
    fi
}

restore_backup() {
    local backup_file="$1"
    log_info "Restoring database from: $backup_file"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$backup_file"; then
        log_success "Backup restored successfully"
        return 0
    else
        log_error "Backup restoration failed"
        return 1
    fi
}

# Main migration functions
run_full_migration() {
    log_info "Starting full database migration..."

    # Test connection first
    if ! test_db_connection; then
        exit 1
    fi

    # Create backup
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="/tmp/compilar_backup_$timestamp.sql"
    if ! backup_existing_data "$backup_file"; then
        log_error "Backup failed, aborting migration"
        exit 1
    fi

    # Run migration steps
    local steps=("extensions" "schema" "indexes" "triggers" "initial_data" "migration_utils" "rls_replacement" "vector_setup" "partitioning")
    local failed_steps=()

    for step in "${steps[@]}"; do
        if ! run_step "$step"; then
            failed_steps+=("$step")
            log_error "Step $step failed"
        fi
    done

    # Report results
    if [ ${#failed_steps[@]} -eq 0 ]; then
        log_success "Full migration completed successfully!"
        log_info "Backup saved at: $backup_file"
        echo
        log_info "Next steps:"
        echo "1. Run data migration scripts if needed"
        echo "2. Update application configuration"
        echo "3. Run integration tests"
        echo "4. Monitor system performance"
    else
        log_error "Migration completed with failures: ${failed_steps[*]}"
        echo
        log_warning "To rollback:"
        echo "  $0 --rollback $backup_file"
        exit 1
    fi
}

run_step() {
    local step="$1"
    case $step in
        "extensions") run_extensions ;;
        "schema") run_schema ;;
        "indexes") run_indexes ;;
        "triggers") run_triggers ;;
        "initial_data") run_initial_data ;;
        "migration_utils") run_migration_utils ;;
        "rls_replacement") run_rls_replacement ;;
        "vector_setup") run_vector_setup ;;
        "partitioning") run_partitioning ;;
        *) log_error "Unknown step: $step"; return 1 ;;
    esac
}

run_rollback() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        log_error "Backup file required for rollback"
        echo "Usage: $0 --rollback <backup_file>"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    log_warning "This will restore the database from backup, losing any changes made after the backup."
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi

    # Drop and recreate database
    log_info "Dropping and recreating database..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    # Restore from backup
    if restore_backup "$backup_file"; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed"
        exit 1
    fi
}

run_verify() {
    log_info "Running migration verification..."

    # Test database connection
    if ! test_db_connection; then
        exit 1
    fi

    local checks=(
        "extensions:SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');:2"
        "tables:SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';:32"
        "indexes:SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';:50"
        "triggers:SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%updated_at%';:15"
        "pilar_knowledge:SELECT COUNT(*) FROM pilar_knowledge;:10"
        "utility_functions:SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'check_%';:5"
    )

    local failed_checks=()

    for check in "${checks[@]}"; do
        IFS=':' read -r name query expected <<< "$check"
        if ! verify_step "$name" "$query" "$expected" "$name check"; then
            failed_checks+=("$name")
        fi
    done

    if [ ${#failed_checks[@]} -eq 0 ]; then
        log_success "All verification checks passed!"
    else
        log_error "Verification failed for: ${failed_checks[*]}"
        exit 1
    fi
}

show_help() {
    cat << EOF
Compilar Database Migration Runner

USAGE:
    $0 [OPTIONS] [STEP...]

OPTIONS:
    --full              Run complete migration
    --step STEP         Run specific step(s)
    --verify            Verify migration success
    --rollback FILE     Rollback using backup file
    --dry-run           Show what would be done
    --help              Show this help

STEPS:
    extensions          PostgreSQL extensions setup
    schema              Database schema creation
    indexes             Performance indexes
    triggers            Database triggers
    initial_data        Seed data
    migration_utils     Migration utilities
    rls_replacement     Authorization functions
    vector_setup        Vector extension (optional)
    partitioning        Table partitioning (optional)

ENVIRONMENT VARIABLES:
    DB_HOST             Database host (default: localhost)
    DB_PORT             Database port (default: 5432)
    DB_NAME             Database name (default: compilar_prod)
    DB_USER             Database user (default: compilar_user)
    DB_PASSWORD         Database password (required)

EXAMPLES:
    $0 --full
    $0 --step schema --step indexes
    $0 --verify
    $0 --rollback /tmp/compilar_backup_20240101.sql

EOF
}

# Main script logic
main() {
    local action=""
    local steps=()
    local rollback_file=""
    local dry_run=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --full) action="full" ;;
            --step) steps+=("$2"); shift ;;
            --verify) action="verify" ;;
            --rollback) action="rollback"; rollback_file="$2"; shift ;;
            --dry-run) dry_run=true ;;
            --help) show_help; exit 0 ;;
            *) steps+=("$1") ;;
        esac
        shift
    done

    # Set default action
    if [ -z "$action" ] && [ ${#steps[@]} -eq 0 ]; then
        action="full"
    elif [ ${#steps[@]} -gt 0 ]; then
        action="steps"
    fi

    # Validate environment
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD environment variable is required"
        exit 1
    fi

    # Dry run mode
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN MODE - No changes will be made"
        echo
    fi

    # Execute action
    case $action in
        "full") run_full_migration ;;
        "steps") for step in "${steps[@]}"; do run_step "$step"; done ;;
        "verify") run_verify ;;
        "rollback") run_rollback "$rollback_file" ;;
        *) log_error "Invalid action: $action"; show_help; exit 1 ;;
    esac
}

# Run main function
main "$@"