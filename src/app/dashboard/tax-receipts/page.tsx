import { getEmployeeFromSession } from '@/lib/auth';
import { getTenants, getLeases } from '@/lib/db';
import { redirect } from 'next/navigation';
import TaxReceiptsClient from './_components/tax-receipts-client';

export default async function TaxReceiptsPage() {
  const employee = await getEmployeeFromSession();

  if (!employee) {
    redirect('/login');
  }

  const tenants = await getTenants();
  const leases = await getLeases();

  return <TaxReceiptsClient employee={employee} tenants={tenants} leases={leases} />;
}

