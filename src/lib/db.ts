

'use server';

import type mysql from 'mysql2/promise';
import { getConnection } from './db-connection';
import type { Employee, Property, Unit, Tenant, Lease, LeaseWithDetails, LeasePayment, PaymentTransaction, Expense, MaintenanceContract, Asset, Payee, Cheque, Bank, Owner, UnitConfiguration, ChequeTransaction, PropertyDocument, CalendarEvent, ActivityLog, PushSubscription, EvictionRequest, PurchaseRequest } from './types';
import { employeeSchema, propertySchema, unitSchema, tenantSchema, leaseSchema, leasePaymentSchema, paymentTransactionSchema, expenseSchema, maintenanceContractSchema, assetSchema, payeeSchema, chequeSchema, bankSchema, ownerSchema, unitConfigurationSchema, chequeTransactionSchema, propertyDocumentSchema, calendarEventSchema, activityLogSchema, pushSubscriptionSchema, evictionRequestSchema, purchaseRequestSchema } from './types';
import bcrypt from 'bcrypt';
import { format } from 'date-fns';
import { randomUUID } from 'crypto';


export async function setupDatabase() {
    // This function is now just a placeholder, as migrations are handled in db-connection.ts
    // It's kept for the login page logic which calls it to initialize the DB.
    await getConnection();
}

// --- Employee Functions ---

export async function getEmployees(): Promise<Employee[]> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM employees ORDER BY name');
    return (rows as any[]).map(row => {
        const permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []);
        const notificationPreferences = typeof row.notificationPreferences === 'string' ? JSON.parse(row.notificationPreferences) : (row.notificationPreferences || {});
        return employeeSchema.parse({ ...row, id: String(row.id), permissions, notificationPreferences });
    });
  } catch (e) {
    console.error("Error in getEmployees", e);
    return [];
  }
}

export async function addEmployee(employee: Omit<Employee, 'id'> & { password?: string }): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const newId = randomUUID();
    
    if (!employee.password) {
        throw new Error("Password is required for new employees.");
    }
    const hashedPassword = await bcrypt.hash(employee.password, 10);

    const data = {
      ...employee,
      password: hashedPassword,
    };
    
    await connection.execute(
      `INSERT INTO employees (id, name, email, password, position, department, startDate, phone, 
        emergencyContact, emiratesId, passportNumber, allowLogin, dateOfBirth, status, nationality, 
        managerId, salary, visaNumber, visaExpiryDate, insuranceNumber, insuranceExpiryDate, 
        telegramBotToken, telegramChannelId, enableEmailAlerts, profilePictureUrl, permissions,
        basicSalary, housingAllowance, transportAllowance, otherAllowance) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, data.name, data.email, data.password, data.position, data.department, data.startDate, 
        data.phone ?? null, data.emergencyContact ?? null, data.emiratesId ?? null, data.passportNumber ?? null, 
        data.allowLogin ?? true, data.dateOfBirth ?? null, data.status ?? 'Active', data.nationality ?? null, 
        data.managerId === 'no-manager' ? null : data.managerId, data.salary ?? null, data.visaNumber ?? null, data.visaExpiryDate ?? null, 
        data.insuranceNumber ?? null, data.insuranceExpiryDate ?? null, data.telegramBotToken ?? null, 
        data.telegramChannelId ?? null, data.enableEmailAlerts ?? false, data.profilePictureUrl ?? null,
        JSON.stringify(data.permissions ?? []),
        data.basicSalary ?? 0, data.housingAllowance ?? 0, data.transportAllowance ?? 0, data.otherAllowance ?? 0
      ]
    );
  } catch (error: any) {
    console.error("Failed to add employee:", error);
    throw new Error(`Database error adding employee: ${error.message}`);
  }
}

export async function updateEmployee(id: string, employee: Partial<Omit<Employee, 'id'>> & { password?: string | null }): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    
    const updateData: {[key: string]: any} = { ...employee };
    delete updateData.id;
    if (updateData.managerId === 'no-manager') updateData.managerId = null;
    
    if (updateData.password && updateData.password.length > 0) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
        delete updateData.password;
    }
    
    if (updateData.permissions) {
        updateData.permissions = JSON.stringify(updateData.permissions);
    }
    
    if (updateData.notificationPreferences) {
        updateData.notificationPreferences = JSON.stringify(updateData.notificationPreferences);
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) return;

    const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
    const query = `UPDATE employees SET ${setClause} WHERE id = ?`;

    await connection.execute(query, [...values, id]);
  } catch (error) {
    console.error('Failed to update employee', error);
    throw error;
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
  } catch (error) {
    console.error('Failed to delete employee', error);
    throw error;
  }
}

// --- Property Functions ---

/**
 * Get all properties, optionally filtered by employeeId
 * If employeeId is provided and employee is not a general manager,
 * only returns properties assigned to that employee
 */
export async function getProperties(employeeId?: string): Promise<Property[]> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    
    let query = `
        SELECT 
            p.*,
            o.name as ownerName,
            (SELECT COUNT(*) FROM units WHERE propertyId = p.id) as totalUnits,
            (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Rented') as occupiedUnits,
            (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Available') as availableUnits,
            (SELECT COUNT(*) FROM leases l JOIN units u ON l.unitId = u.id WHERE u.propertyId = p.id AND l.status = 'Active' AND (l.contractUrl IS NULL OR l.contractUrl = '')) as leasesWithoutContract
        FROM properties p 
        LEFT JOIN owners o ON p.ownerId = o.id
    `;
    
    // Filter by employee if provided
    if (employeeId) {
      query += `
        WHERE EXISTS (
          SELECT 1 FROM employee_properties ep 
          WHERE ep.propertyId = p.id AND ep.employeeId = ?
        )
      `;
    }
    
    query += ` ORDER BY p.name`;
    
    const [rows] = employeeId 
      ? await connection.query(query, [employeeId])
      : await connection.query(query);
      
    return (rows as any[]).map(row => propertySchema.parse({ ...row, id: String(row.id) }));
  } catch(e) {
    console.error("Error in getProperties", e);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<(Property & { owner: Owner | null }) | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
              p.*, 
              p.id as propertyId, 
              p.name as propertyName,
              o.*, 
              o.id as owner_id, 
              o.name as owner_name, 
              o.phone as owner_contact, 
              o.email as owner_email, 
              o.nationality as owner_nationality, 
              o.emiratesId as owner_emiratesId,
              o.emiratesIdUrl as owner_emiratesIdUrl,
              o.taxNumber as owner_taxNumber 
            FROM properties p
            LEFT JOIN owners o ON p.ownerId = o.id
            WHERE p.id = ?
        `, [id]);
        const data = rows as any[];
        if (data.length === 0) return null;
        
        const row = data[0];
        const owner = row.owner_id ? ownerSchema.parse({
            id: String(row.owner_id),
            name: row.owner_name,
            contact: row.owner_contact,
            email: row.owner_email,
            nationality: row.owner_nationality,
            emiratesId: row.owner_emiratesId,
            emiratesIdUrl: row.owner_emiratesIdUrl,
            taxNumber: row.owner_taxNumber,
        }) : null;
        
        const propertyData = {
          ...row,
          id: String(row.propertyId),
          name: row.propertyName
        };

        return { ...propertySchema.parse(propertyData), owner };
    } catch(e) {
        console.error("Error getting property by ID", e);
        return null;
    }
}


export async function addProperty(property: Omit<Property, 'id'>): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const newId = randomUUID();
    await connection.execute(
      `INSERT INTO properties (id, name, type, location, status, price, size, sizeUnit, description, imageUrl, dateListed, purpose, floors, rooms, configuration, latitude, longitude, address, ownerId, managerId, accountNumber) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, 
        property.name ?? null, 
        property.type ?? null, 
        property.location ?? null, 
        property.status ?? null, 
        property.price ?? null,
        property.size ?? null, 
        property.sizeUnit ?? null, 
        property.description ?? null, 
        property.imageUrl ?? null, 
        property.dateListed ?? null,
        property.purpose ?? null, 
        property.floors ?? null, 
        property.rooms ?? null, 
        property.configuration ?? null, 
        property.latitude ?? null, 
        property.longitude ?? null, 
        property.address ?? null,
        property.ownerId === 'no-owner' ? null : (property.ownerId ?? null),
        property.managerId === 'no-manager' ? null : (property.managerId ?? null),
        property.accountNumber ?? null,
      ]
    );
  } catch(e) {
    console.error("Error adding property", e);
    throw e;
  }
}

export async function updateProperty(id: string, property: Omit<Property, 'id'>): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE properties SET name = ?, type = ?, location = ?, status = ?, price = ?, size = ?, sizeUnit = ?, description = ?, imageUrl = ?, dateListed = ?, purpose = ?, floors = ?, rooms = ?, configuration = ?, latitude = ?, longitude = ?, address = ?, ownerId = ?, managerId = ?, accountNumber = ?
       WHERE id = ?`,
      [
        property.name, property.type, property.location, property.status, property.price,
        property.size, property.sizeUnit, property.description, property.imageUrl, property.dateListed,
        property.purpose, property.floors, property.rooms, property.configuration, property.latitude, property.longitude, property.address,
        property.ownerId === 'no-owner' ? null : (property.ownerId ?? null),
        property.managerId === 'no-manager' ? null : property.managerId,
        property.accountNumber,
        id
      ]
    );
  } catch(e) {
    console.error("Error updating property", e);
    throw e;
  }
}

