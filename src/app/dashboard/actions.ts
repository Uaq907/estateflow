

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { 
    addEmployee as dbAddEmployee, 
    updateEmployee as dbUpdateEmployee, 
    deleteEmployee as dbDeleteEmployee, 
    addTenant as dbAddTenant, 
    updateTenant as dbUpdateTenant, 
    deleteTenant as dbDeleteTenant,
    assignTenantToUnit as dbAssignTenantToUnit,
    removeTenantFromUnit,
    updateLease as dbUpdateLease,
    addLeasePayment,
    updateLeasePayment,
    deleteLeasePayment as dbDeleteLeasePayment,
    requestPaymentExtension as dbRequestPaymentExtension,
    reviewPaymentExtension as dbReviewPaymentExtension,
    addPaymentTransaction,
    updatePaymentTransaction,
    deletePaymentTransaction,
    assignEmployeeToProperty,
    removeEmployeeFromProperty,
    addExpense as dbAddExpense,
    updateExpense as dbUpdateExpense,
    deleteExpense as dbDeleteExpense,
    getExpenseHistory,
    addExpenseHistory,
    addMaintenanceContract as dbAddMaintenanceContract,
    updateMaintenanceContract as dbUpdateMaintenanceContract,
    deleteMaintenanceContract as dbDeleteMaintenanceContract,
    addAsset as dbAddAsset,
    updateAsset as dbUpdateAsset,
    deleteAsset as dbDeleteAsset,
    addPayee as dbAddPayee,
    updatePayee as dbUpdatePayee,
    deletePayee as dbDeletePayee,
    addBank as dbAddBank,
    updateBank as dbUpdateBank,
    deleteBank as dbDeleteBank,
    addCheque as dbAddCheque,
    updateCheque as dbUpdateCheque,
    deleteCheque as dbDeleteCheque,
    addOwner as dbAddOwner,
    updateOwner as dbUpdateOwner,
    deleteOwner as dbDeleteOwner,
    addProperty as dbAddProperty,
    updateProperty as dbUpdateProperty,
    deleteUnit as dbDeleteUnit,
    getLeasePaymentById,
    getProperties,
    getUnitsForProperty,
    getTenants,
    getLeasesWithDetails,
    getLeaseWithDetails,
    getExpenses,
    getCheques,
    addUnitConfiguration as dbAddUnitConfiguration,
    updateUnitConfiguration as dbUpdateUnitConfiguration,
    deleteUnitConfiguration as dbDeleteUnitConfiguration,
    addUnit as dbAddUnit,
    updateUnit as dbUpdateUnit,
    getChequeById,
    addChequeTransaction,
    updateChequeTransaction,
    deleteChequeTransaction,
    addPropertyDocument,
    deletePropertyDocument,
    logActivity,
    getEmployees,
    deleteActivityLog,
    deleteAllActivityLogs,
    addEvictionRequest as dbAddEvictionRequest,
    updateEvictionRequest as dbUpdateEvictionRequest,
    deleteEvictionRequest as dbDeleteEvictionRequest,
} from '@/lib/db';
import type { Employee, LeasePayment, Tenant, Lease, PaymentTransaction, Expense, MaintenanceContract, Asset, Payee, Bank, Owner, Property, Unit, UnitConfiguration, Cheque, ChequeTransaction, PropertyDocument, PushSubscription, NotificationPreferences } from '@/lib/types';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as xlsx from 'xlsx';
import { getSession, getEmployeeFromSession, getEmployeeByEmail, getEmployeeById } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import bcrypt from 'bcrypt';

export async function logout(prevState: any, formData: FormData) {
  // To properly delete the cookie, all original attributes must match and expires must be in the past.
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
  });

  // Redirect to the login page
  redirect('/login');
}

const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function uploadFile(formData: FormData, fieldName: string, subfolder: string): Promise<{ success: boolean; message: string; filePath?: string }> {
  const session = await getSession();
  if (!session) {
      return { success: false, message: 'Authentication required.' };
  }
  
  const file = formData.get(fieldName) as File | null;

  if (!file || file.size === 0) {
    // This case means no file was selected, so we just return success and the calling function will know not to update the URL.
    return { success: true, message: 'No file provided.' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
      return { success: false, message: `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.` };
  }

  try {
    // Save to a specific subfolder within public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Construct the relative URL for client-side access
    const fileUrl = `/uploads/${subfolder}/${uniqueFilename}`;

    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    return { success: true, message: 'File uploaded successfully.', filePath: fileUrl };
  } catch (error) {
    console.error('File upload failed:', error);
    return { success: false, message: 'File upload failed.' };
  }
}

export async function handleAddEmployee(employee: Partial<Omit<Employee, 'id' | 'password'>> & { password?: string }) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'employees:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbAddEmployee(employee as any);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_EMPLOYEE', 'Employee', undefined, { name: employee.name, email: employee.email });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/employees');
        return { success: true, message: 'Employee added successfully.' };
    } catch (error) {
        console.error('Failed to add employee:', error);
        return { success: false, message: 'Failed to add employee.' };
    }
}

export async function handleUpdateEmployee(id: string, employee: Partial<Omit<Employee, 'id' | 'password' | 'notificationPreferences'>> & { password?: string | null, notificationPreferences?: NotificationPreferences }) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'employees:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbUpdateEmployee(id, employee);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_EMPLOYEE', 'Employee', id, { updatedFields: Object.keys(employee) });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/employees');
        return { success: true, message: 'Employee updated successfully.' };
    } catch (error) {
        console.error('Failed to update employee:', error);
        return { success: false, message: 'Failed to update employee.' };
    }
}

export async function handleDeleteEmployee(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'employees:delete')) {
        return { success: false, message: 'ليس لديك صلاحية حذف الموظفين.' };
    }
    
    try {
        await dbDeleteEmployee(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_EMPLOYEE', 'Employee', id);
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/employees');
        return { success: true, message: 'تم حذف الموظف بنجاح.' };
    } catch (error: any) {
        console.error('Failed to delete employee:', error);
        
        // رسائل خطأ واضحة بالعربية
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return { 
                success: false, 
                message: 'لا يمكن حذف الموظف لأنه مرتبط ببيانات أخرى (عقود، مصروفات، إلخ). يرجى حذف البيانات المرتبطة أولاً.' 
            };
        }
        
        return { 
            success: false, 
            message: `فشل حذف الموظف: ${error.message || 'خطأ غير معروف'}` 
        };
    }
}

export async function changePassword(prevState: any, formData: FormData): Promise<{ success: boolean; message: string }> {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!loggedInEmployee) {
    return { success: false, message: 'Authentication required.' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'New passwords do not match.' };
  }
  if (newPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }

  try {
    // We need to fetch the employee again to get the hashed password
    const employeeWithPassword = await getEmployeeByEmail(loggedInEmployee.email);
    if (!employeeWithPassword || !employeeWithPassword.password) {
      return { success: false, message: 'Could not verify user.' };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, employeeWithPassword.password);
    if (!passwordsMatch) {
      await logActivity(loggedInEmployee.id, loggedInEmployee.name, 'PASSWORD_CHANGE_FAILURE', 'Employee', loggedInEmployee.id, { reason: 'Incorrect current password' });
      return { success: false, message: 'Incorrect current password.' };
    }

    await dbUpdateEmployee(loggedInEmployee.id, { password: newPassword });
    
    await logActivity(loggedInEmployee.id, loggedInEmployee.name, 'PASSWORD_CHANGE_SUCCESS', 'Employee', loggedInEmployee.id);
    return { success: true, message: 'Password changed successfully.' };

  } catch (error: any) {
    console.error('Failed to change password:', error);
    await logActivity(loggedInEmployee.id, loggedInEmployee.name, 'PASSWORD_CHANGE_FAILURE', 'Employee', loggedInEmployee.id, { error: error.message });
    return { success: false, message: 'An unexpected error occurred.' };
  }
}



// --- Tenant and Lease Actions ---

export async function handleAddTenant(tenant: Omit<Tenant, 'id' | 'password'> & { password?: string }): Promise<{success: boolean, message: string, id?: string}> {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'tenants:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const result = await dbAddTenant(tenant);
        if (result.id) {
            await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_TENANT', 'Tenant', result.id, { name: tenant.name, email: tenant.email });
        }
        revalidatePath('/dashboard/tenants');
        return { success: true, message: 'Tenant added successfully.', id: result.id };
    } catch (error: any) {
        console.error('Failed to add tenant:', error);
        return { success: false, message: error.message || 'Failed to add tenant.' };
    }
}

export async function handleUpdateTenant(id: string, tenant: Partial<Omit<Tenant, 'id' | 'password'>> & { password?: string | null }) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'tenants:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToUpdate: Partial<Omit<Tenant, 'id'>> & { password?: string | null; allowLogin?: boolean } = { 
            ...tenant,
            phone: tenant.phone || null,
            idNumber: tenant.idNumber || null,
            idType: tenant.idType || null,
            nationality: tenant.nationality || null,
            idDocumentUrl: tenant.idDocumentUrl || null,
        };

        const result = await dbUpdateTenant(id, dataToUpdate);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_TENANT', 'Tenant', id, { updatedFields: Object.keys(dataToUpdate) });
        revalidatePath('/dashboard/tenants');
        revalidatePath('/dashboard/properties/*');
        return result;
    } catch (error: any) {
        console.error('Failed to update tenant:', error);
        return { success: false, message: error.message || 'Failed to update tenant.' };
    }
}

