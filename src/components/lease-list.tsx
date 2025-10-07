
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LeaseWithDetails } from '@/lib/types';
import { format, differenceInDays, isPast } from 'date-fns';
import Link from 'next/link';
import { Eye, Home, Building, User, Calendar, Banknote, AlertTriangle, FileWarning, Wallet, Briefcase } from 'lucide-react';
import { Progress } from './ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from '@/contexts/language-context';

interface LeaseListProps {
  leases: LeaseWithDetails[];
}

export default function LeaseList({ leases }: LeaseListProps) {
    const { t } = useLanguage();
    const getStatusBadgeVariant = (status: string, isExpired: boolean): "default" | "secondary" | "destructive" | "outline" => {
        if (isExpired) return 'destructive';
        switch(status) {
            case 'Active': return 'default';
            case 'Completed': return 'secondary';
            case 'Cancelled':
            case 'Completed with Dues':
            case 'Cancelled with Dues':
                return 'destructive';
            default: return 'outline';
        }
    }
    
    const translateStatus = (status: string) => {
        switch (status) {
            case 'Expired': return t('leaseList.expired');
            case 'Active': return t('leaseList.active');
            case 'Completed': return t('leaseList.completed');
            case 'Cancelled': return t('leaseList.cancelled');
            case 'Completed with Dues': return t('leaseList.completedWithDues');
            case 'Cancelled with Dues': return t('leaseList.cancelledWithDues');
            default: return status;
        }
    }

    const calculatePaymentProgress = (leaseDetails: LeaseWithDetails) => {
        const totalAmount = leaseDetails.lease.totalLeaseAmount;
        const paidAmount = leaseDetails.lease.totalPaidAmount ?? 0;
        if (!totalAmount || totalAmount === 0) return { progress: 0, balance: 0 };
        return {
            progress: (paidAmount / totalAmount) * 100,
            balance: totalAmount - paidAmount,
        }
    }

    const hasOverduePayments = (lease: any) => {
        // Check if there are any overdue payments
        const today = new Date();
        const endDate = new Date(lease.endDate);
        
        // If lease is expired and has outstanding balance
        const isExpired = lease.status === 'Expired' || endDate < today;
        const hasBalance = lease.totalLeaseAmount && lease.totalPaidAmount && 
                          (lease.totalLeaseAmount - lease.totalPaidAmount) > 0;
        
        // Also check if there are overdue payments based on payment schedule
        // For demo purposes, we'll check if the lease is expired and has balance
        return isExpired && hasBalance;
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leases.length > 0 ? (
            leases.map((leaseDetails) => {
                const { lease, property, unit, tenant } = leaseDetails;
                const { progress, balance } = calculatePaymentProgress(leaseDetails);
                const leaseDuration = differenceInDays(new Date(lease.endDate), new Date(lease.startDate));
                const isExpired = lease.status === 'Active' && isPast(new Date(lease.endDate));
                const displayStatus = isExpired ? 'Expired' : lease.status;
                const hasOverdue = hasOverduePayments(lease);

                return (
                    <Card key={lease.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl">{property.name}</CardTitle>
                                    <CardDescription>{t('leaseList.unit')} {unit.unitNumber}</CardDescription>
                                </div>
                                <Badge variant={getStatusBadgeVariant(lease.status, isExpired)} className={displayStatus === 'Expired' ? "animate-pulse" : ""}>
                                    {translateStatus(displayStatus)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="flex items-center gap-3 text-sm"><User className="h-4 w-4 text-muted-foreground"/><span className="font-medium">{tenant.name}</span></div>
                            {lease.businessName && <div className="flex items-center gap-3 text-sm"><Building className="h-4 w-4 text-muted-foreground"/><span className="text-muted-foreground">{lease.businessName}</span></div>}
                            <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground"/><span>{format(new Date(lease.startDate), 'dd/MM/yy')} - {format(new Date(lease.endDate), 'dd/MM/yy')}</span></div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className={hasOverdue ? "text-red-500 font-bold" : "font-bold"}>
                                        AED {balance.toLocaleString()}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {t('leaseList.balance')}
                                    </span>
                                </div>
                                <div className="text-center text-xs text-muted-foreground mb-1">{t('leaseList.paymentProgress')}</div>
                                <Progress 
                                    value={progress} 
                                    className={hasOverdue ? "[&>div]:bg-red-500" : ""}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className={hasOverdue ? "text-red-500 font-bold" : "font-bold"}>
                                    AED {lease.totalLeaseAmount?.toLocaleString() ?? 'N/A'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t('leaseList.total')}</span>
                                    <Banknote className="h-4 w-4 text-muted-foreground"/>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {!lease.contractUrl && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="destructive"><FileWarning className="h-4 w-4"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('leaseList.contractMissing')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {(lease.paymentsCount ?? 0) === 0 && (
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                 <Badge variant="destructive"><AlertTriangle className="h-4 w-4"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('leaseList.noPaymentPlan')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {unit.type === 'Commercial' && !lease.tradeLicenseUrl && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                 <Badge variant="destructive"><Briefcase className="h-4 w-4"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('leaseList.tradeLicenseMissing')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {!tenant.idDocumentUrl && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                 <Badge variant="destructive"><User className="h-4 w-4"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{t('leaseList.tenantIdMissing')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/dashboard/leases/${lease.id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> {t('leaseList.viewDetails')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })
        ) : (
            <p className="col-span-full h-24 text-center content-center text-muted-foreground">
                {t('leaseList.noLeasesFound')}
            </p>
        )}
    </div>
  );
}
