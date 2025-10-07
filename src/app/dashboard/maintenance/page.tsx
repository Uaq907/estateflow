
import { getEmployeeFromSession } from '@/lib/auth';
import { getMaintenanceContracts, getProperties, getPropertiesForEmployee } from '@/lib/db';
import MaintenanceClient from '@/components/maintenance-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'maintenance:read')) {
    redirect('/dashboard');
  }

  const allContracts = await getMaintenanceContracts();
  
  const canViewAllProperties = hasPermission(loggedInEmployee, 'properties:read');
  const visibleProperties = canViewAllProperties
    ? await getProperties()
    : await getPropertiesForEmployee(loggedInEmployee!.id);

  return (
    <MaintenanceClient
      initialContracts={allContracts}
      properties={visibleProperties}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