export async function deleteProperty(id: string): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    
    // Check if the property has any occupied units
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as count FROM units WHERE propertyId = ? AND status = 'Rented'`, 
      [id]
    );
    const count = (rows as any)[0].count;

    if (count > 0) {
      throw new Error("Cannot delete property: It has occupied units with active tenants.");
    }

    await connection.beginTransaction();
    // Delete associated units first if they exist
    await connection.execute('DELETE FROM units WHERE propertyId = ?', [id]);
    // Then delete the property
    await connection.execute('DELETE FROM properties WHERE id = ?', [id]);
    await connection.commit();

  } catch(e: any) {
    if (connection) await connection.rollback();
    console.error("Error deleting property", e);
    throw e;
  }
}

// --- Property Document Functions ---

export async function getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM property_documents WHERE propertyId = ? ORDER BY createdAt DESC', [propertyId]);
    return (rows as any[]).map(row => propertyDocumentSchema.parse({ ...row, id: String(row.id) }));
  } catch(e) {
    console.error("Error getting property documents", e);
    return [];
  }
}

export async function addPropertyDocument(doc: Omit<PropertyDocument, 'id' | 'createdAt'>): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    const newId = randomUUID();
    await connection.execute(
      `INSERT INTO property_documents (id, propertyId, documentName, documentUrl) 
       VALUES (?, ?, ?, ?)`,
      [newId, doc.propertyId, doc.documentName, doc.documentUrl]
    );
  } catch(e) {
    console.error("Error adding property document", e);
    throw e;
  }
}

export async function deletePropertyDocument(documentId: string): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    await connection.execute('DELETE FROM property_documents WHERE id = ?', [documentId]);
  } catch(e) {
    console.error("Error deleting property document", e);
    throw e;
  }
}

// --- Unit Functions ---

export async function getUnitsForProperty(propertyId: string): Promise<Unit[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                u.*,
                t.name AS tenantName,
                l.endDate AS leaseEndDate,
                l.id AS activeLeaseId,
                l.businessName,
                l.contractUrl,
                (SELECT dueDate FROM lease_payments WHERE leaseId = l.id AND status != 'Paid' ORDER BY dueDate ASC LIMIT 1) as nextPaymentDueDate,
                (SELECT COUNT(*) > 0 FROM lease_payments WHERE leaseId = l.id AND extensionStatus = 'Pending') as hasPendingExtension
            FROM units u
            LEFT JOIN leases l ON u.id = l.unitId AND l.status = 'Active'
            LEFT JOIN tenants t ON l.tenantId = t.id
            WHERE u.propertyId = ?
            ORDER BY u.unitNumber, u.unitNumber
        `, [propertyId]);
        return (rows as any[]).map(row => unitSchema.parse({ ...row, id: String(row.id), hasPendingExtension: Boolean(row.hasPendingExtension) }));
    } catch(e) {
        console.error("Error getting units for property", e);
        return [];
    }
}

export async function getUnits(): Promise<Unit[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                u.*,
                t.name AS tenantName,
                l.endDate AS leaseEndDate,
                l.id AS activeLeaseId,
                l.businessName,
                l.contractUrl,
                (SELECT dueDate FROM lease_payments WHERE leaseId = l.id AND status != 'Paid' ORDER BY dueDate ASC LIMIT 1) as nextPaymentDueDate,
                (SELECT COUNT(*) > 0 FROM lease_payments WHERE leaseId = l.id AND extensionStatus = 'Pending') as hasPendingExtension
            FROM units u
            LEFT JOIN leases l ON u.id = l.unitId AND l.status = 'Active'
            LEFT JOIN tenants t ON l.tenantId = t.id
            ORDER BY u.unitNumber, u.unitNumber
        `);
        return (rows as any[]).map(row => unitSchema.parse({ ...row, id: String(row.id), hasPendingExtension: Boolean(row.hasPendingExtension) }));
    } catch(e) {
        console.error("Error getting units", e);
        return [];
    }
}

export async function addUnit(unit: Omit<Unit, 'id'>): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        const floor = unit.floor ?? null;

        // Check for duplicates before inserting. Use NULL-safe operator for floor.
        const [rows] = await connection.execute(
            'SELECT id FROM units WHERE propertyId = ? AND unitNumber = ? AND floor <=> ?',
            [unit.propertyId, unit.unitNumber, floor]
        );

        if ((rows as any[]).length > 0) {
            return { success: false, message: `A unit with number "${unit.unitNumber}" already exists on floor ${floor ?? 'N/A'}.` };
        }
        
        await connection.execute(
            `INSERT INTO units (id, propertyId, unitNumber, type, status, size, sizeUnit, price, description, floor, accountNumber, configuration) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, 
                unit.propertyId, 
                unit.unitNumber, 
                unit.type, 
                unit.status, 
                unit.size ?? null, 
                unit.sizeUnit ?? null, 
                unit.price ?? null, 
                unit.description ?? null, 
                floor, 
                unit.accountNumber ?? null, 
                unit.configuration ?? null
            ]
        );
        return { success: true, message: 'Unit added successfully.' };
    } catch(e: any) {
        console.error("Error adding unit", e);
        return { success: false, message: `Database error adding unit: ${e.message}` };
    }
}

