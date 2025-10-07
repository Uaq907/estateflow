
'use client';

import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import type { Payee } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';

interface PayeeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  payee: Payee | null;
  onSubmit: (data: FormData) => void;
}

export default function PayeeDialog({ isOpen, onOpenChange, payee, onSubmit }: PayeeDialogProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} action={onSubmit}>
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">{payee ? t('payeeDialog.editTitle') : t('payeeDialog.addTitle')}</DialogTitle>
            <DialogDescription className="text-right">{t('payeeDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-right">{t('payeeDialog.payeeName')}</Label>
              <Input id="name" name="name" defaultValue={payee?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="block text-right">{t('payeeDialog.contactPerson')}</Label>
              <Input id="contactPerson" name="contactPerson" defaultValue={payee?.contactPerson ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="block text-right">{t('payeeDialog.contactEmail')}</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={payee?.contactEmail ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="block text-right">{t('payeeDialog.notes')}</Label>
              <Textarea id="notes" name="notes" defaultValue={payee?.notes ?? ''} />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse">
            <Button type="submit">{t('payeeDialog.save')}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('payeeDialog.cancel')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
