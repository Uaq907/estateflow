

import { getEmployeeFromSession } from '@/lib/auth';
import { getUnitConfigurations } from '@/lib/db';
import UnitConfigurationClient from './_components/unit-configuration-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UnitConfigurationPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'settings:manage')) {
    redirect('/dashboard');
  }

  const allConfigs = await getUnitConfigurations();

  return (
    <UnitConfigurationClient
      initialConfigurations={allConfigs}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
