
import { getTenantFromSession } from '@/lib/auth';
import { getLeasesForTenant, getPaymentsForTenant } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import TenantDashboardClient from './tenant-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function TenantDashboardPage() {
  const tenant = await getTenantFromSession();

  if (!tenant) {
    redirect('/login');
  }

  const leases = await getLeasesForTenant(tenant.id);
  
  if (leases.length === 0) {
    // Render a state where the tenant has no leases at all.
    return (
        <div className="flex flex-col min-h-screen">
            {/* A simple header can be added here if needed */}
            <main className="p-4 sm:p-6 lg:p-8 flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome, {tenant.name}</h1>
                    <p className="text-muted-foreground mt-2">You do not have any lease contracts with us at the moment.</p>
                </div>
            </main>
        </div>
    );
  }

  const payments = await getPaymentsForTenant(tenant.id);

  return (
    <TenantDashboardClient
        leases={leases}
        payments={payments}
        tenant={tenant}
    />
  );
}
