

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Landmark, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { handleAddCheque, handleUpdateCheque, handleDeleteCheque, uploadFile, handleAddChequeTransaction, handleUpdateChequeTransaction, handleDeleteChequeTransaction } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getCheques } from '@/lib/db';
import type { Employee, Cheque, Payee, Tenant, Bank as BankType, ChequeTransaction } from '@/lib/types';
import ChequeList from './cheque-list';
import ChequeDialog from './cheque-dialog';
import ChequeTransactionDialog from './cheque-transaction-dialog';
import { AppHeader } from './layout/header';
import { hasPermission } from '@/lib/permissions';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './date-picker';
import ChequeDashboardCards from './cheque-dashboard-cards';
import { Label } from './ui/label';
import { useLanguage } from '@/contexts/language-context';

const chequeStatuses = ['Submitted', 'Pending', 'Partially Paid', 'Cleared', 'Bounced', 'Cancelled'];

export default function ChequeManagementClient({
  initialCheques,
  savedPayees,
  tenants,
  businessNames,
  banks,
  loggedInEmployee
}: {
  initialCheques: Cheque[],
  savedPayees: Payee[],
  tenants: Tenant[],
  businessNames: any[],
  banks: BankType[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const [cheques, setCheques] = useState<Cheque[]>(initialCheques);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('active');
  const [bankFilter, setBankFilter] = useState('all');
  const [payeeFilter, setPayeeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [chequesPerPage, setChequesPerPage] = useState(10);

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ChequeTransaction | null>(null);
  const [chequeForTransaction, setChequeForTransaction] = useState<Cheque | null>(null);


  const canRead = hasPermission(loggedInEmployee, 'cheques:read');
  const canCreate = hasPermission(loggedInEmployee, 'cheques:create');
  const canUpdate = hasPermission(loggedInEmployee, 'cheques:update');
  const canDelete = hasPermission(loggedInEmployee, 'cheques:delete');
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'cheques:documents:update');

  const refreshCheques = async () => {
    const updatedCheques = await getCheques();
    setCheques(updatedCheques);
  }

  const handleAddNew = () => {
    setEditingCheque(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (cheque: Cheque) => {
    setEditingCheque(cheque);
    setIsDialogOpen(true);
  };

  const handleDelete = async (chequeId: string) => {
    if (!canDelete) {
        toast({ variant: 'destructive', title: t('cheques.permissionDenied'), description: t('cheques.noPermissionDelete') });
        return;
    }
    const result = await handleDeleteCheque(chequeId);
    if (result.success) {
        toast({ title: t('cheques.success'), description: result.message });
        await refreshCheques();
    } else {
        toast({ variant: 'destructive', title: t('cheques.error'), description: result.message });
    }
  }
  
  const getPayeeName = (cheque: Cheque): string => {
      if (cheque.payeeType === 'manual') return cheque.manualPayeeName || '';
      if (cheque.payeeType === 'saved') return cheque.savedPayeeName || '';
      if (cheque.payeeType === 'tenant') return cheque.tenantName || '';
      return '';
  }
  
  const uniquePayeeNames = useMemo(() => {
    const names = new Set<string>();
    cheques.forEach(cheque => {
      const name = getPayeeName(cheque);
      if (name) {
        names.add(name);
      }
    });
    return Array.from(names).sort();
  }, [cheques]);


  const filteredCheques = useMemo(() => {
    return cheques.filter(cheque => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const matchesSearch = lowercasedQuery === '' ||
            (cheque.id.toLowerCase().includes(lowercasedQuery)) ||
            (cheque.chequeNumber && cheque.chequeNumber.toLowerCase().includes(lowercasedQuery)) ||
            (getPayeeName(cheque) && getPayeeName(cheque).toLowerCase().includes(lowercasedQuery)) ||
            (cheque.amount.toString().includes(lowercasedQuery));

        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = cheque.status !== 'Cleared' && cheque.status !== 'Cancelled';
        } else if (statusFilter !== 'all') {
            matchesStatus = cheque.status === statusFilter;
        }

        const matchesBank = bankFilter === 'all' || cheque.bankId === bankFilter;
        
        const matchesPayee = payeeFilter === 'all' || getPayeeName(cheque) === payeeFilter;

        const chequeDueDate = cheque.dueDate ? new Date(cheque.dueDate) : null;
        if (!chequeDueDate) return false;
        chequeDueDate.setHours(0, 0, 0, 0);

        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);

        const matchesDate = (!fromDate || chequeDueDate >= fromDate) && 
                            (!toDate || chequeDueDate <= toDate);
        
        return matchesSearch && matchesStatus && matchesBank && matchesPayee && matchesDate;
    });
  }, [cheques, searchQuery, statusFilter, bankFilter, payeeFilter, dateFilter]);
  
  const totalPages = Math.ceil(filteredCheques.length / chequesPerPage);
  const paginatedCheques = filteredCheques.slice(
    (currentPage - 1) * chequesPerPage,
    currentPage * chequesPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


  const handleSubmit = async (formData: FormData) => {
    let chequeImageUrl: string | undefined | null = editingCheque?.chequeImageUrl;
    
    const chequeImageFile = formData.get('chequeImage') as File;
    if (chequeImageFile && chequeImageFile.size > 0) {
      if (!canUpdateDocuments) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You cannot upload documents.' });
        return;
      }
      const uploadResult = await uploadFile(formData, 'chequeImage', 'cheques');
      if (!uploadResult.success) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message });
        return;
      }
      chequeImageUrl = uploadResult.filePath;
    }
    
    const chequeData: Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'> = {
        transactions: [],
        payeeType: formData.get('payeeType') as any,
        payeeId: formData.get('payeeId') as string | null,
        tenantId: formData.get('tenantId') as string | null,
        manualPayeeName: formData.get('manualPayeeName') as string | null,
        bankId: formData.get('bankId') as string,
        chequeNumber: formData.get('chequeNumber') as string,
        amount: Number(formData.get('amount')),
        chequeDate: new Date(formData.get('chequeDate') as string),
        dueDate: new Date(formData.get('dueDate') as string),
        status: formData.get('status') as any,
        description: formData.get('description') as string,
        chequeImageUrl: chequeImageUrl,
        createdById: loggedInEmployee?.id,
    };
    
    const payeeType = formData.get('payeeType');
    if (payeeType === 'saved') {
        chequeData.tenantId = null;
        chequeData.manualPayeeName = null;
    } else if (payeeType === 'tenant') {
        chequeData.payeeId = null;
        chequeData.manualPayeeName = null;
    } else {
        chequeData.payeeId = null;
        chequeData.tenantId = null;
    }


    const result = editingCheque
        ? await handleUpdateCheque(editingCheque.id, chequeData)
        : await handleAddCheque(chequeData);

    if (result.success) {
        toast({ title: t('cheques.success'), description: result.message });
        await refreshCheques();
        setIsDialogOpen(false);
    } else {
        toast({ variant: 'destructive', title: t('cheques.error'), description: result.message });
    }
  };
  
    const handleAddTransactionClick = (cheque: Cheque) => {
        setChequeForTransaction(cheque);
        setEditingTransaction(null);
        setIsTransactionDialogOpen(true);
    };

    const handleEditTransactionClick = (transaction: ChequeTransaction) => {
        const parentCheque = cheques.find(c => c.transactions?.some(t => t.id === transaction.id));
        setChequeForTransaction(parentCheque ?? null);
        setEditingTransaction(transaction);
        setIsTransactionDialogOpen(true);
    };
    
    const handleDeleteTransactionClick = async (transactionId: string) => {
         if (!canUpdate) {
            toast({ variant: 'destructive', title: t('cheques.permissionDenied'), description: t('cheques.noPermissionUpdate') });
            return;
        }
        const result = await handleDeleteChequeTransaction(transactionId);
        if (result.success) {
            toast({ title: t('cheques.success'), description: result.message });
            await refreshCheques();
        } else {
            toast({ variant: 'destructive', title: t('cheques.error'), description: result.message });
        }
    }


    const handleTransactionSubmit = async (formData: FormData) => {
        if (!chequeForTransaction) return;

        let documentUrl: string | undefined | null = editingTransaction?.documentUrl;
        const docFile = formData.get('documentUrl') as File;
        if (docFile && docFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'documentUrl', 'cheque_transactions');
            if (!uploadResult.success) {
                toast({ variant: 'destructive', title: t('cheques.uploadFailed'), description: uploadResult.message });
                return;
            }
            documentUrl = uploadResult.filePath;
        }

        const transactionData = {
            chequeId: chequeForTransaction.id,
            amountPaid: Number(formData.get('amountPaid')),
            paymentDate: new Date(formData.get('paymentDate') as string),
            paymentMethod: formData.get('paymentMethod') as string,
            notes: formData.get('notes') as string,
            documentUrl,
        };

        const result = editingTransaction
            ? await handleUpdateChequeTransaction(editingTransaction.id, transactionData)
            : await handleAddChequeTransaction(transactionData);
        
        if (result.success) {
            toast({ title: t('cheques.success'), description: result.message });
            await refreshCheques();
            setIsTransactionDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: t('cheques.error'), description: result.message });
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
          <ChequeDashboardCards cheques={filteredCheques} />

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="text-right">
                    <CardTitle>{t('cheques.title')}</CardTitle>
                    <CardDescription>
                        {t('cheques.description')}
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {canCreate && (
                        <>
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link href="/dashboard/banks"><Landmark className="mr-2"/>{t('cheques.manageBanks')}</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link href="/dashboard/payees"><Users className="mr-2"/>{t('cheques.managePayees')}</Link>
                            </Button>
                            <Button onClick={handleAddNew} className="w-full sm:w-auto">
                                <PlusCircle className="mr-2" />
                                {t('cheques.addCheque')}
                            </Button>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                 <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('cheques.searchPlaceholder')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 w-full"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[150px]"><SelectValue placeholder={t('cheques.filterByStatus')}/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t('cheques.activeCheques')}</SelectItem>
                            <SelectItem value="all">{t('cheques.allStatuses')}</SelectItem>
                            <SelectItem value="Submitted">{t('chequeStatus.submitted')}</SelectItem>
                            <SelectItem value="Pending">{t('chequeStatus.pending')}</SelectItem>
                            <SelectItem value="Partially Paid">{t('chequeStatus.partiallyPaid')}</SelectItem>
                            <SelectItem value="Cleared">{t('chequeStatus.cleared')}</SelectItem>
                            <SelectItem value="Bounced">{t('chequeStatus.bounced')}</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={payeeFilter} onValueChange={setPayeeFilter}>
                        <SelectTrigger className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[150px]"><SelectValue placeholder={t('cheques.filterByPayee')}/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('cheques.allPayees')}</SelectItem>
                          {uniquePayeeNames.map(name => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <Select value={bankFilter} onValueChange={setBankFilter}>
                        <SelectTrigger className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[150px]"><SelectValue placeholder={t('cheques.filterByBank')}/></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('cheques.allBanks')}</SelectItem>{banks.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="w-full sm:w-auto sm:w-[150px]">
                        <DatePicker 
                            name="date-from"
                            placeholder={t('cheques.dateFrom')}
                            value={dateFilter.from}
                            onSelect={date => setDateFilter(prev => ({ ...prev, from: date }))}
                        />
                    </div>
                     <div className="w-full sm:w-auto sm:w-[150px]">
                        <DatePicker 
                            name="date-to"
                            placeholder={t('cheques.dateTo')}
                            value={dateFilter.to}
                            onSelect={date => setDateFilter(prev => ({ ...prev, to: date }))}
                        />
                    </div>
                    <Button variant="ghost" onClick={() => { setSearchQuery(''); setStatusFilter('active'); setBankFilter('all'); setPayeeFilter('all'); setDateFilter({}); }}>
                        {t('cheques.clearFilters')}
                    </Button>
                 </div>
                {canRead ? (
                    <ChequeList
                        cheques={paginatedCheques}
                        onEdit={canUpdate ? handleEdit : undefined}
                        onDelete={canDelete ? handleDelete : undefined}
                        onAddTransaction={handleAddTransactionClick}
                        onEditTransaction={handleEditTransactionClick}
                        onDeleteTransaction={handleDeleteTransactionClick}
                    />
                ) : (
                    <p className="text-center text-muted-foreground py-10">{t('cheques.noPermissionView')}</p>
                )}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between space-x-2 py-4">
                     <div className="flex items-center space-x-2">
                        <Label htmlFor="rows" className="text-sm font-medium">{t('cheques.rowsPerPage')}</Label>
                        <Select
                            value={`${chequesPerPage}`}
                            onValueChange={(value) => {
                                setChequesPerPage(Number(value))
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={chequesPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                            {t('cheques.page')} {currentPage} {t('cheques.of')} {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            {t('cheques.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            {t('cheques.next')}
                        </Button>
                    </div>
                </CardFooter>
            )}
          </Card>
      </main>

      {isDialogOpen && (
        <ChequeDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            cheque={editingCheque}
            savedPayees={savedPayees}
            tenants={tenants}
            businessNames={businessNames}
            banks={banks}
            onSubmit={handleSubmit}
            loggedInEmployee={loggedInEmployee}
        />
      )}
      
      {isTransactionDialogOpen && chequeForTransaction && (
        <ChequeTransactionDialog
            isOpen={isTransactionDialogOpen}
            onOpenChange={setIsTransactionDialogOpen}
            transaction={editingTransaction}
            cheque={chequeForTransaction}
            onSubmit={handleTransactionSubmit}
        />
       )}
    </div>
  );
}

    
