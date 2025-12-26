/**
 * Database helper utilities
 */
import { Client } from 'pg';

/**
 * Execute SQL query
 */
export async function executeQuery(
  client: Client,
  query: string,
  params?: any[]
): Promise<any[]> {
  const result = await client.query(query, params);
  return result.rows;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(
  client: Client,
  tableName: string,
  condition: string,
  params?: any[]
): Promise<void> {
  await client.query(`DELETE FROM ${tableName} WHERE ${condition}`, params);
}

/**
 * Get table row count
 */
export async function getTableCount(
  client: Client,
  tableName: string,
  condition?: string,
  params?: any[]
): Promise<number> {
  const query = condition
    ? `SELECT COUNT(*) as count FROM ${tableName} WHERE ${condition}`
    : `SELECT COUNT(*) as count FROM ${tableName}`;
  
  const result = await client.query(query, params);
  return parseInt(result.rows[0].count);
}

