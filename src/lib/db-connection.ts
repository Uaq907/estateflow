

'use server';

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let connection: mysql.Connection | null = null;
let migrationsHaveRun = false;

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


export async function getConnection() {
  if (connection && connection.connection.stream.readable) {
    // if (!migrationsHaveRun) {
    //     await runMigrationsInternal();
    //     migrationsHaveRun = true;
    // }
    return connection;
  }
  
  try {
    // The database is expected to exist. Direct connection attempt.
    connection = await mysql.createConnection(dbConfig);
    
    // await runMigrationsInternal(connection);
    // migrationsHaveRun = true;

    connection.on('error', (err) => {
        console.error('Database connection error:', err);
        connection = null;
        migrationsHaveRun = false;
    });

    return connection;
  } catch (error) {
    console.error("DB Connection Error:", error);
    connection = null;
    migrationsHaveRun = false;
    throw error;
  }
}

async function runMigrationsInternal(existingConnection?: mysql.Connection | null) {
    // This function is now disabled. Migrations should be handled manually via .sql files.
}

export async function closeConnection() {
    if (connection) {
        await connection.end();
        connection = null;
        migrationsHaveRun = false;
    }
}
