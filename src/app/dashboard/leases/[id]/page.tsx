
import { getEmployeeFromSession } from '@/lib/auth';
import { getLeaseWithDetails, getLeasePayments } from '@/lib/db';
import LeaseDetailClient from '@/components/lease-detail-client';
import { notFound, redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'leases:read')) {
    redirect('/dashboard');
  }
  
  const { id } = await params;
  
  // For demo admin, use demo data directly
  if (loggedInEmployee?.id === 'demo-admin') {
    const demoData = getFullDemoData(50);
    const demoLease = demoData.leases.find(lease => lease.id === id);
    
    if (demoLease) {
      const demoTenant = demoData.tenants.find(tenant => tenant.id === demoLease.tenantId);
      const demoUnit = demoData.units.find(unit => unit.id === demoLease.unitId);
      const demoProperty = demoData.properties.find(property => property.id === demoLease.propertyId);
      const demoPayments = demoData.leasePayments.filter(payment => payment.leaseId === id);
      
      if (demoTenant && demoUnit && demoProperty) {
        const leaseWithDetails = {
          lease: demoLease,
          tenant: demoTenant,
          unit: demoUnit,
          property: demoProperty
        };
        
        return (
          <LeaseDetailClient
            leaseWithDetails={leaseWithDetails as any}
            initialPayments={demoPayments}
            loggedInEmployee={loggedInEmployee}
          />
        );
      }
    }
    
    // If not found in demo data, redirect to financials
    redirect('/dashboard/financials');
  }
  
  try {
    const leaseDetails = await getLeaseWithDetails(id);
    if (!leaseDetails) {
      notFound();
    }

    const payments = await getLeasePayments(id);
    
    return (
      <LeaseDetailClient
        leaseWithDetails={leaseDetails}
        initialPayments={payments}
        loggedInEmployee={loggedInEmployee}
      />
    );
  } catch (error) {
    console.error('Error fetching lease details:', error);
    
    // Try to find lease in demo data
    const demoData = getFullDemoData(50);
    const demoLease = demoData.leases.find(lease => lease.id === id);
    
    if (demoLease) {
      // Find related data for the demo lease
      const demoTenant = demoData.tenants.find(tenant => tenant.id === demoLease.tenantId);
      const demoUnit = demoData.units.find(unit => unit.id === demoLease.unitId);
      const demoProperty = demoData.properties.find(property => property.id === demoLease.propertyId);
      const demoPayments = demoData.leasePayments.filter(payment => payment.leaseId === id);
      
      if (demoTenant && demoUnit && demoProperty) {
        const leaseWithDetails = {
          lease: demoLease,
          tenant: demoTenant,
          unit: demoUnit,
          property: demoProperty
        };
        
        return (
          <LeaseDetailClient
            leaseWithDetails={leaseWithDetails as any}
            initialPayments={demoPayments}
            loggedInEmployee={loggedInEmployee}
          />
        );
      }
    }
    
    // If not found in demo data, redirect to financials
    redirect('/dashboard/financials');
  }
}
