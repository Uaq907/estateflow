import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { getFullDemoData } from '@/lib/demo-data';
import UnitDetailClient from '@/components/unit-detail-client';

export const dynamic = 'force-dynamic';

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'properties:read')) {
    redirect('/dashboard');
  }
  
  const { id } = await params;
  
  try {
    // Try to get data from database first
    // const unitDetails = await getUnitWithDetails(id);
    // if (!unitDetails) {
    //   notFound();
    // }
    // return <UnitDetailClient unitDetails={unitDetails} loggedInEmployee={loggedInEmployee} />;
    
    // For now, use demo data
    throw new Error('Using demo data');
  } catch (error) {
    console.error('Error fetching unit details:', error);
    
    // Use demo data
    const demoData = getFullDemoData(50);
    const demoUnit = demoData.units.find(unit => unit.id === id);
    
    if (demoUnit) {
      // Find related data for the unit
      const demoProperty = demoData.properties.find(property => property.id === demoUnit.propertyId);
      const currentLease = demoData.leases.find(lease => lease.unitId === id && lease.status === 'Active');
      const previousLeases = demoData.leases.filter(lease => lease.unitId === id && lease.status !== 'Active');
      const currentTenant = currentLease ? demoData.tenants.find(tenant => tenant.id === currentLease.tenantId) : null;
      const previousTenants = previousLeases.map(lease => 
        demoData.tenants.find(tenant => tenant.id === lease.tenantId)
      ).filter(Boolean);
      const currentPayments = currentLease ? demoData.leasePayments.filter(payment => payment.leaseId === currentLease.id) : [];
      const previousPayments = previousLeases.flatMap(lease => 
        demoData.leasePayments.filter(payment => payment.leaseId === lease.id)
      );
      
      const unitDetails = {
        unit: demoUnit,
        property: demoProperty,
        currentLease,
        previousLeases,
        currentTenant,
        previousTenants,
        currentPayments,
        previousPayments
      };
      
      return (
        <UnitDetailClient
          unitDetails={unitDetails as any}
          loggedInEmployee={loggedInEmployee}
        />
      );
    }
    
    // If not found in demo data, redirect to properties
    redirect('/dashboard/properties');
  }
}