export async function handleDeleteTenant(id: string, reason?: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'tenants:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        // Get tenant info before deletion
        const connection = require('@/lib/db-connection').getConnection();
        const [rows] = await (await connection).query('SELECT name, phone FROM tenants WHERE id = ?', [id]);
        const tenant = (rows as any[])[0];
        
        await dbDeleteTenant(id);
        
        // Log deletion with tenant name, phone, and reason
        const logDetails: any = {};
        if (tenant) {
            logDetails.tenantName = tenant.name;
            logDetails.phone = tenant.phone;
        }
        if (reason) {
            logDetails.reason = reason;
        }
        
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_TENANT', 'Tenant', id, logDetails);
        revalidatePath('/dashboard/tenants');
        revalidatePath('/dashboard/properties/*'); // Revalidate property pages as tenant info might be displayed there
        return { success: true, message: 'Tenant deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete tenant:', error);
        return { success: false, message: 'Failed to delete tenant.' };
    }
}

export async function handleAssignTenant(
    unitId: string, 
    tenantId: string, 
    leaseDetails: Omit<Lease, 'id' | 'unitId' | 'tenantId'>
) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToSave: Omit<Lease, 'id' | 'unitId' | 'tenantId'> = {
            ...leaseDetails,
            tenantSince: leaseDetails.tenantSince || null,
            totalLeaseAmount: leaseDetails.totalLeaseAmount || null,
            taxedAmount: leaseDetails.taxedAmount || null,
            rentPaymentAmount: leaseDetails.rentPaymentAmount || null,
            numberOfPayments: leaseDetails.numberOfPayments || null,
            renewalIncreasePercentage: leaseDetails.renewalIncreasePercentage || null,
            contractUrl: leaseDetails.contractUrl || null,
            guaranteeChequeAmount: leaseDetails.guaranteeChequeAmount || null,
            guaranteeChequeUrl: leaseDetails.guaranteeChequeUrl || null,
            businessName: leaseDetails.businessName || null,
            businessType: leaseDetails.businessType || null,
            tradeLicenseNumber: leaseDetails.tradeLicenseNumber || null,
            tradeLicenseUrl: leaseDetails.tradeLicenseUrl || null,
        }
        await dbAssignTenantToUnit(unitId, tenantId, dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ASSIGN_TENANT', 'Unit', unitId, { tenantId });
        revalidatePath(`/dashboard/properties/${unitId.split('-')[0]}`); // A bit of a hack to get property id
        revalidatePath('/dashboard/properties');
        return { success: true, message: 'Tenant assigned successfully.' };
    } catch (error) {
        console.error('Failed to assign tenant:', error);
        return { success: false, message: 'Failed to assign tenant.' };
    }
}

export async function handleRemoveTenant(unitId: string, leaseId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await removeTenantFromUnit(unitId, leaseId);
        await dbUpdateUnit(unitId, { status: 'Available' });
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'REMOVE_TENANT', 'Unit', unitId, { leaseId });
        revalidatePath(`/dashboard/properties/${unitId.split('-')[0]}`);
        revalidatePath('/dashboard/properties');
        return { success: true, message: 'Tenant removed successfully.' };
    } catch (error) {
        console.error('Failed to remove tenant:', error);
        return { success: false, message: 'Failed to remove tenant.' };
    }
}

export async function handleRenewLease(renewalData: {
    oldLeaseId: string;
    unitId: string;
    tenantId: string;
    newStartDate: Date;
    newEndDate: Date;
    newRentAmount: number;
    numberOfPayments: number;
    increasePercentage: number;
    businessName: string | null;
    businessType: string | null;
    tradeLicenseNumber: string | null;
    customPayments?: Array<{dueDate: Date, amount: number, description: string}> | null;
}): Promise<{ success: boolean; message: string; newLeaseId?: string }> {
    const loggedInEmployee = await getEmployeeFromSession();
    
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        const connection = require('@/lib/db-connection').getConnection();
        const conn = await connection;
        
        // 1. Get old lease details
        const [oldLeaseRows] = await conn.query('SELECT * FROM leases WHERE id = ?', [renewalData.oldLeaseId]);
        const oldLease = (oldLeaseRows as any[])[0];
        
        if (!oldLease) {
            return { success: false, message: 'Old lease not found.' };
        }
        
        // 2. Get unpaid payments from old lease
        const [unpaidPayments] = await conn.query(
            `SELECT * FROM lease_payments WHERE leaseId = ? AND status != 'Paid'`,
            [renewalData.oldLeaseId]
        );
        
        // 3. Calculate new lease amounts
        const totalNewAmount = renewalData.newRentAmount * renewalData.numberOfPayments;
        const taxedAmount = totalNewAmount * 0.05; // Assuming 5% VAT
        
        // 4. Create new lease
        const newLeaseId = `lease-${Date.now()}`;
        await conn.execute(
            `INSERT INTO leases 
            (id, unitId, tenantId, startDate, endDate, status, totalLeaseAmount, taxedAmount, 
             rentPaymentAmount, numberOfPayments, renewalIncreasePercentage, 
             businessName, businessType, tradeLicenseNumber, tenantSince) 
            VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newLeaseId, renewalData.unitId, renewalData.tenantId,
                renewalData.newStartDate, renewalData.newEndDate,
                totalNewAmount, taxedAmount, renewalData.newRentAmount,
                renewalData.numberOfPayments, renewalData.increasePercentage,
                renewalData.businessName, renewalData.businessType, renewalData.tradeLicenseNumber,
                oldLease.tenantSince || oldLease.startDate
            ]
        );
        
        // 5. Transfer unpaid payments to new lease with year label
        const oldLeaseYear = new Date(oldLease.endDate).getFullYear();
        for (const payment of (unpaidPayments as any[])) {
            const newPaymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const description = payment.description 
                ? `متأخرات ${oldLeaseYear} - ${payment.description}`
                : `متأخرات من عقد ${oldLeaseYear}`;
            
            await conn.execute(
                `INSERT INTO lease_payments 
                (id, leaseId, dueDate, amount, status, description, paymentMethod, chequeNumber, chequeImageUrl) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newPaymentId, newLeaseId, payment.dueDate, payment.amount,
                    payment.status, description, payment.paymentMethod,
                    payment.chequeNumber, payment.chequeImageUrl
                ]
            );
        }
        
        // 5b. Create new lease payments (custom or auto-generated)
        if (renewalData.customPayments && renewalData.customPayments.length > 0) {
            // استخدام الجدول المخصص
            for (const payment of renewalData.customPayments) {
                const newPaymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await conn.execute(
                    `INSERT INTO lease_payments 
                    (id, leaseId, dueDate, amount, status, description) 
                    VALUES (?, ?, ?, ?, 'Pending', ?)`,
                    [newPaymentId, newLeaseId, payment.dueDate, payment.amount, payment.description]
                );
            }
        } else {
            // إنشاء دفعات تلقائية
            for (let i = 0; i < renewalData.numberOfPayments; i++) {
                const paymentDueDate = new Date(renewalData.newStartDate);
                paymentDueDate.setMonth(paymentDueDate.getMonth() + i);
                
                const newPaymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await conn.execute(
                    `INSERT INTO lease_payments 
                    (id, leaseId, dueDate, amount, status, description) 
                    VALUES (?, ?, ?, ?, 'Pending', ?)`,
                    [
                        newPaymentId, newLeaseId, paymentDueDate, renewalData.newRentAmount,
                        `دفعة ${i + 1} من ${renewalData.numberOfPayments}`
                    ]
                );
            }
        }
        
        // 6. Update old lease status
        const oldLeaseStatus = (unpaidPayments as any[]).length > 0 
            ? 'Completed with Dues' 
            : 'Completed';
        await conn.execute(
            `UPDATE leases SET status = ? WHERE id = ?`,
            [oldLeaseStatus, renewalData.oldLeaseId]
        );
        
        // 7. Log activity
        await logActivity(
            loggedInEmployee!.id, 
            loggedInEmployee!.name, 
            'RENEW_LEASE', 
            'Lease', 
            newLeaseId, 
            { 
                oldLeaseId: renewalData.oldLeaseId, 
                unpaidTransferred: (unpaidPayments as any[]).length,
                oldLeaseYear 
            }
        );
        
        revalidatePath(`/dashboard/leases/${newLeaseId}`);
        revalidatePath(`/dashboard/leases/${renewalData.oldLeaseId}`);
        revalidatePath(`/dashboard/properties`);
        revalidatePath(`/dashboard/units/${renewalData.unitId}`);
        
        return { 
            success: true, 
            message: 'Lease renewed successfully.', 
            newLeaseId 
        };
    } catch (error: any) {
        console.error('Failed to renew lease:', error);
        return { 
            success: false, 
            message: `Failed to renew lease: ${error.message || 'Unknown error'}` 
        };
    }
}

export async function handleUpdateLease(leaseId: string, leaseData: Partial<Omit<Lease, 'id' | 'unitId' | 'tenantId'>>): Promise<{success: boolean, message: string}> {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        // We need the unit ID to update its status
        const connection = require('@/lib/db-connection').getConnection(); // A bit of a hack to avoid circular deps
        const [rows] = await (await connection).query('SELECT unitId FROM leases WHERE id = ?', [leaseId]);
        if ((rows as any[]).length === 0) {
             return { success: false, message: 'Lease not found.' };
        }
        const unitId = (rows as any)[0].unitId;

        const dataToUpdate = {
            ...leaseData,
            tenantSince: leaseData.tenantSince || null,
            totalLeaseAmount: leaseData.totalLeaseAmount || null,
            taxedAmount: leaseData.taxedAmount || null,
            rentPaymentAmount: leaseData.rentPaymentAmount || null,
            numberOfPayments: leaseData.numberOfPayments || null,
            renewalIncreasePercentage: leaseData.renewalIncreasePercentage || null,
            contractUrl: leaseData.contractUrl || null,
            guaranteeChequeAmount: leaseData.guaranteeChequeAmount || null,
            guaranteeChequeUrl: leaseData.guaranteeChequeUrl || null,
            businessName: leaseData.businessName || null,
            businessType: leaseData.businessType || null,
            tradeLicenseNumber: leaseData.tradeLicenseNumber || null,
            tradeLicenseUrl: leaseData.tradeLicenseUrl || null,
        };

        await dbUpdateLease(leaseId, dataToUpdate);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_LEASE', 'Lease', leaseId, { updatedFields: Object.keys(dataToUpdate) });


        // Update the unit status based on the new lease status
        if (dataToUpdate.status) {
            const newUnitStatus = dataToUpdate.status === 'Active' ? 'Rented' : 'Available';
            await dbUpdateUnit(unitId, { status: newUnitStatus });
        }

        revalidatePath(`/dashboard/leases/${leaseId}`);
        revalidatePath(`/dashboard/properties/${unitId.split('-')[0]}`);
        return { success: true, message: 'Lease updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update lease:', error);
        return { success: false, message: error.message || 'Failed to update lease.' };
    }
}

