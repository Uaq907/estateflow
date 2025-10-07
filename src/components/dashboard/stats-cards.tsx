'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, FileText, AlertTriangle, Users2 } from 'lucide-react';
import type { Property, Tenant, Lease, Expense, Employee } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';

interface StatsCardsProps {
    properties: Property[];
    tenants: Tenant[];
    leases: Lease[];
    expenses: Expense[];
    employees: Employee[];
}

export default function StatsCards({ properties, tenants, leases, expenses, employees }: StatsCardsProps) {
  const { t } = useLanguage();
  
  // Add safety checks to prevent undefined errors
  const safeProperties = properties || [];
  const safeTenants = tenants || [];
  const safeLeases = leases || [];
  const safeExpenses = expenses || [];
  const safeEmployees = employees || [];

  const totalProperties = safeProperties.length;
  const totalTenants = safeTenants.length;
  const activeLeases = safeLeases.filter(l => l.status === 'Active').length;
  const pendingExpenses = safeExpenses.filter(e => e.status === 'Pending' || (e.status as any) === 'Pending Receipt').length;
  const totalEmployees = safeEmployees.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.totalProperties')}</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalProperties}</div>
                <p className="text-xs text-muted-foreground">{t('overview.managedAssets')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.totalEmployees')}</CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">{t('overview.allStaff')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.totalTenants')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalTenants}</div>
                <p className="text-xs text-muted-foreground">{t('overview.allTenants')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.activeLeases')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeLeases}</div>
                <p className="text-xs text-muted-foreground">{t('overview.activeContracts')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.pendingExpenses')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingExpenses}</div>
                <p className="text-xs text-muted-foreground">{t('overview.pendingApproval')}</p>
            </CardContent>
        </Card>
    </div>
  );
}
