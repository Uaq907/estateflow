import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TaxReceiptsClient from './_components/tax-receipts-client';

export default async function TaxReceiptsPage() {
  const employee = await getEmployeeFromSession();
  
  if (!employee) {
    redirect('/login');
  }

  return (
    <main className="p-6">
      <TaxReceiptsClient loggedInEmployee={employee} />
    </main>
  );
}
