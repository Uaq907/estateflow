
import { getEmployeeFromSession } from '@/lib/auth';
import { getTenants, getLeasesWithDetails } from '@/lib/db';
import TenantManagementClient from '@/components/tenant-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function TenantManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'tenants:read')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  let allTenants = [];
  let allLeases = [];
  let justLeases = [];

  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data (50 records)
    const demoData = getFullDemoData(50);
    allTenants = demoData.tenants as any[];
    allLeases = demoData.leases.map(lease => ({
      lease: lease,
      tenant: demoData.tenants.find(t => t.id === lease.tenantId),
      unit: { id: lease.unitId, propertyId: String(Math.floor(Math.random() * 50) + 1), unitNumber: `${Math.floor(Math.random() * 10) + 1}A`, type: 'Apartment', status: 'Occupied' },
      property: { id: String(Math.floor(Math.random() * 50) + 1), name: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown Property' }
    })) as any[];
    justLeases = allLeases.map(l => l.lease);
  } else {
    try {
      [allTenants, allLeases] = await Promise.all([
        getTenants(),
        getLeasesWithDetails()
      ]);
      justLeases = allLeases.map(l => l.lease);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      allTenants = demoData.tenants as any[];
      allLeases = demoData.leases.map(lease => ({
        lease: lease,
        tenant: demoData.tenants.find(t => t.id === lease.tenantId),
        unit: { id: lease.unitId, propertyId: String(Math.floor(Math.random() * 50) + 1), unitNumber: `${Math.floor(Math.random() * 10) + 1}A`, type: 'Apartment', status: 'Occupied' },
        property: { id: String(Math.floor(Math.random() * 50) + 1), name: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown Property' }
      })) as any[];
      justLeases = allLeases.map(l => l.lease);
    }
  }

  return (
    <TenantManagementClient
      initialTenants={allTenants}
      leases={justLeases}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
