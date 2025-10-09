

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Building, LogOut, Home, Users, ChevronDown, LandPlot, UserSquare,
    Calendar, User, FileText, Banknote, Wallet, Receipt, Wrench, Package, WalletCards, Edit, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { handleUpdateLease, uploadFile, handleRemoveTenant, handleRenewLease } from '@/app/dashboard/actions';
import PaymentPlan from '@/components/payment-plan';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Lease, LeasePayment, LeaseWithDetails } from '@/lib/types';
import { format, isPast } from 'date-fns';
import { Badge } from './ui/badge';
import { AppHeader } from './layout/header';
import LeaseDialog from './lease-dialog';
import { hasPermission } from '@/lib/permissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { DatePicker } from './date-picker';
import { useLanguage } from '@/contexts/language-context';

export default function LeaseDetailClient({
  leaseWithDetails,
  initialPayments,
  loggedInEmployee
}: {
  leaseWithDetails: LeaseWithDetails,
  initialPayments: LeasePayment[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { lease, tenant, property, unit } = leaseWithDetails;
  
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [isEndLeaseAlertOpen, setIsEndLeaseAlertOpen] = useState(false);
  const [isRenewLeaseDialogOpen, setIsRenewLeaseDialogOpen] = useState(false);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [scheduledPayments, setScheduledPayments] = useState<Array<{dueDate: Date, amount: number, description: string}>>([]);
  const [numberOfPayments, setNumberOfPayments] = useState(lease.numberOfPayments || 12);
  const [monthlyRent, setMonthlyRent] = useState(lease.rentPaymentAmount || 0);
  
  // حساب التواريخ الجديدة تلقائياً
  const oldEndDate = new Date(lease.endDate);
  const autoNewStartDate = new Date(oldEndDate);
  autoNewStartDate.setDate(autoNewStartDate.getDate() + 1); // اليوم التالي
  
  const autoNewEndDate = new Date(autoNewStartDate);
  autoNewEndDate.setFullYear(autoNewEndDate.getFullYear() + 1); // سنة كاملة
  autoNewEndDate.setDate(autoNewEndDate.getDate() - 1); // ناقص يوم
  
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(autoNewStartDate);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(autoNewEndDate);
  
  // فقط الأدمن يمكنه تعديل التواريخ
  const isAdmin = loggedInEmployee?.email === 'uaq907@gmail.com';
  const canEditDates = isAdmin;
  
  // حساب جدول الدفعات
  const generatePaymentSchedule = (numPayments: number, rentAmount: number, startDate: Date) => {
    const payments = [];
    const totalAmount = numPayments * rentAmount;
    
    for (let i = 0; i < numPayments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      payments.push({
        dueDate,
        amount: rentAmount,
        description: `دفعة ${i + 1} من ${numPayments}`
      });
    }
    
    return payments;
  };
  
  const handleGenerateSchedule = () => {
    if (newStartDate && monthlyRent > 0 && numberOfPayments > 0) {
      const schedule = generatePaymentSchedule(numberOfPayments, monthlyRent, newStartDate);
      setScheduledPayments(schedule);
      setShowPaymentSchedule(true);
    }
  };
  
  const handlePaymentChange = (index: number, field: 'amount' | 'description', value: any) => {
    const updated = [...scheduledPayments];
    updated[index] = { ...updated[index], [field]: value };
    setScheduledPayments(updated);
  };
  
  const totalScheduledAmount = scheduledPayments.reduce((sum, p) => sum + p.amount, 0);
  const expectedTotal = monthlyRent * numberOfPayments;
  const amountDifference = totalScheduledAmount - expectedTotal;
  
  const canUpdateLease = hasPermission(loggedInEmployee, 'leases:update');
  const canEndLease = hasPermission(loggedInEmployee, 'leases:delete');
  const isCommercial = unit.type === 'Commercial';

  const paymentPlanSubtotal = initialPayments?.reduce((acc, payment) => acc + payment.amount, 0) || 0;
  
  // حساب المبلغ المدفوع والمتبقي
  const totalPaid = initialPayments?.reduce((acc, payment) => {
    const paidAmount = payment.transactions?.reduce((sum, t) => sum + t.amountPaid, 0) || 0;
    return acc + paidAmount;
  }, 0) || 0;
  
  const remainingBalance = (lease.totalLeaseAmount || paymentPlanSubtotal) - totalPaid;

  const handleLeaseSubmit = async (formData: FormData) => {
    let contractUrl = lease.contractUrl;
    const contractFile = formData.get('contract') as File | null;
    if (contractFile && contractFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'contract', 'leases');
        if (uploadResult.success && uploadResult.filePath) { contractUrl = uploadResult.filePath; } 
        else { toast({ variant: 'destructive', title: t('leaseDetail.uploadFailed'), description: uploadResult.message }); return; }
    }

    let guaranteeChequeUrl = lease.guaranteeChequeUrl;
    const chequeFile = formData.get('guaranteeCheque') as File | null;
    if (chequeFile && chequeFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'guaranteeCheque', 'leases');
        if (uploadResult.success && uploadResult.filePath) { guaranteeChequeUrl = uploadResult.filePath; } 
        else { toast({ variant: 'destructive', title: t('leaseDetail.uploadFailed'), description: uploadResult.message }); return; }
    }

    let tradeLicenseUrl = lease.tradeLicenseUrl;
    const licenseFile = formData.get('tradeLicense') as File | null;
    if (licenseFile && licenseFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'tradeLicense', 'leases');
        if (uploadResult.success && uploadResult.filePath) { tradeLicenseUrl = uploadResult.filePath; }
        else { toast({ variant: 'destructive', title: t('leaseDetail.uploadFailed'), description: uploadResult.message }); return; }
    }
      
    const leaseData = {
      status: formData.get('status') as Lease['status'],
      tenantSince: formData.get('tenantSince') ? new Date(formData.get('tenantSince') as string) : null,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      totalLeaseAmount: Number(formData.get('totalLeaseAmount')) || null,
      taxedAmount: Number(formData.get('taxedAmount')) || null,
      numberOfPayments: Number(formData.get('numberOfPayments')) || null,
      renewalIncreasePercentage: Number(formData.get('renewalIncreasePercentage')) || null,
      contractUrl,
      guaranteeChequeAmount: Number(formData.get('guaranteeChequeAmount')) || null,
      guaranteeChequeUrl,
      businessName: formData.get('businessName') as string || null,
      businessType: formData.get('businessType') as string || null,
      tradeLicenseNumber: formData.get('tradeLicenseNumber') as string || null,
      tradeLicenseUrl,
    };

    const result = await handleUpdateLease(lease.id, leaseData);
    if (result.success) {
        toast({ title: t('leaseDetail.success'), description: result.message });
        setIsLeaseDialogOpen(false);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: t('leaseDetail.error'), description: result.message });
    }
  }

  const handleEndLeaseConfirm = async () => {
    const result = await handleRemoveTenant(unit.id, lease.id);
    if (result.success) {
        toast({ title: t('leaseDetail.success'), description: result.message });
        setIsEndLeaseAlertOpen(false);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: t('leaseDetail.error'), description: result.message });
    }
  }
  
  const handleRenewLeaseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // التحقق من تطابق المبالغ
    if (showPaymentSchedule && amountDifference !== 0) {
      toast({ 
        variant: 'destructive', 
        title: t('leaseDetail.error'), 
        description: t('leaseDetail.pleaseFixMismatch') 
      });
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    
    const renewalData = {
      oldLeaseId: lease.id,
      unitId: unit.id,
      tenantId: tenant.id,
      newStartDate: newStartDate!,
      newEndDate: newEndDate!,
      newRentAmount: monthlyRent,
      numberOfPayments: numberOfPayments,
      increasePercentage: formData.get('increasePercentage') ? Number(formData.get('increasePercentage')) : 0,
      businessName: lease.businessName || null,
      businessType: lease.businessType || null,
      tradeLicenseNumber: lease.tradeLicenseNumber || null,
      customPayments: showPaymentSchedule ? scheduledPayments : null,
    };
    
    const result = await handleRenewLease(renewalData);
    if (result.success) {
        toast({ title: t('leaseDetail.success'), description: t('leaseDetail.leaseRenewedSuccess') });
        setIsRenewLeaseDialogOpen(false);
        // Redirect to the new lease
        if (result.newLeaseId) {
          router.push(`/dashboard/leases/${result.newLeaseId}`);
        } else {
          router.refresh();
        }
    } else {
        toast({ variant: 'destructive', title: t('leaseDetail.error'), description: result.message });
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow space-y-6 pt-24">
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="text-right">
                    <CardTitle>{t('leaseDetail.title')}</CardTitle>
                    <CardDescription>
                        الإيجار للوحدة <span className="font-semibold">{unit.unitNumber}</span> في العقار <span className="font-semibold">{property.name}</span>
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    {canUpdateLease && (lease.status === 'Active' || lease.status === 'Completed') && (
                        <Button onClick={() => setIsRenewLeaseDialogOpen(true)} variant="outline">{t('leaseDetail.renewLease')}</Button>
                    )}
                    {canEndLease && lease.status === 'Active' && isPast(new Date(lease.endDate)) && (
                        <Button onClick={() => setIsEndLeaseAlertOpen(true)} variant="destructive">{t('leaseDetail.endLease')}</Button>
                    )}
                    {canUpdateLease &&
                      <Button onClick={() => setIsLeaseDialogOpen(true)} variant="outline">
                          <Edit className="mr-2"/>
                          {t('leaseDetail.editLease')}
                      </Button>
                    }
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 text-right">
                        <h4 className="font-semibold text-lg flex items-center gap-2 justify-end flex-row-reverse"><User /> {t('leaseDetail.tenantInfo')}</h4>
                        <p><strong>{t('leaseDetail.name')}:</strong> {tenant.name}</p>
                        <p><strong>{t('leaseDetail.email')}:</strong> {tenant.email}</p>
                        <p><strong>{t('leaseDetail.phone')}:</strong> {tenant.phone ?? 'N/A'}</p>
                    </div>

                    <div className="space-y-2 text-right">
                        <h4 className="font-semibold text-lg flex items-center gap-2 justify-end flex-row-reverse"><Home /> {t('leaseDetail.unitInfo')}</h4>
                        <p><strong>{t('leaseDetail.unit')}:</strong> {unit.unitNumber}</p>
                        <p><strong>{t('leaseDetail.type')}:</strong> {unit.type}</p>
                        <p><strong>{t('leaseDetail.property')}:</strong> {property.name}</p>
                    </div>

                    <div className="space-y-2 text-right">
                        <h4 className="font-semibold text-lg flex items-center gap-2 justify-end flex-row-reverse"><Calendar /> {t('leaseDetail.leaseTerm')}</h4>
                        <p><strong>{t('leaseDetail.startDate')}:</strong> {format(new Date(lease.startDate), 'dd/MM/yyyy')}</p>
                        <p><strong>{t('leaseDetail.endDate')}:</strong> {format(new Date(lease.endDate), 'dd/MM/yyyy')}</p>
                        <p><strong>{t('leaseDetail.status')}:</strong> <Badge>{lease.status}</Badge></p>
                    </div>

                    <div className="space-y-2 text-right">
                        <h4 className="font-semibold text-lg flex items-center gap-2 justify-end flex-row-reverse"><Banknote /> {t('leaseDetail.financials')}</h4>
                        <p><strong>{t('leaseDetail.subTotal')}:</strong> AED {paymentPlanSubtotal.toLocaleString()}</p>
                        {lease.taxedAmount && lease.taxedAmount > 0 && (
                            <p><strong>{t('leaseDetail.taxedAmount')}:</strong> AED {lease.taxedAmount?.toLocaleString()}</p>
                        )}
                        <p><strong>{t('leaseDetail.totalAmount')}:</strong> AED {(lease.totalLeaseAmount ?? paymentPlanSubtotal).toLocaleString()}</p>
                        <p><strong>{t('leaseDetail.totalPaid')}:</strong> AED {totalPaid.toLocaleString()}</p>
                        <p><strong>{t('leaseDetail.remainingBalance')}:</strong> <span className={remainingBalance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>AED {remainingBalance.toLocaleString()}</span></p>
                    </div>
                </div>

                {isCommercial && (lease.businessName || lease.tradeLicenseNumber) && (
                    <>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2 lg:col-span-2 text-right">
                                <h4 className="font-semibold text-lg flex items-center gap-2 justify-end flex-row-reverse"><Briefcase /> {t('leaseDetail.businessDetails')}</h4>
                                <p><strong>{t('leaseDetail.businessName')}:</strong> {lease.businessName ?? 'N/A'}</p>
                                <p><strong>{t('leaseDetail.businessType')}:</strong> {lease.businessType ?? 'N/A'}</p>
                                <p><strong>{t('leaseDetail.licenseNumber')}:</strong> {lease.tradeLicenseNumber ?? 'N/A'}</p>
                                {lease.tradeLicenseUrl && (
                                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                        <Link href={lease.tradeLicenseUrl} target="_blank">{t('leaseDetail.viewTradeLicense')}</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}


                 <div className="mt-6 flex flex-wrap gap-4 justify-end">
                    {lease.contractUrl && (
                        <Button asChild variant="outline">
                            <Link href={lease.contractUrl} target="_blank"><FileText className="mr-2"/> {t('leaseDetail.viewContract')}</Link>
                        </Button>
                    )}
                    {lease.guaranteeChequeUrl && (
                        <Button asChild variant="outline">
                            <Link href={lease.guaranteeChequeUrl} target="_blank"><Wallet className="mr-2" /> {t('leaseDetail.viewGuaranteeCheque')}</Link>
                        </Button>
                    )}
                 </div>
            </CardContent>
        </Card>
        
        <PaymentPlan 
            lease={lease}
            initialPayments={initialPayments}
            loggedInEmployee={loggedInEmployee}
        />

      </main>

      <LeaseDialog
        isOpen={isLeaseDialogOpen}
        onOpenChange={setIsLeaseDialogOpen}
        lease={lease}
        unitType={unit.type}
        onSubmit={handleLeaseSubmit}
        loggedInEmployee={loggedInEmployee}
      />

       {/* Renew Lease Dialog */}
       <Dialog open={isRenewLeaseDialogOpen} onOpenChange={setIsRenewLeaseDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleRenewLeaseSubmit}>
            <DialogHeader>
              <DialogTitle className="text-right">{t('leaseDetail.renewLeaseTitle')}</DialogTitle>
              <DialogDescription className="text-right">
                {t('leaseDetail.renewLeaseDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newStartDate">{t('leaseDetail.newStartDate')}</Label>
                  {canEditDates ? (
                    <DatePicker 
                      name="newStartDate" 
                      value={newStartDate} 
                      onSelect={setNewStartDate} 
                      required 
                    />
                  ) : (
                    <>
                      <Input 
                        value={newStartDate ? format(newStartDate, 'dd/MM/yyyy') : ''} 
                        readOnly 
                        className="bg-muted"
                      />
                      <input type="hidden" name="newStartDate" value={newStartDate?.toISOString()} />
                      <p className="text-xs text-muted-foreground">
                        {t('leaseDetail.autoCalculated')}
                      </p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEndDate">{t('leaseDetail.newEndDate')}</Label>
                  {canEditDates ? (
                    <DatePicker 
                      name="newEndDate" 
                      value={newEndDate} 
                      onSelect={setNewEndDate} 
                      required 
                    />
                  ) : (
                    <>
                      <Input 
                        value={newEndDate ? format(newEndDate, 'dd/MM/yyyy') : ''} 
                        readOnly 
                        className="bg-muted"
                      />
                      <input type="hidden" name="newEndDate" value={newEndDate?.toISOString()} />
                      <p className="text-xs text-muted-foreground">
                        {t('leaseDetail.autoCalculated')}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newRentAmount">{t('leaseDetail.newRentAmount')}</Label>
                  <Input 
                    id="newRentAmount" 
                    name="newRentAmount" 
                    type="number" 
                    step="0.01"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="increasePercentage">{t('leaseDetail.increasePercentage')}</Label>
                  <Input 
                    id="increasePercentage" 
                    name="increasePercentage" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="numberOfPayments">{t('leaseDetail.numberOfPayments')}</Label>
                  <Input 
                    id="numberOfPayments" 
                    name="numberOfPayments" 
                    type="number"
                    value={numberOfPayments}
                    onChange={(e) => setNumberOfPayments(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateSchedule}
                  >
                    {t('leaseDetail.viewSchedule')}
                  </Button>
                </div>
              </div>
              
              {/* جدول الدفعات المجدولة */}
              {showPaymentSchedule && scheduledPayments.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{t('leaseDetail.paymentSchedule')}</h4>
                    <Badge variant={amountDifference === 0 ? 'default' : 'destructive'}>
                      {t('leaseDetail.total')}: AED {totalScheduledAmount.toLocaleString()}
                    </Badge>
                  </div>
                  
                  {amountDifference !== 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                        ⚠️ {t('leaseDetail.amountMismatch')}: 
                        {amountDifference > 0 ? ' +' : ' -'}AED {Math.abs(amountDifference).toLocaleString()}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {t('leaseDetail.expectedTotal')}: AED {expectedTotal.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {scheduledPayments.map((payment, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded bg-background">
                        <div className="text-sm">
                          <div className="text-muted-foreground text-xs mb-1">{t('leaseDetail.dueDate')}</div>
                          <div className="font-medium">{format(payment.dueDate, 'dd/MM/yyyy')}</div>
                        </div>
                        <div>
                          <Input 
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => handlePaymentChange(index, 'amount', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Input 
                            value={payment.description}
                            onChange={(e) => handlePaymentChange(index, 'description', e.target.value)}
                            className="h-8 text-sm"
                            placeholder={t('leaseDetail.description')}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  {t('leaseDetail.unpaidPaymentsNotice')}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('leaseDetail.unpaidPaymentsWillTransfer')
                    .replace('{count}', initialPayments.filter(p => p.status !== 'Paid').length.toString())
                    .replace('{year}', new Date(lease.endDate).getFullYear().toString())}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex-row-reverse">
              <Button type="submit">{t('leaseDetail.confirmRenew')}</Button>
              <Button type="button" variant="outline" onClick={() => setIsRenewLeaseDialogOpen(false)}>
                {t('leaseDetail.cancel')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
       </Dialog>

       <AlertDialog open={isEndLeaseAlertOpen} onOpenChange={setIsEndLeaseAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('leaseDetail.endLeaseTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {t('leaseDetail.endLeaseDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={handleEndLeaseConfirm} className="bg-destructive hover:bg-destructive/90">
              {t('leaseDetail.confirmEndLease')}
            </AlertDialogAction>
            <AlertDialogCancel>{t('leaseDetail.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