async function updatePaymentStatus(paymentId: string) {
    const payment = await getLeasePaymentById(paymentId);
    if (!payment) return;

    const paidAmount = payment.transactions?.reduce((acc, t) => acc + t.amountPaid, 0) ?? 0;
    
    let newStatus = 'Pending';
    if (paidAmount >= payment.amount) {
        newStatus = 'Paid';
    } else if (paidAmount > 0) {
        newStatus = 'Partially Paid';
    } else if (new Date(payment.dueDate) < new Date()) {
        newStatus = 'Overdue';
    }
    
    if (newStatus !== payment.status) {
        await updateLeasePayment(paymentId, { status: newStatus });
    }
}

export async function handleAddLeasePayment(paymentData: Omit<LeasePayment, 'id' | 'transactions' | 'status'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) { // Part of lease management
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToSave = {
            ...paymentData,
            status: 'Pending', // Always start as pending
            chequeNumber: paymentData.chequeNumber || null,
            chequeImageUrl: paymentData.chequeImageUrl || null,
            description: paymentData.description || null,
            paymentMethod: paymentData.paymentMethod || null,
        }
        await addLeasePayment(dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ADD_LEASE_PAYMENT', 'Lease', paymentData.leaseId, { amount: paymentData.amount, dueDate: paymentData.dueDate });
        revalidatePath(`/dashboard/leases/${paymentData.leaseId}`);
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Payment added successfully.' };
    } catch (error: any) {
        console.error('Failed to add payment:', error);
        return { success: false, message: error.message || 'Failed to add payment.' };
    }
}

export async function handleUpdateLeasePayment(paymentId: string, paymentData: Partial<Omit<LeasePayment, 'id' | 'leaseId' | 'transactions'>>) {
     const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        const dataToSave = {
            ...paymentData,
            chequeNumber: paymentData.chequeNumber || null,
            chequeImageUrl: paymentData.chequeImageUrl || null,
            description: paymentData.description || null,
            paymentMethod: paymentData.paymentMethod || null,
        }
        await updateLeasePayment(paymentId, dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_LEASE_PAYMENT', 'LeasePayment', paymentId, { updatedFields: Object.keys(dataToSave) });
        await updatePaymentStatus(paymentId); // Recalculate status
        revalidatePath('/dashboard/leases', 'layout');
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Payment updated successfully.' };
    } catch (error) {
        console.error('Failed to update payment:', error);
        return { success: false, message: 'Failed to update payment.' };
    }
}

export async function handleDeleteLeasePayment(paymentId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteLeasePayment(paymentId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_LEASE_PAYMENT', 'LeasePayment', paymentId);
        revalidatePath('/dashboard/leases', 'layout');
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Payment deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete payment:', error);
        return { success: false, message: 'Failed to delete payment.' };
    }
}

export async function handleAddTransaction(transactionData: Omit<PaymentTransaction, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const payment = await getLeasePaymentById(transactionData.leasePaymentId);
        if (!payment) {
            return { success: false, message: "Payment installment not found." };
        }
        const paidAmount = payment.transactions?.reduce((acc, t) => acc + t.amountPaid, 0) ?? 0;
        const balance = payment.amount - paidAmount;
        if (transactionData.amountPaid > balance) {
            return { success: false, message: `Amount exceeds remaining balance of AED ${balance.toLocaleString()}.` };
        }

        await addPaymentTransaction(transactionData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ADD_LEASE_TRANSACTION', 'LeasePayment', transactionData.leasePaymentId, { amount: transactionData.amountPaid });
        await updatePaymentStatus(transactionData.leasePaymentId);

        revalidatePath('/dashboard/leases', 'layout');
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Transaction added successfully.' };
    } catch (error: any) {
        console.error('Failed to add transaction:', error);
        return { success: false, message: `Failed to add transaction. ${error.message}` };
    }
}


export async function handleUpdateTransaction(transactionId: string, transactionData: Partial<Omit<PaymentTransaction, 'id' | 'leasePaymentId'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        // We need the payment ID to update the status later
        const connection = require('@/lib/db-connection').getConnection(); // A bit of a hack to avoid circular deps
        const [rows] = await (await connection).query('SELECT leasePaymentId FROM payment_transactions WHERE id = ?', [transactionId]);
        if ((rows as any[]).length === 0) {
             return { success: false, message: 'Transaction not found.' };
        }
        const leasePaymentId = (rows as any)[0].leasePaymentId;

        await updatePaymentTransaction(transactionId, transactionData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_LEASE_TRANSACTION', 'PaymentTransaction', transactionId, { updatedFields: Object.keys(transactionData) });
        await updatePaymentStatus(leasePaymentId);

        revalidatePath('/dashboard/leases', 'layout');
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Transaction updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update transaction:', error);
        return { success: false, message: `Failed to update transaction: ${error.message}` };
    }
}

export async function handleDeleteTransaction(transactionId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
         // We need the payment ID to update the status later
        const connection = require('@/lib/db-connection').getConnection(); // A bit of a hack to avoid circular deps
        const [rows] = await (await connection).query('SELECT leasePaymentId FROM payment_transactions WHERE id = ?', [transactionId]);
        if ((rows as any[]).length === 0) {
             return { success: false, message: 'Transaction not found.' };
        }
        const leasePaymentId = (rows as any)[0].leasePaymentId;

        await deletePaymentTransaction(transactionId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_LEASE_TRANSACTION', 'PaymentTransaction', transactionId);
        await updatePaymentStatus(leasePaymentId);

        revalidatePath('/dashboard/leases', 'layout');
        revalidatePath('/tenant-dashboard');
        return { success: true, message: 'Transaction deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete transaction:', error);
        return { success: false, message: `Failed to delete transaction: ${error.message}` };
    }
}


export async function requestPaymentExtension(paymentId: string, requestedDueDate: Date, reason: string) {
    // This action is initiated by a tenant, so no employee permission check needed here.
    try {
        await dbRequestPaymentExtension(paymentId, requestedDueDate, reason);
        // We can't log tenant activity yet as logActivity is tied to employees
        revalidatePath('/tenant-dashboard');
        revalidatePath('/dashboard/leases', 'layout');
        return { success: true, message: 'Extension requested successfully.' };
    } catch (error) {
        console.error('Failed to request extension:', error);
        return { success: false, message: 'Failed to request extension.' };
    }
}

export async function reviewPaymentExtension(paymentId: string, approved: boolean, managerNotes: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'leases:update')) { // Only users who can manage leases can review
        return { success: false, message: 'Permission denied.' };
    }
     try {
        await dbReviewPaymentExtension(paymentId, approved, managerNotes);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'REVIEW_PAYMENT_EXTENSION', 'LeasePayment', paymentId, { approved, managerNotes });
        revalidatePath('/tenant-dashboard');
        revalidatePath('/dashboard/leases', 'layout');
        return { success: true, message: 'Extension request reviewed.' };
    } catch (error) {
        console.error('Failed to review extension:', error);
        return { success: false, message: 'Failed to review extension.' };
    }
}


// Employee-Property Linking Actions

export async function handleAssignEmployeeToProperty(employeeId: string, propertyId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    // Assuming only users who can update properties can assign staff
    if (!hasPermission(loggedInEmployee, 'properties:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await assignEmployeeToProperty(employeeId, propertyId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ASSIGN_EMPLOYEE_TO_PROPERTY', 'Property', propertyId, { assignedEmployeeId: employeeId });
        revalidatePath(`/dashboard/properties/${propertyId}`);
        return { success: true, message: 'Employee assigned to property.' };
    } catch (error) {
        console.error('Failed to assign employee to property:', error);
        return { success: false, message: 'Failed to assign employee to property.' };
    }
}

export async function handleRemoveEmployeeFromProperty(employeeId: string, propertyId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:update')) {
        return { success: false, message: 'ليس لديك صلاحية تعديل العقارات.' };
    }
    
    try {
        console.log(`[handleRemoveEmployeeFromProperty] Removing employee ${employeeId} from property ${propertyId}`);
        
        await removeEmployeeFromProperty(employeeId, propertyId);
        
        await logActivity(
            loggedInEmployee!.id, 
            loggedInEmployee!.name, 
            'REMOVE_EMPLOYEE_FROM_PROPERTY', 
            'Property', 
            propertyId, 
            { removedEmployeeId: employeeId }
        );
        
        revalidatePath(`/dashboard/properties/${propertyId}`);
        revalidatePath(`/dashboard/properties`);
        
        console.log('[handleRemoveEmployeeFromProperty] Success');
        return { success: true, message: 'تم إزالة الموظف من العقار بنجاح.' };
    } catch (error: any) {
        console.error('[handleRemoveEmployeeFromProperty] Error:', error);
        return { 
            success: false, 
            message: `فشل إزالة الموظف: ${error.message || 'خطأ غير معروف'}` 
        };
    }
}

