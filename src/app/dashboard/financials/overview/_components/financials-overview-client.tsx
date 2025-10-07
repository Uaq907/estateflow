
'use client';

import { useMemo } from 'react';
import type { Employee } from '@/lib/types';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Building } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';
import { useLanguage } from '@/contexts/language-context';

interface FinancialSummary {
  propertyId: string;
  propertyName: string;
  totalIncome: number;
  totalExpense: number;
}

interface FinancialsOverviewClientProps {
  initialSummary: FinancialSummary[];
  loggedInEmployee: Employee | null;
}

const chartConfig = {
  income: { label: 'Income', color: 'hsl(var(--chart-2))' },
  expense: { label: 'Expense', color: 'hsl(var(--chart-1))' },
};

export default function FinancialsOverviewClient({
  initialSummary,
  loggedInEmployee,
}: FinancialsOverviewClientProps) {
  const { t } = useLanguage();

  const portfolioStats = useMemo(() => {
    const totalIncome = initialSummary.reduce((acc, item) => acc + item.totalIncome, 0);
    const totalExpense = initialSummary.reduce((acc, item) => acc + item.totalExpense, 0);
    const netProfit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netProfit };
  }, [initialSummary]);

  const chartData = initialSummary.map(item => ({
    name: item.propertyName,
    income: item.totalIncome,
    expense: item.totalExpense,
  }));

  const formatCurrency = (value: number) => {
    const amount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
    return `AED ${amount}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('financials.title')}</h2>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('financials.totalIncome')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(portfolioStats.totalIncome)}</div>
              <p className="text-xs text-muted-foreground">{t('financials.acrossAllProperties')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('financials.totalExpenses')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(portfolioStats.totalExpense)}</div>
              <p className="text-xs text-muted-foreground">{t('financials.acrossAllProperties')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('financials.netProfit')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioStats.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(portfolioStats.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">{t('financials.netProfitDescription')}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('financials.properties')}</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialSummary.length}</div>
              <p className="text-xs text-muted-foreground">{t('financials.propertiesWithData')}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('financials.incomeVsExpense')}</CardTitle>
                <CardDescription>{t('financials.visualComparison')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full mt-[-2rem] min-h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={chartData}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                          />
                           <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `AED ${Number(value) / 1000}k`} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="var(--color-income)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-income)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="var(--color-expense)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-expense)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            dataKey="expense"
                            type="natural"
                            fill="url(#fillExpense)"
                            fillOpacity={0.4}
                            stroke="var(--color-expense)"
                            stackId="a"
                          />
                          <Area
                            dataKey="income"
                            type="natural"
                            fill="url(#fillIncome)"
                            fillOpacity={0.4}
                            stroke="var(--color-income)"
                            stackId="a"
                          />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('financials.summaryByProperty')}</CardTitle>
            <CardDescription>{t('financials.detailedBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financials.property')}</TableHead>
                    <TableHead className="text-right">{t('financials.income')}</TableHead>
                    <TableHead className="text-right">{t('financials.expense')}</TableHead>
                    <TableHead className="text-right">{t('financials.profit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialSummary.length > 0 ? (
                    initialSummary.map((item) => (
                      <TableRow key={item.propertyId}>
                        <TableCell className="font-medium">{item.propertyName}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(item.totalIncome)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(item.totalExpense)}</TableCell>
                        <TableCell className={`text-right font-semibold ${item.totalIncome - item.totalExpense >= 0 ? '' : 'text-destructive'}`}>
                          {formatCurrency(item.totalIncome - item.totalExpense)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        {t('financials.noDataAvailable')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