export async function updateUnit(id: string, unit: Partial<Omit<Unit, 'id'>>): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        const currentUnitResult = await connection.execute('SELECT * FROM units WHERE id = ?', [id]);
        const currentUnit = (currentUnitResult[0] as any[])[0];

        if (!currentUnit) {
            return { success: false, message: "Unit not found." };
        }
        
        // If the unit number or floor is being updated, check for duplicates
        if (unit.unitNumber !== undefined || unit.floor !== undefined) {
            const unitNumberToCheck = unit.unitNumber !== undefined ? unit.unitNumber : currentUnit.unitNumber;
            const floorToCheck = unit.floor !== undefined ? unit.floor : currentUnit.floor;

            const [rows] = await connection.execute(
                'SELECT id FROM units WHERE propertyId = ? AND unitNumber = ? AND floor <=> ? AND id != ?',
                [currentUnit.propertyId, unitNumberToCheck, floorToCheck, id]
            );

            if ((rows as any[]).length > 0) {
                return { success: false, message: `Another unit with number "${unitNumberToCheck}" already exists on floor ${floorToCheck ?? 'N/A'}.` };
            }
        }
        
        // Build the update query dynamically
        const fieldsToUpdate = Object.keys(unit).filter(key => key !== 'id' && key !== 'propertyId' && (unit as any)[key] !== undefined);
        if (fieldsToUpdate.length === 0) {
            return { success: true, message: 'No changes to update.' };
        }

        const setClause = fieldsToUpdate.map(field => `\`${field}\` = ?`).join(', ');
        const values = fieldsToUpdate.map(field => (unit as any)[field] ?? null);

        const query = `UPDATE units SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
        return { success: true, message: 'Unit updated successfully.' };
    } catch(e: any) {
        console.error("Error updating unit", e);
        return { success: false, message: `Database error updating unit: ${e.message}` };
    }
}

export async function deleteUnit(id: string): Promise<{ success: boolean; message: string }> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();

        const [rows] = await connection.execute('SELECT id FROM leases WHERE unitId = ?', [id]);
        if ((rows as any[]).length > 0) {
            return { success: false, message: 'This unit cannot be deleted because it has existing lease records. Please remove the tenant from the unit first.' };
        }

        await connection.execute('DELETE FROM units WHERE id = ?', [id]);
        return { success: true, message: 'Unit deleted successfully.' };
    } catch (e: any) {
        console.error("Error deleting unit", e);
        return { success: false, message: `An unexpected database error occurred: ${e.message}` };
    }
}


// --- Tenant and Lease Functions ---

/**
 * Get all tenants, optionally filtered by employeeId (property manager)
 * If employeeId is provided, only returns tenants in properties assigned to that employee
 */
export async function getTenants(employeeId?: string): Promise<Tenant[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        let query = 'SELECT DISTINCT t.* FROM tenants t';
        
        // Filter by employee's assigned properties if provided
        if (employeeId) {
          query += `
            WHERE EXISTS (
              SELECT 1 FROM leases l
              JOIN units u ON l.unitId = u.id
              JOIN employee_properties ep ON u.propertyId = ep.propertyId
              WHERE l.tenantId = t.id AND ep.employeeId = ?
            )
          `;
        }
        
        query += ' ORDER BY t.name';
        
        const [rows] = employeeId 
          ? await connection.query(query, [employeeId])
          : await connection.query(query);
          
        return (rows as any[]).map(row => tenantSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting tenants", e);
        return [];
    }
}

export async function getTenantById(id: string): Promise<Tenant | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM tenants WHERE id = ?', [id]);
        const data = rows as any[];
        if (data.length === 0) return null;
        return tenantSchema.parse({ ...data[0], id: String(data[0].id) });
    } catch(e) {
        console.error("Error getting tenant by ID", e);
        return null;
    }
}


export async function addTenant(tenant: Omit<Tenant, 'id'> & { password?: string }): Promise<{success: boolean, message: string, id?: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        
        let hashedPassword = null;
        if (tenant.password) {
            hashedPassword = await bcrypt.hash(tenant.password, 10);
        }

        await connection.execute(
            'INSERT INTO tenants (id, name, email, password, phone, idNumber, idType, nationality, idDocumentUrl, allowLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newId, tenant.name, tenant.email, hashedPassword, tenant.phone ?? null, tenant.idNumber ?? null, tenant.idType ?? null, tenant.nationality ?? null, tenant.idDocumentUrl ?? null, tenant.allowLogin ?? false]
        );
        return { success: true, message: 'Tenant added successfully.', id: newId };
    } catch(e: any) {
        console.error("Error adding tenant", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function updateTenant(id: string, tenant: Partial<Omit<Tenant, 'id'>> & { password?: string | null }): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();

        const fieldsToUpdate: { [key: string]: any } = {};

        // Dynamically build the update object
        if (tenant.name !== undefined) fieldsToUpdate.name = tenant.name;
        if (tenant.email !== undefined) fieldsToUpdate.email = tenant.email;
        if (tenant.phone !== undefined) fieldsToUpdate.phone = tenant.phone ?? null;
        if (tenant.idNumber !== undefined) fieldsToUpdate.idNumber = tenant.idNumber ?? null;
        if (tenant.idType !== undefined) fieldsToUpdate.idType = tenant.idType ?? null;
        if (tenant.nationality !== undefined) fieldsToUpdate.nationality = tenant.nationality ?? null;
        if (tenant.idDocumentUrl !== undefined) fieldsToUpdate.idDocumentUrl = tenant.idDocumentUrl ?? null;
        if (tenant.allowLogin !== undefined) fieldsToUpdate.allowLogin = tenant.allowLogin;

        if (tenant.password) {
            fieldsToUpdate.password = await bcrypt.hash(tenant.password, 10);
        }

        const fieldNames = Object.keys(fieldsToUpdate);
        if (fieldNames.length === 0) {
          return { success: true, message: "No changes to update." };
        }

        const setClause = fieldNames.map(field => `\`${field}\` = ?`).join(', ');
        const params = [...Object.values(fieldsToUpdate), id];

        const query = `UPDATE tenants SET ${setClause} WHERE id = ?`;

        await connection.execute(query, params);
        return { success: true, message: "Tenant updated successfully." };

    } catch(e: any) {
        console.error("Error updating tenant", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function deleteTenant(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        // In a real app, you might want to check for active leases before deleting.
        await connection.execute('DELETE FROM tenants WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting tenant", e);
        throw e;
    }
}

export async function assignTenantToUnit(unitId: string, tenantId: string, leaseDetails: Omit<Lease, 'id' | 'unitId' | 'tenantId'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // Update the unit's status to 'Rented'
        await connection.execute('UPDATE units SET status = ? WHERE id = ?', ['Rented', unitId]);

        // Deactivate any existing active leases for this unit
        await connection.execute("UPDATE leases SET status = 'Completed' WHERE unitId = ? AND status = 'Active'", [unitId]);
        
        // Create the new lease
        const newLeaseId = randomUUID();
        await connection.execute(
            `INSERT INTO leases (
                id, unitId, tenantId, startDate, endDate, status,
                tenantSince, totalLeaseAmount, taxedAmount, rentPaymentAmount, numberOfPayments,
                renewalIncreasePercentage, contractUrl, guaranteeChequeAmount, guaranteeChequeUrl,
                businessName, businessType, tradeLicenseNumber, tradeLicenseUrl
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newLeaseId, unitId, tenantId, leaseDetails.startDate, leaseDetails.endDate,
                'Active', // New lease is always active
                leaseDetails.tenantSince ?? null, 
                leaseDetails.totalLeaseAmount ?? null, 
                leaseDetails.taxedAmount ?? null, 
                leaseDetails.rentPaymentAmount ?? null,
                leaseDetails.numberOfPayments ?? null, 
                leaseDetails.renewalIncreasePercentage ?? null, 
                leaseDetails.contractUrl ?? null,
                leaseDetails.guaranteeChequeAmount ?? null, 
                leaseDetails.guaranteeChequeUrl ?? null,
                leaseDetails.businessName ?? null, 
                leaseDetails.businessType ?? null, 
                leaseDetails.tradeLicenseNumber ?? null, 
                leaseDetails.tradeLicenseUrl ?? null
            ]
        );

        await connection.commit();
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Failed to assign tenant to unit:', error);
        throw error;
    }
}

export async function removeTenantFromUnit(unitId: string, leaseId: string): Promise<void> {
     let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // Deactivate the lease by setting its status
        await connection.execute("UPDATE leases SET status = 'Completed' WHERE id = ?", [leaseId]);

        // Update the unit's status back to 'Available'
        await connection.execute('UPDATE units SET status = ? WHERE id = ?', ['Available', unitId]);

        await connection.commit();
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Failed to remove tenant from unit:', error);
        throw error;
    }
}

export async function getLeases(): Promise<Lease[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM leases');
        return (rows as any[]).map(row => leaseSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting leases", e);
        return [];
    }
}

export async function getLeasesWithDetails(): Promise<LeaseWithDetails[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                l.*,
                t.id as tenantId, t.name as tenantName, t.email as tenantEmail, t.phone as tenantPhone, t.allowLogin as tenantAllowLogin, t.idDocumentUrl as tenantIdDocumentUrl,
                u.unitNumber as unitNumber, u.type as unitType, u.id as unitId,
                p.name as propertyName, p.id as propertyId,
                (SELECT SUM(pt.amountPaid) FROM payment_transactions pt LEFT JOIN lease_payments lp ON pt.leasePaymentId = lp.id WHERE lp.leaseId = l.id) as totalPaidAmount,
                (SELECT COUNT(*) FROM lease_payments lp WHERE lp.leaseId = l.id) as paymentsCount
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            ORDER BY 
                CASE 
                    WHEN l.status = 'Expired' OR l.endDate < NOW() THEN 0 
                    ELSE 1 
                END,
                CASE 
                    WHEN l.status = 'Expired' OR l.endDate < NOW() THEN l.endDate 
                    ELSE l.startDate 
                END ASC
        `);
        
        const leases: LeaseWithDetails[] = (rows as any[]).map(row => {
            const leaseData = { 
                ...row, 
                id: String(row.id), 
                missingAttachmentsCount: null, // This will be calculated on the client
                paymentsCount: row.paymentsCount,
            };
            return {
                lease: leaseSchema.parse(leaseData),
                tenant: tenantSchema.parse({
                    id: String(row.tenantId),
                    name: row.tenantName,
                    email: row.tenantEmail,
                    phone: row.tenantPhone,
                    allowLogin: row.tenantAllowLogin,
                    idDocumentUrl: row.tenantIdDocumentUrl,
                }),
                unit: unitSchema.parse({
                    id: String(row.unitId),
                    propertyId: String(row.propertyId),
                    unitNumber: row.unitNumber,
                    type: row.unitType,
                    status: 'Unknown',
                }),
                property: propertySchema.parse({
                    id: String(row.propertyId),
                    name: row.propertyName,
                    type: 'Unknown',
                }),
            };
        });
        return leases;
    } catch(e) {
        console.error("Error getting leases with details", e);
        return [];
    }
}


export async function getLeasesForTenant(tenantId: string): Promise<LeaseWithDetails[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                l.*,
                t.id as tenantId, t.name as tenantName, t.email as tenantEmail, t.phone as tenantPhone, t.allowLogin as tenantAllowLogin,
                u.unitNumber as unitNumber, u.type as unitType, u.id as unitId,
                p.name as propertyName, p.id as propertyId,
                (SELECT SUM(pt.amountPaid) FROM payment_transactions pt LEFT JOIN lease_payments lp ON pt.leasePaymentId = lp.id WHERE lp.leaseId = l.id) as totalPaidAmount
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            WHERE l.tenantId = ?
            ORDER BY 
                CASE 
                    WHEN l.status = 'Expired' OR l.endDate < NOW() THEN 0 
                    ELSE 1 
                END,
                CASE 
                    WHEN l.status = 'Expired' OR l.endDate < NOW() THEN l.endDate 
                    ELSE l.startDate 
                END ASC
        `, [tenantId]);
        
        const leases: LeaseWithDetails[] = (rows as any[]).map(row => {
            const leaseData = { ...row, id: String(row.id) };
            return {
                lease: leaseSchema.parse(leaseData),
                tenant: tenantSchema.parse({
                    id: String(row.tenantId),
                    name: row.tenantName,
                    email: row.tenantEmail,
                    phone: row.tenantPhone,
                    allowLogin: row.tenantAllowLogin
                }),
                unit: unitSchema.parse({
                    id: String(row.unitId),
                    propertyId: String(row.propertyId),
                    unitNumber: row.unitNumber,
                    type: row.unitType,
                    status: 'Unknown',
                }),
                property: propertySchema.parse({
                    id: String(row.propertyId),
                    name: row.propertyName,
                    type: 'Unknown',
                }),
            };
        });
        return leases;
    } catch(e) {
        console.error("Error getting leases for tenant", e);
        return [];
    }
}

export async function updateLease(id: string, leaseData: Partial<Omit<Lease, 'id' | 'unitId' | 'tenantId'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(leaseData);
        const values = Object.values(leaseData);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE leases SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating lease", e);
        throw e;
    }
}


export async function getLeaseWithDetails(leaseId: string): Promise<LeaseWithDetails | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                l.*,
                t.id as tenantId, t.name as tenantName, t.email as tenantEmail, t.phone as tenantPhone, t.allowLogin as tenantAllowLogin,
                u.unitNumber as unitNumber, u.type as unitType, u.id as unitId,
                p.name as propertyName, p.id as propertyId,
                (SELECT SUM(pt.amountPaid) FROM payment_transactions pt LEFT JOIN lease_payments lp ON pt.leasePaymentId = lp.id WHERE lp.leaseId = l.id) as totalPaidAmount
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            WHERE l.id = ?
        `, [leaseId]);
        
        const data = rows as any[];
        if (data.length === 0) return null;
        const row = data[0];
        
        const leaseData = {
            ...row,
            id: String(row.id)
        };

        return {
            lease: leaseSchema.parse(leaseData),
            tenant: tenantSchema.parse({
                id: String(row.tenantId),
                name: row.tenantName,
                email: row.tenantEmail,
                phone: row.tenantPhone,
                allowLogin: row.tenantAllowLogin
            }),
            unit: unitSchema.parse({
                id: String(row.unitId),
                propertyId: String(row.propertyId),
                unitNumber: row.unitNumber,
                type: row.unitType,
                status: 'Unknown', // Not fetched, can be added if needed
            }),
            property: propertySchema.parse({
                id: String(row.propertyId),
                name: row.propertyName,
                type: 'Unknown', // Not fetched, can be added if needed
            }),
        };

    } catch(e) {
        console.error("Error getting lease with details", e);
        return null;
    }
}

export async function getActiveLeaseForTenant(tenantId: string): Promise<Lease | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query("SELECT * FROM leases WHERE tenantId = ? AND status = 'Active'", [tenantId]);
        const data = rows as any[];
        if (data.length === 0) return null;
        return leaseSchema.parse({ ...data[0], id: String(data[0].id) });
    } catch(e) {
        console.error("Error getting active lease for tenant", e);
        return null;
    }
}


export async function getLeasePayments(leaseId: string): Promise<LeasePayment[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [paymentRows] = await connection.query('SELECT * FROM lease_payments WHERE leaseId = ? ORDER BY dueDate ASC', [leaseId]);
        const payments = (paymentRows as any[]).map(row => leasePaymentSchema.parse({ ...row, id: String(row.id), transactions: [] }));
        
        if (payments.length > 0) {
            const paymentIds = payments.map(p => p.id);
            const [transactionRows] = await connection.query('SELECT * FROM payment_transactions WHERE leasePaymentId IN (?) ORDER BY paymentDate ASC', [paymentIds]);
            const transactions = (transactionRows as any[]).map(row => paymentTransactionSchema.parse({ ...row, id: String(row.id) }));

            for (const payment of payments) {
                payment.transactions = transactions.filter(t => t.leasePaymentId === payment.id);
            }
        }
        
        return payments;
    } catch(e) {
        console.error("Error getting lease payments", e);
        return [];
    }
}

