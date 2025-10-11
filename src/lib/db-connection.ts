

'use server';

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'estateflow',
  connectTimeout: 30000, // 30 seconds
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 10,
  idleTimeout: 60000,
  acquireTimeout: 30000
};

let connection: mysql.Connection | null = null;
let connectionPool: mysql.Pool | null = null;
let migrationsHaveRun = false;

// Initialize connection pool
function getPool() {
  if (!connectionPool) {
    connectionPool = mysql.createPool(poolConfig);
  }
  return connectionPool;
}

async function columnExists(conn: mysql.Connection, tableName: string, columnName: string): Promise<boolean> {
    try {
        const [columns] = await conn.query(`
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `, [conn.config.database, tableName, columnName]);
        return (columns as any[]).length > 0;
    } catch (error) {
        console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
        return false;
    }
}

async function tableExists(conn: mysql.Connection, tableName: string): Promise<boolean> {
    try {
        const [tables] = await conn.query("SHOW TABLES LIKE ?", [tableName]);
        return (tables as any[]).length > 0;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
}

async function getForeignKeyName(conn: mysql.Connection, tableName: string, columnName: string): Promise<string | null> {
    try {
        const [results] = await conn.query(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [conn.config.database, tableName, columnName]);

        if ((results as any[]).length > 0) {
            return (results as any)[0].CONSTRAINT_NAME;
        }
        return null;
    } catch (error) {
        console.error(`Error getting foreign key name for ${tableName}.${columnName}:`, error);
        return null;
    }
}

async function constraintExists(conn: mysql.Connection, tableName: string, constraintName: string): Promise<boolean> {
    try {
        const [constraints] = await conn.query(`
            SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?
        `, [conn.config.database, tableName, constraintName]);
        return (constraints as any[]).length > 0;
    } catch (error) {
        console.error(`Error checking if constraint ${constraintName} exists on ${tableName}:`, error);
        return false;
    }
}


export async function getConnection(retries = 3): Promise<mysql.Connection> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use pool to get a connection
      const pool = getPool();
      const poolConnection = await pool.getConnection();
      
      // Test connection
      await poolConnection.ping();
      
      return poolConnection as mysql.Connection;
    } catch (error) {
      lastError = error;
      console.error(`DB Connection Error (attempt ${attempt}/${retries}):`, error);
      
      // Reset pool on error
      if (connectionPool) {
        try {
          await connectionPool.end();
        } catch (e) {
          // Ignore errors when closing pool
        }
        connectionPool = null;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

async function runMigrationsInternal(existingConnection?: mysql.Connection | null) {
    // This function is now disabled. Migrations should be handled manually via .sql files.
}

export async function closeConnection() {
    if (connectionPool) {
        await connectionPool.end();
        connectionPool = null;
    }
    if (connection) {
        await connection.end();
        connection = null;
    }
    migrationsHaveRun = false;
}
