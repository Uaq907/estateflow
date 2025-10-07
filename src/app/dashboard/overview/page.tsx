

import { getEmployeeFromSession } from '@/lib/auth';
import { 
  getEmployees, 
  getProperties, 
  getTenants, 
  getExpenses, 
  getLeases,
  getUpcomingPayments,
  getOverduePayments,
  getExpiringContracts,
  getExpiredContracts,
  getExpiringLeases,
  getLeasesNeedingAttention,
  getDueSoonCheques,
  getOverdueOrBouncedCheques
} from '@/lib/db';
import OverviewClient from '@/components/dashboard/overview-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const employee = await getEmployeeFromSession();
  
  if (!hasPermission(employee, 'dashboard:view-overview')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  if (employee?.id === 'demo-admin') {
    // Provide demo data for overview page (50 records)
    const demoData = getFullDemoData(50);
    
    const overviewData = {
      allEmployees: demoData.employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        status: emp.status
      })),
      allProperties: demoData.properties.map(prop => ({
        id: prop.id,
        name: prop.name,
        type: prop.type,
        status: prop.status,
        totalUnits: prop.totalUnits,
        occupiedUnits: prop.occupiedUnits
      })),
      allTenants: demoData.tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        status: tenant.status
      })),
      allExpenses: demoData.expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        status: expense.status
      })),
      allLeases: demoData.leases.map(lease => ({
        id: lease.id,
        tenantName: demoData.tenants.find(t => t.id === lease.tenantId)?.name || 'Unknown',
        propertyName: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown',
        startDate: lease.startDate,
        endDate: lease.endDate,
        monthlyRent: lease.monthlyRent
      })),
      upcomingPayments: Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        tenantName: demoData.tenants[Math.floor(Math.random() * demoData.tenants.length)]?.name || 'Unknown',
        amount: 2000 + Math.floor(Math.random() * 8000),
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      })),
      overduePayments: Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        tenantName: demoData.tenants[Math.floor(Math.random() * demoData.tenants.length)]?.name || 'Unknown',
        amount: 2000 + Math.floor(Math.random() * 8000),
        dueDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      })),
      expiringContracts: [],
      expiredContracts: [],
      expiringLeases: Array.from({ length: 15 }, (_, i) => ({
        id: String(i + 1),
        tenantName: demoData.tenants[Math.floor(Math.random() * demoData.tenants.length)]?.name || 'Unknown',
        propertyName: demoData.properties[Math.floor(Math.random() * demoData.properties.length)]?.name || 'Unknown',
        endDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      })),
      leasesNeedingAttention: [],
      dueSoonCheques: [],
      overdueCheques: []
    };

    return (
      <OverviewClient 
        loggedInEmployee={employee}
        initialEmployees={overviewData.allEmployees as any}
        initialProperties={overviewData.allProperties}
        initialTenants={overviewData.allTenants as any}
        initialExpenses={overviewData.allExpenses as any}
        initialLeases={overviewData.allLeases as any}
        upcomingPayments={overviewData.upcomingPayments as any}
        overduePayments={overviewData.overduePayments as any}
        expiringContracts={overviewData.expiringContracts as any}
        expiredContracts={overviewData.expiredContracts as any}
        expiringLeases={overviewData.expiringLeases as any}
        leasesNeedingAttention={overviewData.leasesNeedingAttention}
        dueSoonCheques={overviewData.dueSoonCheques}
        overdueCheques={overviewData.overdueCheques}
      />
    );
  }

  // Fetch all necessary data for the dashboard
  const [
    allEmployees,
    allProperties,
    allTenants,
    allExpenses,
    allLeases,
    upcomingPayments,
    overduePayments,
    expiringContracts,
    expiredContracts,
    expiringLeases,
    leasesNeedingAttention,
    dueSoonCheques,
    overdueCheques
  ] = await Promise.all([
    getEmployees(),
    getProperties(),
    getTenants(),
    getExpenses(),
    getLeases(),
    getUpcomingPayments(90),
    getOverduePayments(),
    getExpiringContracts(90),
    getExpiredContracts(),
    getExpiringLeases(90),
    getLeasesNeedingAttention(),
    getDueSoonCheques(90),
    getOverdueOrBouncedCheques()
  ]);

  return (
    <OverviewClient 
        loggedInEmployee={employee}
        initialEmployees={allEmployees}
        initialProperties={allProperties}
        initialTenants={allTenants}
        initialExpenses={allExpenses}
        initialLeases={allLeases}
        upcomingPayments={upcomingPayments}
        overduePayments={overduePayments}
        expiringContracts={expiringContracts}
        expiredContracts={expiredContracts}
        expiringLeases={expiringLeases}
        leasesNeedingAttention={leasesNeedingAttention}
        dueSoonCheques={dueSoonCheques}
        overdueCheques={overdueCheques}
    />
  );
}
