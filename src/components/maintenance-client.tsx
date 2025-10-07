

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { handleAddMaintenanceContract, handleUpdateMaintenanceContract, handleDeleteMaintenanceContract, uploadFile } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getMaintenanceContracts } from '@/lib/db';
import type { Employee, MaintenanceContract, Property } from '@/lib/types';
import MaintenanceContractList from './maintenance-contract-list';
import MaintenanceContractDialog from './maintenance-contract-dialog';
import { AppHeader } from './layout/header';
import { hasPermission } from '@/lib/permissions';
import MaintenanceDashboardCards from './maintenance-dashboard-cards';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { differenceInDays } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

const serviceCategories = [
    "HVAC", "Plumbing", "Electrical", "Elevator", "Cleaning", 
    "Security", "Landscaping", "Pest Control", "Fire Safety", "Other"
];

export default function MaintenanceClient({
  initialContracts,
  properties,
  loggedInEmployee
}: {
  initialContracts: MaintenanceContract[],
  properties: Property[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<MaintenanceContract[]>(initialContracts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<MaintenanceContract | null>(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const contractsPerPage = 10;

  const canCreate = hasPermission(loggedInEmployee, 'maintenance:create');
  const canUpdate = hasPermission(loggedInEmployee, 'maintenance:update');
  const canDelete = hasPermission(loggedInEmployee, 'maintenance:delete');
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'maintenance:documents:update');

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const matchesSearch = lowercasedQuery === '' ||
            contract.vendorName.toLowerCase().includes(lowercasedQuery) ||
            contract.serviceType.toLowerCase().includes(lowercasedQuery);

        const matchesProperty = propertyFilter === 'all' || contract.propertyId === propertyFilter;
        const matchesCategory = categoryFilter === 'all' || contract.serviceType === categoryFilter;

        const endDate = new Date(contract.endDate);
        const daysUntilExpiry = differenceInDays(endDate, new Date());
        let contractStatus = 'active';
        if (new Date() > endDate) contractStatus = 'expired';
        else if (daysUntilExpiry <= 90) contractStatus = 'expiring';
        
        const matchesStatus = statusFilter === 'all' || contractStatus === statusFilter;

        return matchesSearch && matchesProperty && matchesCategory && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter, propertyFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * contractsPerPage,
    currentPage * contractsPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


  const refreshContracts = async () => {
    const updatedContracts = await getMaintenanceContracts();
    setContracts(updatedContracts);
  }

  const handleAddNew = () => {
    setEditingContract(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (contract: MaintenanceContract) => {
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  const handleDelete = async (contractId: string) => {
    const result = await handleDeleteMaintenanceContract(contractId);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        await refreshContracts();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleSubmit = async (formData: FormData) => {
    let contractUrl: string | undefined | null = editingContract?.contractUrl;
    
    const contractFile = formData.get('contractFile') as File;
    if (contractFile && contractFile.size > 0) {
      const uploadResult = await uploadFile(formData, 'contractFile', 'contracts');
      if (!uploadResult.success) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message });
        return;
      }
      contractUrl = uploadResult.filePath;
    }
    
    const contractData = {
        propertyId: formData.get('propertyId') as string,
        serviceType: formData.get('serviceType') as string,
        vendorName: formData.get('vendorName') as string,
        startDate: new Date(formData.get('startDate') as string),
        endDate: new Date(formData.get('endDate') as string),
        paymentSchedule: formData.get('paymentSchedule') as any,
        nextDueDate: formData.get('nextDueDate') ? new Date(formData.get('nextDueDate') as string) : null,
        notes: formData.get('notes') as string,
        contractUrl: contractUrl,
        isVat: formData.get('isVat') === 'on',
        baseAmount: Number(formData.get('baseAmount')),
    };

    const result = editingContract
        ? await handleUpdateMaintenanceContract(editingContract.id, contractData)
        : await handleAddMaintenanceContract(contractData);

    if (result.success) {
        toast({ title: 'Success', description: result.message });
        await refreshContracts();
        setIsDialogOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
          <MaintenanceDashboardCards contracts={contracts} />

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>{t('maintenance.title')}</CardTitle>
                    <CardDescription>
                        {t('maintenance.description')}
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {canCreate && (
                        <Button onClick={handleAddNew} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2" />
                            {t('maintenance.addContract')}
                        </Button>
                    )}
                 </div>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col md:flex-row gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('maintenance.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8 w-full"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder={t('maintenance.filterByStatus')}/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('maintenance.allStatuses')}</SelectItem>
                            <SelectItem value="active">{t('maintenance.active')}</SelectItem>
                            <SelectItem value="expiring">{t('maintenance.expiring')}</SelectItem>
                            <SelectItem value="expired">{t('maintenance.expired')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={propertyFilter} onValueChange={(value) => { setPropertyFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder={t('maintenance.filterByProperty')}/></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('maintenance.allProperties')}</SelectItem>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder={t('maintenance.filterByService')}/></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('maintenance.allServices')}</SelectItem>{serviceCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPropertyFilter('all'); setCategoryFilter('all'); }}>
                        {t('maintenance.clear')}
                    </Button>
                 </div>

                <MaintenanceContractList
                    contracts={paginatedContracts}
                    onEdit={canUpdate ? handleEdit : undefined}
                    onDelete={canDelete ? handleDelete : undefined}
                />
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        {t('maintenance.page')} {currentPage} {t('maintenance.of')} {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        {t('maintenance.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        {t('maintenance.next')}
                    </Button>
                </CardFooter>
            )}
          </Card>
      </main>

      {isDialogOpen && (
        <MaintenanceContractDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            contract={editingContract}
            properties={properties}
            onSubmit={handleSubmit}
            loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
