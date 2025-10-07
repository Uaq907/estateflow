

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee, Lease, Tenant, Unit } from '@/lib/types';
import { FileText, ShieldCheck, Calendar as CalendarIcon, Briefcase, Lock, ServerCrash } from 'lucide-react';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { hasPermission } from '@/lib/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/contexts/language-context';
import { format } from 'date-fns';

interface LeaseDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    lease: Lease;
    unitType: string;
    onSubmit: (formData: FormData) => void;
    loggedInEmployee: Employee | null;
}

const leaseStatusOptions: Array<Lease['status']> = ['Active', 'Completed', 'Cancelled', 'Completed with Dues', 'Cancelled with Dues'];

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function LeaseDialog({ isOpen, onOpenChange, lease, unitType, onSubmit, loggedInEmployee }: LeaseDialogProps) {
    const { t } = useLanguage();
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    const [tenantSince, setTenantSince] = useState<string>(lease.tenantSince ? format(new Date(lease.tenantSince), 'yyyy-MM-dd') : '');
    const [startDate, setStartDate] = useState<string>(lease.startDate ? format(new Date(lease.startDate), 'yyyy-MM-dd') : '');
    const [endDate, setEndDate] = useState<string>(lease.endDate ? format(new Date(lease.endDate), 'yyyy-MM-dd') : '');
    const [status, setStatus] = useState<Lease['status']>(lease.status);
    
    const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});

    const isCommercial = unitType === 'Commercial';
    const canUpdateDocuments = hasPermission(loggedInEmployee, 'leases:documents:update');

    useEffect(() => {
        if (isOpen) {
            setTenantSince(lease.tenantSince ? format(new Date(lease.tenantSince), 'yyyy-MM-dd') : '');
            setStartDate(lease.startDate ? format(new Date(lease.startDate), 'yyyy-MM-dd') : '');
            setEndDate(lease.endDate ? format(new Date(lease.endDate), 'yyyy-MM-dd') : '');
            setStatus(lease.status);
            setFileErrors({});
        }
    }, [isOpen, lease]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const name = event.target.name;
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            setFileErrors(prev => ({ ...prev, [name]: `${t('leaseDialog.fileSizeExceeds')} ${MAX_FILE_SIZE_MB}MB.` }));
        } else {
            setFileErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const firstError = Object.values(fileErrors).find(e => e !== null);
        if (firstError) {
            toast({ variant: 'destructive', title: t('leaseDialog.fileError'), description: firstError });
            return;
        }
        const formData = new FormData(event.currentTarget);
        onSubmit(formData);
    };

    if (!lease) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">{t('leaseDialog.title')}</DialogTitle>
                    <DialogDescription className="text-right">
                        {t('leaseDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    
                    <div className="flex items-center gap-4 pt-4 justify-end flex-row-reverse">
                        <Lock className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{t('leaseDialog.leaseStatus')}</h3>
                    </div>
                    <Separator/>
                    <div className="space-y-2">
                        <Label htmlFor="status" className="block text-right">{t('leaseDialog.leaseStatus')}</Label>
                        <Select name="status" value={status} onValueChange={(value) => setStatus(value as Lease['status'])}>
                            <SelectTrigger><SelectValue placeholder={t('leaseDialog.selectStatus')} /></SelectTrigger>
                            <SelectContent>
                                {leaseStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground text-right">
                            {t('leaseDialog.statusNote')}
                        </p>
                    </div>


                    <div className="flex items-center gap-4 pt-4 justify-end flex-row-reverse">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{t('leaseDialog.leaseInformation')}</h3>
                    </div>
                    <Separator/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tenantSince" className="block text-right">{t('leaseDialog.tenantSince')}</Label>
                            <Input 
                              id="tenantSince" 
                              name="tenantSince" 
                              type="date" 
                              value={tenantSince} 
                              onChange={(e) => setTenantSince(e.target.value)}
                              lang="en"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="block text-right">{t('leaseDialog.startDate')}</Label>
                            <Input 
                              id="startDate" 
                              name="startDate" 
                              type="date" 
                              value={startDate} 
                              onChange={(e) => setStartDate(e.target.value)}
                              required
                              lang="en"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="endDate" className="block text-right">{t('leaseDialog.endDate')}</Label>
                            <Input 
                              id="endDate" 
                              name="endDate" 
                              type="date" 
                              value={endDate} 
                              onChange={(e) => setEndDate(e.target.value)}
                              required
                              lang="en"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalLeaseAmount" className="block text-right">{t('leaseDialog.totalLeaseAmount')}</Label>
                            <Input id="totalLeaseAmount" name="totalLeaseAmount" type="number" placeholder="12000" defaultValue={lease.totalLeaseAmount ?? ''}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxedAmount" className="block text-right">{t('leaseDialog.taxedAmount')}</Label>
                            <Input id="taxedAmount" name="taxedAmount" type="number" placeholder={t('leaseDialog.taxedAmountPlaceholder')} defaultValue={lease.taxedAmount ?? ''} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="numberOfPayments" className="block text-right">{t('leaseDialog.numberOfPayments')}</Label>
                            <Input id="numberOfPayments" name="numberOfPayments" type="number" defaultValue={lease.numberOfPayments ?? 1} />
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="renewalIncreasePercentage" className="block text-right">{t('leaseDialog.renewalIncrease')}</Label>
                            <Input id="renewalIncreasePercentage" name="renewalIncreasePercentage" type="number" step="0.1" placeholder="5.5" defaultValue={lease.renewalIncreasePercentage ?? ''}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contract" className="block text-right">{t('leaseDialog.uploadNewContract')}</Label>
                            <Input id="contract" name="contract" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange} />
                            {fileErrors['contract'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['contract']}</Alert>}
                            {lease.contractUrl && (
                                <Button asChild variant="link" size="sm" className="p-0 h-auto w-auto">
                                    <Link href={lease.contractUrl} target="_blank">{t('leaseDialog.viewCurrentContract')}</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {isCommercial && (
                        <>
                            <div className="flex items-center gap-4 pt-4 justify-end flex-row-reverse">
                                <Briefcase className="h-5 w-5" />
                                <h3 className="text-lg font-semibold">{t('leaseDialog.businessDetails')}</h3>
                            </div>
                            <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName" className="block text-right">{t('leaseDialog.businessName')}</Label>
                                    <Input id="businessName" name="businessName" placeholder={t('leaseDialog.businessName')} defaultValue={lease.businessName ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessType" className="block text-right">{t('leaseDialog.businessType')}</Label>
                                    <Input id="businessType" name="businessType" placeholder={t('leaseDialog.businessType')} defaultValue={lease.businessType ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tradeLicenseNumber" className="block text-right">{t('leaseDialog.tradeLicenseNumber')}</Label>
                                    <Input id="tradeLicenseNumber" name="tradeLicenseNumber" defaultValue={lease.tradeLicenseNumber ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tradeLicense" className="block text-right">{t('leaseDialog.uploadTradeLicense')}</Label>
                                    <Input id="tradeLicense" name="tradeLicense" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange} />
                                    {fileErrors['tradeLicense'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['tradeLicense']}</Alert>}
                                     {lease.tradeLicenseUrl && (
                                        <Button asChild variant="link" size="sm" className="p-0 h-auto w-auto">
                                            <Link href={lease.tradeLicenseUrl} target="_blank">{t('leaseDialog.viewCurrentLicense')}</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-4 pt-4 justify-end flex-row-reverse">
                        <ShieldCheck className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{t('leaseDialog.guaranteeDetails')}</h3>
                    </div>
                    <Separator/>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="guaranteeChequeAmount" className="block text-right">{t('leaseDialog.guaranteeChequeAmount')}</Label>
                            <Input id="guaranteeChequeAmount" name="guaranteeChequeAmount" type="number" placeholder="5000" defaultValue={lease.guaranteeChequeAmount ?? ''}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guaranteeCheque" className="block text-right">{t('leaseDialog.uploadGuaranteeCheque')}</Label>
                            <Input id="guaranteeCheque" name="guaranteeCheque" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange}/>
                            {fileErrors['guaranteeCheque'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['guaranteeCheque']}</Alert>}
                            {lease.guaranteeChequeUrl && (
                                <Button asChild variant="link" size="sm" className="p-0 h-auto w-auto">
                                    <Link href={lease.guaranteeChequeUrl} target="_blank">{t('leaseDialog.viewCurrentCheque')}</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                </form>
                <DialogFooter className="flex-row-reverse">
                    <Button type="submit" onClick={() => formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}>{t('leaseDialog.saveChanges')}</Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('leaseDialog.cancel')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
