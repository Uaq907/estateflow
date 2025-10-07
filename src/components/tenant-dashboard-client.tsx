
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Building, LogOut, Home, Users, ChevronDown, LandPlot, UserSquare,
    Calendar, User, FileText, Banknote, Wallet, Receipt, Wrench, Package, WalletCards
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TenantPaymentPlan } from './tenant-payment-plan';
import { useToast } from '@/hooks/use-toast';
import type { Employee, LeasePayment, LeaseWithDetails, Tenant } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/header';

export default function TenantDashboardClient({
  leaseWithDetails,
  initialPayments,
  tenant
}: {
  leaseWithDetails: LeaseWithDetails,
  initialPayments: LeasePayment[],
  tenant: Tenant | null
}) {
  const { toast } = useToast();

  const { lease, property, unit } = leaseWithDetails;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={null} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow space-y-6 pt-24">
        <div className="pt-4 flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {tenant ? `Welcome, ${tenant.name}!` : 'Welcome to your Dashboard!'}
                </h2>
                <p className="text-muted-foreground">Here is an overview of your current lease and payment schedule.</p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Lease Contract Details</CardTitle>
                <CardDescription>
                    Lease for Unit <span className="font-semibold">{unit.unitNumber}</span> in Property <span className="font-semibold">{property.name}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><User /> Tenant Information</h4>
                        <p><strong>Name:</strong> {tenant?.name}</p>
                        <p><strong>Email:</strong> {tenant?.email}</p>
                        <p><strong>Phone:</strong> {tenant?.phone ?? 'N/A'}</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><Calendar /> Lease Term</h4>
                        <p><strong>Start Date:</strong> {format(new Date(lease.startDate), 'dd/MM/yyyy')}</p>
                        <p><strong>End Date:</strong> {format(new Date(lease.endDate), 'dd/MM/yyyy')}</p>
                        <div className="flex items-center gap-2"><strong>Status:</strong> <Badge>{lease.status}</Badge></div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><Banknote /> Financials</h4>
                        <p><strong>Total Amount:</strong> AED {lease.totalLeaseAmount?.toLocaleString() ?? 'N/A'}</p>
                        <p><strong>Taxed Amount:</strong> AED {lease.taxedAmount?.toLocaleString() ?? 'N/A'}</p>
                        <p><strong>Payments:</strong> {lease.numberOfPayments ?? 'N/A'}</p>
                    </div>
                </div>
                 <div className="mt-6 flex flex-wrap gap-4">
                    {lease.contractUrl && (
                        <Button asChild variant="outline">
                            <Link href={lease.contractUrl} target="_blank"><FileText className="mr-2"/> View Contract</Link>
                        </Button>
                    )}
                    {lease.guaranteeChequeUrl && (
                        <Button asChild variant="outline">
                            <Link href={lease.guaranteeChequeUrl} target="_blank"><Wallet className="mr-2" /> View Guarantee Cheque</Link>
                        </Button>
                    )}
                 </div>
            </CardContent>
        </Card>
        
        <TenantPaymentPlan
            lease={lease}
            initialPayments={initialPayments}
        />

      </main>
    </div>
  );
}