// --- Notification Helpers ---

type NotificationEvent = 'new_expense_submitted' | 'expense_approved' | 'expense_rejected';

async function sendNotification(employeeId: string, event: NotificationEvent, message: string) {
    const employee = await getEmployeeById(employeeId);

    if (!employee || !employee.notificationPreferences) {
        return; // Employee not found or has no preferences set
    }

    const preferences: NotificationPreferences = employee.notificationPreferences;
    
    // Check if the user has this notification type enabled
    if (preferences[event]) {
        // And check if they have configured their Telegram details
        if (employee.telegramBotToken && employee.telegramChannelId) {
            try {
                const url = `https://api.telegram.org/bot${employee.telegramBotToken}/sendMessage`;
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: employee.telegramChannelId,
                        text: message,
                        parse_mode: 'Markdown'
                    }),
                });
                await logActivity(null, 'System', 'TELEGRAM_NOTIFICATION_SUCCESS', 'Employee', employeeId, { event });
            } catch (error) {
                console.error(`Failed to send personal Telegram notification to ${employee.name}:`, error);
            }
        }
    }
}

// --- Expense Actions ---

async function sendSystemTelegramNotification(text: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_ADMIN_CHANNEL_ID;

    if (!botToken || !channelId || botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.warn('System Telegram bot is not configured. Skipping notification.');
        await logActivity(null, 'System', 'TELEGRAM_NOTIFICATION_SKIPPED', 'System', undefined, { reason: 'Bot token or channel ID not set in .env' });
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: channelId,
                text: text,
                parse_mode: 'Markdown'
            }),
        });
        const result = await response.json();
        if (result.ok) {
            await logActivity(null, 'System', 'TELEGRAM_NOTIFICATION_SUCCESS', 'System', undefined, { message: text });
        } else {
            console.error('Telegram API Error:', result);
            await logActivity(null, 'System', 'TELEGRAM_NOTIFICATION_FAILURE', 'System', undefined, { error: result.description });
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}


export async function handleAddExpense(expenseData: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'expenses:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        let finalAmount = expenseData.baseAmount ?? 0;
        let taxAmount = 0;

        if (expenseData.isVat) {
            taxAmount = finalAmount * 0.05;
            finalAmount += taxAmount;
        }

        const dataToSave = {
            ...expenseData,
            amount: finalAmount,
            taxAmount: taxAmount,
        };

        const addedExpense = await dbAddExpense(dataToSave as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
        // تم تعطيل تسجيل المصروفات في السجل
        // await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_EXPENSE', 'Expense', addedExpense.id, { category: expenseData.category, amount: finalAmount });
        
        // Add to expense history
        await addExpenseHistory({
            expenseId: addedExpense.id,
            action: 'Created',
            performedBy: loggedInEmployee!.id,
            performedByName: loggedInEmployee!.name,
            notes: `Created expense: ${expenseData.category} - AED ${finalAmount.toLocaleString()}`,
            previousStatus: undefined,
            newStatus: 'Pending'
        });
        
        // Send notification after successful submission to the admin channel
        const message = `*New Expense Submitted*
        
*Employee:* ${loggedInEmployee!.name}
*Category:* ${expenseData.category}
*Amount:* AED ${finalAmount.toLocaleString()}
*Description:* ${expenseData.description}

Please review it in the dashboard.`;
        await sendSystemTelegramNotification(message);

        revalidatePath('/dashboard/expenses');
        return { success: true, message: 'Expense submitted successfully.' };
    } catch (error: any) {
        console.error('Failed to add expense:', error);
        return { success: false, message: `Failed to add expense: ${error.message}` };
    }
}

export async function handleUpdateExpense(id: string, expenseData: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    
    const connection = require('@/lib/db-connection').getConnection();
    const [rows] = await (await connection).query('SELECT * FROM expenses WHERE id = ?', [id]);
    const originalExpense = (rows as any[])[0] as Expense;

    if (!originalExpense) {
        return { success: false, message: 'Expense not found.' };
    }

    const canApprove = hasPermission(loggedInEmployee, 'expenses:approve');
    const isOwner = originalExpense.employeeId === loggedInEmployee?.id;
    if (!canApprove && !(isOwner && originalExpense?.status === 'Needs Correction')) {
        return { success: false, message: 'Permission denied.' };
    }

    try {
        const dataToUpdate = { ...expenseData };

        if (dataToUpdate.baseAmount !== undefined && dataToUpdate.baseAmount !== null) {
             let finalAmount = dataToUpdate.baseAmount ?? 0;
             let taxAmount = 0;
            if (dataToUpdate.isVat) {
                taxAmount = dataToUpdate.baseAmount * 0.05;
                finalAmount += taxAmount;
            }
            dataToUpdate.amount = finalAmount;
            dataToUpdate.taxAmount = taxAmount;
        }
        
        if (isOwner && originalExpense?.status === 'Needs Correction' && !dataToUpdate.status) {
            dataToUpdate.status = 'Pending';
        }

        const updatedFieldsForLog: Record<string, {old: any, new: any}> = {};
        for (const key in dataToUpdate) {
            if (Object.prototype.hasOwnProperty.call(dataToUpdate, key) && (dataToUpdate as any)[key] !== (originalExpense as any)[key]) {
                updatedFieldsForLog[key] = {
                    old: (originalExpense as any)[key],
                    new: (dataToUpdate as any)[key]
                };
            }
        }

        await dbUpdateExpense(id, dataToUpdate);
        // تم تعطيل تسجيل المصروفات في السجل
        // await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_EXPENSE', 'Expense', id, { updatedFields: updatedFieldsForLog });

        // --- Add to expense history ---
        if (dataToUpdate.status && dataToUpdate.status !== originalExpense.status) {
            const actionMap: Record<string, string> = {
                'Approved': 'Approved',
                'Rejected': 'Rejected',
                'Needs Correction': 'Needs Correction',
                'Pending': 'Resubmitted'
            };
            
            await addExpenseHistory({
                expenseId: id,
                action: actionMap[dataToUpdate.status] || 'Submitted',
                performedBy: loggedInEmployee!.id,
                performedByName: loggedInEmployee!.name,
                notes: dataToUpdate.managerNotes || undefined,
                previousStatus: originalExpense.status,
                newStatus: dataToUpdate.status
            });
        }

        // --- Send Notifications based on status change ---
        if (dataToUpdate.status && dataToUpdate.status !== originalExpense.status) {
            if (dataToUpdate.status === 'Approved') {
                const message = `*Expense Approved!*
Your expense request for *${originalExpense.category}* (AED ${originalExpense.amount.toLocaleString()}) has been approved.`;
                await sendNotification(originalExpense.employeeId, 'expense_approved', message);
                
                // Create tax receipt if expense has VAT
                if (originalExpense.isVat && originalExpense.taxAmount && originalExpense.taxAmount > 0) {
                    await createTaxReceiptFromExpense(originalExpense, loggedInEmployee!);
                }
            } else if (dataToUpdate.status === 'Rejected') {
                 const message = `*Expense Rejected*
Your expense request for *${originalExpense.category}* (AED ${originalExpense.amount.toLocaleString()}) was rejected.
Manager Notes: ${dataToUpdate.managerNotes || 'No notes provided.'}`;
                await sendNotification(originalExpense.employeeId, 'expense_rejected', message);
            } else if (dataToUpdate.status === 'Needs Correction') {
                const message = `*Expense Needs Correction*
Your expense request for *${originalExpense.category}* (AED ${originalExpense.amount.toLocaleString()}) needs correction.
Manager Notes: ${dataToUpdate.managerNotes || 'No notes provided.'}`;
                await sendNotification(originalExpense.employeeId, 'expense_rejected', message);
            }
        }


        revalidatePath('/dashboard/expenses');
        return { success: true, message: 'Expense updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update expense:', error);
        return { success: false, message: `Failed to update expense: ${error.message}` };
    }
}

export async function handleDeleteExpense(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'expenses:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteExpense(id);
        // تم تعطيل تسجيل المصروفات في السجل
        // await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_EXPENSE', 'Expense', id);
        revalidatePath('/dashboard/expenses');
        return { success: true, message: 'Expense deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete expense:', error);
        return { success: false, message: `Failed to delete expense: ${error.message}` };
    }
}


// --- Maintenance Contract Actions ---

export async function handleAddMaintenanceContract(contractData: Partial<Omit<MaintenanceContract, 'id' | 'createdAt' | 'updatedAt'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'maintenance:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const baseAmount = Number(contractData.baseAmount) || 0;
        let finalAmount = baseAmount;
        let taxAmount = 0;

        if (contractData.isVat) {
            taxAmount = baseAmount * 0.05;
            finalAmount = baseAmount + taxAmount;
        }

        const dataToSave: Omit<MaintenanceContract, 'id' | 'createdAt' | 'updatedAt'> = {
            propertyId: contractData.propertyId!,
            serviceType: contractData.serviceType!,
            vendorName: contractData.vendorName!,
            startDate: contractData.startDate!,
            endDate: contractData.endDate!,
            contractAmount: finalAmount,
            paymentSchedule: contractData.paymentSchedule!,
            isVat: contractData.isVat ?? false,
            baseAmount: baseAmount,
            taxAmount: taxAmount,
            nextDueDate: contractData.nextDueDate ?? null,
            contractUrl: contractData.contractUrl ?? null,
            notes: contractData.notes ?? null,
        };

        await dbAddMaintenanceContract(dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_MAINTENANCE_CONTRACT', 'MaintenanceContract', undefined, { vendor: contractData.vendorName, service: contractData.serviceType });
        revalidatePath('/dashboard/maintenance');
        return { success: true, message: 'Contract added successfully.' };
    } catch (error: any) {
        console.error('Failed to add contract:', error);
        return { success: false, message: `Failed to add contract: ${error.message}` };
    }
}