export async function getPaymentsForTenant(tenantId: string): Promise<LeasePayment[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                lp.*,
                p.name AS propertyName,
                u.unitNumber
            FROM lease_payments lp
            LEFT JOIN leases l ON lp.leaseId = l.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            WHERE l.tenantId = ?
            ORDER BY lp.dueDate DESC
        `, [tenantId]);
        
        const payments = (rows as any[]).map(row => leasePaymentSchema.parse({ ...row, id: String(row.id), transactions: [] }));
        
        if (payments.length > 0) {
            const paymentIds = payments.map(p => p.id);
            const [transactionRows] = await connection.query('SELECT * FROM payment_transactions WHERE leasePaymentId IN (?) ORDER BY paymentDate ASC', [paymentIds]);
            const transactions = (transactionRows as any[]).map(row => paymentTransactionSchema.parse({ ...row, id: String(row.id) }));

            for (const payment of payments) {
                payment.transactions = transactions.filter(t => t.leasePaymentId === payment.id);
            }
        }
        
        return payments;
    } catch(e) {
        console.error("Error getting payments for tenant", e);
        return [];
    }
}


/**
 * Get all lease payments with details, optionally filtered by employeeId
 * If employeeId is provided, only returns payments for properties assigned to that employee
 */
export async function getAllLeasePaymentsWithDetails(employeeId?: string): Promise<LeasePayment[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT 
                lp.*,
                p.name AS propertyName,
                u.unitNumber,
                t.name as tenantName
            FROM lease_payments lp
            JOIN leases l ON lp.leaseId = l.id
            JOIN units u ON l.unitId = u.id
            JOIN properties p ON u.propertyId = p.id
            JOIN tenants t ON l.tenantId = t.id
        `;
        
        // Filter by employee's assigned properties if provided
        if (employeeId) {
          query += `
            WHERE EXISTS (
              SELECT 1 FROM employee_properties ep 
              WHERE ep.propertyId = p.id AND ep.employeeId = ?
            )
          `;
        }
        
        query += ' ORDER BY lp.dueDate DESC';
        
        const [rows] = employeeId
          ? await connection.query(query, [employeeId])
          : await connection.query(query);
        
        const payments = (rows as any[]).map(row => leasePaymentSchema.parse({ ...row, id: String(row.id), transactions: [] }));
        
        if (payments.length > 0) {
            const paymentIds = payments.map(p => p.id);
            const [transactionRows] = await connection.query('SELECT * FROM payment_transactions WHERE leasePaymentId IN (?) ORDER BY paymentDate ASC', [paymentIds]);
            const transactions = (transactionRows as any[]).map(row => paymentTransactionSchema.parse({ ...row, id: String(row.id) }));

            for (const payment of payments) {
                payment.transactions = transactions.filter(t => t.leasePaymentId === payment.id);
            }
        }
        
        return payments;
    } catch(e) {
        console.error("Error getting all lease payments", e);
        return [];
    }
}


export async function getLeasePaymentById(paymentId: string): Promise<LeasePayment | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [paymentRows] = await connection.query('SELECT * FROM lease_payments WHERE id = ?', [paymentId]);
        const paymentsData = paymentRows as any[];
        if (paymentsData.length === 0) return null;

        const payment = leasePaymentSchema.parse({ ...paymentsData[0], id: String(paymentsData[0].id), transactions: [] });

        const [transactionRows] = await connection.query('SELECT * FROM payment_transactions WHERE leasePaymentId = ? ORDER BY paymentDate ASC', [payment.id]);
        payment.transactions = (transactionRows as any[]).map(row => paymentTransactionSchema.parse({ ...row, id: String(row.id) }));

        return payment;
    } catch(e) {
        console.error("Error getting lease payment by ID", e);
        return null;
    }
}


export async function addLeasePayment(payment: Omit<LeasePayment, 'id' | 'transactions'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO lease_payments (id, leaseId, dueDate, amount, status, chequeNumber, chequeImageUrl, description, paymentMethod)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
             [
                newId, 
                payment.leaseId, 
                payment.dueDate, 
                payment.amount, 
                payment.status, 
                payment.chequeNumber || null, 
                payment.chequeImageUrl || null, 
                payment.description || null, 
                payment.paymentMethod || null
            ]
        );
    } catch(e) {
        console.error("Error adding lease payment", e);
        throw e;
    }
}

export async function updateLeasePayment(id: string, payment: Partial<Omit<LeasePayment, 'id' | 'leaseId' | 'transactions'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(payment);
        const values = Object.values(payment);
        if (fields.length === 0) return;
        
        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE lease_payments SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating lease payment", e);
        throw e;
    }
}

export async function deleteLeasePayment(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM lease_payments WHERE id = ?', [id]);
    } catch (e) {
        console.error("Error deleting lease payment", e);
        throw e;
    }
}

export async function requestPaymentExtension(paymentId: string, requestedDueDate: Date, reason: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            `UPDATE lease_payments 
             SET extensionRequested = TRUE, extensionStatus = 'Pending', requestedDueDate = ?, extensionReason = ? 
             WHERE id = ?`,
            [requestedDueDate, reason, paymentId]
        );
    } catch(e) {
        console.error("Error requesting payment extension", e);
        throw e;
    }
}

export async function reviewPaymentExtension(paymentId: string, approved: boolean, managerNotes: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const status = approved ? 'Approved' : 'Rejected';
        
        let query = `UPDATE lease_payments SET extensionStatus = ?, managerNotes = ?`;
        const params: any[] = [status, managerNotes];
        
        // If approved, also update the main due date
        if (approved) {
            query += ', dueDate = requestedDueDate';
        }
        
        query += ' WHERE id = ?';
        params.push(paymentId);
        
        await connection.execute(query, params);
    } catch(e) {
        console.error("Error reviewing payment extension", e);
        throw e;
    }
}

export async function addPaymentTransaction(transaction: Omit<PaymentTransaction, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO payment_transactions (id, leasePaymentId, amountPaid, paymentDate, paymentMethod, notes, documentUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, 
                transaction.leasePaymentId, 
                transaction.amountPaid, 
                transaction.paymentDate, 
                transaction.paymentMethod || null, 
                transaction.notes || null, 
                transaction.documentUrl || null
            ]
        );
    } catch(e) {
        console.error("Error adding payment transaction", e);
        throw e;
    }
}

export async function updatePaymentTransaction(id: string, transaction: Partial<Omit<PaymentTransaction, 'id' | 'leasePaymentId'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(transaction);
        const values = Object.values(transaction);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE payment_transactions SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating payment transaction", e);
        throw e;
    }
}

export async function deletePaymentTransaction(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM payment_transactions WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting payment transaction", e);
        throw e;
    }
}

// --- Employee-Property Linking Functions ---

export async function assignEmployeeToProperty(employeeId: string, propertyId: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            'INSERT INTO employee_properties (employeeId, propertyId) VALUES (?, ?)',
            [employeeId, propertyId]
        );
    } catch(e) {
        console.error("Error assigning employee to property", e);
        throw e;
    }
}

export async function removeEmployeeFromProperty(employeeId: string, propertyId: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [employeeId, propertyId]
        );
    } catch(e) {
        console.error("Error removing employee from property", e);
        throw e;
    }
}

export async function getEmployeesForProperty(propertyId: string): Promise<Employee[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT e.* FROM employees e
            JOIN employee_properties ep ON e.id = ep.employeeId
            WHERE ep.propertyId = ?
            ORDER BY e.name
        `, [propertyId]);
        return (rows as any[]).map(row => {
            const permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
            return employeeSchema.parse({ ...row, id: String(row.id), permissions });
        });
    } catch(e) {
        console.error("Error getting employees for property", e);
        return [];
    }
}

export async function getPropertiesForEmployee(employeeId: string): Promise<Property[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                p.*,
                o.name as ownerName,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id) as totalUnits,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Rented') as occupiedUnits,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Available') as availableUnits,
                (SELECT COUNT(*) FROM leases l JOIN units u ON l.unitId = u.id WHERE u.propertyId = p.id AND l.status = 'Active' AND (l.contractUrl IS NULL OR l.contractUrl = '')) as leasesWithoutContract
            FROM properties p
            JOIN employee_properties ep ON p.id = ep.propertyId
            LEFT JOIN owners o ON p.ownerId = o.id
            WHERE ep.employeeId = ?
            ORDER BY p.name
        `, [employeeId]);
        return (rows as any[]).map(row => propertySchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting properties for employee", e);
        return [];
    }
}

/**
 * Get only property IDs assigned to an employee (lighter than getPropertiesForEmployee)
 * Used for filtering other entities by property
 */
export async function getPropertyIdsForEmployee(employeeId: string): Promise<string[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT propertyId FROM employee_properties WHERE employeeId = ?
        `, [employeeId]);
        return (rows as any[]).map(row => row.propertyId);
    } catch(e) {
        console.error("Error getting property IDs for employee", e);
        return [];
    }
}


// --- Expense Functions ---

export async function getExpenses({ employeeId }: { employeeId?: string } = {}): Promise<Expense[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT 
                ex.*,
                p.name as propertyName,
                u.unitNumber as unitNumber,
                emp.name as employeeName,
                mgr.name as managerName
            FROM expenses ex
            LEFT JOIN properties p ON ex.propertyId = p.id
            LEFT JOIN units u ON ex.unitId = u.id
            LEFT JOIN employees emp ON ex.employeeId = emp.id
            LEFT JOIN employees mgr ON ex.managerId = mgr.id
        `;
        const params: string[] = [];

        if (employeeId) {
            query += ` WHERE ex.employeeId = ?`;
            params.push(employeeId);
        }

        query += ` ORDER BY ex.createdAt DESC`;
        
        const [rows] = await connection.query(query, params);
        return (rows as any[]).map(row => expenseSchema.parse({ 
            ...row, 
            id: String(row.id),
        }));
    } catch(e) {
        console.error("Error getting expenses", e);
        return [];
    }
}

export async function getExpenseHistory(expenseId: string): Promise<any[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        const [rows] = await connection.query(
            `SELECT * FROM expense_history 
             WHERE expenseId = ? 
             ORDER BY createdAt DESC`,
            [expenseId]
        );
        
        return rows as any[];
    } catch (e) {
        console.error("Error getting expense history", e);
        return [];
    }
}

