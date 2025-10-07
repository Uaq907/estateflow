
import { getEmployeeFromSession } from '@/lib/auth';
import { getBanks } from '@/lib/db';
import BankManagementClient from '@/components/bank-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BankManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'cheques:read')) {
    redirect('/dashboard');
  }
  const allBanks = await getBanks();

  return (
    <BankManagementClient
      initialBanks={allBanks}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