export async function handleUpdateMaintenanceContract(id: string, contractData: Partial<Omit<MaintenanceContract, 'id' | 'createdAt' | 'updatedAt'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'maintenance:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToUpdate = { ...contractData };

        if (dataToUpdate.baseAmount !== undefined) {
             const baseAmount = Number(dataToUpdate.baseAmount) || 0;
             let finalAmount = baseAmount;
             let taxAmount = 0;
            if (dataToUpdate.isVat) {
                taxAmount = baseAmount * 0.05;
                finalAmount = baseAmount + taxAmount;
            }
            dataToUpdate.contractAmount = finalAmount;
            dataToUpdate.taxAmount = taxAmount;
        }

        await dbUpdateMaintenanceContract(id, dataToUpdate);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_MAINTENANCE_CONTRACT', 'MaintenanceContract', id, { updatedFields: Object.keys(dataToUpdate) });
        revalidatePath('/dashboard/maintenance');
        return { success: true, message: 'Contract updated successfully.' };
    } catch (error) {
        console.error('Failed to update contract:', error);
        return { success: false, message: 'Failed to update contract.' };
    }
}

export async function handleDeleteMaintenanceContract(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'maintenance:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteMaintenanceContract(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_MAINTENANCE_CONTRACT', 'MaintenanceContract', id);
        revalidatePath('/dashboard/maintenance');
        return { success: true, message: 'Contract deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete contract:', error);
        return { success: false, message: 'Failed to delete contract.' };
    }
}


// --- Asset Actions ---

export async function handleAddAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'assets:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToSave = {
            ...assetData,
            purchasePrice: assetData.purchasePrice || null,
        }
        await dbAddAsset(dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_ASSET', 'Asset', undefined, { name: assetData.name, category: assetData.category });
        revalidatePath('/dashboard/assets');
        return { success: true, message: 'Asset added successfully.' };
    } catch (error) {
        console.error('Failed to add asset:', error);
        return { success: false, message: 'Failed to add asset.' };
    }
}

export async function handleUpdateAsset(id: string, assetData: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{success: boolean, message: string}> {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'assets:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToSave = {
            ...assetData,
            purchasePrice: assetData.purchasePrice || null,
        }
        await dbUpdateAsset(id, dataToSave);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_ASSET', 'Asset', id, { updatedFields: Object.keys(dataToSave) });
        revalidatePath('/dashboard/assets');
        return { success: true, message: 'Asset updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update asset:', error);
        return { success: false, message: `Failed to update asset: ${error.message}` };
    }
}

export async function handleDeleteAsset(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'assets:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteAsset(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_ASSET', 'Asset', id);
        revalidatePath('/dashboard/assets');
        return { success: true, message: 'Asset deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete asset:', error);
        return { success: false, message: 'Failed to delete asset.' };
    }
}

// --- Payee Actions ---

export async function handleAddPayee(payeeData: Omit<Payee, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:create')) { // Payees are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbAddPayee(payeeData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_PAYEE', 'Payee', undefined, { name: payeeData.name });
        revalidatePath('/dashboard/payees');
        return { success: true, message: 'Payee added successfully.' };
    } catch (error) {
        console.error('Failed to add payee:', error);
        return { success: false, message: 'Failed to add payee.' };
    }
}

export async function handleUpdatePayee(id: string, payeeData: Omit<Payee, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) { // Payees are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbUpdatePayee(id, payeeData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_PAYEE', 'Payee', id, { updatedFields: Object.keys(payeeData) });
        revalidatePath('/dashboard/payees');
        return { success: true, message: 'Payee updated successfully.' };
    } catch (error) {
        console.error('Failed to update payee:', error);
        return { success: false, message: 'Failed to update payee.' };
    }
}

export async function handleDeletePayee(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:delete')) { // Payees are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeletePayee(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_PAYEE', 'Payee', id);
        revalidatePath('/dashboard/payees');
        return { success: true, message: 'Payee deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete payee:', error);
        return { success: false, message: 'Failed to delete payee.' };
    }
}

// --- Bank Actions ---

export async function handleAddBank(bankData: Omit<Bank, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:create')) { // Banks are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbAddBank(bankData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_BANK', 'Bank', undefined, { name: bankData.name });
        revalidatePath('/dashboard/banks');
        return { success: true, message: 'Bank added successfully.' };
    } catch (error) {
        console.error('Failed to add bank:', error);
        return { success: false, message: 'Failed to add bank.' };
    }
}

export async function handleUpdateBank(id: string, bankData: Omit<Bank, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) { // Banks are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbUpdateBank(id, bankData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_BANK', 'Bank', id, { updatedFields: Object.keys(bankData) });
        revalidatePath('/dashboard/banks');
        return { success: true, message: 'Bank updated successfully.' };
    } catch (error) {
        console.error('Failed to update bank:', error);
        return { success: false, message: 'Failed to update bank.' };
    }
}

export async function handleDeleteBank(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:delete')) { // Banks are for cheques
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteBank(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_BANK', 'Bank', id);
        revalidatePath('/dashboard/banks');
        return { success: true, message: 'Bank deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete bank:', error);
        return { success: false, message: 'Failed to delete bank.' };
    }
}

// --- Cheque Actions ---

async function updateChequeStatus(chequeId: string) {
    const cheque = await getChequeById(chequeId);
    if (!cheque) return;

    const paidAmount = cheque.totalPaidAmount ?? 0;
    
    let newStatus = cheque.status;
    if (paidAmount >= cheque.amount) {
        newStatus = 'Cleared';
    } else if (paidAmount > 0) {
        newStatus = 'Partially Paid';
    } else {
        newStatus = 'Pending';
    }
    
    if (newStatus !== cheque.status) {
        await dbUpdateCheque(chequeId, { status: newStatus });
    }
}


export async function handleAddCheque(chequeData: Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbAddCheque(chequeData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_CHEQUE', 'Cheque', undefined, { amount: chequeData.amount, dueDate: chequeData.dueDate });
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Cheque added successfully.' };
    } catch (error: any) {
        console.error('Failed to add cheque:', error);
        return { success: false, message: `Failed to add cheque: ${error.message}` };
    }
}

export async function handleUpdateCheque(id: string, chequeData: Partial<Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{success: boolean, message: string}> {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbUpdateCheque(id, chequeData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_CHEQUE', 'Cheque', id, { updatedFields: Object.keys(chequeData) });
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Cheque updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update cheque:', error);
        return { success: false, message: `Failed to update cheque: ${error.message}` };
    }
}

export async function handleDeleteCheque(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteCheque(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_CHEQUE', 'Cheque', id);
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Cheque deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete cheque:', error);
        return { success: false, message: 'Failed to delete cheque.' };
    }
}

export async function handleAddChequeTransaction(transactionData: Omit<ChequeTransaction, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) { // Assuming this permission for transactions
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await addChequeTransaction(transactionData);
        await updateChequeStatus(transactionData.chequeId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ADD_CHEQUE_TRANSACTION', 'Cheque', transactionData.chequeId, { amount: transactionData.amountPaid });
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Transaction added successfully.' };
    } catch (error: any) {
        return { success: false, message: `Failed to add transaction: ${error.message}` };
    }
}

export async function handleUpdateChequeTransaction(transactionId: string, transactionData: Partial<Omit<ChequeTransaction, 'id' | 'chequeId'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const connection = require('@/lib/db-connection').getConnection();
        const [rows] = await (await connection).query('SELECT chequeId FROM cheque_transactions WHERE id = ?', [transactionId]);
        if ((rows as any[]).length === 0) {
             return { success: false, message: 'Transaction not found.' };
        }
        const chequeId = (rows as any)[0].chequeId;

        await updateChequeTransaction(transactionId, transactionData);
        await updateChequeStatus(chequeId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_CHEQUE_TRANSACTION', 'ChequeTransaction', transactionId, { updatedFields: Object.keys(transactionData) });
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Transaction updated successfully.' };
    } catch (error: any) {
        return { success: false, message: `Failed to update transaction: ${error.message}` };
    }
}

export async function handleDeleteChequeTransaction(transactionId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'cheques:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const connection = require('@/lib/db-connection').getConnection();
        const [rows] = await (await connection).query('SELECT chequeId FROM cheque_transactions WHERE id = ?', [transactionId]);
        if ((rows as any[]).length === 0) {
             return { success: false, message: 'Transaction not found.' };
        }
        const chequeId = (rows as any)[0].chequeId;

        await deleteChequeTransaction(transactionId);
        await updateChequeStatus(chequeId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_CHEQUE_TRANSACTION', 'ChequeTransaction', transactionId);
        revalidatePath('/dashboard/cheques');
        return { success: true, message: 'Transaction deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: `Failed to delete transaction: ${error.message}` };
    }
}

// --- Activity Log Actions ---

export async function handleDeleteActivityLog(logId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await deleteActivityLog(logId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_ACTIVITY_LOG', 'ActivityLog', logId);
        revalidatePath('/dashboard/settings/log-analyzer');
        return { success: true, message: 'Activity log deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete activity log:', error);
        return { success: false, message: `Failed to delete activity log: ${error.message}` };
    }
}

export async function handleDeleteAllActivityLogs() {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await deleteAllActivityLogs();
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_ALL_ACTIVITY_LOGS', 'ActivityLog', 'all');
        revalidatePath('/dashboard/settings/log-analyzer');
        return { success: true, message: 'All activity logs deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete all activity logs:', error);
        return { success: false, message: `Failed to delete all activity logs: ${error.message}` };
    }
}

export async function getSystemDataReport() {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'ليس لديك صلاحية.', data: null };
    }
    
    try {
        const connection = await getConnection();
        
        const report: any = {
            properties: 0,
            units: 0,
            tenants: 0,
            leases: 0,
            expenses: 0,
            cheques: 0,
            payments: 0,
            owners: 0,
            assets: 0,
            employeeProperties: 0,
            activityLogs: 0,
            maintenanceRequests: 0,
            legalCases: 0
        };
        
        const tables = [
            { key: 'properties', table: 'properties' },
            { key: 'units', table: 'units' },
            { key: 'tenants', table: 'tenants' },
            { key: 'leases', table: 'leases' },
            { key: 'expenses', table: 'expenses' },
            { key: 'cheques', table: 'cheques' },
            { key: 'payments', table: 'payments' },
            { key: 'owners', table: 'owners' },
            { key: 'assets', table: 'assets' },
            { key: 'employeeProperties', table: 'employee_properties' },
            { key: 'activityLogs', table: 'activity_logs' },
            { key: 'maintenanceRequests', table: 'maintenance_requests' },
            { key: 'legalCases', table: 'legal_cases' }
        ];
        
        for (const { key, table } of tables) {
            try {
                const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
                report[key] = (rows as any)[0].count;
            } catch (e) {
                report[key] = 0;
            }
        }
        
        return { success: true, data: report };
    } catch (error: any) {
        console.error('Failed to get system data report:', error);
        return { success: false, message: error.message, data: null };
    }
}

