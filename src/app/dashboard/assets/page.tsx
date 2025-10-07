
import { getEmployeeFromSession } from '@/lib/auth';
import { getAssets, getProperties, getUnitsForProperty, getPropertiesForEmployee } from '@/lib/db';
import AssetManagementClient from '@/components/asset-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AssetManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'assets:read')) {
    redirect('/dashboard');
  }

  const allAssets = await getAssets();
  
  const canViewAllProperties = hasPermission(loggedInEmployee, 'properties:read');
  const visibleProperties = canViewAllProperties
    ? await getProperties()
    : await getPropertiesForEmployee(loggedInEmployee!.id);


  // Fetch units for all properties
  const propertiesWithUnits = await Promise.all(
    visibleProperties.map(async (property) => {
      const units = await getUnitsForProperty(property.id);
      return { ...property, units };
    })
  );

  return (
    <AssetManagementClient
      initialAssets={allAssets}
      properties={propertiesWithUnits}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
