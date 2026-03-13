#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * This script selects the appropriate Prisma schema based on the DATABASE_PROVIDER environment variable.
 * 
 * Usage:
 *   - For SQLite (default): DATABASE_PROVIDER=sqlite (or leave unset)
 *   - For PostgreSQL: DATABASE_PROVIDER=postgres
 * 
 * The script copies the appropriate schema to prisma/schema.prisma before running Prisma commands.
 */

const fs = require('fs');
const path = require('path');

const provider = process.env.DATABASE_PROVIDER || 'sqlite';
const schemaDir = path.join(__dirname, '..', 'prisma');

console.log(`\n🔧 Selecting Prisma schema for: ${provider.toUpperCase()}\n`);

// Determine which schema to use
const sourceFile = provider === 'postgres' 
  ? path.join(schemaDir, 'schema.postgres.prisma')
  : path.join(schemaDir, 'schema.sqlite.prisma');

const targetFile = path.join(schemaDir, 'schema.prisma');

// Check if source exists
if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Schema file not found: ${sourceFile}`);
  process.exit(1);
}

// Copy the schema
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Using ${provider} schema`);
  console.log(`   Source: ${path.basename(sourceFile)}`);
  console.log(`   Target: schema.prisma\n`);
} catch (error) {
  console.error(`❌ Failed to copy schema: ${error.message}`);
  process.exit(1);
}
