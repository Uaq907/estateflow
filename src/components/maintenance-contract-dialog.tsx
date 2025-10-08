

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { Employee, MaintenanceContract, Property } from '@/lib/types';
import { Calendar as CalendarIcon, FileText, ServerCrash } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { DatePicker } from './date-picker';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useLanguage } from '@/contexts/language-context';

interface MaintenanceContractDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contract: MaintenanceContract | null;
  properties: Property[];
  onSubmit: (data: FormData) => void;
  loggedInEmployee: Employee | null;
}

const paymentSchedules = ['Monthly', 'Quarterly', 'Annually', 'One-time'];
const serviceCategories = [
    "HVAC", "Plumbing", "Electrical", "Elevator", "Cleaning", 
    "Security", "Landscaping", "Pest Control", "Fire Safety", "Other"
];
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function MaintenanceContractDialog({ isOpen, onOpenChange, contract, properties, onSubmit, loggedInEmployee }: MaintenanceContractDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [startDate, setStartDate] = useState<Date | undefined>(contract?.startDate ? new Date(contract.startDate) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(contract?.endDate ? new Date(contract.endDate) : undefined);
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(contract?.nextDueDate ? new Date(contract.nextDueDate) : undefined);
  
  const [isVat, setIsVat] = useState(contract?.isVat ?? false);
  const [baseAmount, setBaseAmount] = useState<number | string>(contract?.baseAmount ?? '');
  
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'maintenance:documents:update');

  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  const numericBaseAmount = Number(baseAmount) || 0;
  const taxAmount = isVat ? numericBaseAmount * 0.05 : 0;
  const grandTotal = numericBaseAmount + taxAmount;


  useEffect(() => {
    if (isOpen) {
      setStartDate(contract?.startDate ? new Date(contract.startDate) : undefined);
      setEndDate(contract?.endDate ? new Date(contract.endDate) : undefined);
      setNextDueDate(contract?.nextDueDate ? new Date(contract.nextDueDate) : undefined);
      setIsVat(contract?.isVat ?? false);
      setBaseAmount(contract?.baseAmount ?? '');
      setFileError(null);
      setSelectedFileSize(null);
    }
  }, [isOpen, contract]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      } else {
        setFileError(null);
      }
    } else {
        setSelectedFileSize(null);
        setFileError(null);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileError) {
        toast({
            variant: 'destructive',
            title: 'File Error',
            description: fileError,
        });
        return;
    }
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{contract ? t('maintenanceDialog.editTitle') : t('maintenanceDialog.addTitle')}</DialogTitle>
            <DialogDescription>{t('maintenanceDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="serviceType">{t('maintenanceDialog.serviceType')}</Label>
                <Select name="serviceType" defaultValue={contract?.serviceType}>
                    <SelectTrigger><SelectValue placeholder={t('maintenanceDialog.selectServiceType')} /></SelectTrigger>
                    <SelectContent>
                        {serviceCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vendorName">{t('maintenanceDialog.vendorName')}</Label>
                <Input id="vendorName" name="vendorName" defaultValue={contract?.vendorName} placeholder={t('maintenanceDialog.vendorPlaceholder')} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('maintenanceDialog.startDate')}</Label>
                <DatePicker name="startDate" value={startDate} onSelect={setStartDate} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('maintenanceDialog.endDate')}</Label>
                <DatePicker name="endDate" value={endDate} onSelect={setEndDate} required/>
              </div>
            </div>

            <Separator />
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="isVat" name="isVat" checked={isVat} onCheckedChange={setIsVat} />
                    <Label htmlFor="isVat">{t('maintenanceDialog.vatSubject')}</Label>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="baseAmount">{t('maintenanceDialog.baseAmount')}</Label>
                    <Input id="baseAmount" name="baseAmount" type="number" step="0.01" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} required />
                </div>

                {isVat && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('maintenanceDialog.tax')}</Label>
                            <Input value={taxAmount.toFixed(2)} disabled className="bg-muted"/>
                        </div>
                         <div className="space-y-2">
                            <Label>{t('maintenanceDialog.grandTotal')}</Label>
                            <Input value={grandTotal.toFixed(2)} disabled className="bg-muted font-bold"/>
                        </div>
                    </div>
                )}
            </div>
            <Separator />


             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="paymentSchedule">{t('maintenanceDialog.paymentSchedule')}</Label>
                    <Select name="paymentSchedule" defaultValue={contract?.paymentSchedule} required>
                        <SelectTrigger><SelectValue placeholder={t('maintenanceDialog.selectSchedule')} /></SelectTrigger>
                        <SelectContent>
                            {paymentSchedules.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nextDueDate">{t('maintenanceDialog.nextDueDate')}</Label>
                     <DatePicker name="nextDueDate" value={nextDueDate} onSelect={setNextDueDate}/>
                </div>
            </div>

             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="propertyId">{t('maintenanceDialog.property')}</Label>
                    <Select name="propertyId" defaultValue={contract?.propertyId} required>
                    <SelectTrigger><SelectValue placeholder={t('maintenanceDialog.selectProperty')} /></SelectTrigger>
                    <SelectContent>
                        {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="space-y-2">
              <Label htmlFor="notes">{t('maintenanceDialog.notes')}</Label>
              <Textarea id="notes" name="notes" defaultValue={contract?.notes ?? ''} placeholder={t('maintenanceDialog.notesPlaceholder')} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contractFile">{t('maintenanceDialog.uploadContract')}</Label>
                <Input id="contractFile" name="contractFile" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange}/>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{t('maintenanceDialog.maxFileSize', { size: MAX_FILE_SIZE_MB })}</span>
                    {selectedFileSize && <span>{t('maintenanceDialog.selected')}: {formatFileSize(selectedFileSize)}</span>}
                </div>
                {fileError && (
                    <Alert variant="destructive" className="mt-2">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>{t('maintenanceDialog.fileError')}</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                )}
                {contract?.contractUrl && (
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href={contract.contractUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <FileText className="h-4 w-4" />
                            {t('maintenanceDialog.viewCurrent')}
                        </Link>
                    </div>
                )}
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('maintenanceDialog.cancel')}</Button>
            <Button type="submit">{t('maintenanceDialog.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
