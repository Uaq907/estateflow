
import { getEmployeeFromSession } from '@/lib/auth';
import { getEmployees } from '@/lib/db';
import EmployeeManagementClient from '@/components/employee-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function EmployeeManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'employees:read')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  let allEmployees = [];
  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data for employees (50 records)
    const demoData = getFullDemoData(50);
    allEmployees = demoData.employees as any[];
  } else {
    try {
      allEmployees = await getEmployees();
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      allEmployees = demoData.employees as any[];
    }
  }

  return (
    <EmployeeManagementClient
      initialEmployees={allEmployees}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
