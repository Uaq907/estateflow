
'use client';

import { useState } from 'react';
import type { Employee, LeasePayment, LeaseWithDetails } from '@/lib/types';
import { AppHeader } from './layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LeaseList from './lease-list';
import AllPaymentsList from './all-payments-list';
import Link from 'next/link';
import { Button } from './ui/button';
import { BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function FinancialsClient({ 
    initialLeases,
    initialPayments,
    loggedInEmployee,
}: { 
    initialLeases: LeaseWithDetails[],
    initialPayments: LeasePayment[],
    loggedInEmployee: Employee | null,
}) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('financialsPage.title')}</CardTitle>
                    <CardDescription>{t('financialsPage.description')}</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/dashboard/financials/overview"><BarChart3 className="mr-2"/>{t('financialsPage.viewDashboard')}</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="leases" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="leases">{t('financialsPage.allLeases')}</TabsTrigger>
                        <TabsTrigger value="payments">{t('financialsPage.allPayments')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="leases" className="pt-4">
                        <LeaseList leases={initialLeases} />
                    </TabsContent>
                    <TabsContent value="payments" className="pt-4">
                        <AllPaymentsList payments={initialPayments} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