export async function handleDeleteAllSystemData() {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'ليس لديك صلاحية حذف البيانات.' };
    }
    
    try {
        const connection = await getConnection();
        
        // الحذف بالترتيب الصحيح لتجنب مشاكل Foreign Keys
        const tables = [
            'payments',
            'cheques',
            'expenses',
            'assets',
            'maintenance_requests',
            'legal_cases',
            'activity_logs',
            'leases',
            'units',
            'properties',
            'tenants',
            'owners',
            'employee_properties'
        ];
        
        let totalDeleted = 0;
        const deletedCounts: any = {};
        
        for (const table of tables) {
            try {
                const [result] = await connection.execute(`DELETE FROM ${table}`);
                const count = (result as any).affectedRows;
                deletedCounts[table] = count;
                totalDeleted += count;
            } catch (e: any) {
                console.error(`Error deleting from ${table}:`, e.message);
                deletedCounts[table] = 0;
            }
        }
        
        await logActivity(
            loggedInEmployee!.id, 
            loggedInEmployee!.name, 
            'DELETE_ALL_SYSTEM_DATA', 
            'System', 
            'all',
            { totalDeleted, tables: deletedCounts }
        );
        
        revalidatePath('/dashboard');
        
        return { 
            success: true, 
            message: `تم حذف ${totalDeleted} سجل بنجاح.`,
            deletedCounts 
        };
    } catch (error: any) {
        console.error('Failed to delete all system data:', error);
        return { 
            success: false, 
            message: `فشل حذف البيانات: ${error.message}` 
        };
    }
}

// --- Owner Actions ---

export async function handleAddOwner(ownerData: Omit<Owner, 'id'>) {
    console.log('handleAddOwner - Start, ownerData:', ownerData);
    
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:create')) { // Owners are tied to properties
        console.log('handleAddOwner - Permission denied');
        return { success: false, message: 'Permission denied.' };
    }
    
    console.log('handleAddOwner - Permission granted, logged in employee:', loggedInEmployee?.id, loggedInEmployee?.name);
    
    try {
        const dataToSave = {
            ...ownerData,
            contact: ownerData.contact || null,
            email: ownerData.email || null,
            nationality: ownerData.nationality || null,
            emiratesId: ownerData.emiratesId || null,
            emiratesIdUrl: ownerData.emiratesIdUrl || null,
            taxNumber: ownerData.taxNumber || null,
        };
        
        console.log('handleAddOwner - Data to save:', dataToSave);
        await dbAddOwner(dataToSave);
        console.log('handleAddOwner - Owner added to database successfully');
        
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_OWNER', 'Owner', undefined, { name: ownerData.name });
        console.log('handleAddOwner - Activity logged');
        
        revalidatePath('/dashboard/owners');
        console.log('handleAddOwner - Path revalidated');
        
        return { success: true, message: 'Owner added successfully.' };
    } catch (error: any) {
        console.error('Failed to add owner to database:', error);
        
        // Check if it's a database column error - allow demo mode
        if (error.message && error.message.includes("Unknown column")) {
            console.log('handleAddOwner - Database schema mismatch, allowing operation in demo mode');
            
            // Return success for demo mode - the client will handle adding to local state
            return { 
                success: true, 
                message: 'تمت إضافة المالك بنجاح (وضع التجريبي - لن يتم حفظ البيانات بشكل دائم)\n\nOwner added successfully (Demo mode - data will not be saved permanently)' 
            };
        }
        
        // Check if it's a connection error - allow demo mode
        if (error.message && error.message.includes("connect")) {
            console.log('handleAddOwner - Database unavailable, allowing operation in demo mode');
            
            return { 
                success: true, 
                message: 'تمت إضافة المالك بنجاح (وضع التجريبي - قاعدة البيانات غير متصلة)\n\nOwner added successfully (Demo mode - database not connected)' 
            };
        }
        
        // For other errors, show the error message
        return { success: false, message: `Failed to add owner: ${error.message}` };
    }
}

export async function handleUpdateOwner(id: string, ownerData: Partial<Omit<Owner, 'id'>>): Promise<{success: boolean, message: string}> {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:update')) { // Owners are tied to properties
        return { success: false, message: 'Permission denied.' };
    }
    try {
        const dataToUpdate = { 
            ...ownerData,
            contact: ownerData.contact || null,
            email: ownerData.email || null,
            nationality: ownerData.nationality || null,
            emiratesId: ownerData.emiratesId || null,
            emiratesIdUrl: ownerData.emiratesIdUrl || null,
            taxNumber: ownerData.taxNumber || null,
        };

        await dbUpdateOwner(id, dataToUpdate);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_OWNER', 'Owner', id, { updatedFields: Object.keys(dataToUpdate) });
        revalidatePath('/dashboard/owners');
        return { success: true, message: 'Owner updated successfully.' };
    } catch (error: any) {
        console.error('Failed to update owner:', error);
        
        // Enhanced error message to identify the problematic field
        let errorMessage = `Failed to update owner: ${error.message}`;
        
        // Check if it's a database column error
        if (error.message && error.message.includes("Unknown column")) {
            const columnMatch = error.message.match(/Unknown column '(\w+)'/);
            if (columnMatch) {
                const columnName = columnMatch[1];
                const fieldNames: Record<string, string> = {
                    'contact': 'رقم الاتصال (Contact Number)',
                    'email': 'البريد الإلكتروني (Email)',
                    'nationality': 'الجنسية (Nationality)',
                    'emiratesId': 'الهوية الإماراتية (Emirates ID)',
                    'taxNumber': 'الرقم الضريبي (Tax Number)',
                    'name': 'اسم المالك (Owner Name)',
                };
                const fieldName = fieldNames[columnName] || columnName;
                errorMessage = `خطأ في قاعدة البيانات: الحقل "${fieldName}" غير موجود في جدول المالكين. يرجى التواصل مع مسؤول النظام.\n\nDatabase Error: Field "${fieldName}" is missing from the owners table. Please contact the system administrator.`;
            }
        }
        
        return { success: false, message: errorMessage };
    }
}

export async function handleDeleteOwner(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:delete')) { // Owners are tied to properties
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteOwner(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_OWNER', 'Owner', id);
        revalidatePath('/dashboard/owners');
        return { success: true, message: 'Owner deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete owner:', error);
        return { success: false, message: `Failed to delete owner: ${error.message}` };
    }
}

// --- Tax Receipt Actions ---

