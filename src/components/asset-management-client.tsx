

'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Package, DollarSign, Wrench, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { handleAddAsset, handleUpdateAsset, handleDeleteAsset, uploadFile } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getAssets } from '@/lib/db';
import type { Employee, Asset, Property, Unit } from '@/lib/types';
import AssetList from './asset-list';
import AssetDialog from './asset-dialog';
import { hasPermission } from '@/lib/permissions';
import { AppHeader } from './layout/header';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { differenceInDays } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

const assetCategories = ['Appliances', 'Furniture', 'HVAC', 'Plumbing', 'Electrical', 'Fixtures', 'Other'];
const assetStatuses = ['In Service', 'Under Repair', 'Decommissioned', 'In Storage'];

export default function AssetManagementClient({ 
    initialAssets, 
    properties,
    loggedInEmployee 
}: { 
    initialAssets: Asset[], 
    properties: (Property & { units: Unit[] })[],
    loggedInEmployee: Employee | null 
}) {
  const { t } = useLanguage();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 10;

  const canCreate = hasPermission(loggedInEmployee, 'assets:create');
  const canUpdate = hasPermission(loggedInEmployee, 'assets:update');
  const canDelete = hasPermission(loggedInEmployee, 'assets:delete');
  const canRead = hasPermission(loggedInEmployee, 'assets:read');
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'assets:documents:update');

  const assetStats = useMemo(() => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice ?? 0), 0);
    const repairing = assets.filter(a => a.status === 'Under Repair').length;
    const expiringSoon = assets.filter(a => a.warrantyExpiryDate && differenceInDays(new Date(a.warrantyExpiryDate), new Date()) <= 30 && differenceInDays(new Date(a.warrantyExpiryDate), new Date()) >= 0).length;

    return {
      totalAssets: assets.length,
      totalValue,
      repairing,
      expiringSoon
    };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return assets.filter(asset => {
      const matchesSearch = (
        asset.name.toLowerCase().includes(lowercasedQuery) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(lowercasedQuery)) ||
        (asset.modelNumber && asset.modelNumber.toLowerCase().includes(lowercasedQuery))
      );
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
      const matchesProperty = propertyFilter === 'all' || asset.propertyId === propertyFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesProperty;
    });
  }, [assets, searchQuery, statusFilter, categoryFilter, propertyFilter]);

  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * assetsPerPage,
    currentPage * assetsPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const refreshAssets = async () => {
    const updatedAssets = await getAssets();
    setAssets(updatedAssets);
  }

  const handleAddNew = () => {
    setEditingAsset(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDelete = async (assetId: string) => {
    if (!canDelete) {
        toast({ variant: 'destructive', title: 'Error', description: 'You do not have permission to delete assets.' });
        return;
    }
    const result = await handleDeleteAsset(assetId);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshAssets();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    let invoiceUrl: string | undefined | null = editingAsset?.invoiceUrl;
    
    // Check for file first, before other processing
    const invoiceFile = formData.get('invoiceFile') as File;
    if (invoiceFile && invoiceFile.size > 0) {
      const uploadResult = await uploadFile(formData, 'invoiceFile', 'assets');
      if (!uploadResult.success) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message });
        return; 
      }
      invoiceUrl = uploadResult.filePath;
    }

    const purchasePriceValue = formData.get('purchasePrice') as string;
    
    const assetData = {
      propertyId: formData.get('propertyId') as string,
      unitId: formData.get('unitId') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      manufacturer: formData.get('manufacturer') as string,
      modelNumber: formData.get('modelNumber') as string,
      serialNumber: formData.get('serialNumber') as string,
      status: formData.get('status') as any,
      purchaseDate: formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : null,
      purchasePrice: purchasePriceValue ? Number(purchasePriceValue) : null,
      warrantyExpiryDate: formData.get('warrantyExpiryDate') ? new Date(formData.get('warrantyExpiryDate') as string) : null,
      locationInProperty: formData.get('locationInProperty') as string,
      notes: formData.get('notes') as string,
      invoiceUrl,
    };
    
    const result = editingAsset
      ? await handleUpdateAsset(editingAsset.id, assetData)
      : await handleAddAsset(assetData);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshAssets();
      setIsDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('assets.totalAssets')}</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{assetStats.totalAssets}</div><p className="text-xs text-muted-foreground">{t('assets.itemsTracked')}</p></CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('assets.totalPurchaseValue')}</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">AED {assetStats.totalValue.toLocaleString()}</div><p className="text-xs text-muted-foreground">{t('assets.capitalValue')}</p></CardContent>
              </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('assets.underRepair')}</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{assetStats.repairing}</div><p className="text-xs text-muted-foreground">{t('assets.currentlyRepairing')}</p></CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('assets.warrantyExpiringSoon')}</CardTitle><CalendarOff className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{assetStats.expiringSoon}</div><p className="text-xs text-muted-foreground">{t('assets.warrantyExpiring30Days')}</p></CardContent>
              </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>{t('assets.title')}</CardTitle>
                    <CardDescription>
                        {t('assets.description')}
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                    <Input 
                        placeholder={t('assets.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-[200px]"
                    />
                    <Select value={propertyFilter} onValueChange={(value) => { setPropertyFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder={t('assets.filterByProperty')} /></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('assets.allProperties')}</SelectItem>{properties.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                    </Select>
                     <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder={t('assets.filterByCategory')} /></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('assets.allCategories')}</SelectItem>{assetCategories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder={t('assets.filterByStatus')} /></SelectTrigger>
                        <SelectContent><SelectItem value="all">{t('assets.allStatuses')}</SelectItem>{assetStatuses.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                    {canCreate && (
                        <Button onClick={handleAddNew} className="w-full md:w-auto mt-2 sm:mt-0">
                            <PlusCircle className="mr-2" />
                            {t('assets.add')}
                        </Button>
                    )}
                 </div>
            </CardHeader>
            <CardContent>
              {canRead ? (
                <AssetList
                    assets={paginatedAssets}
                    onEdit={canUpdate ? handleEdit : undefined}
                    onDelete={canDelete ? handleDelete : undefined}
                />
               ) : (
                  <p className="text-center text-muted-foreground">{t('assets.noPermissionView')}</p>
                )}
            </CardContent>
             {totalPages > 1 && (
                <CardFooter className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        {t('assets.page')} {currentPage} {t('assets.of')} {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        {t('assets.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        {t('assets.next')}
                    </Button>
                </CardFooter>
            )}
          </Card>
      </main>

      {isDialogOpen && (
        <AssetDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            asset={editingAsset}
            properties={properties}
            onSubmit={handleSubmit}
            loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
