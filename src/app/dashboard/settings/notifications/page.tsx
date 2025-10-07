

import { getEmployeeFromSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import NotificationSettingsClient from './_components/notification-settings-client';
import { getEmployees } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'settings:manage-notifications')) {
    redirect('/dashboard');
  }
  
  // We need the full employee list to find managers to notify.
  // In a larger app, this could be optimized.
  const employees = await getEmployees();


  return (
    <NotificationSettingsClient
      loggedInEmployee={loggedInEmployee}
      allEmployees={employees}
    />
  );
}