export async function createTaxReceiptFromExpense(expense: any, approvedBy: any) {
    try {
        // Check if expense has VAT and tax amount
        if (!expense.isVat || !expense.taxAmount || expense.taxAmount <= 0) {
            console.log('No VAT amount in expense, skipping tax receipt creation');
            return;
        }

        // Get property, unit, lease, and owner details
        const { getPropertyById } = await import('@/lib/db');
        const property = await getPropertyById(expense.propertyId);
        const employee = await getEmployeeById(expense.employeeId);
        
        if (!property || !employee) {
            console.error('Property or employee not found for tax receipt creation');
            return;
        }

        // Get owner details from property
        const connection = await require('@/lib/db-connection').getConnection();
        const [ownerRows] = await connection.query(
            'SELECT * FROM owners WHERE id = ?',
            [property.ownerId]
        );
        const owner = (ownerRows as any[])[0];

        // Check if owner has tax number
        if (!owner || !owner.taxNumber) {
            console.log('Owner does not have tax number, skipping tax receipt creation');
            return;
        }

        // Get lease details if unit is specified (for commercial name)
        let businessName = '';
        let unitInfo = '';
        if (expense.unitId) {
            const [leaseRows] = await connection.query(`
                SELECT l.*, u.number as unitNumber
                FROM leases l
                LEFT JOIN units u ON l.unitId = u.id
                WHERE l.unitId = ? AND l.status = 'Active'
                ORDER BY l.createdAt DESC
                LIMIT 1
            `, [expense.unitId]);
            
            if ((leaseRows as any[]).length > 0) {
                const lease = (leaseRows as any[])[0];
                businessName = lease.businessName || '';
                unitInfo = lease.unitNumber ? ` - وحدة رقم ${lease.unitNumber}` : '';
            }
        }

        // Generate invoice number
        const invoiceNumber = `TR-${Date.now().toString().slice(-6)}`;
        
        // Create tax receipt data
        const taxReceiptData = {
            invoiceNumber,
            customerName: owner.name || 'مالك العقار',
            customerAddress: owner.address || property.address || 'Umm Al-Quwain, UAE',
            customerTRN: owner.taxNumber,
            serviceDescription: businessName 
                ? `${businessName}${unitInfo} - ${expense.category} - ${expense.description || 'لا يوجد وصف'}`
                : `${property.name || 'عقار'}${unitInfo} - ${expense.category} - ${expense.description || 'لا يوجد وصف'}`,
            invoiceAmount: expense.baseAmount || expense.amount - (expense.taxAmount || 0),
            vatAmount: expense.taxAmount || 0,
            totalAmount: expense.amount,
            amountInWords: convertAmountToWords(expense.amount),
            invoiceDate: new Date().toISOString().split('T')[0],
            trnNumber: '100427200900003',
            bankDetails: {
                bank: 'ADIB Bank',
                accountHolder: 'Abdulla Mohamed Ali Omair AL Ali',
                accountNumber: '18860565',
                iban: 'AE76500000000188650565',
                swiftCode: 'ADIBUQWA',
                branch: 'Umm AL Quwain'
            },
            contactDetails: {
                location: 'Umm Al-Quwain - UAE',
                poBox: '125',
                phones: ['050-6332331', '050-6271221', '055-6271211'],
                emails: ['uaq79000@gmail.com', 'uaq42000@hotmail.com']
            },
            expenseId: expense.id,
            ownerId: owner.id,
            ownerName: owner.name,
            propertyName: property.name,
            businessName: businessName,
            createdAt: new Date().toISOString().split('T')[0]
        };

        // Store in localStorage for now (in a real app, this would be stored in database)
        if (typeof window !== 'undefined') {
            const existingReceipts = JSON.parse(localStorage.getItem('taxReceipts') || '[]');
            existingReceipts.unshift(taxReceiptData);
            localStorage.setItem('taxReceipts', JSON.stringify(existingReceipts));
        }

        // Log activity
        await logActivity(
            approvedBy.id, 
            approvedBy.name, 
            'CREATE_TAX_RECEIPT', 
            'TaxReceipt', 
            invoiceNumber, 
            { 
                expenseId: expense.id, 
                amount: expense.amount,
                vatAmount: expense.taxAmount,
                ownerId: owner.id,
                ownerName: owner.name,
                ownerTRN: owner.taxNumber
            }
        );

        // Send notification about tax receipt creation
        const message = `*تم إنشاء إيصال ضريبي تلقائياً*

*رقم الإيصال:* ${invoiceNumber}
*المالك:* ${owner.name}
*الرقم الضريبي:* ${owner.taxNumber}
${businessName ? `*الاسم التجاري:* ${businessName}` : ''}
*المبلغ الإجمالي:* AED ${expense.amount.toLocaleString()}
*مبلغ الضريبة:* AED ${(expense.taxAmount || 0).toLocaleString()}

يمكنك عرضه في قسم الإيصالات الضريبية.`;
        
        await sendSystemTelegramNotification(message);

        console.log('Tax receipt created successfully:', invoiceNumber);
        return invoiceNumber;
    } catch (error) {
        console.error('Failed to create tax receipt:', error);
    }
}

function convertAmountToWords(amount: number): string {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
    
    if (amount === 0) return 'صفر درهم إماراتي';
    if (amount < 10) return `${ones[amount]} درهم إماراتي`;
    if (amount < 100) {
        const ten = Math.floor(amount / 10);
        const one = amount % 10;
        if (one === 0) return `${tens[ten]} درهم إماراتي`;
        return `${ones[one]} و ${tens[ten]} درهم إماراتي`;
    }
    if (amount < 1000) {
        const hundred = Math.floor(amount / 100);
        const remainder = amount % 100;
        if (remainder === 0) return `${hundreds[hundred]} درهم إماراتي`;
        return `${hundreds[hundred]} و ${convertAmountToWords(remainder)}`;
    }
    if (amount < 10000) {
        const thousand = Math.floor(amount / 1000);
        const remainder = amount % 1000;
        if (remainder === 0) return `${ones[thousand]} ألف درهم إماراتي`;
        return `${ones[thousand]} ألف و ${convertAmountToWords(remainder)}`;
    }
    
    return `${amount.toLocaleString()} درهم إماراتي`;
}

// --- Property Document Actions ---
export async function handleAddPropertyDocument(formData: FormData) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:documents:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    const propertyId = formData.get('propertyId') as string;
    const documentName = formData.get('documentName') as string;

    const uploadResult = await uploadFile(formData, 'document', 'properties');
    if (!uploadResult.success || !uploadResult.filePath) {
        return { success: false, message: uploadResult.message };
    }

    try {
        const docData = {
            propertyId,
            documentName,
            documentUrl: uploadResult.filePath,
        };
        await addPropertyDocument(docData);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'ADD_PROPERTY_DOCUMENT', 'Property', propertyId, { documentName });
        revalidatePath(`/dashboard/properties/${propertyId}`);
        return { success: true, message: 'Document uploaded successfully.' };
    } catch (error: any) {
        console.error('Failed to add property document:', error);
        return { success: false, message: `Failed to save document record: ${error.message}` };
    }
}

export async function handleDeletePropertyDocument(documentId: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:documents:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        // In a real app, you might want to delete the file from storage as well.
        await deletePropertyDocument(documentId);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_PROPERTY_DOCUMENT', 'PropertyDocument', documentId);
        revalidatePath('/dashboard/properties', 'layout'); // Revalidate the whole layout
        return { success: true, message: 'Document deleted successfully.' };
    } catch (error: any) {
        console.error('Failed to delete property document:', error);
        return { success: false, message: `Failed to delete document: ${error.message}` };
    }
}


// --- Bulk Import/Export Actions ---

type ImportType = 'properties' | 'units' | 'tenants' | 'owners';

export async function downloadTemplateAction(type: ImportType) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'bulk-import:execute')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        let headers: string[] = [];
        let fileName = `${type}_template.xlsx`;

        switch (type) {
            case 'properties':
                headers = ['name', 'type', 'address', 'status', 'purpose', 'price', 'size', 'sizeUnit', 'description', 'floors', 'rooms', 'configuration', 'latitude', 'longitude', 'accountNumber'];
                break;
            case 'units':
                headers = ['propertyId', 'unitNumber', 'type', 'status', 'size', 'sizeUnit', 'price', 'description', 'floor', 'accountNumber'];
                break;
            case 'tenants':
                headers = ['name', 'email', 'password', 'phone', 'idNumber', 'idType', 'nationality', 'allowLogin'];
                break;
            case 'owners':
                headers = ['name', 'contact', 'email', 'nationality', 'emiratesId', 'taxNumber'];
                break;
        }

        const ws = xlsx.utils.aoa_to_sheet([headers]);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return {
            success: true,
            file: Array.from(new Uint8Array(buf)),
            fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    } catch (error: any) {
        console.error(`Failed to download ${type} template:`, error);
        return { success: false, message: `Failed to download ${type} template: ${error.message}` };
    }
}

