
import { getEmployeeFromSession } from '@/lib/auth';
import { getTenantById, getLeasesForTenant, getPaymentsForTenant } from '@/lib/db';
import TenantDetailClient from './_components/tenant-detail-client';
import { notFound } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'tenants:read')) {
    redirect('/dashboard/tenants');
  }

  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) {
    notFound();
  }

  const [leases, payments] = await Promise.all([
    getLeasesForTenant(id),
    getPaymentsForTenant(id)
  ]);

  return (
    <TenantDetailClient
      tenant={tenant}
      leases={leases}
      payments={payments}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
