
import { getEmployeeFromSession } from '@/lib/auth';
import { getExpenses, getProperties, getUnitsForProperty, getPropertiesForEmployee } from '@/lib/db';
import ExpenseManagementClient from '@/components/expense-management-client';
import type { Property, Unit } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function ExpenseManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!loggedInEmployee) {
    redirect('/login');
  }

  const canReadAll = hasPermission(loggedInEmployee, 'expenses:read-all');
  const canReadOwn = hasPermission(loggedInEmployee, 'expenses:read-own');
  
  // A user must have at least one of these permissions to view the page.
  if (!canReadAll && !canReadOwn) {
    redirect('/dashboard');
  }

  const canCreate = hasPermission(loggedInEmployee, 'expenses:create');
  
  // Check if this is demo admin (no database needed)
  let allExpenses = [];
  let propertiesWithUnits = [];

  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data (50 records)
    const demoData = getFullDemoData(50);
    allExpenses = demoData.expenses as any[];
    propertiesWithUnits = demoData.properties.map(property => ({
      ...property,
      units: Array.from({ length: property.totalUnits }, (_, i) => ({
        id: String(i + 1),
        propertyId: property.id,
        unitNumber: `${Math.floor(i / 10) + 1}${String.fromCharCode(65 + (i % 26))}`,
        type: 'Apartment',
        status: Math.random() > 0.3 ? 'Occupied' : 'Available',
        rent: 2000 + Math.floor(Math.random() * 8000),
        size: 50 + Math.floor(Math.random() * 150),
        bedrooms: 1 + Math.floor(Math.random() * 4),
        bathrooms: 1 + Math.floor(Math.random() * 3)
      }))
    })) as any[];
  } else {
    try {
      // Only users who can view all properties should be able to filter by all properties.
      // Otherwise, they are restricted to properties they are assigned to.
      const canViewAllProperties = hasPermission(loggedInEmployee, 'properties:read');

      const visibleProperties = canViewAllProperties
        ? await getProperties()
        : await getPropertiesForEmployee(loggedInEmployee.id);
      
      // Fetch expenses based on user permissions. Default to own expenses if 'read-all' is not present.
      allExpenses = await getExpenses({ 
        employeeId: canReadAll ? undefined : loggedInEmployee.id 
      });

      // Fetch units for all visible properties
      propertiesWithUnits = await Promise.all(
        visibleProperties.map(async (property) => {
          const units = await getUnitsForProperty(property.id);
          return { ...property, units };
        })
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      allExpenses = demoData.expenses as any[];
      propertiesWithUnits = demoData.properties.map(property => ({
        ...property,
        units: Array.from({ length: property.totalUnits }, (_, i) => ({
          id: String(i + 1),
          propertyId: property.id,
          unitNumber: `${Math.floor(i / 10) + 1}${String.fromCharCode(65 + (i % 26))}`,
          type: 'Apartment',
          status: Math.random() > 0.3 ? 'Occupied' : 'Available',
          rent: 2000 + Math.floor(Math.random() * 8000),
          size: 50 + Math.floor(Math.random() * 150),
          bedrooms: 1 + Math.floor(Math.random() * 4),
          bathrooms: 1 + Math.floor(Math.random() * 3)
        }))
      })) as any[];
    }
  }

  return (
    <ExpenseManagementClient
      initialExpenses={allExpenses}
      properties={propertiesWithUnits}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
