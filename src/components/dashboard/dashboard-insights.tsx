

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LeasePayment, MaintenanceContract, LeaseWithDetails, Cheque } from "@/lib/types";
import { AlertCircle, CalendarClock, CalendarOff, FileClock, Hourglass, FileSignature, WalletCards } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { useLanguage } from '@/contexts/language-context';

interface InsightListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  icon: React.ReactNode;
}

function InsightList<T>({ title, items, renderItem, icon }: InsightListProps<T>) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
        {icon}
        {title}
        <Badge variant="secondary" className="ml-2">{items.length}</Badge>
      </h3>
      {items.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 rounded-md">
          {items.map(renderItem)}
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground py-4">{t('insights.noItems')}</p>
      )}
    </div>
  );
}

const getPayeeName = (cheque: Cheque) => {
    if (cheque.payeeType === 'manual') return cheque.manualPayeeName;
    if (cheque.payeeType === 'saved') return cheque.savedPayeeName;
    if (cheque.payeeType === 'tenant') return cheque.tenantName;
    return 'N/A';
}


export default function DashboardInsights({
  upcomingPayments,
  overduePayments,
  expiringContracts,
  expiredContracts,
  expiringLeases,
  leasesNeedingAttention,
  dueSoonCheques,
  overdueCheques,
}: {
  upcomingPayments: LeasePayment[],
  overduePayments: LeasePayment[],
  expiringContracts: MaintenanceContract[],
  expiredContracts: MaintenanceContract[],
  expiringLeases: LeaseWithDetails[],
  leasesNeedingAttention: LeaseWithDetails[],
  dueSoonCheques: Cheque[],
  overdueCheques: Cheque[],
}) {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('insights.title')}</CardTitle>
        <CardDescription>{t('insights.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payments">{t('insights.payments')}</TabsTrigger>
            <TabsTrigger value="leases">{t('insights.leases')}</TabsTrigger>
            <TabsTrigger value="contracts">{t('insights.contracts')}</TabsTrigger>
            <TabsTrigger value="cheques">{t('insights.privateCheques')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payments" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InsightList
                title={t('insights.upcomingPayments')}
                items={upcomingPayments}
                icon={<Hourglass />}
                renderItem={(p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      {p.unitType === 'Commercial' && p.businessName && <p className="text-xs text-muted-foreground">{p.businessName}</p>}
                      <p className="font-semibold">{p.tenantName}</p>
                      <p className="text-sm text-muted-foreground">{p.propertyName} - {t('insights.unit')} {p.unitNumber}</p>
                      <p className="text-sm font-medium">AED {p.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold text-primary">{format(new Date(p.dueDate), 'dd/MM/yyyy')}</p>
                       <p className="text-xs text-muted-foreground">{t('insights.in')} {formatDistanceToNow(new Date(p.dueDate))}</p>
                       <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1"><Link href={`/dashboard/leases/${p.leaseId}`}>{t('insights.viewLease')}</Link></Button>
                    </div>
                  </div>
                )}
              />
              <InsightList
                title={t('insights.overduePayments')}
                items={overduePayments}
                icon={<AlertCircle className="text-destructive" />}
                renderItem={(p) => (
                   <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-destructive/50">
                    <div>
                      {p.unitType === 'Commercial' && p.businessName && <p className="text-xs text-muted-foreground">{p.businessName}</p>}
                      <p className="font-semibold">{p.tenantName}</p>
                      <p className="text-sm text-muted-foreground">{p.propertyName} - {t('insights.unit')} {p.unitNumber}</p>
                       <p className="text-sm font-medium text-destructive">AED {p.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold text-destructive">{format(new Date(p.dueDate), 'dd/MM/yyyy')}</p>
                       <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.dueDate))} {t('insights.ago')}</p>
                       <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-destructive"><Link href={`/dashboard/leases/${p.leaseId}`}>{t('insights.viewLease')}</Link></Button>
                    </div>
                  </div>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="leases" className="pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InsightList
                    title={t('insights.expiringLeases')}
                    items={expiringLeases}
                    icon={<FileSignature />}
                    renderItem={(l) => (
                        <div key={l.lease.id} className="flex justify-between items-center p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
                            <div>
                                {l.unit.type === 'Commercial' && l.lease.businessName && <p className="text-xs text-muted-foreground">{l.lease.businessName}</p>}
                                <p className="font-semibold">{l.tenant.name}</p>
                                <p className="text-sm text-muted-foreground">{l.property.name} - {t('insights.unit')} {l.unit.unitNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-yellow-600 dark:text-yellow-400">{format(new Date(l.lease.endDate), 'dd/MM/yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{t('insights.in')} {formatDistanceToNow(new Date(l.lease.endDate))}</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1"><Link href={`/dashboard/leases/${l.lease.id}`}>{t('insights.viewLease')}</Link></Button>
                            </div>
                        </div>
                    )}
                />
                 <InsightList
                    title={t('insights.leasesNeedingAttention')}
                    items={leasesNeedingAttention}
                    icon={<FileClock className="text-destructive" />}
                    renderItem={(l) => (
                        <div key={l.lease.id} className="flex justify-between items-center p-3 rounded-lg border border-destructive/50">
                            <div>
                                {l.unit.type === 'Commercial' && l.lease.businessName && <p className="text-xs text-muted-foreground">{l.lease.businessName}</p>}
                                <p className="font-semibold">{l.tenant.name}</p>
                                <p className="text-sm text-muted-foreground">{l.property.name} - {t('insights.unit')} {l.unit.unitNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-destructive">{l.lease.status}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(l.lease.endDate), 'dd/MM/yyyy')}</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-destructive"><Link href={`/dashboard/leases/${l.lease.id}`}>{t('insights.viewLease')}</Link></Button>
                            </div>
                        </div>
                    )}
                />
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InsightList
                    title={t('insights.expiringContracts')}
                    items={expiringContracts}
                    icon={<CalendarClock />}
                    renderItem={(c) => (
                        <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
                            <div>
                                <p className="font-semibold">{c.serviceType}</p>
                                <p className="text-sm text-muted-foreground">{c.vendorName} @ {c.propertyName}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-yellow-600 dark:text-yellow-400">{format(new Date(c.endDate), 'dd/MM/yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{t('insights.in')} {formatDistanceToNow(new Date(c.endDate))}</p>
                            </div>
                        </div>
                    )}
                />
                 <InsightList
                    title={t('insights.expiredContracts')}
                    items={expiredContracts}
                    icon={<CalendarOff className="text-destructive" />}
                    renderItem={(c) => (
                        <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-destructive/50">
                            <div>
                                <p className="font-semibold">{c.serviceType}</p>
                                <p className="text-sm text-muted-foreground">{c.vendorName} @ {c.propertyName}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-destructive">{format(new Date(c.endDate), 'dd/MM/yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.endDate))} {t('insights.ago')}</p>
                            </div>
                        </div>
                    )}
                />
            </div>
          </TabsContent>
          <TabsContent value="cheques" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InsightList
                title={t('insights.chequesDueSoon')}
                items={dueSoonCheques}
                icon={<WalletCards />}
                renderItem={(c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div>
                      <p className="font-semibold">{getPayeeName(c)}</p>
                      <p className="text-sm font-medium">AED {c.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-yellow-600 dark:text-yellow-400">{c.dueDate ? format(new Date(c.dueDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{c.dueDate ? `${t('insights.in')} ${formatDistanceToNow(new Date(c.dueDate))}` : 'N/A'}</p>
                       <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1"><Link href="/dashboard/cheques">{t('insights.viewCheques')}</Link></Button>
                    </div>
                  </div>
                )}
              />
              <InsightList
                title={t('insights.overdueAndBounced')}
                items={overdueCheques}
                icon={<AlertCircle className="text-destructive" />}
                renderItem={(c) => (
                   <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-destructive/50">
                    <div>
                      <p className="font-semibold">{getPayeeName(c)}</p>
                      <p className="text-sm font-medium text-destructive">AED {c.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-destructive">{c.dueDate ? format(new Date(c.dueDate), 'dd/MM/yyyy') : 'N/A'}</p>
                       <p className="text-xs text-muted-foreground">{c.status === 'Bounced' ? t('insights.bounced') : t('insights.overdue')}</p>
                       <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-destructive"><Link href="/dashboard/cheques">{t('insights.viewCheques')}</Link></Button>
                    </div>
                  </div>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
