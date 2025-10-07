
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Receipt, ChevronDown, Hourglass, CheckCircle, XCircle, Info } from 'lucide-react';
import type { Employee, Lease, LeasePayment, PaymentTransaction } from '@/lib/types';
import { format, isFuture } from 'date-fns';
import { requestPaymentExtension } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getLeasePayments } from '@/lib/db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/date-picker';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';


interface TenantPaymentPlanProps {
    lease: Lease;
    initialPayments: LeasePayment[];
}

export function TenantPaymentPlan({ lease, initialPayments }: TenantPaymentPlanProps) {
    const [payments, setPayments] = useState(initialPayments);
    const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);
    const [paymentForExtension, setPaymentForExtension] = useState<LeasePayment | null>(null);
    const [requestedDate, setRequestedDate] = useState<Date | undefined>();

    const { toast } = useToast();

    const refreshPayments = async () => {
        const updatedPayments = await getLeasePayments(lease.id);
        setPayments(updatedPayments);
    }

    const openExtensionDialog = (payment: LeasePayment) => {
        setPaymentForExtension(payment);
        setRequestedDate(new Date(payment.dueDate));
        setIsExtensionDialogOpen(true);
    }
    
    const handleExtensionRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!paymentForExtension || !requestedDate) return;

        const formData = new FormData(event.currentTarget);
        const reason = formData.get('reason') as string;

        const result = await requestPaymentExtension(paymentForExtension.id, requestedDate, reason);
        if (result.success) {
            await refreshPayments();
            toast({ title: 'Success', description: result.message });
            setIsExtensionDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    }
    

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
    
     const getExtensionStatusBadge = (status: LeasePayment['extensionStatus']) => {
        if (!status) return null;
        switch(status) {
            case 'Pending': return <Badge variant="secondary"><Hourglass className="mr-1 h-3 w-3" />Pending</Badge>;
            case 'Approved': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
            case 'Rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Payment Plan</CardTitle>
                    <CardDescription>Your upcoming payment schedule.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount Due</TableHead>
                                <TableHead>Amount Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Extension</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        
                            {payments.length > 0 ? (
                                payments.map(payment => {
                                    const { status, paidAmount, progress } = calculatePaymentStatus(payment);
                                    const canRequestExtension = status !== 'Paid' && !payment.extensionRequested && isFuture(new Date(payment.dueDate));

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
                                            <TableCell>{payment.extensionStatus === 'Approved' && payment.requestedDueDate ? format(new Date(payment.requestedDueDate), 'dd/MM/yyyy') : format(new Date(payment.dueDate), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{payment.description ?? 'N/A'}</TableCell>
                                            <TableCell>AED {payment.amount.toLocaleString()}</TableCell>
                                            <TableCell>AED {paidAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getExtensionStatusBadge(payment.extensionStatus)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canRequestExtension && (
                                                    <Button variant="outline" size="sm" onClick={() => openExtensionDialog(payment)}>
                                                        <Hourglass className="mr-2 h-4 w-4"/> Request Extension
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                            <tr className="bg-muted/50 hover:bg-muted">
                                                <TableCell colSpan={8} className="p-0">
                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2">Payment Progress</h4>
                                                            <Progress value={progress} className="h-2"/>
                                                        </div>
                                                        {payment.extensionStatus === 'Rejected' && payment.managerNotes && (
                                                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                                                <h4 className="font-semibold text-destructive flex items-center gap-2"><Info className="h-4 w-4"/> Manager's Note on Extension</h4>
                                                                <p className="text-sm text-destructive/80 mt-1">{payment.managerNotes}</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold mb-2">Recorded Transactions</h4>
                                                            {payment.transactions && payment.transactions.length > 0 ? (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow><TableHead>Date Paid</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Notes</TableHead><TableHead>Document</TableHead></TableRow>
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
                                                                        </TableRow>
                                                                    ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : <p className="text-sm text-center text-muted-foreground py-4">No transactions recorded for this installment.</p>}
                                                        </div>
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
                                        <TableCell colSpan={8} className="text-center h-24">
                                            No payments scheduled.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                    </Table>
                </div>
            </CardContent>

            <Dialog open={isExtensionDialogOpen} onOpenChange={setIsExtensionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Payment Extension</DialogTitle>
                        <DialogDescription>
                            Original due date: {paymentForExtension && format(new Date(paymentForExtension.dueDate), 'dd/MM/yyyy')}
                        </DialogDescription>
                    </DialogHeader>
                    {paymentForExtension && (
                        <form onSubmit={handleExtensionRequestSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="requestedDueDate">New Requested Due Date</Label>
                                    <DatePicker name="requestedDueDate" value={requestedDate} onSelect={setRequestedDate} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Extension</Label>
                                    <Textarea id="reason" name="reason" required placeholder="Please provide a brief reason for your request..." />
                                </div>
                            </div>
                             <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsExtensionDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Submit Request</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
