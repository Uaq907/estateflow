
import { getEmployeeFromSession } from '@/lib/auth';
import { getPayees } from '@/lib/db';
import PayeeManagementClient from '@/components/payee-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PayeeManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'cheques:read')) {
    redirect('/dashboard');
  }
  const allPayees = await getPayees();

  return (
    <PayeeManagementClient
      initialPayees={allPayees}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
