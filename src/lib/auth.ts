

'use server';

import 'server-only';
import { cookies } from 'next/headers';
import type mysql from 'mysql2/promise';
import { employeeSchema, tenantSchema, type Employee, type Tenant } from './types';
import { z } from 'zod';
import { getConnection } from './db-connection';

export type UserRole = 'employee' | 'tenant';

export interface SessionPayload {
    userId: string;
    role: UserRole;
    expires: Date;
}

export async function createSession(userId: string, role: UserRole) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session: SessionPayload = { userId, role, expires };
    // In a real app, this would be encrypted (e.g., using iron-session)
    return JSON.stringify(session);
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const payload: SessionPayload = JSON.parse(sessionCookie);
        if (new Date(payload.expires) < new Date()) {
            // Cookie has expired
            (await cookies()).delete('session');
            return null;
        }
        return payload;
    } catch {
        // Invalid cookie, delete it
        (await cookies()).delete('session');
        return null;
    }
}


export async function getEmployeeByEmail(email: string): Promise<(Employee & { password?: string }) | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM employees WHERE email = ?', [email]);
        const data = rows as any[];
        if (data.length === 0) return null;
        
        const row = data[0];
        const permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []);
        const notificationPreferences = typeof row.notificationPreferences === 'string' ? JSON.parse(row.notificationPreferences) : (row.notificationPreferences || null);
        
        const authEmployeeSchema = employeeSchema.extend({ password: z.string().optional() });
        const parsedData = authEmployeeSchema.parse({ ...row, id: String(row.id), permissions, notificationPreferences });
        return parsedData;
    } catch(error) {
        console.error("Could not fetch employee by email", error);
        // Rethrow the error to be handled by the caller, especially for DB connection issues.
        throw error;
    }
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM employees WHERE id = ?', [id]);
        if ((rows as any[]).length === 0) {
            return null;
        }
        const row = (rows as any)[0];
        const permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []);
        const notificationPreferences = typeof row.notificationPreferences === 'string' ? JSON.parse(row.notificationPreferences) : (row.notificationPreferences || {});
        
        return employeeSchema.parse({ 
            ...row, 
            id: String(row.id), 
            permissions,
            notificationPreferences
        });
    } catch (e) {
        console.error("Error in getEmployeeById", e);
        return null;
    }
}


export async function getTenantByEmail(email: string): Promise<(Tenant & { password?: string }) | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM tenants WHERE email = ?', [email]);
        const data = rows as any[];
        if (data.length === 0) return null;
        const authTenantSchema = tenantSchema.extend({ password: z.string().optional() });
        const parsedData = authTenantSchema.parse({ ...data[0], id: String(data[0].id) });
        return parsedData;
    } catch(error) {
        console.error("Could not fetch tenant by email", error);
        throw error;
    }
}


export async function getEmployeeFromSession(): Promise<Employee | null> {
  const session = await getSession();
  if (!session || session.role !== 'employee') return null;

  // Check if this is demo admin session
  if (session.userId === 'demo-admin') {
    // Return demo admin employee data
    return {
      id: 'demo-admin',
      name: 'Demo Admin',
      email: 'uaq907@gmail.com',
      position: 'Administrator',
      department: 'Management',
      startDate: new Date(),
      allowLogin: true,
      permissions: ['dashboard:view-overview', 'properties:read', 'properties:write', 'employees:read', 'employees:write', 'tenants:read', 'tenants:write', 'expenses:read-all', 'expenses:write', 'reports:read', 'reports:execute'],
      phone: 'N/A',
      emergencyContact: 'N/A',
      emiratesId: 'N/A',
      passportNumber: 'N/A',
      dateOfBirth: new Date('1990-01-01'),
      status: 'Active',
      nationality: 'N/A',
      managerId: null,
      salary: 0,
      visaNumber: 'N/A',
      visaExpiryDate: new Date('2030-01-01'),
      insuranceNumber: 'N/A',
      insuranceExpiryDate: new Date('2030-01-01'),
      telegramBotToken: null,
      telegramChannelId: null,
      enableEmailAlerts: false,
      profilePictureUrl: null,
      assignedPropertyIds: []
    } as Employee;
  }

  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM employees WHERE id = ?', [session.userId]);
    if ((rows as any[]).length === 0) {
      return null;
    }
    
    const row = (rows as any)[0];
    const permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []);
    const notificationPreferences = typeof row.notificationPreferences === 'string' ? JSON.parse(row.notificationPreferences) : (row.notificationPreferences || null);
    
    // Also fetch assigned properties
    const [propRows] = await connection.query('SELECT propertyId FROM employee_properties WHERE employeeId = ?', [session.userId]);
    const assignedPropertyIds = (propRows as any[]).map(r => r.propertyId);

    // Parse to ensure type safety and remove password before returning
    const parsedData = employeeSchema.parse({ ...row, id: String(row.id), permissions, notificationPreferences, assignedPropertyIds });
    return parsedData;
  } catch (error) {
    console.error('Failed to fetch employee from session', error);
    return null;
  }
}


export async function getTenantFromSession(): Promise<Tenant | null> {
  const session = await getSession();
  if (!session || session.role !== 'tenant') return null;

  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM tenants WHERE id = ?', [session.userId]);
    if ((rows as any[]).length === 0) {
      return null;
    }
    const parsedData = tenantSchema.parse({ ...(rows as any)[0], id: String((rows as any)[0].id) });
    return parsedData;
  } catch (error) {
    console.error('Failed to fetch tenant from session', error);
    return null;
  }
}

    