export async function addExpenseHistory(historyData: {
    expenseId: string;
    action: string;
    performedBy: string;
    performedByName?: string;
    notes?: string;
    previousStatus?: string;
    newStatus?: string;
}): Promise<{id: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        
        await connection.execute(
            `INSERT INTO expense_history 
            (id, expenseId, action, performedBy, performedByName, notes, previousStatus, newStatus, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                newId,
                historyData.expenseId,
                historyData.action,
                historyData.performedBy,
                historyData.performedByName || null,
                historyData.notes || null,
                historyData.previousStatus || null,
                historyData.newStatus || null
            ]
        );
        
        return { id: newId };
    } catch (e) {
        console.error("Error adding expense history", e);
        throw e;
    }
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<{id: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        const unitId = expense.unitId === 'property-wide' ? null : expense.unitId;
        await connection.execute(
            `INSERT INTO expenses (id, propertyId, unitId, employeeId, managerId, amount, category, description, status, taxNumber, isVat, baseAmount, taxAmount, supplier, isRecurring, recurrenceType, recurrenceEndDate, receiptUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId,
                expense.propertyId ?? null,
                unitId ?? null,
                expense.employeeId ?? null,
                expense.managerId ?? null,
                expense.amount ?? null,
                expense.category ?? null,
                expense.description ?? null,
                expense.status ?? 'Pending',
                expense.taxNumber ?? null,
                expense.isVat ?? false,
                expense.baseAmount ?? null,
                expense.taxAmount ?? null,
                expense.supplier ?? null,
                expense.isRecurring ?? false,
                expense.recurrenceType ?? null,
                expense.recurrenceEndDate ?? null,
                expense.receiptUrl ?? null
            ]
        );
        return { id: newId };
    } catch(e) {
        console.error("Error adding expense", e);
        throw e;
    }
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        const updateData = { ...expense };
        if (updateData.unitId === 'property-wide') {
            updateData.unitId = null;
        }

        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        
        if (fields.length === 0) return;

        // Ensure updatedAt is always updated
        fields.push('updatedAt');
        values.push(new Date());

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE expenses SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating expense", e);
        throw e;
    }
}

export async function deleteExpense(id: string): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    await connection.execute('DELETE FROM expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Failed to delete expense', error);
    throw error;
  }
}

// --- Maintenance Contract Functions ---

export async function getMaintenanceContracts(): Promise<MaintenanceContract[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT mc.*, p.name AS propertyName 
            FROM maintenance_contracts mc
            LEFT JOIN properties p ON mc.propertyId = p.id
            ORDER BY mc.nextDueDate ASC
        `);
        return (rows as any[]).map(row => maintenanceContractSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting maintenance contracts", e);
        return [];
    }
}

export async function addMaintenanceContract(contract: Omit<MaintenanceContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO maintenance_contracts (id, propertyId, serviceType, vendorName, startDate, endDate, contractAmount, paymentSchedule, nextDueDate, contractUrl, notes, isVat, baseAmount, taxAmount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, 
                contract.propertyId, 
                contract.serviceType,                 contract.vendorName, 
                contract.startDate, 
                contract.endDate, 
                contract.contractAmount, 
                contract.paymentSchedule, 
                contract.nextDueDate ?? null,
                contract.contractUrl ?? null, 
                contract.notes ?? null,
                contract.isVat ?? false,
                contract.baseAmount ?? null,
                contract.taxAmount ?? null
            ]
        );
    } catch(e) {
        console.error("Error adding maintenance contract", e);
        throw e;
    }
}

export async function updateMaintenanceContract(id: string, contract: Partial<Omit<MaintenanceContract, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(contract);
        const values = Object.values(contract);
        if (fields.length === 0) return;

        fields.push('updatedAt');
        values.push(new Date());

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE maintenance_contracts SET ${setClause} WHERE id = ?`;
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating maintenance contract", e);
        throw e;
    }
}

export async function deleteMaintenanceContract(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM maintenance_contracts WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting maintenance contract", e);
        throw e;
    }
}


// --- Asset Functions ---

export async function getAssets(): Promise<Asset[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT a.*, p.name as propertyName, u.unitNumber as unitNumber
            FROM assets a
            LEFT JOIN properties p ON a.propertyId = p.id
            LEFT JOIN units u ON a.unitId = u.id
            ORDER BY a.createdAt DESC
        `);
        return (rows as any[]).map(row => assetSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting assets", e);
        return [];
    }
}

export async function addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        const unitId = asset.unitId === 'property-wide' ? null : asset.unitId;
        await connection.execute(
            `INSERT INTO assets (id, propertyId, unitId, name, category, manufacturer, modelNumber, serialNumber, status, purchaseDate, purchasePrice, warrantyExpiryDate, locationInProperty, notes, invoiceUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, asset.propertyId, unitId, asset.name, asset.category ?? null, asset.manufacturer ?? null, asset.modelNumber ?? null, asset.serialNumber ?? null,
                asset.status, asset.purchaseDate, asset.purchasePrice ?? null, asset.warrantyExpiryDate, asset.locationInProperty ?? null,
                asset.notes ?? null, asset.invoiceUrl ?? null
            ]
        );
    } catch(e) {
        console.error("Error adding asset", e);
        throw e;
    }
}

export async function updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        const updateData = { ...asset };
        if (updateData.unitId === 'property-wide') {
            updateData.unitId = null;
        }

        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        
        if (fields.length === 0) return;

        fields.push('updatedAt');
        values.push(new Date());

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE assets SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating asset", e);
        throw e;
    }
}


export async function deleteAsset(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM assets WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting asset", e);
        throw e;
    }
}

// --- Payee Functions ---

export async function getPayees(): Promise<Payee[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM payees ORDER BY name ASC');
        return (rows as any[]).map(row => payeeSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting payees", e);
        return [];
    }
}

export async function addPayee(payee: Omit<Payee, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            'INSERT INTO payees (id, name, contactPerson, contactEmail, notes) VALUES (?, ?, ?, ?, ?)',
            [newId, payee.name, payee.contactPerson, payee.contactEmail, payee.notes]
        );
    } catch(e) {
        console.error("Error adding payee", e);
        throw e;
    }
}

export async function updatePayee(id: string, payee: Omit<Payee, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            'UPDATE payees SET name = ?, contactPerson = ?, contactEmail = ?, notes = ? WHERE id = ?',
            [payee.name, payee.contactPerson, payee.contactEmail, payee.notes, id]
        );
    } catch(e) {
        console.error("Error updating payee", e);
        throw e;
    }
}

export async function deletePayee(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM payees WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting payee", e);
        throw e;
    }
}

// --- Bank Functions ---

export async function getBanks(): Promise<Bank[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM banks ORDER BY name ASC');
        return (rows as any[]).map(row => bankSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting banks", e);
        return [];
    }
}

export async function addBank(bank: Omit<Bank, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            'INSERT INTO banks (id, name, branch, accountNumber, notes) VALUES (?, ?, ?, ?, ?)',
            [newId, bank.name, bank.branch, bank.accountNumber, bank.notes]
        );
    } catch(e) {
        console.error("Error adding bank", e);
        throw e;
    }
}

export async function updateBank(id: string, bank: Omit<Bank, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            'UPDATE banks SET name = ?, branch = ?, accountNumber = ?, notes = ? WHERE id = ?',
            [bank.name, bank.branch, bank.accountNumber, bank.notes, id]
        );
    } catch(e) {
        console.error("Error updating bank", e);
        throw e;
    }
}

export async function deleteBank(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM banks WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting bank", e);
        throw e;
    }
}


// --- Cheque Functions ---

/**
 * Get cheques, optionally filtered by createdById or employeeId (property manager)
 * If employeeId is provided, only returns cheques for tenants in properties assigned to that employee
 */
export async function getCheques({ createdById, employeeId }: { createdById?: string, employeeId?: string } = {}): Promise<Cheque[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        let query = `
            SELECT 
                c.*,
                p.name as savedPayeeName,
                t.name as tenantName,
                b.name as bankName,
                emp.name as createdByName,
                (SELECT SUM(ct.amountPaid) FROM cheque_transactions ct WHERE ct.chequeId = c.id) as totalPaidAmount
            FROM cheques c
            LEFT JOIN payees p ON c.payeeId = p.id
            LEFT JOIN tenants t ON c.tenantId = t.id
            LEFT JOIN banks b ON c.bankId = b.id
            LEFT JOIN employees emp ON c.createdById = emp.id
        `;

        const params: string[] = [];
        const conditions: string[] = [];
        
        if (createdById) {
            conditions.push('c.createdById = ?');
            params.push(createdById);
        }
        
        // Filter by employee's assigned properties if provided
        if (employeeId) {
            conditions.push(`EXISTS (
                SELECT 1 FROM leases l
                JOIN units u ON l.unitId = u.id
                JOIN employee_properties ep ON u.propertyId = ep.propertyId
                WHERE l.tenantId = c.tenantId AND ep.employeeId = ?
            )`);
            params.push(employeeId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY c.dueDate ASC';

        const [rows] = await connection.query(query, params);
        const cheques = (rows as any[]).map(row => chequeSchema.parse({ ...row, id: String(row.id), transactions: [] }));
        
        if (cheques.length > 0) {
            const chequeIds = cheques.map(c => c.id);
            const [transactionRows] = await connection.query('SELECT * FROM cheque_transactions WHERE chequeId IN (?) ORDER BY paymentDate ASC', [chequeIds]);
            const transactions = (transactionRows as any[]).map(row => chequeTransactionSchema.parse({ ...row, id: String(row.id) }));

            for (const cheque of cheques) {
                cheque.transactions = transactions.filter(t => t.chequeId === cheque.id);
            }
        }
        
        return cheques;

    } catch(e) {
        console.error("Error getting cheques", e);
        return [];
    }
}

export async function getChequeById(id: string): Promise<Cheque | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                c.*,
                (SELECT SUM(ct.amountPaid) FROM cheque_transactions ct WHERE ct.chequeId = c.id) as totalPaidAmount
            FROM cheques c
            WHERE c.id = ?
        `, [id]);
        const data = rows as any[];
        if (data.length === 0) return null;

        const cheque = chequeSchema.parse({ ...data[0], id: String(data[0].id), transactions: [] });

        const [transactionRows] = await connection.query('SELECT * FROM cheque_transactions WHERE chequeId = ? ORDER BY paymentDate ASC', [cheque.id]);
        const transactions = (transactionRows as any[]).map(row => chequeTransactionSchema.parse({ ...row, id: String(row.id) }));
        cheque.transactions = transactions;
        
        // Recalculate here to be sure
        cheque.totalPaidAmount = transactions.reduce((acc, t) => acc + t.amountPaid, 0);

        return cheque;
    } catch(e) {
        console.error("Error getting cheque by ID", e);
        return null;
    }
}


export async function addCheque(cheque: Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO cheques (id, payeeType, payeeId, tenantId, manualPayeeName, bankId, chequeNumber, amount, chequeDate, dueDate, status, description, chequeImageUrl, createdById)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, 
                cheque.payeeType, 
                cheque.payeeId || null, 
                cheque.tenantId || null, 
                cheque.manualPayeeName || null,
                cheque.bankId, 
                cheque.chequeNumber, 
                cheque.amount, 
                cheque.chequeDate,
                cheque.dueDate, 
                cheque.status, 
                cheque.description || null, 
                cheque.chequeImageUrl || null,
                cheque.createdById || null
            ]
        );
    } catch(e) {
        console.error("Error adding cheque", e);
        throw e;
    }
}

export async function updateCheque(id: string, cheque: Partial<Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(cheque);
        const values = Object.values(cheque);
        if (fields.length === 0) return;

        fields.push('updatedAt');
        values.push(new Date());

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE cheques SET ${setClause} WHERE id = ?`;
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating cheque", e);
        throw e;
    }
}

