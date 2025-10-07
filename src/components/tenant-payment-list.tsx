
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, ChevronDown, Building, Home } from 'lucide-react';
import type { LeasePayment } from '@/lib/types';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const paymentStatuses = ['Paid', 'Partially Paid', 'Pending', 'Overdue'];

export default function TenantPaymentList({ payments }: { payments: LeasePayment[] }) {
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 10;

    const properties = useMemo(() => {
        const uniqueProperties = new Map<string, string>();
        payments.forEach(p => {
            if (p.propertyName) {
                uniqueProperties.set(p.propertyName, p.propertyName);
            }
        });
        return Array.from(uniqueProperties.values());
    }, [payments]);

    const calculatePaymentStatus = (payment: LeasePayment) => {
        const paidAmount = payment.transactions?.reduce((acc, t) => acc + t.amountPaid, 0) ?? 0;
        const progress = payment.amount > 0 ? (paidAmount / payment.amount) * 100 : 0;
        const balance = payment.amount - paidAmount;
        const today = new Date();
        const dueDate = new Date(payment.dueDate);
        
        let status = 'Pending';
        let paymentTiming = 'on-time'; // 'on-time', 'late', 'overdue'
        
        if (paidAmount > 0) {
            // Check if payment was made on time
            const paymentDate = payment.transactions?.[0]?.paymentDate ? new Date(payment.transactions[0].paymentDate) : today;
            if (paymentDate <= dueDate) {
                paymentTiming = 'on-time';
            } else {
                paymentTiming = 'late';
            }
            
            status = paidAmount >= payment.amount ? 'Paid' : 'Partially Paid';
        } else if (dueDate < today && balance > 0) {
            status = 'Overdue';
            paymentTiming = 'overdue';
        }
        
        return { status, paidAmount, progress, balance, paymentTiming };
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Partially Paid': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    }

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const { status } = calculatePaymentStatus(p);
            const matchesProperty = propertyFilter === 'all' || p.propertyName === propertyFilter;
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            return matchesProperty && matchesStatus;
        });
    }, [payments, propertyFilter, statusFilter]);

    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * paymentsPerPage,
        currentPage * paymentsPerPage
    );

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>A complete log of all payment installments for this tenant.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                    <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by Property" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Property / Unit</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Lease</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        
                            {paginatedPayments.length > 0 ? (
                                paginatedPayments.map(payment => {
                                    const { status, paidAmount, progress, balance, paymentTiming } = calculatePaymentStatus(payment);
                                    return (
                                        <Collapsible asChild key={payment.id}>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                                                <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                                                <span className="sr-only">Toggle details</span>
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <Building className="h-4 w-4 text-muted-foreground" />
                                                            {payment.propertyName}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                                                            <Home className="h-4 w-4" />
                                                            Unit {payment.unitNumber}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground pl-6">ID: {payment.id}</div>
                                                    </TableCell>
                                                    <TableCell className={
                                                        paymentTiming === 'overdue' ? "text-red-500 font-semibold" : 
                                                        paymentTiming === 'late' ? "text-orange-500 font-semibold" :
                                                        paymentTiming === 'on-time' && status === 'Paid' ? "text-blue-500 font-semibold" : ""
                                                    }>
                                                        {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                                                    </TableCell>
                                                    <TableCell className={
                                                        paymentTiming === 'overdue' ? "text-red-500 font-semibold" : 
                                                        paymentTiming === 'late' ? "text-orange-500 font-semibold" :
                                                        paymentTiming === 'on-time' && status === 'Paid' ? "text-blue-500 font-semibold" : ""
                                                    }>
                                                        AED {payment.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell><Badge variant={getStatusBadgeVariant(status)}>{status}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="link" size="sm"><Link href={`/dashboard/leases/${payment.leaseId}`}>View Lease</Link></Button>
                                                    </TableCell>
                                                </TableRow>
                                                <CollapsibleContent asChild>
                                                    <tr className="bg-muted/50 hover:bg-muted">
                                                        <TableCell colSpan={6} className="p-0">
                                                            <div className="p-4 space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex-grow">
                                                                        <div className="flex justify-between text-sm mb-1">
                                                                            <span className="font-medium">Payment Progress</span>
                                                                            <span className={
                                                                                paymentTiming === 'overdue' ? "text-red-500 font-semibold" : 
                                                                                paymentTiming === 'late' ? "text-orange-500 font-semibold" :
                                                                                paymentTiming === 'on-time' && status === 'Paid' ? "text-blue-500 font-semibold" : 
                                                                                "text-muted-foreground"
                                                                            }>
                                                                                Balance: AED {balance.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <Progress 
                                                                            value={progress} 
                                                                            className={`h-2 ${
                                                                                paymentTiming === 'overdue' ? '[&>div]:bg-red-500' : 
                                                                                paymentTiming === 'late' ? '[&>div]:bg-orange-500' :
                                                                                paymentTiming === 'on-time' && status === 'Paid' ? '[&>div]:bg-blue-500' : ''
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 text-sm">Recorded Transactions</h4>
                                                                    {payment.transactions && payment.transactions.length > 0 ? (
                                                                        <div className="border rounded-md">
                                                                            <Table>
                                                                                <TableHeader>
                                                                                    <TableRow><TableHead>Date Paid</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Notes</TableHead></TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                    {payment.transactions.map(tx => (
                                                                                        <TableRow key={tx.id}>
                                                                                            <TableCell>{format(new Date(tx.paymentDate), 'dd/MM/yyyy')}</TableCell>
                                                                                            <TableCell>AED {tx.amountPaid.toLocaleString()}</TableCell>
                                                                                            <TableCell>{tx.paymentMethod}</TableCell>
                                                                                            <TableCell>{tx.notes}</TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                    ) : <p className="text-sm text-center text-muted-foreground py-4 border rounded-md">No transactions recorded for this installment.</p>}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </tr>
                                                </CollapsibleContent>
                                            </TableBody>
                                        </Collapsible>
                                    )
                                })
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            No payments found.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                    </Table>
                </div>
            </CardContent>
             {totalPages > 1 && (
                <CardFooter className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
