
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Building, LogOut, Home, Users, ChevronDown, LandPlot, UserSquare,
    Calendar, User, FileText, Banknote, Wallet, Receipt, Wrench, Package, WalletCards, FileSignature
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import TenantPaymentList from '@/components/tenant-payment-list';
import { useToast } from '@/hooks/use-toast';
import type { LeasePayment, LeaseWithDetails, Tenant } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/header';
import { Separator } from '@/components/ui/separator';

export default function TenantDashboardClient({
  leases,
  payments,
  tenant
}: {
  leases: LeaseWithDetails[],
  payments: LeasePayment[],
  tenant: Tenant | null
}) {
  const { toast } = useToast();

  const stats = {
      totalLeases: leases.length,
      activeLeases: leases.filter(l => l.lease.status === 'Active').length,
      totalAmount: leases.reduce((sum, l) => sum + (l.lease.totalLeaseAmount || 0), 0),
      totalPaid: leases.reduce((sum, l) => sum + (l.lease.totalPaidAmount || 0), 0),
  };
  stats.totalAmount = Math.round(stats.totalAmount);
  stats.totalPaid = Math.round(stats.totalPaid);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={null} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow space-y-6 pt-24">
        <div className="pt-4 flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {tenant ? `Welcome, ${tenant.name}!` : 'Welcome to your Dashboard!'}
                </h2>
                <p className="text-muted-foreground">Here is an overview of your current and past leases.</p>
            </div>
            {tenant && <Button asChild variant="outline"><Link href={`/dashboard/tenants/${tenant.id}`}>View Profile</Link></Button>}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Lease History</CardTitle>
                <CardDescription>
                    A list of all your lease agreements with us.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {leases.length > 0 ? leases.map(({lease, property, unit}) => (
                   <div key={lease.id} className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg">
                        <div>
                            <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-primary"/>
                                <p className="font-bold text-lg">{property.name}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground pl-1">
                                <Home className="h-4 w-4"/>
                                <span>Unit {unit.unitNumber}</span>
                                <Badge variant="outline">{unit.type}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground pl-1 mt-1">
                                <Calendar className="h-4 w-4"/>
                                <span>{format(new Date(lease.startDate), 'dd/MM/yy')} - {format(new Date(lease.endDate), 'dd/MM/yy')}</span>
                                <Badge variant={lease.status === 'Active' ? 'default' : 'secondary'}>{lease.status}</Badge>
                            </div>
                        </div>
                        <Button asChild className="mt-2 sm:mt-0"><Link href={`/dashboard/leases/${lease.id}`}>View Lease</Link></Button>
                   </div>
                )) : <p className="text-center text-muted-foreground">No lease history found.</p>}
            </CardContent>
        </Card>
        
        <TenantPaymentList 
            payments={payments}
        />

      </main>
    </div>
  );
}