export async function deleteCheque(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM cheques WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting cheque", e);
        throw e;
    }
}

export async function addChequeTransaction(transaction: Omit<ChequeTransaction, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO cheque_transactions (id, chequeId, amountPaid, paymentDate, paymentMethod, notes, documentUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                newId, 
                transaction.chequeId, 
                transaction.amountPaid, 
                transaction.paymentDate, 
                transaction.paymentMethod || null, 
                transaction.notes || null, 
                transaction.documentUrl || null
            ]
        );
    } catch(e) {
        console.error("Error adding cheque transaction", e);
        throw e;
    }
}

export async function updateChequeTransaction(id: string, transaction: Partial<Omit<ChequeTransaction, 'id' | 'chequeId'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(transaction);
        const values = Object.values(transaction);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE cheque_transactions SET ${setClause} WHERE id = ?`;
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating cheque transaction", e);
        throw e;
    }
}

export async function deleteChequeTransaction(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM cheque_transactions WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting cheque transaction", e);
        throw e;
    }
}


// --- Dashboard Insight Functions ---

async function getPaymentsWithDetails(query: string, params: any[]): Promise<LeasePayment[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                lp.*,
                t.name AS tenantName,
                p.name AS propertyName,
                u.unitNumber,
                u.type as unitType,
                l.businessName
            FROM lease_payments lp
            LEFT JOIN leases l ON lp.leaseId = l.id
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            ${query}
        `, params);
        return (rows as any[]).map(row => leasePaymentSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting payments with details", e);
        return [];
    }
}

export async function getUpcomingPayments(days: number): Promise<LeasePayment[]> {
    const query = "WHERE lp.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY) AND (SELECT IFNULL(SUM(amountPaid), 0) FROM payment_transactions WHERE leasePaymentId = lp.id) < lp.amount ORDER BY lp.dueDate ASC";
    return getPaymentsWithDetails(query, [days]);
}

export async function getOverduePayments(): Promise<LeasePayment[]> {
    const query = "WHERE lp.dueDate < CURDATE() AND (SELECT IFNULL(SUM(amountPaid), 0) FROM payment_transactions WHERE leasePaymentId = lp.id) < lp.amount ORDER BY lp.dueDate DESC";
    return getPaymentsWithDetails(query, []);
}

export async function getExpiringContracts(days: number): Promise<MaintenanceContract[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT mc.*, p.name AS propertyName 
            FROM maintenance_contracts mc
            LEFT JOIN properties p ON mc.propertyId = p.id
            WHERE mc.endDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY mc.endDate ASC
        `, [days]);
        return (rows as any[]).map(row => maintenanceContractSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting expiring contracts", e);
        return [];
    }
}

export async function getExpiredContracts(): Promise<MaintenanceContract[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT mc.*, p.name AS propertyName 
            FROM maintenance_contracts mc
            LEFT JOIN properties p ON mc.propertyId = p.id
            WHERE mc.endDate < CURDATE()
            ORDER BY mc.endDate DESC
        `, []);
        return (rows as any[]).map(row => maintenanceContractSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting expired contracts", e);
        return [];
    }
}

async function getLeasesWithDetailsForInsights(query: string, params: any[]): Promise<LeaseWithDetails[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                l.*,
                t.id as tenantId, t.name as tenantName, t.email as tenantEmail,
                u.unitNumber, u.id as unitId, u.type as unitType, u.status as unitStatus, u.propertyId as unitPropertyId,
                p.name as propertyName, p.id as propertyId, p.type as propertyType
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            ${query}
        `, params);

        return (rows as any[]).map(row => ({
            lease: leaseSchema.parse({ ...row, id: String(row.id), businessName: row.businessName }),
            tenant: tenantSchema.parse({ id: String(row.tenantId), name: row.tenantName, email: row.tenantEmail }),
            unit: unitSchema.parse({ id: String(row.unitId), unitNumber: row.unitNumber, type: row.unitType, propertyId: row.unitPropertyId, status: row.unitStatus }),
            property: propertySchema.parse({ id: String(row.propertyId), name: row.propertyName, type: row.propertyType }),
        }));
    } catch (e) {
        console.error("Error getting leases for insights", e);
        return [];
    }
}

export async function getExpiringLeases(days: number): Promise<LeaseWithDetails[]> {
    const query = `
        WHERE l.status = 'Active' 
        AND l.endDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY l.endDate ASC
    `;
    return getLeasesWithDetailsForInsights(query, [days]);
}

export async function getLeasesNeedingAttention(): Promise<LeaseWithDetails[]> {
    const query = `
        WHERE (l.status = 'Active' AND l.endDate < CURDATE())
        OR l.status IN ('Completed with Dues', 'Cancelled with Dues')
        ORDER BY l.endDate DESC
    `;
    return getLeasesWithDetailsForInsights(query, []);
}

export async function getDueSoonCheques(days: number): Promise<Cheque[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT c.*, p.name as savedPayeeName, t.name as tenantName
            FROM cheques c
            LEFT JOIN payees p ON c.payeeId = p.id AND c.payeeType = 'saved'
            LEFT JOIN tenants t ON c.tenantId = t.id AND c.payeeType = 'tenant'
            WHERE c.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND c.status = 'Pending'
            ORDER BY c.dueDate ASC
        `, [days]);
        return (rows as any[]).map(row => chequeSchema.parse(row));
    } catch (e) {
        console.error("Error getting due soon cheques", e);
        return [];
    }
}

export async function getOverdueOrBouncedCheques(): Promise<Cheque[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT c.*, p.name as savedPayeeName, t.name as tenantName
            FROM cheques c
            LEFT JOIN payees p ON c.payeeId = p.id AND c.payeeType = 'saved'
            LEFT JOIN tenants t ON c.tenantId = t.id AND c.payeeType = 'tenant'
            WHERE (c.dueDate < CURDATE() AND c.status = 'Pending') OR c.status = 'Bounced'
            ORDER BY c.dueDate DESC
        `);
        return (rows as any[]).map(row => chequeSchema.parse(row));
    } catch (e) {
        console.error("Error getting overdue or bounced cheques", e);
        return [];
    }
}

export async function getFinancialSummaryByProperty() {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT
                p.id AS propertyId,
                p.name AS propertyName,
                (
                    SELECT IFNULL(SUM(pt.amountPaid), 0)
                    FROM payment_transactions pt
                    JOIN lease_payments lp ON pt.leasePaymentId = lp.id
                    JOIN leases l ON lp.leaseId = l.id
                    JOIN units u ON l.unitId = u.id
                    WHERE u.propertyId = p.id
                ) AS totalIncome,
                (
                    SELECT IFNULL(SUM(e.amount), 0)
                    FROM expenses e
                    WHERE e.propertyId = p.id AND e.status = 'Approved'
                ) AS totalExpense
            FROM properties p
            GROUP BY p.id, p.name
            ORDER BY p.name;
        `);
        // Ensure numeric types
        return (rows as any[]).map(row => ({
            propertyId: row.propertyId,
            propertyName: row.propertyName,
            totalIncome: Number(row.totalIncome) || 0,
            totalExpense: Number(row.totalExpense) || 0,
        }));
    } catch (e) {
        console.error("Error getting financial summary by property", e);
        return [];
    }
}


// --- Owner Functions ---
export async function getOwners(): Promise<Owner[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM owners ORDER BY name ASC');
        return (rows as any[]).map(row => ownerSchema.parse({ ...row, id: String(row.id) }));
    } catch(e) {
        console.error("Error getting owners", e);
        return [];
    }
}

export async function addOwner(owner: Omit<Owner, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            'INSERT INTO owners (id, name, contact, email, nationality, emiratesId, emiratesIdUrl, taxNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newId, owner.name, owner.contact, owner.email, owner.nationality, owner.emiratesId, owner.emiratesIdUrl, owner.taxNumber]
        );
    } catch(e) {
        console.error("Error adding owner", e);
        throw e;
    }
}

export async function updateOwner(id: string, owner: Partial<Omit<Owner, 'id'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(owner);
        const values = Object.values(owner);

        if (fields.length === 0) {
            return; // Nothing to update
        }

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE owners SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
    } catch(e) {
        console.error("Error updating owner", e);
        throw e;
    }
}

export async function deleteOwner(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM owners WHERE id = ?', [id]);
    } catch(e) {
        console.error("Error deleting owner", e);
        throw e;
    }
}

// --- Unit Configuration Functions ---

