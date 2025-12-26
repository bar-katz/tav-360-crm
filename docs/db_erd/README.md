# Database ERD Documentation

This directory contains Entity Relationship Diagrams (ERDs) documenting the database schema at different points in time.

## Versioning Convention

ERD files are named using the format: `erd_vYYYY-MM-DD_COMMIT.md`

- **YYYY-MM-DD**: Date when the ERD was generated
- **COMMIT**: Short git commit hash (first 7 characters)

## Current ERD

- **erd_v2025-12-20_4a8df92.md** - Initial ERD after monorepo refactor

## How to View ERDs

The ERDs are written in Mermaid format and can be viewed:

1. **GitHub**: GitHub automatically renders Mermaid diagrams in markdown files
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Copy the mermaid code block to [Mermaid Live Editor](https://mermaid.live/)
4. **Documentation Tools**: Most modern documentation tools support Mermaid

## Generating a New ERD

When the database schema changes:

1. Update the models in `backend/src/models/`
2. Create new migration files
3. Generate a new ERD using this format
4. Update this README with the new version

## ERD Format

Each ERD file includes:
- Version information (date, commit hash, migration count)
- Complete Mermaid ERD diagram
- Entity summary with counts
- Key relationships explanation
- Foreign key relationships table
- Migration history

