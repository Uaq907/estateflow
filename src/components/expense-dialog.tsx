

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { DatePicker } from './date-picker';
import type { Employee, Expense, Property, Unit } from '@/lib/types';
import { FileText, Percent, Plus, RefreshCcw } from 'lucide-react';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { hasPermission } from '@/lib/permissions';

interface ExpenseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  expense: Expense | null;
  properties: (Property & { units: Unit[] })[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loggedInEmployee: Employee;
}

const expenseCategories = ['Maintenance', 'Utilities', 'Marketing', 'Supplies', 'Legal', 'Other'];
const expenseStatuses: Expense['status'][] = ['Pending', 'Approved', 'Rejected', 'Needs Correction'];

export default function ExpenseDialog({ isOpen, onOpenChange, expense, properties, onSubmit, loggedInEmployee }: ExpenseDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(expense?.propertyId);
  const [isVat, setIsVat] = useState(expense?.isVat ?? false);
  const [baseAmount, setBaseAmount] = useState<number | string>(expense?.baseAmount ?? '');
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(expense?.createdAt ? new Date(expense.createdAt) : new Date());

  const numericBaseAmount = Number(baseAmount) || 0;
  const taxAmount = isVat ? numericBaseAmount * 0.05 : 0;
  const grandTotal = numericBaseAmount + taxAmount;

  useEffect(() => {
    if (isOpen) {
        setSelectedPropertyId(expense?.propertyId);
        setIsVat(expense?.isVat ?? false);
        setBaseAmount(expense?.baseAmount ?? '');
        setExpenseDate(expense?.createdAt ? new Date(expense.createdAt) : new Date());
    }
  }, [isOpen, expense]);

  const canApprove = hasPermission(loggedInEmployee, 'expenses:approve');
  const isOwner = expense ? loggedInEmployee.id === expense.employeeId : true;

  const isEditable = !expense || 
                     (isOwner && expense.status === 'Needs Correction') ||
                     (isOwner && expense.status === 'Pending') ||
                     (canApprove && expense.status === 'Pending');

  const showManagerActionButtons = canApprove && expense?.status === 'Pending';
  
  const showSubmitterActionButtons = !expense || (isOwner && expense.status !== 'Approved' && expense.status !== 'Rejected');
  
  const isFinalStatus = expense?.status === 'Approved' || expense?.status === 'Rejected';


  const getDialogContent = () => {
    if (!expense) { 
      return (
        <>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>Fill in the details for the new expense request.</DialogDescription>
            </div>
            <div className="text-right mr-10">
              <div className="text-sm font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </>
      );
    }
    
    // An approver is reviewing
    if (canApprove && expense.status === 'Pending') {
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle>Review Expense Request</DialogTitle>
                <DialogDescription>Submitted by {expense.employeeName}.</DialogDescription>
              </div>
              <div className="text-right mr-10">
                <div className="text-sm font-medium">{new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </>
        );
    }

    switch (expense.status) {
        case 'Pending':
            return (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle>Edit Expense Request</DialogTitle>
                  </div>
                  <div className="text-right mr-10">
                    <div className="text-sm font-medium">{new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </>
            );
        case 'Needs Correction':
            return (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle>Correct and Resubmit Expense</DialogTitle>
                  </div>
                  <div className="text-right mr-10">
                    <div className="text-sm font-medium">{new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </>
            );
        default:
             return (
               <>
                 <div className="flex justify-between items-start">
                   <div>
                     <DialogTitle>Expense Details</DialogTitle>
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-muted-foreground">Created Date & Time</div>
                     <div className="text-sm font-medium">{new Date(expense.createdAt).toLocaleDateString()} {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                 </div>
               </>
             );
    }
  };

  const availableUnits = properties.find(p => p.id === selectedPropertyId)?.units ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form ref={formRef} onSubmit={onSubmit}>
          <DialogHeader>{getDialogContent()}</DialogHeader>

          {expense && <input type="hidden" name="id" value={expense.id} />}

          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date</Label>
                <DatePicker 
                  name="expenseDate" 
                  value={expenseDate} 
                  onSelect={setExpenseDate} 
                  required 
                  placeholder="Select expense date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property</Label>
                <Select name="propertyId" defaultValue={expense?.propertyId} onValueChange={setSelectedPropertyId} required disabled={!isEditable}>
                  <SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-2"/>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitId">Unit (Optional)</Label>
                <Select name="unitId" defaultValue={expense?.unitId ?? 'property-wide'} disabled={!selectedPropertyId || !isEditable}>
                  <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property-wide">Property-wide Expense</SelectItem>
                    {availableUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.unitNumber}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input id="supplier" name="supplier" defaultValue={expense?.supplier ?? ''} placeholder="e.g., ACME Supplies" disabled={!isEditable}/>
              </div>
            </div>

            <Separator className="my-2"/>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={expense?.category} required disabled={!isEditable}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-2"/>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="isVat" name="isVat" checked={isVat} onCheckedChange={setIsVat} disabled={!isEditable}/>
                    <Label htmlFor="isVat">Add VAT (5%)</Label>
                </div>

                {isVat && (
                    <div className="space-y-2">
                        <Label htmlFor="taxNumber">Tax Number (TRN)</Label>
                        <Input id="taxNumber" name="taxNumber" defaultValue={expense?.taxNumber ?? ''} placeholder="Tax Registration Number" disabled={!isEditable}/>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="baseAmount">Base Amount (AED)</Label>
                    <Input id="baseAmount" name="baseAmount" type="number" step="0.01" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} required disabled={!isEditable} />
                </div>

                {isVat && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tax (5%)</Label>
                            <Input value={taxAmount.toFixed(2)} disabled className="bg-muted"/>
                        </div>
                         <div className="space-y-2">
                            <Label>Grand Total</Label>
                            <Input value={grandTotal.toFixed(2)} disabled className="bg-muted font-bold"/>
                        </div>
                    </div>
                )}
            </div>
            
            <Separator className="my-2"/>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={expense?.description ?? ''} disabled={!isEditable} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="receiptFile">Upload Receipt / Invoice</Label>
                <Input id="receiptFile" name="receiptFile" type="file" required={!expense} disabled={!isEditable} />
                {expense?.receiptUrl && (
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <FileText className="h-4 w-4" />
                            View Current Receipt
                        </Link>
                    </div>
                )}
            </div>

            {expense?.status === 'Needs Correction' && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-md">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Manager's Notes for Correction</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{expense.managerNotes}</p>
                </div>
            )}
            
            {showManagerActionButtons && (
                 <div className="space-y-2">
                    <Label htmlFor="managerNotes">Manager Notes (optional)</Label>
                    <Textarea id="managerNotes" name="managerNotes" placeholder="Reason for rejection or other notes..." />
                 </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            
            {showSubmitterActionButtons && !isFinalStatus && <Button type="submit" value="submit">Submit Request</Button>}

            {showManagerActionButtons && (
                <>
                <Button type="submit" value="needs_correction" variant="secondary">Return for Correction</Button>
                <Button type="submit" value="reject" variant="destructive">Reject</Button>
                <Button type="submit" value="approve">Approve</Button>
                </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
