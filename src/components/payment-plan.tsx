

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { PlusCircle, Edit, Trash2, Receipt, ChevronDown, MoreHorizontal, FileText, AlertTriangle } from 'lucide-react';
import type { Employee, Lease, LeasePayment, PaymentTransaction } from '@/lib/types';
import { format } from 'date-fns';
import { handleAddLeasePayment, handleUpdateLeasePayment, handleDeleteLeasePayment, handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction, uploadFile, reviewPaymentExtension } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getLeasePayments } from '@/lib/db';
import { useLanguage } from '@/contexts/language-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';
import { DatePicker } from './date-picker';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface PaymentPlanProps {
    lease: Lease;
    initialPayments: LeasePayment[];
    loggedInEmployee: Employee | null;
}

const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'Other'];

export default function PaymentPlan({ lease, initialPayments, loggedInEmployee }: PaymentPlanProps) {
    const { t } = useLanguage();
    const [payments, setPayments] = useState(initialPayments);
    const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
    const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
    const [isDeletePaymentAlertOpen, setIsDeletePaymentAlertOpen] = useState(false);
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
    const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
    const [isDeleteTransactionAlertOpen, setIsDeleteTransactionAlertOpen] = useState(false);
    const [isReviewExtensionDialogOpen, setIsReviewExtensionDialogOpen] = useState(false);
    
    const [paymentToDelete, setPaymentToDelete] = useState<LeasePayment | null>(null);
    const [editingPayment, setEditingPayment] = useState<LeasePayment | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<PaymentTransaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<PaymentTransaction | null>(null);
    const [paymentForTransaction, setPaymentForTransaction] = useState<LeasePayment | null>(null);
    const [paymentForExtensionReview, setPaymentForExtensionReview] = useState<LeasePayment | null>(null);
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
    const [addPaymentDueDate, setAddPaymentDueDate] = useState<Date | undefined>();
    const [editPaymentDueDate, setEditPaymentDueDate] = useState<Date | undefined>();
    const [addTransactionDate, setAddTransactionDate] = useState<Date | undefined>(new Date());
    const [editTransactionDate, setEditTransactionDate] = useState<Date | undefined>();


    const { toast } = useToast();

    const handleGeneratePlan = async () => {
        if (payments.length > 0) {
             toast({ variant: 'destructive', title: 'Plan Exists', description: 'A payment plan has already been generated.' });
            return;
        }

        if (!lease.totalLeaseAmount || !lease.numberOfPayments || lease.numberOfPayments === 0) {
            toast({ variant: 'destructive', title: 'Cannot Generate Plan', description: 'Total Lease Amount and Number of Payments must be set.' });
            return;
        }
        
        try {
            const newPayments: Omit<LeasePayment, 'id' | 'transactions' | 'status'>[] = [];

            if (lease.taxedAmount && lease.taxedAmount > 0) {
                const vatAmount = lease.taxedAmount * 0.05;
                newPayments.push({
                    leaseId: lease.id,
                    dueDate: new Date(lease.startDate),
                    amount: vatAmount,
                    description: 'VAT Payment',
                    chequeNumber: null,
                    chequeImageUrl: null,
                });
            }

            const paymentAmount = lease.totalLeaseAmount / lease.numberOfPayments;
            const monthsBetweenPayments = 12 / lease.numberOfPayments;

            for (let i = 0; i < lease.numberOfPayments; i++) {
                const dueDate = new Date(lease.startDate);
                dueDate.setMonth(dueDate.getMonth() + Math.round(i * monthsBetweenPayments));

                newPayments.push({
                    leaseId: lease.id,
                    dueDate: dueDate,
                    amount: paymentAmount,
                    description: `Rent Installment ${i + 1}`,
                    chequeNumber: null,
                    chequeImageUrl: null,
                    paymentMethod: 'Cheque', // Default to Cheque
                });
            }
        
            for (const payment of newPayments) {
                await handleAddLeasePayment(payment);
            }
            const updatedPayments = await getLeasePayments(lease.id);
            setPayments(updatedPayments);
            toast({ title: "Success", description: "Payment plan generated successfully."});
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to generate payment plan: ${error.message}` });
        }
    };
    
    const refreshPayments = async () => {
        const updatedPayments = await getLeasePayments(lease.id);
        setPayments(updatedPayments);
    }
    
    const handleAddPaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        let chequeImageUrl: string | undefined;
        const chequeFile = formData.get('chequeImage') as File;
        if (chequeFile && chequeFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'chequeImage', 'payments');
            if (!uploadResult.success) { 
                toast({ variant: 'destructive', title: 'Cheque Upload Failed', description: uploadResult.message }); 
                return; 
            }
            chequeImageUrl = uploadResult.filePath;
        }
        
        const paymentData: Omit<LeasePayment, 'id' | 'transactions' | 'status'> = {
            leaseId: lease.id,
            dueDate: new Date(formData.get('dueDate') as string),
            amount: Number(formData.get('amount')),
            description: formData.get('description') as string,
            chequeNumber: formData.get('chequeNumber') as string,
            chequeImageUrl: chequeImageUrl,
            paymentMethod: formData.get('paymentMethod') as string | null,
        };
        
        const result = await handleAddLeasePayment(paymentData);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsAddPaymentDialogOpen(false);
        } else {
             toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }

    const handleEditPaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingPayment) return;
        const formData = new FormData(event.currentTarget);
        
        let chequeImageUrl: string | undefined | null = editingPayment.chequeImageUrl;
        const chequeFile = formData.get('chequeImage') as File;
        if (chequeFile && chequeFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'chequeImage', 'payments');
            if (!uploadResult.success) { 
                toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message }); 
                return; 
            }
            chequeImageUrl = uploadResult.filePath;
        }

        const paymentData: Partial<Omit<LeasePayment, 'id' | 'leaseId' | 'transactions'>> = {
            dueDate: new Date(formData.get('dueDate') as string),
            amount: Number(formData.get('amount')),
            description: formData.get('description') as string,
            chequeNumber: formData.get('chequeNumber') as string,
            chequeImageUrl: chequeImageUrl,
            paymentMethod: formData.get('paymentMethod') as string
        };
        
        const result = await handleUpdateLeasePayment(editingPayment.id, paymentData);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsEditPaymentDialogOpen(false);
        } else {
             toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }
    
    const handleDeletePaymentConfirm = async () => {
        if (!paymentToDelete) return;
        const result = await handleDeleteLeasePayment(paymentToDelete.id);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsDeletePaymentAlertOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }
    
    const handleAddTransactionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!paymentForTransaction) return;
        const formData = new FormData(event.currentTarget);
        
        const { balance } = calculatePaymentStatus(paymentForTransaction);
        const amountPaid = Number(formData.get('amountPaid'));

        if (amountPaid > balance) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: `Payment of AED ${amountPaid.toLocaleString()} exceeds the remaining balance of AED ${balance.toLocaleString()}.`
            });
            return;
        }


        let documentUrl: string | undefined;
        const docFile = formData.get('document') as File;
        if (docFile && docFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'document', 'transactions');
            if (!uploadResult.success) { 
                toast({ variant: 'destructive', title: 'Document Upload Failed', description: uploadResult.message }); 
                return;
            }
            documentUrl = uploadResult.filePath;
        }

        const transactionData: Omit<PaymentTransaction, 'id'> = {
            leasePaymentId: paymentForTransaction.id,
            amountPaid: amountPaid,
            paymentDate: new Date(formData.get('paymentDate') as string),
            paymentMethod: formData.get('paymentMethod') as string,
            notes: formData.get('notes') as string,
            documentUrl: documentUrl || null,
        };

        const result = await handleAddTransaction(transactionData);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsAddTransactionDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }
    
    const handleEditTransactionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingTransaction) return;
        const formData = new FormData(event.currentTarget);

        let documentUrl: string | undefined | null = editingTransaction.documentUrl;
        const docFile = formData.get('document') as File;
        if (docFile && docFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'document', 'transactions');
            if (!uploadResult.success) { 
                toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message }); 
                return; 
            }
            documentUrl = uploadResult.filePath;
        }
        
        const transactionData: Partial<Omit<PaymentTransaction, 'id' | 'leasePaymentId'>> = {
            amountPaid: Number(formData.get('amountPaid')),
            paymentDate: new Date(formData.get('paymentDate') as string),
            paymentMethod: formData.get('paymentMethod') as string,
            notes: formData.get('notes') as string,
            documentUrl,
        };

        const result = await handleUpdateTransaction(editingTransaction.id, transactionData);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsEditTransactionDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    const handleDeleteTransactionConfirm = async () => {
        if (!transactionToDelete) return;
        const result = await handleDeleteTransaction(transactionToDelete.id);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsDeleteTransactionAlertOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    
    const handleReviewExtensionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!paymentForExtensionReview) return;

        const formData = new FormData(event.currentTarget);
        const approved = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'approve';
        const managerNotes = formData.get('managerNotes') as string;
        
        const result = await reviewPaymentExtension(paymentForExtensionReview.id, approved, managerNotes);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsReviewExtensionDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }

    const openEditDialog = (payment: LeasePayment) => {
        setEditingPayment(payment);
        setEditPaymentDueDate(new Date(payment.dueDate));
        setIsEditPaymentDialogOpen(true);
    };

    const openDeleteDialog = (payment: LeasePayment) => {
        setPaymentToDelete(payment);
        setIsDeletePaymentAlertOpen(true);
    };

    const openAddTransactionDialog = (payment: LeasePayment) => {
        setPaymentForTransaction(payment);
        setSelectedPaymentMethod(paymentMethods[0]);
        setAddTransactionDate(new Date());
        setIsAddTransactionDialogOpen(true);
    };
    
    const openEditTransactionDialog = (transaction: PaymentTransaction) => {
        setEditingTransaction(transaction);
        setEditTransactionDate(new Date(transaction.paymentDate));
        setIsEditTransactionDialogOpen(true);
    };

    const openDeleteTransactionDialog = (transaction: PaymentTransaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteTransactionAlertOpen(true);
    };

    const openReviewExtensionDialog = (payment: LeasePayment) => {
        setPaymentForExtensionReview(payment);
        setIsReviewExtensionDialogOpen(true);
    };

    const calculatePaymentStatus = (payment: LeasePayment): { status: string; paidAmount: number; progress: number, balance: number } => {
        const paidAmount = payment.transactions?.reduce((acc, t) => acc + t.amountPaid, 0) ?? 0;
        const progress = payment.amount > 0 ? (paidAmount / payment.amount) * 100 : 0;
        const balance = payment.amount - paidAmount;
        let status = 'Pending';
        if (paidAmount > 0) {
            status = paidAmount >= payment.amount ? 'Paid' : 'Partially Paid';
        } else if (new Date(payment.dueDate) < new Date() && balance > 0) {
            status = 'Overdue';
        }
        return { status, paidAmount, progress, balance };
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch(status) {
            case 'Paid': return 'default';
            case 'Partially Paid': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('paymentPlan.title')}</CardTitle>
                    <CardDescription>{t('paymentPlan.description')}</CardDescription>
                </div>
                {loggedInEmployee && (
                    <div className="flex gap-2">
                        {payments.length === 0 && (
                            <Button onClick={handleGeneratePlan}><PlusCircle />{t('paymentPlan.generatePlan')}</Button>
                        )}
                        <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
                            <DialogTrigger asChild><Button variant="outline"><PlusCircle/>{t('paymentPlan.addPayment')}</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader><DialogTitle>{t('paymentPlan.addManualPayment')}</DialogTitle><DialogDescription>{t('paymentPlan.addSinglePayment')}</DialogDescription></DialogHeader>
                                <form onSubmit={handleAddPaymentSubmit}>
                                <div className="grid gap-4 py-4">
                                     <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" required placeholder="e.g. Rent Installment" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dueDate">Due Date</Label>
                                            <DatePicker name="dueDate" value={addPaymentDueDate} onSelect={setAddPaymentDueDate} required />
                                        </div>
                                        <div className="space-y-2"><Label htmlFor="amount">Amount (AED)</Label><Input id="amount" name="amount" type="number" required /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="chequeNumber">Cheque Number</Label><Input id="chequeNumber" name="chequeNumber" /></div></div>
                                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select name="paymentMethod"><SelectTrigger><SelectValue placeholder="Select method"/></SelectTrigger><SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div></div>
                                     <div className="space-y-2"><Label htmlFor="chequeImage">Upload Cheque Image</Label><Input id="chequeImage" name="chequeImage" type="file" /><p className="text-xs text-muted-foreground mt-1">Max file size: 5MB.</p></div>
                                </div>
                                <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>Cancel</Button><Button type="submit">Add Payment</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>{t('paymentPlan.dueDate')}</TableHead>
                                <TableHead>{t('paymentPlan.description_label')}</TableHead>
                                <TableHead>{t('paymentPlan.amountDue')}</TableHead>
                                <TableHead>{t('paymentPlan.chequeDetails')}</TableHead>
                                <TableHead>{t('paymentPlan.amountPaid')}</TableHead>
                                <TableHead>{t('paymentPlan.remainingBalance')}</TableHead>
                                <TableHead>{t('paymentPlan.status')}</TableHead>
                                <TableHead><span className="sr-only">{t('paymentPlan.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        
                            {payments.length > 0 ? (
                                payments.map(payment => {
                                    const { status, paidAmount, progress, balance } = calculatePaymentStatus(payment);
                                    const isChequeMissingImage = payment.paymentMethod === 'Cheque' && !payment.chequeImageUrl;
                                    return (
                                    <Collapsible asChild key={payment.id}>
                                        <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="w-9 p-0">
                                                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180"/>
                                                        <span className="sr-only">Toggle details</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </TableCell>
                                            <TableCell>{format(new Date(payment.dueDate), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{payment.description ?? 'N/A'}</TableCell>
                                            <TableCell>AED {payment.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-2'>
                                                    <span>{payment.chequeNumber || 'N/A'}</span>
                                                    {isChequeMissingImage && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Cheque image is missing.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                                {payment.chequeImageUrl && (
                                                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                                        <Link href={payment.chequeImageUrl} target="_blank">View Image</Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>AED {paidAmount.toLocaleString()}</TableCell>
                                            <TableCell>AED {balance.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => openEditDialog(payment)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteDialog(payment)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                            <tr className="bg-muted/50 hover:bg-muted">
                                                <TableCell colSpan={9} className="p-0">
                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2">{t('paymentPlan.paymentProgress')}</h4>
                                                            <Progress value={progress} className="h-2"/>
                                                        </div>
                                                        {payment.extensionStatus === 'Pending' && loggedInEmployee && (
                                                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-md flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Extension Requested</h4>
                                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">New date: {payment.requestedDueDate ? format(new Date(payment.requestedDueDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                                                </div>
                                                                <Button size="sm" onClick={() => openReviewExtensionDialog(payment)}>Review Request</Button>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-semibold">{t('paymentPlan.recordedTransactions')}</h4>
                                                            <Button size="sm" variant="outline" onClick={() => openAddTransactionDialog(payment)}><PlusCircle className="mr-2"/>{t('paymentPlan.addTransaction')}</Button>
                                                        </div>
                                                        {payment.transactions && payment.transactions.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow><TableHead>Date Paid</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Notes</TableHead><TableHead>Document</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                {payment.transactions.map(tx => (
                                                                    <TableRow key={tx.id}>
                                                                        <TableCell>{format(new Date(tx.paymentDate), 'dd/MM/yyyy')}</TableCell>
                                                                        <TableCell>AED {tx.amountPaid.toLocaleString()}</TableCell>
                                                                        <TableCell>{tx.paymentMethod}</TableCell>
                                                                        <TableCell>{tx.notes}</TableCell>
                                                                        <TableCell>
                                                                            {tx.documentUrl && (
                                                                                <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                                                                    <Link href={tx.documentUrl} target="_blank"><Receipt className="mr-1 h-3 w-3" />View</Link>
                                                                                </Button>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                                                <DropdownMenuContent>
                                                                                    <DropdownMenuItem onClick={() => openEditTransactionDialog(tx)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => openDeleteTransactionDialog(tx)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : <p className="text-sm text-center text-muted-foreground py-4">No transactions recorded for this installment.</p>}
                                                    </div>
                                                </TableCell>
                                            </tr>
                                        </CollapsibleContent>
                                        </TableBody>
                                    </Collapsible>
                                )})
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">
                                            No payments scheduled. Generate a plan or add payments manually.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                    </Table>
                </div>
            </CardContent>

            {/* Edit Payment Dialog */}
            <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Payment Installment</DialogTitle></DialogHeader>
                    {editingPayment && (
                    <form onSubmit={handleEditPaymentSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" defaultValue={editingPayment.description ?? ''} required/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <DatePicker name="dueDate" value={editPaymentDueDate} onSelect={setEditPaymentDueDate} required />
                                </div>
                                <div className="space-y-2"><Label htmlFor="amount">Amount (AED)</Label><Input id="amount" name="amount" type="number" defaultValue={editingPayment.amount} required/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="chequeNumber">Cheque Number</Label><Input id="chequeNumber" name="chequeNumber" defaultValue={editingPayment.chequeNumber ?? ''} /></div></div>
                            <div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select name="paymentMethod" defaultValue={editingPayment.paymentMethod ?? undefined}><SelectTrigger><SelectValue placeholder="Select method"/></SelectTrigger><SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="chequeImage">Upload Cheque Image</Label><Input id="chequeImage" name="chequeImage" type="file" /><p className="text-xs text-muted-foreground mt-1">Max file size: 5MB.</p>
                             {editingPayment.chequeImageUrl && (
                                <Button asChild variant="link" size="sm" className="p-0 h-auto justify-start">
                                    <Link href={editingPayment.chequeImageUrl} target="_blank"><FileText className="mr-2"/>View Current Cheque</Link>
                                </Button>
                             )}
                            </div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditPaymentDialogOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
                    </form>
                    )}
                </DialogContent>
            </Dialog>

             {/* Add Transaction Dialog */}
            <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Transaction for Installment</DialogTitle><DialogDescription>Installment Due: {paymentForTransaction && format(new Date(paymentForTransaction.dueDate), 'dd/MM/yyyy')} for AED {paymentForTransaction?.amount.toLocaleString()}</DialogDescription></DialogHeader>
                    {paymentForTransaction && (
                    <form onSubmit={handleAddTransactionSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate">Payment Date</Label>
                                    <DatePicker name="paymentDate" value={addTransactionDate} onSelect={setAddTransactionDate} required />
                                </div>
                                <div className="space-y-2"><Label htmlFor="amountPaid">Amount Paid (AED)</Label><Input id="amountPaid" name="amountPaid" type="number" step="0.01" required placeholder="e.g. 500.00" /></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select name="paymentMethod" value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="document">{selectedPaymentMethod === 'Cheque' ? 'Upload Cheque' : 'Upload Receipt'}</Label><Input id="document" name="document" type="file" /><p className="text-xs text-muted-foreground mt-1">Max file size: 5MB.</p></div>
                            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" name="notes" placeholder="Optional notes"/></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)}>Cancel</Button><Button type="submit">Record Transaction</Button></DialogFooter>
                    </form>
                    )}
                </DialogContent>
            </Dialog>
            
            {/* Edit Transaction Dialog */}
            <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
                    {editingTransaction && (
                    <form onSubmit={handleEditTransactionSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate">Payment Date</Label>
                                    <DatePicker name="paymentDate" value={editTransactionDate} onSelect={setEditTransactionDate} required />
                                </div>
                                <div className="space-y-2"><Label htmlFor="amountPaid">Amount Paid (AED)</Label><Input id="amountPaid" name="amountPaid" type="number" step="0.01" defaultValue={editingTransaction.amountPaid} required /></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="paymentMethod">Payment Method</Label><Select name="paymentMethod" defaultValue={editingTransaction.paymentMethod ?? undefined}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="document">Upload New Document</Label><Input id="document" name="document" type="file" /><p className="text-xs text-muted-foreground mt-1">Max file size: 5MB.</p></div>
                            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" name="notes" defaultValue={editingTransaction.notes ?? ''} placeholder="Optional notes"/></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditTransactionDialogOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
                    </form>
                    )}
                </DialogContent>
            </Dialog>
            
             <AlertDialog open={isDeletePaymentAlertOpen} onOpenChange={setIsDeletePaymentAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the payment installment and all its transactions.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeletePaymentConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Transaction Alert */}
            <AlertDialog open={isDeleteTransactionAlertOpen} onOpenChange={setIsDeleteTransactionAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the transaction record.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteTransactionConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Review Extension Dialog */}
            <Dialog open={isReviewExtensionDialogOpen} onOpenChange={setIsReviewExtensionDialogOpen}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Payment Extension</DialogTitle>
                        <DialogDescription>
                            Tenant has requested an extension for this payment.
                        </DialogDescription>
                    </DialogHeader>
                    {paymentForExtensionReview && (
                        <form onSubmit={handleReviewExtensionSubmit}>
                            <div className="grid gap-4 py-4">
                                <div>
                                    <p><strong>Original Due Date:</strong> {format(new Date(paymentForExtensionReview.dueDate), 'dd/MM/yyyy')}</p>
                                    <p><strong>Requested Due Date:</strong> {paymentForExtensionReview.requestedDueDate ? format(new Date(paymentForExtensionReview.requestedDueDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-md">
                                    <p className="font-semibold text-sm">Tenant's Reason:</p>
                                    <p className="text-sm text-muted-foreground">{paymentForExtensionReview.extensionReason || 'No reason provided.'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="managerNotes">Manager Notes (optional)</Label>
                                    <Textarea id="managerNotes" name="managerNotes" placeholder="Provide a reason for rejection or other notes..." />
                                </div>
                            </div>
                             <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsReviewExtensionDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" value="reject" variant="destructive">Reject</Button>
                                <Button type="submit" value="approve">Approve</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

