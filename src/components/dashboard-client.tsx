
'use client';

import type { Employee, Property, Tenant, Expense, Lease, LeasePayment, MaintenanceContract } from '@/lib/types';
import { AppHeader } from './layout/header';
import StatsCards from './dashboard/stats-cards';
import DashboardInsights from './dashboard/dashboard-insights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import RecentExpensesChart from './dashboard/recent-expenses-chart';
import PropertyStatusChart from './dashboard/property-status-chart';

export default function DashboardClient({ 
    initialEmployees, 
    initialProperties,
    initialTenants,
    initialExpenses,
    initialLeases,
    loggedInEmployee,
    upcomingPayments,
    overduePayments,
    expiringContracts,
    expiredContracts
}: { 
    initialEmployees: Employee[], 
    initialProperties: Property[],
    initialTenants: Tenant[],
    initialExpenses: Expense[],
    initialLeases: Lease[],
    loggedInEmployee: Employee | null,
    upcomingPayments: LeasePayment[],
    overduePayments: LeasePayment[],
    expiringContracts: MaintenanceContract[],
    expiredContracts: MaintenanceContract[]
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
        <div className="space-y-6">
          <div className="">
            <h2 className="text-3xl font-bold tracking-tight">
                Dashboard Overview
            </h2>
            <p className="text-muted-foreground">A high-level overview of your entire real estate portfolio.</p>
          </div>
          
          <StatsCards 
            properties={initialProperties}
            tenants={initialTenants}
            leases={initialLeases}
            expenses={initialExpenses}
            employees={[]}
          />
          
          <DashboardInsights
            upcomingPayments={upcomingPayments}
            overduePayments={overduePayments}
            expiringContracts={expiringContracts}
            expiredContracts={expiredContracts}
            expiringLeases={[]}
            leasesNeedingAttention={[]}
            dueSoonCheques={[]}
            overdueCheques={[]}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Expenses by Category</CardTitle>
                <CardDescription>A look at where money has been spent recently.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RecentExpensesChart expenses={initialExpenses} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Property Status</CardTitle>
                <CardDescription>The current status distribution of all properties.</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyStatusChart properties={initialProperties} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
