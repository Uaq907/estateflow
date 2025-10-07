

'use client';

import type { Employee, Property, Tenant, Expense, Lease, LeasePayment, MaintenanceContract, LeaseWithDetails, Cheque } from '@/lib/types';
import { AppHeader } from '../layout/header';
import StatsCards from './stats-cards';
import DashboardInsights from './dashboard-insights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import RecentExpensesChart from './recent-expenses-chart';
import PropertyStatusChart from './property-status-chart';
import { useLanguage } from '@/contexts/language-context';

export default function OverviewClient({ 
    initialEmployees, 
    initialProperties,
    initialTenants,
    initialExpenses,
    initialLeases,
    loggedInEmployee,
    upcomingPayments,
    overduePayments,
    expiringContracts,
    expiredContracts,
    expiringLeases,
    leasesNeedingAttention,
    dueSoonCheques,
    overdueCheques,
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
    expiredContracts: MaintenanceContract[],
    expiringLeases: LeaseWithDetails[],
    leasesNeedingAttention: LeaseWithDetails[],
    dueSoonCheques: Cheque[],
    overdueCheques: Cheque[],
}) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
        <div className="space-y-6">
          <div className="">
            <h2 className="text-3xl font-bold tracking-tight">
                {t('overview.title')}
            </h2>
            <p className="text-muted-foreground">{t('overview.description')}</p>
          </div>
          
          <StatsCards 
            properties={initialProperties}
            tenants={initialTenants}
            leases={initialLeases}
            expenses={initialExpenses}
            employees={initialEmployees}
          />
          
          <DashboardInsights
            upcomingPayments={upcomingPayments}
            overduePayments={overduePayments}
            expiringContracts={expiringContracts}
            expiredContracts={expiredContracts}
            expiringLeases={expiringLeases}
            leasesNeedingAttention={leasesNeedingAttention}
            dueSoonCheques={dueSoonCheques}
            overdueCheques={overdueCheques}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('overview.recentExpenses')}</CardTitle>
                <CardDescription>{t('overview.expensesDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RecentExpensesChart expenses={initialExpenses} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('overview.propertyStatus')}</CardTitle>
                <CardDescription>{t('overview.statusDistribution')}</CardDescription>
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
