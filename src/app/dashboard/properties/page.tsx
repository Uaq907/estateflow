
import { getEmployeeFromSession } from '@/lib/auth';
import { getProperties, getEmployees, getOwners, getUnitsForProperty, getPropertiesForEmployee } from '@/lib/db';
import PropertyManagementClient from '@/components/property-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function PropertyManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!loggedInEmployee) {
      redirect('/login');
  }

  // A user must have global read permission OR be assigned to at least one property to see this page.
  const canAccessPage = hasPermission(loggedInEmployee, 'properties:read');
  const isAssignedToAny = loggedInEmployee.assignedPropertyIds && loggedInEmployee.assignedPropertyIds.length > 0;
  
  if (!canAccessPage && !isAssignedToAny) {
    redirect('/dashboard');
  }
  
  // Check if this is demo admin (no database needed)
  let propertiesToView = [];
  let allEmployees = [];
  let allOwners = [];
  let allUnits = [];

        if (loggedInEmployee?.id === 'demo-admin') {
          // Provide demo data (50 records)
          const demoData = getFullDemoData(50);
          propertiesToView = demoData.properties as any[];
          allEmployees = demoData.employees as any[];
          allOwners = [
            { id: '1', name: 'مالك العقار الأول', email: 'owner1@example.com', phone: '+971501111111' },
            { id: '2', name: 'مالك العقار الثاني', email: 'owner2@example.com', phone: '+971502222222' },
            { id: '3', name: 'مالك العقار الثالث', email: 'owner3@example.com', phone: '+971503333333' }
          ] as any[];
          allUnits = demoData.units as any[];
  } else {
    try {
      // If the user has global read, show all. Otherwise, only show their assigned properties.
      propertiesToView = hasPermission(loggedInEmployee, 'properties:read')
        ? await getProperties()
        : await getPropertiesForEmployee(loggedInEmployee.id);
      
      [allEmployees, allOwners] = await Promise.all([
        getEmployees(),
        getOwners(),
      ]);

      allUnits = (await Promise.all(propertiesToView.map(p => getUnitsForProperty(p.id)))).flat();
    } catch (error) {
      console.error('Error fetching data:', error);
            // Fallback to demo data if database fails
            const demoData = getFullDemoData(50);
            propertiesToView = demoData.properties as any[];
            allEmployees = demoData.employees as any[];
            allOwners = [
              { id: '1', name: 'مالك العقار الأول', email: 'owner1@example.com', phone: '+971501111111' },
              { id: '2', name: 'مالك العقار الثاني', email: 'owner2@example.com', phone: '+971502222222' },
              { id: '3', name: 'مالك العقار الثالث', email: 'owner3@example.com', phone: '+971503333333' }
            ] as any[];
            allUnits = demoData.units as any[];
    }
  }

  return (
    <PropertyManagementClient
      initialProperties={propertiesToView}
      initialUnits={allUnits}
      initialEmployees={allEmployees}
      initialOwners={allOwners}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
