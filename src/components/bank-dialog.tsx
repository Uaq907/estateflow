
'use client';

import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import type { Bank } from '@/lib/types';

interface BankDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  bank: Bank | null;
  onSubmit: (data: FormData) => void;
}

export default function BankDialog({ isOpen, onOpenChange, bank, onSubmit }: BankDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} action={onSubmit}>
          <DialogHeader>
            <DialogTitle>{bank ? 'Edit' : 'Add New'} Bank</DialogTitle>
            <DialogDescription>Save a bank account for quick use when creating cheques.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bank Name</Label>
              <Input id="name" name="name" defaultValue={bank?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch (Optional)</Label>
              <Input id="branch" name="branch" defaultValue={bank?.branch ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number (Optional)</Label>
              <Input id="accountNumber" name="accountNumber" defaultValue={bank?.accountNumber ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" defaultValue={bank?.notes ?? ''} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Bank</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
