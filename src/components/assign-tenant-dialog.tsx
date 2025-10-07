

'use client';

import { useState, useRef, useEffect } from 'react';
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
import type { Tenant, Unit } from '@/lib/types';
import { FileText, ShieldCheck, Calendar as CalendarIcon, Briefcase, ServerCrash } from 'lucide-react';
import { Separator } from './ui/separator';
import { format, addYears, addDays } from 'date-fns';
import { Combobox } from './ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AssignTenantDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    unit: Unit | null;
    tenants: Tenant[];
    onSubmit: (formData: FormData) => void;
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export default function AssignTenantDialog({ isOpen, onOpenChange, unit, tenants, onSubmit }: AssignTenantDialogProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [tenantSince, setTenantSince] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});
    const { toast } = useToast();

    const isCommercial = unit?.type === 'Commercial';

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        setStartDate(selectedDate);
        if (selectedDate) {
            // Automatically set end date to one year later, minus one day
            const date = new Date(selectedDate);
            const newEndDate = addDays(addYears(date, 1), -1);
            setEndDate(format(newEndDate, 'yyyy-MM-dd'));
        } else {
            setEndDate('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const name = event.target.name;
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            setFileErrors(prev => ({ ...prev, [name]: `File size cannot exceed ${MAX_FILE_SIZE_MB}MB.` }));
        } else {
            setFileErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = () => {
        if (!formRef.current) return;

        const firstError = Object.values(fileErrors).find(e => e !== null);
        if (firstError) {
            toast({ variant: 'destructive', title: 'File Error', description: firstError });
            return;
        }

        const formData = new FormData(formRef.current);
        const tenantId = formData.get('tenantId');

        if (!tenantId) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'A tenant must be selected.',
            });
            return;
        }
        onSubmit(formData);
    };
    
    useEffect(() => {
        if (isOpen) {
            // عند فتح النموذج، تعيين تاريخ اليوم لـ "مستأجر منذ"
            const today = new Date().toISOString().split('T')[0];
            console.log('Setting tenantSince to:', today);
            setTenantSince(today);
        } else {
            // عند إغلاق النموذج، إعادة تعيين جميع الحقول
            setTenantSince(new Date().toISOString().split('T')[0]);
            setStartDate('');
            setEndDate('');
            setSelectedTenantId('');
            setFileErrors({});
        }
    }, [isOpen]);

    if (!unit) return null;

    const tenantOptions = tenants.map(tenant => ({
      value: tenant.id,
      label: `${tenant.name} (${tenant.email})`,
    }));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Assign Tenant to Unit {unit.unitNumber}</DialogTitle>
                    <DialogDescription>
                        Select a tenant and specify the lease details for this unit.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef}>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="tenantId">Tenant</Label>
                        <input type="hidden" name="tenantId" value={selectedTenantId} />
                        <Combobox
                          options={tenantOptions}
                          value={selectedTenantId}
                          onChange={setSelectedTenantId}
                          placeholder="Select a tenant..."
                          searchPlaceholder="Search tenants..."
                          emptyPlaceholder="No tenants found."
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Lease Information</h3>
                    </div>
                    <Separator/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tenantSince">Tenant Since</Label>
                            <Input 
                              id="tenantSince" 
                              name="tenantSince" 
                              type="date" 
                              value={tenantSince} 
                              onChange={(e) => {
                                console.log('tenantSince changed to:', e.target.value);
                                setTenantSince(e.target.value);
                              }}
                              lang="en"
                            />
                            <p className="text-xs text-muted-foreground">
                              القيمة الحالية: {tenantSince || 'فارغ'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Lease Start Date</Label>
                            <Input 
                              id="startDate" 
                              name="startDate" 
                              type="date" 
                              value={startDate} 
                              onChange={handleStartDateChange}
                              required
                              lang="en"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="endDate">Lease End Date</Label>
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
                            <Label htmlFor="totalLeaseAmount">Total Lease Amount</Label>
                            <Input id="totalLeaseAmount" name="totalLeaseAmount" type="number" placeholder="e.g., 12000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxedAmount">Taxed Amount</Label>
                            <Input id="taxedAmount" name="taxedAmount" type="number" placeholder="Portion subject to VAT" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="numberOfPayments">Number of Payments</Label>
                            <Input id="numberOfPayments" name="numberOfPayments" type="number" defaultValue="1" />
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="renewalIncreasePercentage">Renewal Increase (%)</Label>
                            <Input id="renewalIncreasePercentage" name="renewalIncreasePercentage" type="number" step="0.1" placeholder="e.g. 5.5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contract">Upload Contract</Label>
                            <Input id="contract" name="contract" type="file" onChange={handleFileChange} />
                            {fileErrors['contract'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['contract']}</Alert>}
                        </div>
                    </div>

                    {isCommercial && (
                        <>
                            <div className="flex items-center gap-4 pt-4">
                                <Briefcase className="h-5 w-5" />
                                <h3 className="text-lg font-semibold">Business Details</h3>
                            </div>
                            <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input id="businessName" name="businessName" placeholder="e.g., Acme Corp" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessType">Business Type</Label>
                                    <Input id="businessType" name="businessType" placeholder="e.g., General Trading" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tradeLicenseNumber">Trade License Number</Label>
                                    <Input id="tradeLicenseNumber" name="tradeLicenseNumber" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tradeLicense">Upload Trade License</Label>
                                    <Input id="tradeLicense" name="tradeLicense" type="file" onChange={handleFileChange} />
                                     {fileErrors['tradeLicense'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['tradeLicense']}</Alert>}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                        <ShieldCheck className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Guarantee Details</h3>
                    </div>
                    <Separator/>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="guaranteeChequeAmount">Guarantee Cheque Amount</Label>
                            <Input id="guaranteeChequeAmount" name="guaranteeChequeAmount" type="number" placeholder="e.g. 5000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guaranteeCheque">Upload Guarantee Cheque</Label>
                            <Input id="guaranteeCheque" name="guaranteeCheque" type="file" onChange={handleFileChange} />
                            {fileErrors['guaranteeCheque'] && <Alert variant="destructive" className="mt-2 text-xs p-2"><ServerCrash className="h-3 w-3"/>{fileErrors['guaranteeCheque']}</Alert>}
                        </div>
                    </div>
                </div>
                </form>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit}>Assign Tenant</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
