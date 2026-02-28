# Database Migrations

This directory contains database migration files for the Hospitality Booking Engine.

## Migration Files

- `001_initial_schema.sql` - Initial database schema with all tables and indexes

## Running Migrations

### Prerequisites

- PostgreSQL 14+ installed
- Database created: `webwaka_hospitality`
- Database user with appropriate permissions

### Apply Migrations

```bash
# Using psql
psql -h localhost -U postgres -d webwaka_hospitality -f database/migrations/001_initial_schema.sql

# Using npm script (if configured)
npm run migrate:up
```

### Rollback Migrations

```bash
# Drop all tables (use with caution!)
psql -h localhost -U postgres -d webwaka_hospitality -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Or use rollback script (if available)
npm run migrate:down
```

## Migration Best Practices

1. **Never modify existing migrations** - Create new migrations for schema changes
2. **Test migrations** - Test on development database before production
3. **Backup before migration** - Always backup production database before applying migrations
4. **Version control** - All migrations must be committed to version control
5. **Sequential naming** - Use sequential numbers (001, 002, 003, etc.)

## Creating New Migrations

1. Create new file with next sequential number: `002_add_column.sql`
2. Write SQL for schema change
3. Test migration on development database
4. Commit to version control

## Migration Checklist

Before applying migrations to production:

- [ ] Tested on development database
- [ ] Tested on staging database
- [ ] Backup created
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan prepared
- [ ] Team notified

## Troubleshooting

### Migration fails with "relation already exists"

This usually means the migration was partially applied. Check which tables exist and manually clean up before re-running.

### Migration fails with "permission denied"

Ensure the database user has CREATE, ALTER, and DROP permissions.

### Migration takes too long

Large tables may require downtime or online schema change tools like `pg_repack`.
