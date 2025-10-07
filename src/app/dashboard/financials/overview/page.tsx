
import { getEmployeeFromSession } from '@/lib/auth';
import { getFinancialSummaryByProperty } from '@/lib/db';
import FinancialsOverviewClient from './_components/financials-overview-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function FinancialsOverviewPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'leases:read')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  let financialSummary = [];

  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data (50 records with different financial statuses)
    const demoData = getFullDemoData(50);
    
    financialSummary = demoData.properties.map(property => {
      const propertyLeases = demoData.leases.filter(lease => 
        demoData.leasePayments.some(payment => 
          demoData.leases.find(l => l.id === payment.leaseId)?.tenantId === lease.tenantId
        )
      );
      
      const propertyPayments = demoData.leasePayments.filter(payment => 
        propertyLeases.some(lease => lease.id === payment.leaseId)
      );
      
      const totalRent = propertyLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);
      const paidAmount = propertyPayments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = propertyPayments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + p.amount, 0);
      const overdueAmount = propertyPayments
        .filter(p => p.status === 'Overdue')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return {
        propertyId: property.id,
        propertyName: property.name,
        totalUnits: property.totalUnits,
        occupiedUnits: property.occupiedUnits,
        occupancyRate: (property.occupiedUnits / property.totalUnits) * 100,
        totalRent: totalRent,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
        overdueAmount: overdueAmount,
        collectionRate: totalRent > 0 ? (paidAmount / totalRent) * 100 : 0,
        activeLeases: propertyLeases.length,
        totalPayments: propertyPayments.length
      };
    }) as any[];
  } else {
    try {
      financialSummary = await getFinancialSummaryByProperty();
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      
      financialSummary = demoData.properties.map(property => {
        const propertyLeases = demoData.leases.filter(lease => 
          demoData.leasePayments.some(payment => 
            demoData.leases.find(l => l.id === payment.leaseId)?.tenantId === lease.tenantId
          )
        );
        
        const propertyPayments = demoData.leasePayments.filter(payment => 
          propertyLeases.some(lease => lease.id === payment.leaseId)
        );
        
        const totalRent = propertyLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);
        const paidAmount = propertyPayments
          .filter(p => p.status === 'Paid')
          .reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = propertyPayments
          .filter(p => p.status === 'Pending')
          .reduce((sum, p) => sum + p.amount, 0);
        const overdueAmount = propertyPayments
          .filter(p => p.status === 'Overdue')
          .reduce((sum, p) => sum + p.amount, 0);
        
        return {
          propertyId: property.id,
          propertyName: property.name,
          totalUnits: property.totalUnits,
          occupiedUnits: property.occupiedUnits,
          occupancyRate: (property.occupiedUnits / property.totalUnits) * 100,
          totalRent: totalRent,
          paidAmount: paidAmount,
          pendingAmount: pendingAmount,
          overdueAmount: overdueAmount,
          collectionRate: totalRent > 0 ? (paidAmount / totalRent) * 100 : 0,
          activeLeases: propertyLeases.length,
          totalPayments: propertyPayments.length
        };
      }) as any[];
    }
  }

  return (
    <FinancialsOverviewClient
      initialSummary={financialSummary}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
