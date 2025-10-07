

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { Cheque, ChequeTransaction } from '@/lib/types';
import { FileText, ServerCrash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

interface ChequeTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transaction: ChequeTransaction | null;
  cheque: Cheque;
  onSubmit: (data: FormData) => void;
}

const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'Other'];
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ChequeTransactionDialog({ isOpen, onOpenChange, transaction, cheque, onSubmit }: ChequeTransactionDialogProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [paymentDate, setPaymentDate] = useState<string>(
    transaction?.paymentDate 
      ? new Date(transaction.paymentDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentDate(
        transaction?.paymentDate 
          ? new Date(transaction.paymentDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      );
      setFileError(null);
      setSelectedFileSize(null);
    }
  }, [isOpen, transaction]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFileSize(file.size);
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setFileError(t('chequeTransaction.maxFileSize').replace('{size}', MAX_FILE_SIZE_MB.toString()));
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
        toast({ variant: 'destructive', title: t('chequeTransaction.fileError'), description: fileError });
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

  const balance = cheque.amount - (cheque.totalPaidAmount ?? 0) + (transaction?.amountPaid ?? 0);
  const title = transaction ? t('chequeTransaction.editTitle') : t('chequeTransaction.addTitle');
  const payeeName = cheque.manualPayeeName || cheque.savedPayeeName || cheque.tenantName;
  const description = t('chequeTransaction.description')
    .replace('{number}', cheque.chequeNumber || '')
    .replace('{payee}', payeeName || '')
    .replace('{balance}', balance.toLocaleString());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col h-full">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">{title}</DialogTitle>
            <DialogDescription className="text-right">{description}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="paymentDate" className="block text-right">{t('chequeTransaction.paymentDate')}</Label>
                    <Input 
                      id="paymentDate" 
                      name="paymentDate" 
                      type="date" 
                      value={paymentDate} 
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                      lang="en"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amountPaid" className="block text-right">{t('chequeTransaction.amountPaid')}</Label>
                    <Input name="amountPaid" type="number" step="0.01" defaultValue={transaction?.amountPaid ?? ''} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="block text-right">{t('chequeTransaction.paymentMethod')}</Label>
                <Select name="paymentMethod" defaultValue={transaction?.paymentMethod ?? paymentMethods[0]}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            
             <div className="space-y-2">
                <Label htmlFor="notes" className="block text-right">{t('chequeTransaction.notes')}</Label>
                <Textarea name="notes" placeholder={t('chequeTransaction.notesPlaceholder')} defaultValue={transaction?.notes ?? ''} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="documentUrl" className="block text-right">{t('chequeTransaction.uploadDocument')}</Label>
                <Input name="documentUrl" type="file" onChange={handleFileChange}/>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{t('chequeTransaction.maxFileSize').replace('{size}', MAX_FILE_SIZE_MB.toString())}</span>
                    {selectedFileSize && <span>{t('chequeTransaction.selected')}: {formatFileSize(selectedFileSize)}</span>}
                </div>
                {fileError && (
                    <Alert variant="destructive" className="mt-2">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>{t('chequeTransaction.fileError')}</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                )}
                 {transaction?.documentUrl && !selectedFileSize && (
                    <Button asChild variant="link" size="sm" className="p-0 h-auto justify-start">
                        <Link href={transaction.documentUrl} target="_blank" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" /> {t('chequeTransaction.viewCurrent')}
                        </Link>
                    </Button>
                )}
            </div>

          </div>
          <DialogFooter className="flex-row-reverse">
            <Button type="submit">{t('chequeTransaction.save')}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('chequeTransaction.cancel')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