export async function uploadFileAction(type: ImportType, formData: FormData) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'bulk-import:execute')) {
        return { success: false, message: 'Permission denied.' };
    }

    const file = formData.get('file') as File | null;
    if (!file) {
        return { success: false, message: 'No file uploaded.' };
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: `File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
    }


    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = data[0] as string[];
        const rows = data.slice(1);

        let count = 0;
        for (const row of rows) {
            const rowData = (row as any[]).reduce((obj, val, i) => {
                obj[headers[i]] = val;
                return obj;
            }, {} as Record<string, any>);

            switch (type) {
                case 'properties':
                    await dbAddProperty(rowData as Omit<Property, 'id'>);
                    break;
                case 'units':
                    await dbAddUnit(rowData as Omit<Unit, 'id'>);
                    break;
                case 'tenants':
                    await dbAddTenant(rowData as any);
                    break;
                case 'owners':
                    await dbAddOwner(rowData as Omit<Owner, 'id'>);
                    break;
            }
            count++;
        }
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'BULK_IMPORT', type, undefined, { importedCount: count });
        revalidatePath('/dashboard');
        return { success: true, message: `Successfully imported ${count} ${type}.` };

    } catch (error: any) {
        console.error(`Failed to upload ${type}:`, error);
        return { success: false, message: `Failed to process file: ${error.message}` };
    }
}

// --- Reporting Actions ---
type ReportType = 'properties' | 'units' | 'tenants' | 'leases' | 'expenses' | 'cheques';

export async function generateReportAction(type: ReportType) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'reporting:execute')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        let data: any[] = [];
        let fileName = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;

        switch (type) {
            case 'properties':
                data = await getProperties();
                break;
            case 'units':
                const properties = await getProperties();
                const allUnits = await Promise.all(properties.map(p => getUnitsForProperty(p.id)));
                data = allUnits.flat();
                break;
            case 'tenants':
                data = await getTenants();
                break;
            case 'leases':
                 const leases = await getLeasesWithDetails();
                 data = leases.map(d => ({
                    leaseId: d?.lease.id,
                    property: d?.property.name,
                    unit: d?.unit.unitNumber,
                    tenant: d?.tenant.name,
                    status: d?.lease.status,
                    startDate: d?.lease.startDate,
                    endDate: d?.lease.endDate,
                    totalAmount: d?.lease.totalLeaseAmount,
                    totalPaidAmount: d?.lease.totalPaidAmount,
                    missingAttachmentsCount: d?.lease.missingAttachmentsCount
                 }));
                break;
            case 'expenses':
                data = await getExpenses();
                break;
            case 'cheques':
                data = await getCheques();
                break;
        }

        // Sanitize data for worksheet
        const sanitizedData = data.map(item => {
            const newItem: {[key: string]: any} = {};
            for (const key in item) {
                if (typeof item[key] === 'object' && item[key] !== null && !(item[key] instanceof Date)) {
                    newItem[key] = JSON.stringify(item[key]);
                } else {
                    newItem[key] = item[key];
                }
            }
            return newItem;
        });

        const ws = xlsx.utils.json_to_sheet(sanitizedData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'GENERATE_REPORT', type, undefined, { rowCount: data.length });
        return {
            success: true,
            file: Array.from(new Uint8Array(buf)),
            fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    } catch (error: any) {
        console.error(`Failed to generate ${type} report:`, error);
        return { success: false, message: `Failed to generate ${type} report: ${error.message}` };
    }
}

export async function generateTaxReportAction(reportType: 'revenue' | 'expenses', fromDate: Date, toDate: Date) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'reporting:execute')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        let data: any[] = [];
        let fileName = `${reportType}_tax_report_${new Date().toISOString().split('T')[0]}.xlsx`;

        if (reportType === 'revenue') {
            const connection = require('@/lib/db-connection').getConnection();
            const [rows] = await (await connection).query(`
                SELECT 
                    pt.paymentDate,
                    p.name as propertyName,
                    u.unitNumber,
                    t.name as tenantName,
                    l.totalLeaseAmount,
                    l.taxedAmount,
                    lp.amount as installmentAmount,
                    pt.amountPaid
                FROM payment_transactions pt
                JOIN lease_payments lp ON pt.leasePaymentId = lp.id
                JOIN leases l ON lp.leaseId = l.id
                JOIN units u ON l.unitId = u.id
                JOIN properties p ON u.propertyId = p.id
                JOIN tenants t ON l.tenantId = t.id
                WHERE pt.paymentDate BETWEEN ? AND ?
                AND l.taxedAmount > 0;
            `, [fromDate, toDate]);
            
            data = (rows as any[]).map(row => {
                const proportionOfTaxable = row.totalLeaseAmount > 0 ? (row.taxedAmount / row.totalLeaseAmount) : 0;
                const taxableAmountOfPayment = row.amountPaid * proportionOfTaxable;
                const vatAmount = taxableAmountOfPayment * 0.05;
                return {
                    'Payment Date': row.paymentDate,
                    'Property': row.propertyName,
                    'Unit': row.unitNumber,
                    'Tenant': row.tenantName,
                    'Amount Paid': row.amountPaid,
                    'Taxable Portion': taxableAmountOfPayment,
                    'Output VAT (5%)': vatAmount
                }
            });

        } else if (reportType === 'expenses') {
             const expenses = await getExpenses();
             const filteredExpenses = expenses.filter(e => 
                e.status === 'Approved' && 
                e.isVat && 
                new Date(e.createdAt) >= fromDate && 
                new Date(e.createdAt) <= toDate
             );
             data = filteredExpenses.map(e => ({
                'Expense Date': e.createdAt,
                'Category': e.category,
                'Supplier': e.supplier,
                'Supplier TRN': e.taxNumber,
                'Property': e.propertyName,
                'Description': e.description,
                'Base Amount': e.baseAmount,
                'VAT Amount': e.taxAmount
             }));
        }

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, reportType.charAt(0).toUpperCase() + reportType.slice(1));
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'GENERATE_TAX_REPORT', reportType, undefined, { rowCount: data.length });
        return {
            success: true,
            file: Array.from(new Uint8Array(buf)),
            fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

    } catch (error: any) {
        console.error(`Failed to generate ${reportType} tax report:`, error);
        return { success: false, message: `Failed to generate tax report: ${error.message}` };
    }
}


// --- Settings Actions ---

export async function handleAddUnitConfiguration(config: Omit<UnitConfiguration, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbAddUnitConfiguration(config);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_UNIT_CONFIGURATION', 'UnitConfiguration', undefined, { name: config.name });
        revalidatePath('/dashboard/settings/unit-configurations');
        return { success: true, message: 'Configuration added successfully.' };
    } catch (error: any) {
        return { success: false, message: error.code === 'ER_DUP_ENTRY' ? 'This configuration name already exists.' : 'Failed to add configuration.' };
    }
}

export async function handleUpdateUnitConfiguration(id: string, config: Partial<Omit<UnitConfiguration, 'id'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbUpdateUnitConfiguration(id, config);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_UNIT_CONFIGURATION', 'UnitConfiguration', id, { updatedFields: Object.keys(config) });
        revalidatePath('/dashboard/settings/unit-configurations');
        return { success: true, message: 'Configuration updated successfully.' };
    } catch (error: any) {
        return { success: false, message: error.code === 'ER_DUP_ENTRY' ? 'This configuration name already exists.' : 'Failed to update configuration.' };
    }
}

export async function handleDeleteUnitConfiguration(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'settings:manage')) {
        return { success: false, message: 'Permission denied.' };
    }
    try {
        await dbDeleteUnitConfiguration(id);
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_UNIT_CONFIGURATION', 'UnitConfiguration', id);
        revalidatePath('/dashboard/settings/unit-configurations');
        return { success: true, message: 'Configuration deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete configuration.' };
    }
}

// --- Unit Actions ---

export async function addUnit(unitData: Omit<Unit, 'id'>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    const result = await dbAddUnit(unitData);
    if (result.success) {
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_UNIT', 'Unit', undefined, { propertyId: unitData.propertyId, unitNumber: unitData.unitNumber });
    }
    return result;
}

export async function updateUnit(id: string, unitData: Partial<Omit<Unit, 'id'>>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'properties:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    const result = await dbUpdateUnit(id, unitData);
    if (result.success) {
        await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_UNIT', 'Unit', id, { updatedFields: Object.keys(unitData) });
    }
    return result;
}

// --- Notification Actions ---

export async function sendTestTelegramMessage(): Promise<{ success: boolean; message: string }> {
    const employee = await getEmployeeFromSession();
    if (!employee) {
        return { success: false, message: 'Authentication required.' };
    }

    const { telegramBotToken, telegramChannelId } = employee;

    if (!telegramBotToken || !telegramChannelId) {
        return { success: false, message: 'Your Telegram Bot Token and Channel ID are not configured.' };
    }

    const message = `Hello, ${employee.name}! This is a test notification from EstateFlow.`;
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramChannelId,
                text: message,
            }),
        });

        const result = await response.json();

        if (result.ok) {
            await logActivity(employee.id, employee.name, 'SEND_TEST_TELEGRAM_SUCCESS', 'Employee', employee.id);
            return { success: true, message: 'Test message sent successfully to your Telegram channel.' };
        } else {
            console.error('Telegram API Error:', result);
            await logActivity(employee.id, employee.name, 'SEND_TEST_TELEGRAM_FAILURE', 'Employee', employee.id, { error: result.description });
            return { success: false, message: `Telegram API Error: ${result.description}` };
        }
    } catch (error: any) {
        console.error('Failed to send Telegram message:', error);
        return { success: false, message: `An unexpected error occurred: ${error.message}` };
    }
}

// --- Eviction Request Actions ---

export async function handleAddEvictionRequest(evictionData: {
    tenantId?: string;
    tenantName: string;
    propertyName: string;
    unitNumber: string;
    reason: string;
    description?: string;
    dueAmount?: number;
    submittedDate: string;
}) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'legal:eviction:create')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        const dataToSave = {
            tenantId: evictionData.tenantId || null,
            tenantName: evictionData.tenantName,
            propertyName: evictionData.propertyName,
            unitNumber: evictionData.unitNumber,
            reason: evictionData.reason,
            description: evictionData.description || null,
            dueAmount: evictionData.dueAmount || 0,
            status: 'pending' as const,
            submittedDate: new Date(evictionData.submittedDate),
            createdById: loggedInEmployee!.id,
        };

        const result = await dbAddEvictionRequest(dataToSave);
        
        if (result.success) {
            await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'CREATE_EVICTION_REQUEST', 'EvictionRequest', result.id!, { 
                tenantName: evictionData.tenantName,
                reason: evictionData.reason,
                propertyName: evictionData.propertyName,
                unitNumber: evictionData.unitNumber
            });
            
            revalidatePath('/dashboard/legal/eviction');
            return { success: true, message: 'Eviction request created successfully.' };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error: any) {
        console.error('Failed to add eviction request:', error);
        return { success: false, message: `Failed to add eviction request: ${error.message}` };
    }
}

export async function handleUpdateEvictionRequest(id: string, evictionData: Partial<{
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    reason: string;
    description: string;
    dueAmount: number;
}>) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'legal:eviction:update')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        const result = await dbUpdateEvictionRequest(id, evictionData);
        
        if (result.success) {
            await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'UPDATE_EVICTION_REQUEST', 'EvictionRequest', id, { 
                updatedFields: Object.keys(evictionData)
            });
            
            revalidatePath('/dashboard/legal/eviction');
            return { success: true, message: 'Eviction request updated successfully.' };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error: any) {
        console.error('Failed to update eviction request:', error);
        return { success: false, message: `Failed to update eviction request: ${error.message}` };
    }
}

export async function handleDeleteEvictionRequest(id: string) {
    const loggedInEmployee = await getEmployeeFromSession();
    if (!hasPermission(loggedInEmployee, 'legal:eviction:delete')) {
        return { success: false, message: 'Permission denied.' };
    }
    
    try {
        const result = await dbDeleteEvictionRequest(id);
        
        if (result.success) {
            await logActivity(loggedInEmployee!.id, loggedInEmployee!.name, 'DELETE_EVICTION_REQUEST', 'EvictionRequest', id);
            
            revalidatePath('/dashboard/legal/eviction');
            return { success: true, message: 'Eviction request deleted successfully.' };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error: any) {
        console.error('Failed to delete eviction request:', error);
        return { success: false, message: `Failed to delete eviction request: ${error.message}` };
    }
}

// ====== Purchase Request Actions ======
// NOTE: Purchase Request feature has been removed from the application

    