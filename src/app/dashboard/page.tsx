
import { getEmployeeFromSession } from '@/lib/auth';
import { getPropertiesForEmployee, getProperties } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import DashboardHomeClient from './_components/dashboard-home-client';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function DashboardHomePage() {
  const loggedInEmployee = await getEmployeeFromSession();

  if (!loggedInEmployee) {
    return null; // Should be handled by middleware
  }
  
  // A user can see the dashboard home if they have overview permission OR are assigned to any property.
  const canViewOverview = hasPermission(loggedInEmployee, 'dashboard:view-overview');
  const hasAssignedProperties = (loggedInEmployee.assignedPropertyIds?.length ?? 0) > 0;

  // If a user can't see the overview and has no properties, check for other pages they might have access to.
  if (!canViewOverview && !hasAssignedProperties) {
    if (hasPermission(loggedInEmployee, 'expenses:read-own') || hasPermission(loggedInEmployee, 'expenses:read-all')) {
        redirect('/dashboard/expenses');
    }
     // If they have no permissions at all, they will see a limited home page.
  }

  const canViewAllProperties = hasPermission(loggedInEmployee, 'properties:read');
  const canViewPropertyDetails = (propertyManagerId: string | null) => {
    return canViewAllProperties || loggedInEmployee.id === propertyManagerId;
  };
  
  // Check if this is demo admin (no database needed)
  let assignedProperties = [];
  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo properties for demo admin
    const demoData = getFullDemoData(50);
    assignedProperties = demoData.properties.map(p => ({
        ...p,
        canViewDetails: true,
    }));
  } else {
    try {
      const assignedPropertiesRaw = canViewAllProperties 
        ? await getProperties()
        : await getPropertiesForEmployee(loggedInEmployee.id);
        
      // Augment properties with canViewDetails flag
      assignedProperties = assignedPropertiesRaw.map(p => ({
          ...p,
          canViewDetails: canViewPropertyDetails(p.managerId || null),
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      assignedProperties = demoData.properties.map(p => ({
          ...p,
          canViewDetails: true,
      }));
    }
  }

  return (
    <DashboardHomeClient
      loggedInEmployee={loggedInEmployee}
      assignedProperties={assignedProperties}
      canViewAllProperties={canViewAllProperties}
    />
  );
}

