import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import EmailConfigClient from './_components/email-config-client';
import { getEmailSettings } from '@/lib/db';

export default async function EmailConfigPage() {
  const employee = await getEmployeeFromSession();

  if (!employee) {
    redirect('/login');
  }

  if (!hasPermission(employee, 'settings:manage')) {
    redirect('/dashboard');
  }

  // جلب إعدادات البريد الحالية
  const emailSettings = await getEmailSettings();

  return <EmailConfigClient employee={employee} initialSettings={emailSettings} />;
}

