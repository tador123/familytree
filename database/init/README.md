# Database Initialization

This directory contains SQL scripts that are automatically executed when the PostgreSQL container is first created.

## Files

- `01-schema.sql` - Database schema creation and sample data

## Schema Overview

### Tables

1. **family_members** - Stores biographical information about family members
   - Personal details (name, gender, dates, places)
   - Biography and occupation
   - Auto-managed timestamps

2. **relationships** - Defines connections between family members
   - Supports: parent, child, spouse, sibling relationships
   - Bidirectional with constraints
   - Optional date ranges and notes

3. **media** - Manages photos, documents, and other files
   - Linked to family members
   - Metadata (title, description, date, location)
   - File information (path, type, size)
   - Tag support

## Sample Data

The initialization script includes sample data for the Smith family:
- John Smith (patriarch) and Mary Smith (matriarch)
- Their children: Robert and Sarah
- Various family relationships

## Extending the Schema

To add more initialization scripts:
1. Create a new `.sql` file with a numeric prefix (e.g., `02-additional-data.sql`)
2. Files are executed in alphabetical order
3. Restart the PostgreSQL container to apply changes

## Resetting the Database

To reset the database and re-run initialization:

```bash
docker-compose down -v
docker-compose up -d postgres
```

Note: The `-v` flag removes volumes, which deletes all data.