export async function getUnitConfigurations(): Promise<UnitConfiguration[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM unit_configurations ORDER BY type, name ASC');
        return (rows as any[]).map(row => unitConfigurationSchema.parse({ ...row, id: String(row.id) }));
    } catch (e) {
        console.error("Error in getUnitConfigurations", e);
        return [];
    }
}

export async function addUnitConfiguration(config: Omit<UnitConfiguration, 'id'>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            'INSERT INTO unit_configurations (id, name, type) VALUES (?, ?, ?)',
            [newId, config.name, config.type]
        );
    } catch (e) {
        console.error("Error adding unit configuration", e);
        throw e;
    }
}

export async function updateUnitConfiguration(id: string, config: Partial<Omit<UnitConfiguration, 'id'>>): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute(
            'UPDATE unit_configurations SET name = ?, type = ? WHERE id = ?',
            [config.name, config.type, id]
        );
    } catch (e) {
        console.error("Error updating unit configuration", e);
        throw e;
    }
}

export async function deleteUnitConfiguration(id: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM unit_configurations WHERE id = ?', [id]);
    } catch (e) {
        console.error("Error deleting unit configuration", e);
        throw e;
    }
}

// --- Calendar Functions ---

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const allEvents: CalendarEvent[] = [];

        // Lease End Dates with Arrears (نهاية العقد فقط)
        const [leases] = await connection.query(`
            SELECT 
                l.id, 
                l.tenantId, 
                l.endDate as date, 
                'Lease End' as title, 
                'lease' as type,
                p.name as propertyName,
                p.type as propertyType,
                t.name as tenantName,
                l.businessName,
                COALESCE(SUM(CASE WHEN lp.status != 'Paid' AND lp.dueDate < CURDATE() THEN lp.amount ELSE 0 END), 0) as arrears
            FROM leases l
            JOIN units u ON l.unitId = u.id
            JOIN properties p ON u.propertyId = p.id
            JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN lease_payments lp ON l.id = lp.leaseId
            GROUP BY l.id, l.tenantId, l.endDate, p.name, p.type, t.name, l.businessName
        `);
        for (const event of (leases as any[])) {
            // إذا كان businessName موجود، فهو تجاري
            const isCommercial = event.businessName && event.businessName.trim() !== '';
            const ownerName = isCommercial ? event.businessName : event.tenantName;
            const ownerType = isCommercial ? 'صاحب رخصة تجارية' : 'مستأجر';
            
            // إضافة المتأخرات إذا كانت موجودة
            let detailsText = `${event.propertyName} - ${ownerType}: ${ownerName}`;
            if (event.arrears > 0) {
                detailsText += `\nالمتأخرات: AED ${event.arrears.toLocaleString()}`;
            }
            
            allEvents.push(calendarEventSchema.parse({
                ...event,
                id: `lease-${event.id}-${event.title.replace(/\s+/g, '')}`,
                link: `/dashboard/leases/${event.id}`,
                details: detailsText
            }));
        }

        // Lease Payment Due Dates with Tenant and Property Info
        const [payments] = await connection.query(`
            SELECT 
                lp.id, 
                lp.leaseId, 
                lp.dueDate as date, 
                'Payment Due' as title, 
                'payment' as type, 
                lp.amount,
                p.name as propertyName,
                p.type as propertyType,
                t.name as tenantName,
                l.businessName
            FROM lease_payments lp
            JOIN leases l ON lp.leaseId = l.id
            JOIN units u ON l.unitId = u.id
            JOIN properties p ON u.propertyId = p.id
            JOIN tenants t ON l.tenantId = t.id
            WHERE lp.status != 'Paid'
        `);
        for (const event of (payments as any[])) {
            // تحديد نوع المستأجر
            const isCommercial = event.businessName && event.businessName.trim() !== '';
            const ownerName = isCommercial ? event.businessName : event.tenantName;
            const ownerType = isCommercial ? 'صاحب رخصة تجارية' : 'مستأجر';
            const propertyTypeAr = event.propertyType === 'residential' ? 'سكني' : 'تجاري';
            
            allEvents.push(calendarEventSchema.parse({
                ...event,
                id: `payment-${event.id}`,
                link: `/dashboard/leases/${event.leaseId}`,
                details: `${event.propertyName} (${propertyTypeAr})\n${ownerType}: ${ownerName}\nالمبلغ: AED ${event.amount.toLocaleString()}`
            }));
        }

        // Maintenance Contract End Dates
        const [contracts] = await connection.query(`
            SELECT id, endDate as date, 'Contract Expiry' as title, 'maintenance' as type, vendorName FROM maintenance_contracts
        `);
         for (const event of (contracts as any[])) {
            allEvents.push(calendarEventSchema.parse({
                ...event,
                id: `maintenance-${event.id}`,
                link: `/dashboard/maintenance`,
                details: `Vendor: ${event.vendorName}`
            }));
        }

        // Cheque Due Dates
        const [cheques] = await connection.query(`
            SELECT c.id, c.dueDate as date, 'Cheque Due' as title, 'cheque' as type, 
                   COALESCE(p.name, t.name, c.manualPayeeName) as payeeName, 
                   c.amount,
                   c.chequeNumber,
                   c.payeeType,
                   p.type as payeeCategory
            FROM cheques c
            LEFT JOIN payees p ON c.payeeId = p.id AND c.payeeType = 'saved'
            LEFT JOIN tenants t ON c.tenantId = t.id AND c.payeeType = 'tenant'
            WHERE c.status NOT IN ('Cleared', 'Cancelled')
        `);
        for (const event of (cheques as any[])) {
            // تحديد نوع الشيك (شخصي أو تجاري)
            let chequeType = 'شخصي';
            if (event.payeeType === 'saved' && event.payeeCategory === 'company') {
                chequeType = 'شخصي';
            } else if (event.payeeType === 'tenant') {
                chequeType = 'شخصي';
            }
            
            allEvents.push(calendarEventSchema.parse({
                ...event,
                id: `cheque-${event.id}`,
                link: `/dashboard/cheques?search=${event.id}`,
                details: `${chequeType}: ${event.payeeName}, المبلغ: AED ${event.amount.toLocaleString()}, شيك ${event.chequeNumber}`
            }));
        }

        return allEvents;
    } catch(e) {
        console.error("Error getting calendar events", e);
        return [];
    }
}

// --- Activity Log Functions ---

export async function getActivities(): Promise<ActivityLog[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 1000');
        return (rows as any[]).map(row => {
            let details = row.details;
            // البيانات محفوظة بالفعل كـ JSON string في قاعدة البيانات
            // نتأكد فقط أنها string وليست object
            if (details && typeof details === 'object') {
                details = JSON.stringify(details);
            }
            return activityLogSchema.parse({ ...row, id: String(row.id), details });
        });
    } catch(e) {
        console.error("Error in getActivities", e);
        return [];
    }
}

export async function deleteActivityLog(logId: string): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM activity_logs WHERE id = ?', [logId]);
    } catch(e) {
        console.error("Error deleting activity log", e);
        throw e;
    }
}

export async function deleteAllActivityLogs(): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM activity_logs');
    } catch(e) {
        console.error("Error deleting all activity logs", e);
        throw e;
    }
}

export async function logActivity(
    employeeId: string | null, 
    employeeName: string | null, 
    action: string, 
    entityType?: string, 
    entityId?: string, 
    details?: Record<string, any>
): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        await connection.execute(
            `INSERT INTO activity_logs (id, employeeId, employeeName, action, entityType, entityId, details)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                newId,
                employeeId,
                employeeName,
                action,
                entityType || null,
                entityId || null,
                details ? JSON.stringify(details) : null
            ]
        );
    } catch(e) {
        console.error("Error logging activity", e);
        // We don't rethrow here because a logging failure should not crash a primary user action.
    }
}

// --- Push Subscription Functions ---

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO push_subscriptions (employeeId, endpoint, p256dh, auth) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)`,
      [
        subscription.employeeId,
        subscription.endpoint,
        subscription.p256dh,
        subscription.auth,
      ]
    );
  } catch (e) {
    console.error("Error saving push subscription", e);
    throw e;
  }
}

export async function getPushSubscriptionForEmployee(employeeId: string): Promise<PushSubscription | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query('SELECT * FROM push_subscriptions WHERE employeeId = ?', [employeeId]);
        const data = rows as any[];
        if (data.length === 0) return null;
        
        return pushSubscriptionSchema.parse(data[0]);
    } catch (e) {
        console.error("Error getting push subscription", e);
        return null;
    }
}

// --- Eviction Request Functions ---

export async function getEvictionRequests(): Promise<EvictionRequest[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT er.*, 
                   t.name as tenantName,
                   t.email as tenantEmail,
                   t.phone as tenantPhone,
                   t.idNumber as tenantIdNumber,
                   t.nationality as tenantNationality
            FROM eviction_requests er
            LEFT JOIN tenants t ON er.tenantId = t.id
            ORDER BY er.submittedDate DESC, er.createdAt DESC
        `);
        return (rows as any[]).map(row => evictionRequestSchema.parse({ 
            ...row, 
            id: String(row.id),
            tenantName: row.tenantName || row.tenantName, // Use tenant name from join if available
        }));
    } catch(e) {
        console.error("Error getting eviction requests", e);
        return [];
    }
}

export async function getEvictionRequestById(id: string): Promise<EvictionRequest | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT er.*, 
                   t.name as tenantName,
                   t.email as tenantEmail,
                   t.phone as tenantPhone,
                   t.idNumber as tenantIdNumber,
                   t.nationality as tenantNationality
            FROM eviction_requests er
            LEFT JOIN tenants t ON er.tenantId = t.id
            WHERE er.id = ?
        `, [id]);
        const data = rows as any[];
        if (data.length === 0) return null;
        
        return evictionRequestSchema.parse({ 
            ...data[0], 
            id: String(data[0].id),
            tenantName: data[0].tenantName || data[0].tenantName,
        });
    } catch(e) {
        console.error("Error getting eviction request by ID", e);
        return null;
    }
}

