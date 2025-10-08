
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Hourglass, CheckCircle, TrendingUp } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/language-context';

interface ExpenseDashboardCardsProps {
    expenses: Expense[];
}

export default function ExpenseDashboardCards({ expenses }: ExpenseDashboardCardsProps) {
    const { t } = useLanguage();
    const { stats, chartData } = useMemo(() => {
        const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
        
        const pendingRequests = expenses.filter(e => e.status === 'Pending').length;
        
        const pendingAmount = expenses
            .filter(e => e.status === 'Pending')
            .reduce((acc, e) => acc + e.amount, 0);

        const approvedAmount = expenses
            .filter(e => e.status === 'Approved')
            .reduce((acc, e) => acc + e.amount, 0);

        const categoryTotals = expenses.reduce((acc, e) => {
            const category = e.category || 'Other';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += e.amount;
            return acc;
        }, {} as Record<string, number>);

        const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // --- Chart Data Calculation ---
        const today = new Date();
        const dateArray = Array.from({ length: 30 }, (_, i) => subDays(today, i));
        
        const dailyData = dateArray.map(date => {
            const dateString = format(date, 'yyyy-MM-dd');
            const dailyTotal = expenses
                .filter(e => format(new Date(e.createdAt), 'yyyy-MM-dd') === dateString)
                .reduce((sum, e) => sum + e.amount, 0);
            return { date: dateString, total: dailyTotal };
        }).reverse();

        return {
            stats: { totalAmount, pendingRequests, pendingAmount, approvedAmount, highestCategory },
            chartData: dailyData,
        };
    }, [expenses]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('expenseCards.totalAmount')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">AED {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('expenseCards.totalAmountDesc')}</p>
                 <div className="h-16 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('expenseCards.pendingRequests')}</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">{t('expenseCards.pendingValue')}: AED {stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="h-16 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-4))" fill="url(#colorPending)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('expenseCards.approvedAmount')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">AED {stats.approvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('expenseCards.approvedAmountDesc')}</p>
                 <div className="h-16 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-2))" fill="url(#colorApproved)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('expenseCards.highestCategory')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{stats.highestCategory}</div>
                <p className="text-xs text-muted-foreground">{t('expenseCards.highestCategoryDesc')}</p>
                 <div className="h-16 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-3))" fill="url(#colorCategory)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
