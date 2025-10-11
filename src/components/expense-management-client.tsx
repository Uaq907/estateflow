

'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { handleAddExpense, handleUpdateExpense, uploadFile, handleDeleteExpense } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getExpenses } from '@/lib/db';
import type { Employee, Expense, Property, Unit } from '@/lib/types';
import ExpenseList from './expense-list';
import ExpenseDialog from './expense-dialog';
import { AppHeader } from './layout/header';
import ExpenseDashboardCards from './expense-dashboard-cards';
import { hasPermission } from '@/lib/permissions';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useLanguage } from '@/contexts/language-context';

const expenseCategories = ['Maintenance', 'Utilities', 'Marketing', 'Supplies', 'Legal', 'Other'];
const expenseStatuses = ['Pending', 'Approved', 'Rejected', 'Needs Correction'];


export default function ExpenseManagementClient({ 
    initialExpenses, 
    properties,
    loggedInEmployee 
}: { 
    initialExpenses: Expense[], 
    properties: (Property & { units: Unit[] })[],
    loggedInEmployee: Employee | null 
}) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage, setExpensesPerPage] = useState(10);

  const canCreate = hasPermission(loggedInEmployee, 'expenses:create');
  const canRead = hasPermission(loggedInEmployee, 'expenses:read-all') || hasPermission(loggedInEmployee, 'expenses:read-own');
  const canReadAll = hasPermission(loggedInEmployee, 'expenses:read-all');

  const filteredExpenses = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return expenses.filter(expense => {
      const matchesSearch = (
        expense.description?.toLowerCase().includes(lowercasedQuery) ||
        expense.category.toLowerCase().includes(lowercasedQuery) ||
        expense.propertyName?.toLowerCase().includes(lowercasedQuery) ||
        expense.employeeName?.toLowerCase().includes(lowercasedQuery) ||
        expense.supplier?.toLowerCase().includes(lowercasedQuery)
      );
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesProperty = propertyFilter === 'all' || expense.propertyId === propertyFilter;

      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [expenses, searchQuery, statusFilter, propertyFilter]);

  const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * expensesPerPage,
    currentPage * expensesPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


  const refreshExpenses = async () => {
    if (!loggedInEmployee) return;
    const updatedExpenses = await getExpenses({ employeeId: !canReadAll ? loggedInEmployee.id : undefined });
    setExpenses(updatedExpenses);
  }

  const handleAddNew = () => {
    if (!canCreate) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to create expenses.' });
        return;
    }
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const handleAction = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  }

  const handleDelete = async (id: string) => {
    const result = await handleDeleteExpense(id);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshExpenses();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loggedInEmployee) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    const expenseId = formData.get('id') as string | null;
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
    
    // This is the employee submitting or correcting a request
    if (action === 'submit') {
        let paymentReceiptUrl: string | undefined | null = editingExpense?.paymentReceiptUrl;
        let requestReceiptUrl: string | undefined | null = editingExpense?.requestReceiptUrl;
        let purchaseReceiptUrl: string | undefined | null = editingExpense?.purchaseReceiptUrl;
        
        // رفع إيصال دفع المبلغ
        const paymentReceiptFile = formData.get('paymentReceiptFile') as File;
        if (paymentReceiptFile && paymentReceiptFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'paymentReceiptFile', 'expenses_receipts');
            if (!uploadResult.success) {
                toast({ variant: 'destructive', title: 'فشل الرفع', description: uploadResult.message });
                return;
            }
            paymentReceiptUrl = uploadResult.filePath;
        }

        // رفع إيصال الطلب
        const requestReceiptFile = formData.get('requestReceiptFile') as File;
        if (requestReceiptFile && requestReceiptFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'requestReceiptFile', 'expenses_receipts');
            if (!uploadResult.success) {
                toast({ variant: 'destructive', title: 'فشل الرفع', description: uploadResult.message });
                return;
            }
            requestReceiptUrl = uploadResult.filePath;
        }

        // رفع إيصال المشتريات
        const purchaseReceiptFile = formData.get('purchaseReceiptFile') as File;
        if (purchaseReceiptFile && purchaseReceiptFile.size > 0) {
            const uploadResult = await uploadFile(formData, 'purchaseReceiptFile', 'expenses_receipts');
            if (!uploadResult.success) {
                toast({ variant: 'destructive', title: 'فشل الرفع', description: uploadResult.message });
                return;
            }
            purchaseReceiptUrl = uploadResult.filePath;
        }

         const expenseData = {
            propertyId: formData.get('propertyId') as string,
            unitId: formData.get('unitId') as string,
            employeeId: loggedInEmployee.id,
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            supplier: formData.get('supplier') as string,
            taxNumber: formData.get('taxNumber') as string,
            isVat: formData.get('isVat') === 'on',
            baseAmount: Number(formData.get('baseAmount')),
            paymentReceiptUrl,
            requestReceiptUrl,
            purchaseReceiptUrl,
            receiptUrl: paymentReceiptUrl || requestReceiptUrl || purchaseReceiptUrl, // للتوافق مع الكود القديم
        };
        
        const result = expenseId 
            ? await handleUpdateExpense(expenseId, { ...expenseData, status: 'Pending' }) // Resubmitting sets status back to Pending
            : await handleAddExpense(expenseData);
        
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            await refreshExpenses();
            setIsDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        return;
    }

    // This handles manager actions
    if (!expenseId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot process approval without an expense ID.'});
        return;
    }

    const updateData: Partial<Expense> = {
        managerId: loggedInEmployee.id,
        managerNotes: formData.get('managerNotes') as string,
    };
    
    let successMessage = '';
    
    switch(action) {
        case 'approve':
            updateData.status = 'Approved';
            successMessage = 'Expense has been approved.';
            break;
        case 'reject':
            updateData.status = 'Rejected';
            successMessage = 'Expense has been rejected.';
            break;
        case 'needs_correction':
            updateData.status = 'Needs Correction';
            successMessage = 'Expense has been returned to the employee for correction.';
            break;
        default:
            toast({ variant: 'destructive', title: 'Error', description: 'Unknown action.' });
            return;
    }
    
    const result = await handleUpdateExpense(expenseId, updateData);
    if (result.success) {
        toast({ title: 'Success', description: successMessage });
        await refreshExpenses();
        setIsDialogOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('expenses.title')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('expenses.description')}
                </p>
            </div>
            {canCreate && (
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2" />
                    {t('expenses.addExpense')}
                </Button>
            )}
          </div>

          <ExpenseDashboardCards expenses={filteredExpenses} />
          
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>{t('expenses.title')}</CardTitle>
                    <CardDescription>
                        {t('expenses.description')}
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('expenses.searchExpenses')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8 w-full"
                        />
                    </div>
                     <Select value={propertyFilter} onValueChange={(value) => { setPropertyFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder={t('expenses.filterProperty')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('expenses.allProperties')}</SelectItem>
                            {properties.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder={t('expenses.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('expenses.allStatuses')}</SelectItem>
                            {expenseStatuses.map(status => {
                                const statusKey = status === 'Pending' ? 'expenses.pending' :
                                                 status === 'Approved' ? 'expenses.approved' :
                                                 status === 'Rejected' ? 'expenses.rejected' :
                                                 status === 'Needs Correction' ? 'expenses.needsCorrection' :
                                                 status;
                                return (
                                    <SelectItem key={status} value={status}>{t(statusKey)}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                 </div>
            </CardHeader>
            <CardContent>
              {canRead ? (
                <ExpenseList
                    expenses={paginatedExpenses}
                    loggedInEmployee={loggedInEmployee}
                    onAction={handleAction}
                    onDelete={handleDelete}
                />
              ) : (
                <p className="text-center text-muted-foreground py-10">{t('expenses.noPermission')}</p>
              )}
            </CardContent>
            {canRead && totalPages > 1 && (
                <CardFooter className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="rows" className="text-sm font-medium">{t('expenses.rowsPerPage')}</Label>
                        <Select
                            value={`${expensesPerPage}`}
                            onValueChange={(value) => {
                                setExpensesPerPage(Number(value))
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={expensesPerPage} />
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
                            {t('expenses.page')} {currentPage} {t('expenses.of')} {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            {t('expenses.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            {t('expenses.next')}
                        </Button>
                    </div>
                </CardFooter>
            )}
          </Card>
      </main>

      {loggedInEmployee && isDialogOpen && (
        <ExpenseDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            expense={editingExpense}
            properties={properties}
            onSubmit={handleSubmit}
            loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
