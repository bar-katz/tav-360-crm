/**
 * Database isolation and setup utilities
 * Creates unique test database per test run
 */
import { Client } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TEST_ENV } from '../config/test-env';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

let testDbName: string;
let adminClient: Client | null = null;

/**
 * Generate unique test database name
 */
function generateTestDbName(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${TEST_ENV.TEST_DB_NAME_PREFIX}_${timestamp}_${random}`;
}

/**
 * Create admin connection to PostgreSQL (connects to default 'postgres' database)
 */
async function getAdminClient(): Promise<Client> {
  if (!adminClient) {
    adminClient = new Client({
      host: TEST_ENV.TEST_DB_HOST,
      port: TEST_ENV.TEST_DB_PORT,
      user: TEST_ENV.TEST_DB_USER,
      password: TEST_ENV.TEST_DB_PASSWORD,
      database: 'postgres', // Connect to default database
    });
    await adminClient.connect();
  }
  return adminClient;
}

/**
 * Run database migrations on test database
 */
async function runMigrations(dbName: string): Promise<void> {
  // Calculate migrations directory relative to project root
  // Try multiple possible paths to handle different execution contexts
  const possiblePaths = [
    path.resolve(__dirname, '../../../backend/migrations'), // From tests/e2e/fixtures/
    path.resolve(process.cwd(), 'backend/migrations'), // From project root
    path.resolve(process.cwd(), '../backend/migrations'), // From tests/ directory
  ];
  
  let migrationsDir: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      migrationsDir = possiblePath;
      break;
    }
  }
  
  if (!migrationsDir) {
    throw new Error(
      `Migrations directory not found. Checked paths:\n${possiblePaths.map(p => `  - ${p}`).join('\n')}\n` +
      `Current working directory: ${process.cwd()}\n` +
      `__dirname: ${__dirname}`
    );
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[0]);
      const numB = parseInt(b.split('_')[0]);
      return numA - numB;
    });
  
  const client = new Client({
    host: TEST_ENV.TEST_DB_HOST,
    port: TEST_ENV.TEST_DB_PORT,
    user: TEST_ENV.TEST_DB_USER,
    password: TEST_ENV.TEST_DB_PASSWORD,
    database: dbName,
  });
  
  await client.connect();
  
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`✓ Applied migration: ${file}`);
      } catch (error: any) {
        // Some migrations may have dependencies that aren't met yet
        // Check if it's a "relation does not exist" error for foreign key constraints
        if (error.message && error.message.includes('does not exist') && sql.includes('ALTER TABLE')) {
          console.log(`⚠ Skipped constraint in ${file} (dependency not yet created)`);
          // Try to execute the migration without the ALTER TABLE constraint
          const sqlWithoutAlter = sql.split('ALTER TABLE')[0];
          if (sqlWithoutAlter.trim()) {
            await client.query(sqlWithoutAlter);
            console.log(`✓ Applied migration (partial): ${file}`);
          }
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    }
    
    // Re-run migrations that had skipped constraints to add them now
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      if (sql.includes('ALTER TABLE') && sql.includes('FOREIGN KEY')) {
        try {
          // Extract just the ALTER TABLE statement
          const alterMatch = sql.match(/ALTER TABLE[^;]+;/);
          if (alterMatch) {
            await client.query(alterMatch[0]);
            console.log(`✓ Applied deferred constraint from: ${file}`);
          }
        } catch (error: any) {
          // Ignore if constraint already exists or table still doesn't exist
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.warn(`⚠ Could not apply constraint from ${file}: ${error.message}`);
          }
        }
      }
    }
  } finally {
    await client.end();
  }
}

/**
 * Seed base test data (admin user)
 */
async function seedTestData(dbName: string): Promise<void> {
  const client = new Client({
    host: TEST_ENV.TEST_DB_HOST,
    port: TEST_ENV.TEST_DB_PORT,
    user: TEST_ENV.TEST_DB_USER,
    password: TEST_ENV.TEST_DB_PASSWORD,
    database: dbName,
  });
  
  await client.connect();
  
  try {
    // Hash password using bcrypt (same as backend)
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(TEST_ENV.TEST_USER_PASSWORD, 10);
    
    // Insert test admin user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, app_role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         app_role = EXCLUDED.app_role
       RETURNING id, email`,
      [TEST_ENV.TEST_USER_EMAIL, passwordHash, 'Test Admin', TEST_ENV.TEST_USER_ROLE]
    );
    
    if (result.rows.length > 0) {
      console.log(`✓ Seeded test user: ${result.rows[0].email} (ID: ${result.rows[0].id})`);
    } else {
      // User already exists, verify it's accessible
      const existingUser = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [TEST_ENV.TEST_USER_EMAIL]
      );
      if (existingUser.rows.length > 0) {
        console.log(`✓ Test user already exists: ${existingUser.rows[0].email} (ID: ${existingUser.rows[0].id})`);
      }
    }
    
    console.log(`✓ Seeded test data in ${dbName}`);
  } catch (error: any) {
    console.error(`✗ Failed to seed test data: ${error.message}`);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Setup test database (create, migrate, seed)
 * Call this once per test suite
 */
export async function setupTestDatabase(): Promise<string> {
  testDbName = generateTestDbName();
  const admin = await getAdminClient();
  
  try {
    // Check if database already exists and drop it if needed
    const dbCheck = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [testDbName]
    );
    
    if (dbCheck.rows.length > 0) {
      // Disconnect any active connections to the database
      await admin.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [testDbName]);
      await admin.query(`DROP DATABASE ${testDbName}`);
    }
    
    await admin.query(`CREATE DATABASE ${testDbName}`);
    console.log(`✓ Created test database: ${testDbName}`);
    
    // Run migrations
    await runMigrations(testDbName);
    
    // Seed test data
    await seedTestData(testDbName);
    
    // Set DATABASE_URL for backend (note: backend needs to be restarted to use this)
    process.env.DATABASE_URL = `postgresql://${TEST_ENV.TEST_DB_USER}:${TEST_ENV.TEST_DB_PASSWORD}@${TEST_ENV.TEST_DB_HOST}:${TEST_ENV.TEST_DB_PORT}/${testDbName}`;
    
    // Also create test user in main database if it doesn't exist
    // This allows backend (which may be using main DB) to authenticate
    try {
      const mainDbClient = new Client({
        host: TEST_ENV.TEST_DB_HOST,
        port: TEST_ENV.TEST_DB_PORT,
        user: TEST_ENV.TEST_DB_USER,
        password: TEST_ENV.TEST_DB_PASSWORD,
        database: 'tav360_crm', // Main database
      });
      await mainDbClient.connect();
      
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(TEST_ENV.TEST_USER_PASSWORD, 10);
      
      await mainDbClient.query(
        `INSERT INTO users (email, password_hash, full_name, app_role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           app_role = EXCLUDED.app_role`,
        [TEST_ENV.TEST_USER_EMAIL, passwordHash, 'Test Admin', TEST_ENV.TEST_USER_ROLE]
      );
      
      await mainDbClient.end();
      console.log(`✓ Created test user in main database for backend authentication`);
    } catch (error: any) {
      // If main database doesn't exist or user creation fails, continue
      // Backend might be using test database or user might already exist
      console.log(`⚠ Could not create test user in main database: ${error.message}`);
    }
    
    return testDbName;
  } catch (error) {
    console.error(`✗ Failed to setup test database: ${error}`);
    throw error;
  }
}

