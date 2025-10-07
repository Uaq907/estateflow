
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, ChevronDown, Building, Home, User } from 'lucide-react';
import type { LeasePayment } from '@/lib/types';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './date-picker';
import { useLanguage } from '@/contexts/language-context';

const paymentStatuses = ['Paid', 'Partially Paid', 'Pending', 'Overdue'];

export default function AllPaymentsList({ payments }: { payments: LeasePayment[] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 20;

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
    
    const translateStatus = (status: string) => {
        switch (status) {
            case 'Paid': return t('paymentsList.statusPaid');
            case 'Partially Paid': return t('paymentsList.statusPartiallyPaid');
            case 'Pending': return t('paymentsList.statusPending');
            case 'Overdue': return t('paymentsList.statusOverdue');
            default: return status;
        }
    }

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const { status } = calculatePaymentStatus(p);
            const lowercasedQuery = searchQuery.toLowerCase();
            const matchesSearch = lowercasedQuery === '' ||
                (p.propertyName && p.propertyName.toLowerCase().includes(lowercasedQuery)) ||
                (p.unitNumber && p.unitNumber.toLowerCase().includes(lowercasedQuery)) ||
                (p.tenantName && p.tenantName.toLowerCase().includes(lowercasedQuery)) ||
                (p.chequeNumber && p.chequeNumber.toLowerCase().includes(lowercasedQuery));

            const matchesStatus = statusFilter === 'all' || status === statusFilter;

            const dueDate = new Date(p.dueDate);
            const fromDate = dateFilter.from;
            const toDate = dateFilter.to;
            const matchesDate = (!fromDate || dueDate >= fromDate) && (!toDate || dueDate <= toDate);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [payments, searchQuery, statusFilter, dateFilter]);

    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * paymentsPerPage,
        currentPage * paymentsPerPage
    );

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                <Input
                    placeholder={t('paymentsList.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:flex-grow"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('paymentsList.filterByStatus')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('paymentsList.allStatuses')}</SelectItem>
                        {paymentStatuses.map(s => <SelectItem key={s} value={s}>{translateStatus(s)}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <DatePicker
                    name="date-from"
                    placeholder={t('paymentsList.dueDateFrom')}
                    value={dateFilter.from}
                    onSelect={date => setDateFilter(prev => ({ ...prev, from: date }))}
                    className="w-full sm:w-[150px]"
                />
                <DatePicker
                    name="date-to"
                    placeholder={t('paymentsList.dueDateTo')}
                    value={dateFilter.to}
                    onSelect={date => setDateFilter(prev => ({ ...prev, to: date }))}
                     className="w-full sm:w-[150px]"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>{t('paymentsList.propertyUnit')}</TableHead>
                            <TableHead>{t('paymentsList.tenant')}</TableHead>
                            <TableHead>{t('paymentsList.dueDate')}</TableHead>
                            <TableHead>{t('paymentsList.amount')}</TableHead>
                            <TableHead>{t('paymentsList.status')}</TableHead>
                            <TableHead><span className="sr-only">{t('paymentsList.lease')}</span></TableHead>
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
                                                        <span className="sr-only">{t('paymentsList.toggleDetails')}</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium"><Building className="h-4 w-4 text-muted-foreground" />{payment.propertyName}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6"><Home className="h-4 w-4" />{t('paymentsList.unit')} {payment.unitNumber}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-muted-foreground" />{payment.tenantName}</div>
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
                                            <TableCell><Badge variant={getStatusBadgeVariant(status)}>{translateStatus(status)}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="link" size="sm"><Link href={`/dashboard/leases/${payment.leaseId}`}>{t('paymentsList.viewLease')}</Link></Button>
                                            </TableCell>
                                        </TableRow>
                                        <CollapsibleContent asChild>
                                            <tr className="bg-muted/50 hover:bg-muted">
                                                <TableCell colSpan={7} className="p-0">
                                                    <div className="p-4 space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-grow">
                                                                <div className="flex justify-between text-sm mb-1">
                                                                    <span className="font-medium">{t('paymentsList.paymentProgress')}</span>
                                                                    <span className={
                                                                        paymentTiming === 'overdue' ? "text-red-500 font-semibold" : 
                                                                        paymentTiming === 'late' ? "text-orange-500 font-semibold" :
                                                                        paymentTiming === 'on-time' && status === 'Paid' ? "text-blue-500 font-semibold" : 
                                                                        "text-muted-foreground"
                                                                    }>
                                                                        {t('paymentsList.balance')}: AED {balance.toLocaleString()}
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
                                                            <h4 className="font-semibold mb-2 text-sm">{t('paymentsList.recordedTransactions')}</h4>
                                                            {payment.transactions && payment.transactions.length > 0 ? (
                                                                <div className="border rounded-md">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow><TableHead>{t('paymentsList.date')}</TableHead><TableHead>{t('paymentsList.amount')}</TableHead><TableHead>{t('paymentsList.method')}</TableHead><TableHead>{t('paymentsList.notes')}</TableHead></TableRow>
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
                                                            ) : <p className="text-sm text-center text-muted-foreground py-4 border rounded-md">{t('paymentsList.noTransactions')}</p>}
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
                                <TableCell colSpan={7} className="text-center h-24">
                                    {t('paymentsList.noPaymentsFound')}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        {t('paymentsList.page')} {currentPage} {t('paymentsList.of')} {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        {t('paymentsList.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        {t('paymentsList.next')}
                    </Button>
                </div>
            )}
        </div>
    );
}
