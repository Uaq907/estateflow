

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEmployeeByEmail, getTenantByEmail, createSession } from '@/lib/auth';
import { addEmployee, setupDatabase, logActivity } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';
import { ALL_PERMISSIONS } from '@/lib/permissions';

export async function checkAdminExists(): Promise<boolean> {
    try {
        const admin = await getEmployeeByEmail('admin@oligo.ae');
        return !!admin;
    } catch (error) {
        // If the error is a connection error, it means the DB isn't set up.
        // Treat this as "admin does not exist" for the UI flow.
        if (error instanceof Error && (error.message.includes("ECONNREFUSED") || error.message.includes("ER_UNKNOWN_DATABASE"))) {
            return false;
        }
        // For other errors, we rethrow so it's not silently swallowed.
        throw error;
    }
}


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Check for demo login first (before trying database)
  if (email === 'uaq907@gmail.com' && password === 'demo123') {
    try {
      const sessionValue = await createSession('demo-admin', 'employee');
      const cookieStore = await cookies();
      cookieStore.set('session', sessionValue, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
      redirect('/dashboard');
    } catch (error: any) {
      if (error.message.includes('NEXT_REDIRECT')) {
        throw error; // Re-throw redirect errors
      }
      console.error('Demo login error:', error);
      return 'Demo login failed. Please try again.';
    }
  }
  
  // Skip database connection check for demo login
  // If user is not using demo credentials, we'll try database connection later
  
  try {
    // 1. Try to authenticate as an employee first
    let employee;
    try {
      employee = await getEmployeeByEmail(email);
    } catch (dbError: any) {
      if (dbError.message.includes('ECONNREFUSED') || dbError.message.includes('connect')) {
        return 'خطأ في الاتصال بقاعدة البيانات. الرجاء استخدام بيانات الدخول التجريبية المعروضة أدناه';
      }
      throw dbError;
    }

    if (employee && employee.password) {
        const passwordsMatch = await bcrypt.compare(password, employee.password);
        if (passwordsMatch) {
            if (!employee.allowLogin) {
                return "Your login access has been disabled by an administrator.";
            }
            const sessionValue = await createSession(employee.id, 'employee');
            const cookieStore = await cookies();
            cookieStore.set('session', sessionValue, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
            try {
                // الحصول على عنوان IP
                const { headers } = await import('next/headers');
                const headersList = await headers();
                const forwarded = headersList.get('x-forwarded-for');
                const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'Unknown';
                
                // تسجيل نجاح تسجيل الدخول فقط
                await logActivity(employee.id, employee.name, 'LOGIN_SUCCESS', ip, employee.id, { email });
            } catch (logError) {
                console.error('Error logging activity:', logError);
            }
            redirect('/dashboard');
        }
    }

    // 2. If employee authentication fails, try to authenticate as a tenant
    let tenant;
    try {
      tenant = await getTenantByEmail(email);
    } catch (dbError: any) {
      if (dbError.message.includes('ECONNREFUSED') || dbError.message.includes('connect')) {
        return 'خطأ في الاتصال بقاعدة البيانات. الرجاء استخدام بيانات الدخول التجريبية المعروضة أدناه';
      }
      throw dbError;
    }

    if (tenant && tenant.password) {
        const passwordsMatch = await bcrypt.compare(password, tenant.password);
        if (passwordsMatch) {
            if (!tenant.allowLogin) {
                return "Your login access has been disabled by management.";
            }
            const sessionValue = await createSession(tenant.id, 'tenant');
            const cookieStore = await cookies();
            cookieStore.set('session', sessionValue, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
            try {
                // الحصول على عنوان IP
                const { headers } = await import('next/headers');
                const headersList = await headers();
                const forwarded = headersList.get('x-forwarded-for');
                const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'Unknown';
                
                // تسجيل نجاح تسجيل الدخول فقط
                await logActivity(tenant.id, tenant.name, 'LOGIN_SUCCESS', ip, tenant.id, { email });
            } catch (logError) {
                console.error('Error logging activity:', logError);
            }
            redirect('/tenant-dashboard');
        }
    }
    
    // 3. If both fail, return a generic error (without logging)
    return 'Invalid email or password.';

  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Authentication error:', error);
    return `An unexpected error occurred: ${error.message}`;
  }
}

export async function createAdminAction(prevState: any, formData: FormData) {
    try {
        // This will create the DB if it doesn't exist and run migrations.
        await setupDatabase(); 
        
        const adminEmail = 'admin@oligo.ae';
        
        // Use a separate check here to see if the admin user record exists.
        const existingAdmin = await getEmployeeByEmail(adminEmail);
        if (existingAdmin) {
            return { success: false, message: 'Admin account already exists.' };
        }

        const adminData = {
            name: 'Default Admin',
            email: adminEmail,
            password: 'P@ssw0rd@2025',
            position: 'Administrator',
            department: 'Management',
            startDate: new Date(),
            allowLogin: true,
            permissions: ALL_PERMISSIONS,
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
        };

        await addEmployee(adminData as any);

        revalidatePath('/login');
        return { success: true, message: 'Admin account created successfully. You can now log in.' };
    } catch (error: any) {
        console.error('Failed to create admin:', error);
        return { success: false, message: `An unexpected error occurred while setting up the admin: ${error.message}` };
    }
}
