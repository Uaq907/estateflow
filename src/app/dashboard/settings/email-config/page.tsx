import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import EmailConfigClient from './_components/email-config-client';

export default async function EmailConfigPage() {
  const employee = await getEmployeeFromSession();

  if (!employee) {
    redirect('/login');
  }

  if (!hasPermission(employee, 'settings:manage')) {
    redirect('/dashboard');
  }

  return <EmailConfigClient employee={employee} initialSettings={null} />;
}