/**
 * Teardown test database (drop database)
 * Call this after test suite completes
 */
export async function teardownTestDatabase(): Promise<void> {
  if (!testDbName) {
    return;
  }
  
  const admin = await getAdminClient();
  
  try {
    // Terminate all connections to the test database
    await admin.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
    `, [testDbName]);
    
    // Drop test database
    await admin.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    console.log(`✓ Dropped test database: ${testDbName}`);
  } catch (error) {
    console.error(`✗ Failed to teardown test database: ${error}`);
    // Don't throw - cleanup failures shouldn't fail tests
  }
}

/**
 * Get connection string for test database
 */
export function getTestDatabaseUrl(): string {
  if (!testDbName) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return `postgresql://${TEST_ENV.TEST_DB_USER}:${TEST_ENV.TEST_DB_PASSWORD}@${TEST_ENV.TEST_DB_HOST}:${TEST_ENV.TEST_DB_PORT}/${testDbName}`;
}

/**
 * Get direct database client for test database
 */
export async function getTestDbClient(): Promise<Client> {
  const client = new Client({
    host: TEST_ENV.TEST_DB_HOST,
    port: TEST_ENV.TEST_DB_PORT,
    user: TEST_ENV.TEST_DB_USER,
    password: TEST_ENV.TEST_DB_PASSWORD,
    database: testDbName,
  });
  
  await client.connect();
  return client;
}

/**
 * Get direct database client for main database (where backend writes)
 * Use this when verifying data created via API calls
 */
export async function getMainDbClient(): Promise<Client> {
  const client = new Client({
    host: TEST_ENV.TEST_DB_HOST,
    port: TEST_ENV.TEST_DB_PORT,
    user: TEST_ENV.TEST_DB_USER,
    password: TEST_ENV.TEST_DB_PASSWORD,
    database: TEST_ENV.TEST_DB_NAME_PREFIX.replace('_test', '_crm'), // Main CRM database
  });
  
  await client.connect();
  return client;
}

/**
 * Cleanup admin connection
 */
export async function closeAdminConnection(): Promise<void> {
  if (adminClient) {
    await adminClient.end();
    adminClient = null;
  }
}

