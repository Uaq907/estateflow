
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Hourglass, AlertCircle, CheckCircle, CalendarClock } from 'lucide-react';
import type { Cheque } from '@/lib/types';
import { useMemo } from 'react';
import { isPast } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

interface ChequeDashboardCardsProps {
    cheques: Cheque[];
}

export default function ChequeDashboardCards({ cheques }: ChequeDashboardCardsProps) {
    const { t } = useLanguage();
    const stats = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const unclearedValue = cheques
            .filter(c => c.status !== 'Cleared')
            .reduce((acc, c) => acc + c.amount, 0);

        const bouncedValue = cheques
            .filter(c => c.status === 'Bounced')
            .reduce((acc, c) => acc + c.amount, 0);
        
        const dueSoonCount = cheques.filter(c => {
            const dueDate = c.dueDate ? new Date(c.dueDate) : null;
            if (!dueDate) return false;
            return c.status === 'Pending' && dueDate > now && dueDate <= thirtyDaysFromNow;
        }).length;
        
        const overdueCheques = cheques.filter(c => {
            const dueDate = c.dueDate ? new Date(c.dueDate) : null;
            if (!dueDate) return false;
            return c.status === 'Pending' && isPast(dueDate);
        });
        
        const overdueCount = overdueCheques.length;
        const overdueAmount = overdueCheques.reduce((acc, c) => acc + c.amount, 0);

        const clearedLast30Days = cheques
            .filter(c => {
                const dueDate = c.dueDate ? new Date(c.dueDate) : null;
                if (!dueDate) return false;
                return c.status === 'Cleared' && dueDate >= thirtyDaysAgo && dueDate <= now;
            })
            .reduce((acc, c) => acc + c.amount, 0);

        return { unclearedValue, bouncedValue, dueSoonCount, clearedLast30Days, overdueCount, overdueAmount };
    }, [cheques]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cheques.unclearedValue')}</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">AED {stats.unclearedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('cheques.unclearedDesc')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cheques.overdueCheques')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
                <p className="text-xs text-muted-foreground">{t('cheques.totalValue')}: AED {stats.overdueAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cheques.bouncedValue')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">AED {stats.bouncedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('cheques.bouncedDesc')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cheques.dueIn30Days')}</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.dueSoonCount}</div>
                <p className="text-xs text-muted-foreground">{t('cheques.dueSoonDesc')}</p>
            </CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cheques.clearedLast30')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">AED {stats.clearedLast30Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('cheques.clearedDesc')}</p>
            </CardContent>
        </Card>
    </div>
  );
}
