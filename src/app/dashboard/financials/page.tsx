

import { getEmployeeFromSession } from '@/lib/auth';
import { getLeasesWithDetails, getAllLeasePaymentsWithDetails } from '@/lib/db';
import FinancialsClient from '@/components/financials-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function FinancialsPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'leases:read')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  let initialLeases = [];
  let initialPayments = [];

  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data (50 records with different statuses)
    const demoData = getFullDemoData(50);
    
    // Create leases with details
    const leasesWithDetails = demoData.leases.map(lease => {
      const tenant = demoData.tenants.find(t => t.id === lease.tenantId);
      const property = demoData.properties[Math.floor(Math.random() * demoData.properties.length)];
      const unit = {
        id: lease.unitId,
        propertyId: property?.id || '1',
        unitNumber: `${Math.floor(Math.random() * 10) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        type: 'Apartment',
        status: 'Occupied'
      };
      
      return {
        lease: lease,
        tenant: tenant,
        unit: unit,
        property: property
      };
    }) as any[];
    
    // Sort leases: expired leases first (oldest to newest), then active leases
    initialLeases = leasesWithDetails.sort((a, b) => {
      const aIsExpired = a.lease.status === 'Expired' || new Date(a.lease.endDate) < new Date();
      const bIsExpired = b.lease.status === 'Expired' || new Date(b.lease.endDate) < new Date();
      
      if (aIsExpired && bIsExpired) {
        // Both expired: sort by end date (oldest to newest)
        return new Date(a.lease.endDate).getTime() - new Date(b.lease.endDate).getTime();
      } else if (aIsExpired && !bIsExpired) {
        // A is expired, B is active: A comes first
        return -1;
      } else if (!aIsExpired && bIsExpired) {
        // A is active, B is expired: B comes first
        return 1;
      } else {
        // Both active: sort by start date (newest to oldest)
        return new Date(b.lease.startDate).getTime() - new Date(a.lease.startDate).getTime();
      }
    });

    // Create payments with different statuses
    initialPayments = demoData.leasePayments.map(payment => ({
      id: payment.id,
      leaseId: payment.leaseId,
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paidDate: payment.paidDate,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      // Add tenant and property info for display
      tenantName: demoData.tenants.find(t => {
        const lease = demoData.leases.find(l => l.id === payment.leaseId);
        return lease && t.id === lease.tenantId;
      })?.name || 'Unknown',
      propertyName: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown Property',
      unitNumber: `${Math.floor(Math.random() * 10) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    })) as any[];
  } else {
    try {
      [initialLeases, initialPayments] = await Promise.all([
        getLeasesWithDetails(),
        getAllLeasePaymentsWithDetails(),
      ]);
      
      // Sort leases: expired leases first (oldest to newest), then active leases
      initialLeases = initialLeases.sort((a, b) => {
        const aIsExpired = (a.lease.status as any) === 'Expired' || new Date(a.lease.endDate) < new Date();
        const bIsExpired = (b.lease.status as any) === 'Expired' || new Date(b.lease.endDate) < new Date();
        
        if (aIsExpired && bIsExpired) {
          // Both expired: sort by end date (oldest to newest)
          return new Date(a.lease.endDate).getTime() - new Date(b.lease.endDate).getTime();
        } else if (aIsExpired && !bIsExpired) {
          // A is expired, B is active: A comes first
          return -1;
        } else if (!aIsExpired && bIsExpired) {
          // A is active, B is expired: B comes first
          return 1;
        } else {
          // Both active: sort by start date (newest to oldest)
          return new Date(b.lease.startDate).getTime() - new Date(a.lease.startDate).getTime();
        }
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      
      const leasesWithDetails = demoData.leases.map(lease => {
        const tenant = demoData.tenants.find(t => t.id === lease.tenantId);
        const property = demoData.properties[Math.floor(Math.random() * demoData.properties.length)];
        const unit = {
          id: lease.unitId,
          propertyId: property?.id || '1',
          unitNumber: `${Math.floor(Math.random() * 10) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          type: 'Apartment',
          status: 'Occupied'
        };
        
        return {
          lease: lease,
          tenant: tenant,
          unit: unit,
          property: property
        };
      }) as any[];
      
      // Sort leases: expired leases first (oldest to newest), then active leases
      initialLeases = leasesWithDetails.sort((a, b) => {
        const aIsExpired = a.lease.status === 'Expired' || new Date(a.lease.endDate) < new Date();
        const bIsExpired = b.lease.status === 'Expired' || new Date(b.lease.endDate) < new Date();
        
        if (aIsExpired && bIsExpired) {
          // Both expired: sort by end date (oldest to newest)
          return new Date(a.lease.endDate).getTime() - new Date(b.lease.endDate).getTime();
        } else if (aIsExpired && !bIsExpired) {
          // A is expired, B is active: A comes first
          return -1;
        } else if (!aIsExpired && bIsExpired) {
          // A is active, B is expired: B comes first
          return 1;
        } else {
          // Both active: sort by start date (newest to oldest)
          return new Date(b.lease.startDate).getTime() - new Date(a.lease.startDate).getTime();
        }
      });

      initialPayments = demoData.leasePayments.map(payment => ({
        id: payment.id,
        leaseId: payment.leaseId,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paidDate: payment.paidDate,
        notes: payment.notes,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        tenantName: demoData.tenants.find(t => {
          const lease = demoData.leases.find(l => l.id === payment.leaseId);
          return lease && t.id === lease.tenantId;
        })?.name || 'Unknown',
        propertyName: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown Property',
        unitNumber: `${Math.floor(Math.random() * 10) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
      })) as any[];
    }
  }

  return (
    <FinancialsClient
      initialLeases={initialLeases}
      initialPayments={initialPayments}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
