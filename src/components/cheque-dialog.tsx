

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { Cheque, Payee, Tenant, Bank, Employee } from '@/lib/types';
import { FileText, Users, User, Pencil, ServerCrash, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { hasPermission } from '@/lib/permissions';
import { Combobox } from './ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/contexts/language-context';
import PayeeDialog from './payee-dialog';
import { handleAddPayee } from '@/app/dashboard/actions';

interface ChequeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cheque: Cheque | null;
  savedPayees: Payee[];
  tenants: Tenant[];
  businessNames: any[];
  banks: Bank[];
  onSubmit: (data: FormData) => void;
  loggedInEmployee: Employee | null;
  onPayeeAdded?: (newPayee: Payee) => void;
}

const chequeStatuses = ['Submitted', 'Pending', 'Cleared', 'Bounced', 'Cancelled'];
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ChequeDialog({ isOpen, onOpenChange, cheque, savedPayees, tenants, businessNames, banks, onSubmit, loggedInEmployee }: ChequeDialogProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [payeeType, setPayeeType] = useState(cheque?.payeeType || 'saved');
  const [chequeDate, setChequeDate] = useState<string>(
    cheque?.chequeDate 
      ? new Date(cheque.chequeDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    cheque?.dueDate 
      ? new Date(cheque.dueDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0] // Default to today (same as cheque date)
  );
  
  const [selectedPayeeId, setSelectedPayeeId] = useState(cheque?.payeeId ?? '');
  const [selectedTenantId, setSelectedTenantId] = useState(cheque?.tenantId ?? '');
  const [selectedManualTenantId, setSelectedManualTenantId] = useState('');
  const [manualPayeeName, setManualPayeeName] = useState(cheque?.manualPayeeName ?? '');
  const [selectedBankId, setSelectedBankId] = useState(cheque?.bankId ?? '');
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  
  // State for Add Payee Dialog
  const [isAddPayeeDialogOpen, setIsAddPayeeDialogOpen] = useState(false);
  const [localPayees, setLocalPayees] = useState(savedPayees);


  const canUpdateDocuments = hasPermission(loggedInEmployee, 'cheques:documents:update');
  const canEditChequeDate = loggedInEmployee?.email === 'uaq907@gmail.com';
  
  const handleAddPayeeSubmit = async (formData: FormData) => {
    const payeeData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      contactEmail: formData.get('contactEmail') as string,
      notes: formData.get('notes') as string,
    };
    
    const result = await handleAddPayee(payeeData);
    if (result.success) {
      toast({ title: t('payees.success'), description: result.message });
      // Add to local state
      const newPayee: Payee = {
        id: `temp-${Date.now()}`,
        ...payeeData,
      };
      setLocalPayees(prev => [...prev, newPayee]);
      setSelectedPayeeId(newPayee.id);
      setIsAddPayeeDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: t('payees.error'), description: result.message });
    }
  };

  useEffect(() => {
    if (isOpen) {
        setPayeeType(cheque?.payeeType || 'saved');
        const initialChequeDate = cheque?.chequeDate 
          ? new Date(cheque.chequeDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0];
        
        setChequeDate(initialChequeDate);
        setDueDate(
          cheque?.dueDate 
            ? new Date(cheque.dueDate).toISOString().split('T')[0] 
            : initialChequeDate // Default to cheque date
        );
        setSelectedPayeeId(cheque?.payeeId ?? '');
        setSelectedTenantId(cheque?.tenantId ?? '');
        setSelectedManualTenantId('');
        setManualPayeeName(cheque?.manualPayeeName ?? '');
        setSelectedBankId(cheque?.bankId ?? '');
        setFileError(null);
        setSelectedFileSize(null);
        setLocalPayees(savedPayees); // Refresh local payees when dialog opens
    }
  }, [isOpen, cheque, savedPayees]);
  
  const handlePayeeTypeChange = (value: string) => {
    setPayeeType(value as "saved" | "tenant" | "manual");
    setSelectedPayeeId('');
    setSelectedTenantId('');
    setSelectedManualTenantId('');
  }
  
  const handleManualTenantChange = (leaseId: string) => {
    setSelectedManualTenantId(leaseId);
    // Find the business name and set it as manual payee name
    const selectedBusiness = businessNames.find(b => b.id === leaseId);
    if (selectedBusiness) {
      setManualPayeeName(selectedBusiness.name);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(t('chequeDialog.maxFileSize').replace('{size}', MAX_FILE_SIZE_MB.toString()));
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
            title: t('chequeDialog.fileError'),
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

  const payeeOptions = localPayees.map(p => ({ label: p.name, value: p.id }));
  const tenantOptions = tenants.map(t => ({ 
    label: t.name, 
    value: t.id,
    searchValue: `${t.name} ${t.email || ''} ${t.phone || ''} ${t.idNumber || ''}`
  }));
  const businessNameOptions = businessNames.map(b => ({ 
    label: b.name, 
    value: b.id,
    searchValue: `${b.name} ${b.tenantName || ''}`
  }));
  const bankOptions = banks.map(b => ({ label: `${b.name} ${b.accountNumber ? `(${b.accountNumber})` : ''}`, value: b.id }));


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col h-full">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">{cheque ? t('chequeDialog.editTitle') : t('chequeDialog.addTitle')}</DialogTitle>
            <DialogDescription className="text-right">{t('chequeDialog.description')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <div className="space-y-3">
                <Label className="block text-right">{t('chequeDialog.payeeType')}</Label>
                <RadioGroup name="payeeType" value={payeeType} onValueChange={handlePayeeTypeChange} className="flex gap-4 justify-end flex-row-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Label htmlFor="r1" className="font-normal flex items-center gap-2"><Users/>{t('chequeDialog.savedPayee')}</Label>
                        <RadioGroupItem value="saved" id="r1" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Label htmlFor="r2" className="font-normal flex items-center gap-2"><User/>{t('chequeDialog.tenant')}</Label>
                        <RadioGroupItem value="tenant" id="r2" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Label htmlFor="r3" className="font-normal flex items-center gap-2"><Pencil/>{t('chequeDialog.manual')}</Label>
                        <RadioGroupItem value="manual" id="r3" />
                    </div>
                </RadioGroup>
            </div>

            {payeeType === 'saved' && (
                <div className="space-y-2">
                    <Label htmlFor="payeeId" className="block text-right">{t('chequeDialog.selectPayee')}</Label>
                    <div className="flex gap-2">
                        <input type="hidden" name="payeeId" value={selectedPayeeId} />
                        <Combobox
                            options={payeeOptions}
                            value={selectedPayeeId}
                            onChange={setSelectedPayeeId}
                            placeholder={t('chequeDialog.selectPayeePlaceholder')}
                            searchPlaceholder={t('chequeDialog.searchPayees')}
                            emptyPlaceholder={t('chequeDialog.noPayeesFound')}
                        />
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => setIsAddPayeeDialogOpen(true)}
                            title={t('payeeDialog.addTitle')}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
             {payeeType === 'tenant' && (
                <div className="space-y-2">
                    <Label htmlFor="tenantId" className="block text-right">{t('chequeDialog.selectTenant')}</Label>
                    <input type="hidden" name="tenantId" value={selectedTenantId} />
                     <Combobox
                        options={tenantOptions}
                        value={selectedTenantId}
                        onChange={setSelectedTenantId}
                        placeholder={t('chequeDialog.selectTenantPlaceholder')}
                        searchPlaceholder={t('chequeDialog.searchTenants')}
                        emptyPlaceholder={t('chequeDialog.noTenantsFound')}
                    />
                </div>
            )}
            {payeeType === 'manual' && (
                <div className="space-y-2">
                    <Label htmlFor="manualBusinessName" className="block text-right">{t('chequeDialog.selectBusinessName')}</Label>
                    <input type="hidden" name="manualPayeeName" value={manualPayeeName} />
                    <Combobox
                        options={businessNameOptions}
                        value={selectedManualTenantId}
                        onChange={handleManualTenantChange}
                        placeholder={t('chequeDialog.selectBusinessPlaceholder')}
                        searchPlaceholder={t('chequeDialog.searchBusinessNames')}
                        emptyPlaceholder={t('chequeDialog.noBusinessNamesFound')}
                    />
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bankId" className="block text-right">{t('chequeDialog.selectBank')}</Label>
                     <input type="hidden" name="bankId" value={selectedBankId} required />
                     <Combobox
                        options={bankOptions}
                        value={selectedBankId}
                        onChange={setSelectedBankId}
                        placeholder={t('chequeDialog.selectBankPlaceholder')}
                        searchPlaceholder={t('chequeDialog.searchBanks')}
                        emptyPlaceholder={t('chequeDialog.noBanksFound')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="chequeNumber" className="block text-right">{t('chequeDialog.chequeNumberOptional')}</Label>
                    <Input id="chequeNumber" name="chequeNumber" defaultValue={cheque?.chequeNumber ?? ''} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="chequeDate" className="block text-right">{t('chequeDialog.chequeDate')}</Label>
                    <Input 
                      id="chequeDate" 
                      name="chequeDate" 
                      type="date" 
                      value={chequeDate} 
                      onChange={(e) => {
                        setChequeDate(e.target.value);
                        // Auto-set due date to match cheque date
                        if (!cheque?.dueDate) {
                          setDueDate(e.target.value);
                        }
                      }}
                      required
                      lang="en"
                      disabled={!canEditChequeDate}
                      className={!canEditChequeDate ? "bg-muted cursor-not-allowed" : ""}
                    />
                    {!canEditChequeDate && (
                      <p className="text-xs text-muted-foreground">{t('chequeDialog.chequeDateLocked')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate" className="block text-right">{t('chequeDialog.dueDate')}</Label>
                    <Input 
                      id="dueDate" 
                      name="dueDate" 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)}
                      lang="en"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount" className="block text-right">{t('chequeDialog.amount')}</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={cheque?.amount} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status" className="block text-right">{t('chequeDialog.status')}</Label>
                    <Select name="status" defaultValue={cheque?.status ?? 'Pending'}>
                    <SelectTrigger><SelectValue placeholder={t('chequeDialog.selectStatus')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Submitted">{t('chequeStatus.submitted')}</SelectItem>
                        <SelectItem value="Pending">{t('chequeStatus.pending')}</SelectItem>
                        <SelectItem value="Cleared">{t('chequeStatus.cleared')}</SelectItem>
                        <SelectItem value="Bounced">{t('chequeStatus.bounced')}</SelectItem>
                        <SelectItem value="Cancelled">{t('chequeStatus.cancelled')}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="block text-right">{t('chequeDialog.descriptionOptional')}</Label>
                <Textarea id="description" name="description" defaultValue={cheque?.description ?? ''} placeholder={t('chequeDialog.descriptionPlaceholder')} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="chequeImage" className="block text-right">{t('chequeDialog.uploadCheque')}</Label>
                <Input id="chequeImage" name="chequeImage" type="file" disabled={cheque && !canUpdateDocuments || false} onChange={handleFileChange} />
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{t('chequeDialog.maxFileSize').replace('{size}', MAX_FILE_SIZE_MB.toString())}</span>
                    {selectedFileSize && <span>{t('chequeDialog.selected')}: {formatFileSize(selectedFileSize)}</span>}
                </div>
                {fileError && (
                    <Alert variant="destructive" className="mt-2">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>{t('chequeDialog.fileError')}</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                )}
                {cheque?.chequeImageUrl && !selectedFileSize && (
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href={cheque.chequeImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <FileText className="h-4 w-4" />
                            {t('chequeDialog.viewCurrent')}
                        </Link>
                    </div>
                )}
                {cheque && !canUpdateDocuments && (
                    <p className="text-xs text-muted-foreground">{t('chequeDialog.noPermissionUpload')}</p>
                )}
            </div>

          </div>
          <DialogFooter className="flex-row-reverse">
            <Button type="submit">{t('chequeDialog.save')}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('chequeDialog.cancel')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Add Payee Dialog - Nested */}
      <PayeeDialog
        isOpen={isAddPayeeDialogOpen}
        onOpenChange={setIsAddPayeeDialogOpen}
        payee={null}
        onSubmit={handleAddPayeeSubmit}
      />
    </Dialog>
  );
}