export async function addEvictionRequest(evictionRequest: Omit<EvictionRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<{success: boolean, message: string, id?: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const newId = randomUUID();
        
        await connection.execute(
            `INSERT INTO eviction_requests (id, tenantId, tenantName, propertyName, unitNumber, reason, description, dueAmount, status, submittedDate, createdById)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId,
                evictionRequest.tenantId || null,
                evictionRequest.tenantName,
                evictionRequest.propertyName,
                evictionRequest.unitNumber,
                evictionRequest.reason,
                evictionRequest.description || null,
                evictionRequest.dueAmount || 0,
                evictionRequest.status || 'pending',
                evictionRequest.submittedDate,
                evictionRequest.createdById
            ]
        );
        
        return { success: true, message: 'Eviction request added successfully.', id: newId };
    } catch(e: any) {
        console.error("Error adding eviction request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function updateEvictionRequest(id: string, evictionRequest: Partial<Omit<EvictionRequest, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(evictionRequest);
        const values = Object.values(evictionRequest);
        if (fields.length === 0) return { success: true, message: 'No changes to update.' };

        fields.push('updatedAt');
        values.push(new Date());

        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE eviction_requests SET ${setClause} WHERE id = ?`;
        await connection.execute(query, [...values, id]);
        
        return { success: true, message: 'Eviction request updated successfully.' };
    } catch(e: any) {
        console.error("Error updating eviction request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function deleteEvictionRequest(id: string): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM eviction_requests WHERE id = ?', [id]);
        return { success: true, message: 'Eviction request deleted successfully.' };
    } catch(e: any) {
        console.error("Error deleting eviction request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function getEvictionRequestsByTenant(tenantId: string): Promise<EvictionRequest[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT er.*, 
                   t.name as tenantName,
                   t.email as tenantEmail,
                   t.phone as tenantPhone,
                   t.idNumber as tenantIdNumber,
                   t.nationality as tenantNationality
            FROM eviction_requests er
            LEFT JOIN tenants t ON er.tenantId = t.id
            WHERE er.tenantId = ?
            ORDER BY er.submittedDate DESC, er.createdAt DESC
        `, [tenantId]);
        return (rows as any[]).map(row => evictionRequestSchema.parse({ 
            ...row, 
            id: String(row.id),
            tenantName: row.tenantName || row.tenantName,
        }));
    } catch(e) {
        console.error("Error getting eviction requests by tenant", e);
        return [];
    }
}

// ====== Purchase Request Functions ======

export async function getPurchaseRequests({ employeeId }: { employeeId?: string } = {}): Promise<PurchaseRequest[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT 
                pr.*,
                e.name as employeeName,
                p.name as propertyName,
                approver.name as approvedByName
            FROM purchase_requests pr
            LEFT JOIN employees e ON pr.employeeId = e.id
            LEFT JOIN properties p ON pr.propertyId = p.id
            LEFT JOIN employees approver ON pr.approvedBy = approver.id
        `;
        
        const params: any[] = [];
        
        if (employeeId) {
            query += ' WHERE pr.employeeId = ?';
            params.push(employeeId);
        }
        
        query += ' ORDER BY pr.createdAt DESC';
        
        const [rows] = await connection.query(query, params);
        return (rows as any[]).map(row => purchaseRequestSchema.parse({ 
            ...row, 
            id: String(row.id)
        }));
    } catch(e) {
        console.error("Error getting purchase requests", e);
        return [];
    }
}

export async function getPurchaseRequestById(id: string): Promise<PurchaseRequest | null> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                pr.*,
                e.name as employeeName,
                p.name as propertyName,
                approver.name as approvedByName
            FROM purchase_requests pr
            LEFT JOIN employees e ON pr.employeeId = e.id
            LEFT JOIN properties p ON pr.propertyId = p.id
            LEFT JOIN employees approver ON pr.approvedBy = approver.id
            WHERE pr.id = ?
        `, [id]);
        
        if ((rows as any[]).length === 0) return null;
        return purchaseRequestSchema.parse({ ...(rows as any[])[0], id: String((rows as any[])[0].id) });
    } catch(e) {
        console.error("Error getting purchase request by id", e);
        return null;
    }
}

export async function addPurchaseRequest(request: Partial<PurchaseRequest>): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const id = request.id || `pr-${Date.now()}`;
        
        const fields = ['id', 'employeeId', 'title', 'description', 'category', 'estimatedAmount', 'propertyId', 'unitId', 'status'];
        const values = [
            id,
            request.employeeId,
            request.title,
            request.description || null,
            request.category || null,
            request.estimatedAmount || 0,
            request.propertyId || null,
            request.unitId || null,
            request.status || 'Pending'
        ];
        
        const placeholders = fields.map(() => '?').join(', ');
        const query = `INSERT INTO purchase_requests (${fields.join(', ')}) VALUES (${placeholders})`;
        
        await connection.execute(query, values);
        
        return { success: true, message: 'Purchase request added successfully.' };
    } catch(e: any) {
        console.error("Error adding purchase request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function updatePurchaseRequest(id: string, request: Partial<PurchaseRequest>): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const fields = Object.keys(request).filter(key => key !== 'id');
        const values = fields.map(field => (request as any)[field]);
        
        if (fields.length === 0) return { success: false, message: 'No fields to update' };
        
        const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
        const query = `UPDATE purchase_requests SET ${setClause} WHERE id = ?`;
        
        await connection.execute(query, [...values, id]);
        
        return { success: true, message: 'Purchase request updated successfully.' };
    } catch(e: any) {
        console.error("Error updating purchase request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

export async function deletePurchaseRequest(id: string): Promise<{success: boolean, message: string}> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        await connection.execute('DELETE FROM purchase_requests WHERE id = ?', [id]);
        return { success: true, message: 'Purchase request deleted successfully.' };
    } catch(e: any) {
        console.error("Error deleting purchase request", e);
        return { success: false, message: e.message || "An unexpected error occurred." };
    }
}

// ====== Lease History Functions ======

export interface LeaseHistoryItem extends LeaseWithDetails {
    totalPaidAmount: number;
    totalDueAmount: number;
    paymentsCount: number;
    completedPaymentsCount: number;
}

export async function getCompletedLeasesHistory(): Promise<LeaseHistoryItem[]> {
    let connection: mysql.Connection | null = null;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(`
            SELECT 
                l.*,
                t.id as tenantId, t.name as tenantName, t.email as tenantEmail, 
                t.phone as tenantPhone, t.allowLogin as tenantAllowLogin,
                u.unitNumber as unitNumber, u.type as unitType, u.id as unitId,
                p.name as propertyName, p.id as propertyId, p.location as propertyLocation,
                COALESCE(SUM(CASE WHEN lp.status = 'Paid' THEN lp.amount ELSE 0 END), 0) as totalPaidAmount,
                COALESCE(SUM(lp.amount), 0) as totalDueAmount,
                COUNT(lp.id) as paymentsCount,
                COUNT(CASE WHEN lp.status = 'Paid' THEN 1 END) as completedPaymentsCount
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            LEFT JOIN lease_payments lp ON l.id = lp.leaseId
            WHERE l.status IN ('Completed', 'Completed with Dues', 'Cancelled', 'Cancelled with Dues')
            GROUP BY l.id, t.id, u.id, p.id
            ORDER BY l.endDate DESC
        `);
        
        const data = rows as any[];
        return data.map(row => ({
            lease: leaseSchema.parse({
                id: String(row.id),
                unitId: String(row.unitId),
                tenantId: String(row.tenantId),
                startDate: row.startDate,
                endDate: row.endDate,
                rentPaymentAmount: row.rentPaymentAmount,
                numberOfPayments: row.numberOfPayments,
                rentIncreasePercentage: row.rentIncreasePercentage,
                securityDeposit: row.securityDeposit,
                status: row.status,
                leaseDocument: row.leaseDocument,
                businessName: row.businessName,
                businessType: row.businessType,
                tradeLicenseNumber: row.tradeLicenseNumber,
                tenantSince: row.tenantSince,
                subtotalAmount: row.subtotalAmount,
                taxedAmount: row.taxedAmount,
                totalAmount: row.totalAmount
            }),
            tenant: tenantSchema.parse({
                id: String(row.tenantId),
                name: row.tenantName,
                email: row.tenantEmail,
                phone: row.tenantPhone,
                allowLogin: row.tenantAllowLogin,
                nationality: row.nationality || 'N/A',
                passportNumber: row.passportNumber || 'N/A',
                emiratesId: row.emiratesId || 'N/A',
                visaFile: row.visaFile || null,
                dateOfBirth: row.dateOfBirth || new Date(),
                notes: row.notes || null,
                password: row.password || null,
                telegramBotToken: row.telegramBotToken || null,
                telegramChannelId: row.telegramChannelId || null,
                enableEmailAlerts: row.enableEmailAlerts || false,
                profilePictureUrl: row.profilePictureUrl || null,
                createdAt: row.createdAt || new Date(),
                updatedAt: row.updatedAt || new Date()
            }),
            unit: {
                id: String(row.unitId),
                unitNumber: row.unitNumber,
                type: row.unitType,
                bedrooms: null,
                bathrooms: null,
                squareFeet: null,
                propertyId: String(row.propertyId),
                status: 'Occupied' as any,
                rentAmount: row.rentPaymentAmount,
                accountNo: row.accountNo || null,
                floor: row.floor || null,
                notes: row.notes || null,
                createdAt: row.createdAt || new Date(),
                updatedAt: row.updatedAt || new Date()
            },
            property: {
                id: String(row.propertyId),
                name: row.propertyName,
                location: row.propertyLocation || 'N/A',
                type: row.propertyType || 'N/A',
                address: row.address || 'N/A',
                description: row.description || null,
                yearBuilt: row.yearBuilt || null,
                totalUnits: row.totalUnits || 0,
                ownerId: row.ownerId || null,
                propertyManagerId: row.propertyManagerId || null,
                latitude: row.latitude || null,
                longitude: row.longitude || null,
                imageUrl: row.imageUrl || null,
                createdAt: row.createdAt || new Date(),
                updatedAt: row.updatedAt || new Date()
            },
            totalPaidAmount: Number(row.totalPaidAmount) || 0,
            totalDueAmount: Number(row.totalDueAmount) || 0,
            paymentsCount: Number(row.paymentsCount) || 0,
            completedPaymentsCount: Number(row.completedPaymentsCount) || 0
        }));
    } catch(e) {
        console.error("Error fetching lease history", e);
        throw e;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
