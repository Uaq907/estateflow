
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, DollarSign, CalendarClock, CalendarOff } from 'lucide-react';
import type { MaintenanceContract } from '@/lib/types';
import { useMemo } from 'react';
import { isPast, differenceInDays } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

interface MaintenanceDashboardCardsProps {
    contracts: MaintenanceContract[];
}

export default function MaintenanceDashboardCards({ contracts }: MaintenanceDashboardCardsProps) {
    const { t } = useLanguage();
    
    const stats = useMemo(() => {
        const today = new Date();
        const activeContracts = contracts.filter(c => !isPast(new Date(c.endDate))).length;
        const totalAnnualValue = contracts.reduce((acc, c) => acc + c.contractAmount, 0);
        const expiringSoon = contracts.filter(c => {
            const endDate = new Date(c.endDate);
            const daysLeft = differenceInDays(endDate, today);
            return !isPast(endDate) && daysLeft <= 90;
        }).length;
        const expiredContracts = contracts.filter(c => isPast(new Date(c.endDate))).length;

        return { activeContracts, totalAnnualValue, expiringSoon, expiredContracts };
    }, [contracts]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('maintenance.activeContracts')}</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.activeContracts}</div>
                <p className="text-xs text-muted-foreground">{t('maintenance.totalCurrentContracts')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('maintenance.totalAnnualValue')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">AED {stats.totalAnnualValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('maintenance.sumOfAllContracts')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('maintenance.expiringSoon')}</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">{t('maintenance.contractsNeedingRenewal')}</p>
            </CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('maintenance.expiredContracts')}</CardTitle>
                <CalendarOff className="h-4 w-4 text-muted-foreground text-destructive" />
            </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.expiredContracts}</div>
                <p className="text-xs text-muted-foreground">{t('maintenance.contractsNeedAttention')}</p>
            </CardContent>
        </Card>
    </div>
  );
}
