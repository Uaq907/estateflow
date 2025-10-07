
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Employee, LeasePayment, LeaseWithDetails, Tenant } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    User, Mail, Phone, Fingerprint, FileText, KeyRound, Edit, Building, Home, 
    FileSignature, Banknote, CalendarDays, BarChartHorizontal
} from 'lucide-react';
import TenantSheet from '@/components/tenant-sheet';
import { getTenants } from '@/lib/db';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { hasPermission } from '@/lib/permissions';
import TenantPaymentList from '@/components/tenant-payment-list';

export default function TenantDetailClient({
  tenant: initialTenant,
  leases,
  payments,
  loggedInEmployee,
}: {
  tenant: Tenant;
  leases: LeaseWithDetails[];
  payments: LeasePayment[];
  loggedInEmployee: Employee | null;
}) {
  const [tenant, setTenant] = useState(initialTenant);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  
  const canUpdate = hasPermission(loggedInEmployee, 'tenants:update');

  const onSheetSave = async (message: string) => {
    // A bit inefficient to fetch all, but ensures data consistency
    const allTenants = await getTenants(); 
    const updatedTenant = allTenants.find(t => t.id === tenant.id);
    if (updatedTenant) {
        setTenant(updatedTenant);
    }
    toast({ title: 'Success', description: message });
    setIsSheetOpen(false);
  };
  
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
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 text-lg">
                    <AvatarFallback><User className="h-8 w-8"/></AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
                    <p className="text-muted-foreground">Tenant Dashboard</p>
                </div>
            </div>
            {canUpdate && (
                <Button onClick={() => setIsSheetOpen(true)}><Edit className="mr-2"/>Edit Tenant</Button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Leases</CardTitle><FileSignature className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalLeases}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Leases</CardTitle><KeyRound className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">{stats.activeLeases}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Leased Value</CardTitle><Banknote className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">AED {stats.totalAmount.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Paid</CardTitle><BarChartHorizontal className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-2xl font-bold">AED {stats.totalPaid.toLocaleString()}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Tenant Information</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/><span className="font-medium">{tenant.email}</span></div>
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground"/><span className="font-medium">{tenant.phone || 'N/A'}</span></div>
                    <Separator/>
                    <div className="flex items-center gap-3"><Fingerprint className="h-4 w-4 text-muted-foreground"/><div><p className="text-muted-foreground text-xs">{tenant.idType || 'ID'}</p><p className="font-medium">{tenant.idNumber || 'N/A'}</p></div></div>
                    {tenant.idDocumentUrl && <Button asChild variant="secondary" size="sm" className="w-full"><Link href={tenant.idDocumentUrl} target="_blank"><FileText className="mr-2"/>View ID Document</Link></Button>}
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Lease History</CardTitle><CardDescription>A list of all properties and units this tenant has leased.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
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
                                        <CalendarDays className="h-4 w-4"/>
                                        <span>{format(new Date(lease.startDate), 'dd/MM/yy')} - {format(new Date(lease.endDate), 'dd/MM/yy')}</span>
                                        <Badge variant={lease.status === 'Active' ? 'default' : 'secondary'}>{lease.status}</Badge>
                                    </div>
                                </div>
                                <Button asChild className="mt-2 sm:mt-0"><Link href={`/dashboard/leases/${lease.id}`}>View Lease</Link></Button>
                           </div>
                        )) : <p className="text-center text-muted-foreground">No lease history found for this tenant.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>

        <TenantPaymentList payments={payments} />

      </main>
      
      {isSheetOpen && (
        <TenantSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            tenant={tenant}
            onSave={onSheetSave}
            loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
