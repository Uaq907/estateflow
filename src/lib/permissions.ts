

import type { Employee } from './types';

// Define all possible permissions in the application
export const ALL_PERMISSIONS = [
  // Dashboard
  'dashboard:view-overview',
  'dashboard:view-calendar',

  // Employee Management
  'employees:read',
  'employees:create',
  'employees:update',
  'employees:delete',
  'employees:manage-permissions',
  'employees:documents:update',

  // Property Management
  'properties:read',
  'properties:read-all', // General Manager: Can view all properties
  'properties:create',
  'properties:update',
  'properties:delete',
  'properties:documents:update',
  'properties:documents:delete',

  // Tenant Management
  'tenants:read',
  'tenants:create',
  'tenants:update',
  'tenants:delete',
  'tenants:documents:update',

  // Lease Management
  'leases:read',
  'leases:create',
  'leases:update',
  'leases:delete',
  'leases:documents:update',

  // Expense Management
  'expenses:read-all', // See all expenses
  'expenses:read-own', // See only their own expenses
  'expenses:create',
  'expenses:approve', // Approve/reject expenses
  'expenses:update', // General update
  'expenses:delete',
  'expenses:documents:update',

  // Maintenance Management
  'maintenance:read',
  'maintenance:create',
  'maintenance:update',
  'maintenance:delete',
  'maintenance:documents:update',

  // Asset Management
  'assets:read',
  'assets:create',
  'assets:update',
  'assets:delete',
  'assets:documents:update',

  // Cheque Management
  'cheques:read',
  'cheques:create',
  'cheques:update',
  'cheques:delete',
  'cheques:documents:update',

  // Owner Management
  'owners:documents:update',
  
  // Data Management
  'bulk-import:execute',
  'reporting:execute',
  
  // Settings
  'settings:manage',
  'settings:view-logs',
  'settings:manage-notifications',

  // Legal Management
  'legal:eviction:read',
  'legal:eviction:create',
  'legal:eviction:update',
  'legal:eviction:delete',
  'legal:eviction:documents:add',
  'legal:eviction:reports:generate',
  'legal:increase:read',
  'legal:increase:create',
  'legal:increase:update',
  'legal:increase:delete',
  'legal:increase:documents:add',
  'legal:increase:reports:generate',
  'legal:cases:read',
  'legal:cases:create',
  'legal:cases:update',
  'legal:cases:delete',
  'legal:cases:documents:add',
  'legal:cases:reports:generate',
  'legal:cases:hearings:schedule',
  'legal:enforcement:read',
  'legal:enforcement:create',
  'legal:enforcement:update',
  'legal:enforcement:delete',
  'legal:enforcement:documents:add',
  'legal:enforcement:reports:generate',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_GROUPS = {
    "Basic Control": [
        // Dashboard
        'dashboard:view-overview',
        'dashboard:view-calendar',
        // Settings
        'settings:manage',
        'settings:view-logs',
        'settings:manage-notifications',
    ],
    "Employee Management": [
        'employees:read',
        'employees:create',
        'employees:update',
        'employees:delete',
        'employees:manage-permissions',
        'employees:documents:update',
    ],
    "Property Management": [
        'properties:read',
        'properties:read-all',
        'properties:create',
        'properties:update',
        'properties:delete',
        'properties:documents:update',
        'properties:documents:delete',
    ],
    "Tenant Management": [
        'tenants:read',
        'tenants:create',
        'tenants:update',
        'tenants:delete',
        'tenants:documents:update',
    ],
    "Lease Management": [
        'leases:read',
        'leases:create',
        'leases:update',
        'leases:delete',
        'leases:documents:update',
    ],
    "Financial Management": [
        // Expenses
        'expenses:read-all',
        'expenses:read-own',
        'expenses:create',
        'expenses:update',
        'expenses:approve',
        'expenses:delete',
        'expenses:documents:update',
        // Cheques
        'cheques:read',
        'cheques:create',
        'cheques:update',
        'cheques:delete',
        'cheques:documents:update',
    ],
    "Maintenance & Assets": [
        // Maintenance
        'maintenance:read',
        'maintenance:create',
        'maintenance:update',
        'maintenance:delete',
        'maintenance:documents:update',
        // Assets
        'assets:read',
        'assets:create',
        'assets:update',
        'assets:delete',
        'assets:documents:update',
    ],
    "Owner Management": [
        // Documents
        'owners:documents:update',
    ],
    "Legal Management": [
        // Eviction
        'legal:eviction:read',
        'legal:eviction:create',
        'legal:eviction:update',
        'legal:eviction:delete',
        'legal:eviction:documents:add',
        'legal:eviction:reports:generate',
        // Increase
        'legal:increase:read',
        'legal:increase:create',
        'legal:increase:update',
        'legal:increase:delete',
        'legal:increase:documents:add',
        'legal:increase:reports:generate',
        // Cases
        'legal:cases:read',
        'legal:cases:create',
        'legal:cases:update',
        'legal:cases:delete',
        'legal:cases:documents:add',
        'legal:cases:reports:generate',
        'legal:cases:hearings:schedule',
        // Enforcement
        'legal:enforcement:read',
        'legal:enforcement:create',
        'legal:enforcement:update',
        'legal:enforcement:delete',
        'legal:enforcement:documents:add',
        'legal:enforcement:reports:generate',
    ],
    "Data & Reporting": [
        // Bulk Import
        'bulk-import:execute',
        // Reporting
        'reporting:execute',
    ],
};


/**
 * Checks if a given employee has a specific permission.
 * Administrators (by position name) always have all permissions.
 * @param employee The employee object, which must include their permissions array.
 * @param permission The permission string to check for.
 * @returns True if the employee has the permission, false otherwise.
 */
export function hasPermission(
  employee: Employee | null,
  permission: Permission
): boolean {
  if (!employee) {
    return false;
  }

  // Admin users have all permissions implicitly (case-insensitive check)
  if (employee.position?.toLowerCase().includes('administrator')) {
    return true;
  }

  // Check if permissions is an array and includes the permission
  if (Array.isArray(employee.permissions)) {
    return employee.permissions.includes(permission);
  }

  return false;
}

/**
 * Checks if employee is a General Manager (can view all properties)
 */
export function isGeneralManager(employee: Employee | null): boolean {
  if (!employee) return false;
  
  // Admin is always general manager
  if (employee.position?.toLowerCase().includes('administrator')) {
    return true;
  }
  
  // Check if has properties:read-all permission
  return hasPermission(employee, 'properties:read-all');
}

/**
 * Checks if employee is assigned to a specific property
 */
export function isPropertyManager(employee: Employee | null, propertyId: string, assignedPropertyIds: string[]): boolean {
  if (!employee) return false;
  
  // General managers can manage all properties
  if (isGeneralManager(employee)) return true;
  
  // Check if employee is assigned to this property
  return assignedPropertyIds.includes(propertyId);
}

/**
 * Filters properties based on employee's permissions
 * Returns all properties if general manager, otherwise only assigned properties
 */
export function filterPropertiesByEmployee<T extends { id: string }>(
  properties: T[],
  employee: Employee | null,
  assignedPropertyIds: string[]
): T[] {
  if (!employee) return [];
  
  // General managers see all properties
  if (isGeneralManager(employee)) {
    return properties;
  }
  
  // Property managers see only their assigned properties
  return properties.filter(p => assignedPropertyIds.includes(p.id));
}

  
