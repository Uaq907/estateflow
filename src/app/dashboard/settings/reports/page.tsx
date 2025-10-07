import { getEmployeeFromSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getOwners, getProperties } from '@/lib/db';
import ReportsClient from '@/components/reports-client';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'settings:manage')) {
    redirect('/dashboard');
  }

  // Fetch owners and properties for filtering
  let owners = [];
  let properties = [];
  
  // For demo admin, use demo data directly
  if (loggedInEmployee?.id === 'demo-admin') {
    const demoData = getFullDemoData(10);
    owners = demoData.owners || [];
    properties = demoData.properties || [];
  } else {
    try {
      // Try to fetch from database first
      owners = await getOwners();
      properties = await getProperties();
    } catch (error) {
      console.log('DB Connection Error: Using demo data for reports page');
      // Fallback to demo data if database is not available
      const demoData = getFullDemoData(10);
      owners = demoData.owners || [];
      properties = demoData.properties || [];
    }
  }

  return (
    <ReportsClient 
      loggedInEmployee={loggedInEmployee} 
      owners={owners}
      properties={properties}
    />
  );
}
