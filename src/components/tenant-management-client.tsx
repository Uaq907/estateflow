

'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, UserCheck, Users, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TenantList from '@/components/tenant-list';
import TenantSheet from '@/components/tenant-sheet';
import { useToast } from '@/hooks/use-toast';
import { getTenants } from '@/lib/db';
import type { Employee, Tenant, Lease } from '@/lib/types';
import { AppHeader } from './layout/header';
import { Input } from './ui/input';
import { handleDeleteTenant } from '@/app/dashboard/actions';
import { hasPermission } from '@/lib/permissions';
import { useLanguage } from '@/contexts/language-context';

export default function TenantManagementClient({ 
    initialTenants, 
    leases,
    loggedInEmployee 
}: { 
    initialTenants: Tenant[], 
    leases: Lease[],
    loggedInEmployee: Employee | null 
}) {
  const { t } = useLanguage();
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 20;

  const { toast } = useToast();

  const canCreate = hasPermission(loggedInEmployee, 'tenants:create');
  const canUpdate = hasPermission(loggedInEmployee, 'tenants:update');
  const canDelete = hasPermission(loggedInEmployee, 'tenants:delete');

  const handleAddNew = () => {
    setEditingTenant(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsSheetOpen(true);
  };

  const handleDelete = async (tenantId: string) => {
    const result = await handleDeleteTenant(tenantId);
    if (result.success) {
      setTenants(tenants.filter((t) => t.id !== tenantId));
      toast({ title: 'Success', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const onSheetSave = async (message: string) => {
    const updatedTenants = await getTenants();
    setTenants(updatedTenants);
    toast({ title: 'Success', description: message });
    setIsSheetOpen(false);
    setEditingTenant(null);
  };
  
  const filteredTenants = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!lowercasedQuery) {
        return tenants;
    }
    return tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(lowercasedQuery) ||
      tenant.email.toLowerCase().includes(lowercasedQuery) ||
      (tenant.phone && tenant.phone.includes(lowercasedQuery))
    );
  }, [tenants, searchQuery]);

  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * tenantsPerPage,
    currentPage * tenantsPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  const tenantStats = useMemo(() => {
    const tenantsWithActiveLease = new Set(leases.filter(l => l.status === 'Active').map(l => l.tenantId));
    return {
        total: tenants.length,
        active: tenantsWithActiveLease.size,
        withLogin: tenants.filter(t => t.allowLogin).length,
    }
  }, [tenants, leases]);


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('tenants.totalTenants')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{tenantStats.total}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('tenants.tenantsWithActiveLeases')}</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{tenantStats.active}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('tenants.portalAccessEnabled')}</CardTitle>
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{tenantStats.withLogin}</div>
                  </CardContent>
              </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>{t('tenants.title')}</CardTitle>
                    <CardDescription>
                        {loggedInEmployee ? t('tenants.description') : t('tenants.browseDescription')}
                    </CardDescription>
                </div>
                 <div className="flex w-full md:w-auto md:max-w-sm items-center space-x-2">
                    <Input 
                        type="text" 
                        placeholder={t('tenants.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on new search
                        }}
                    />
                    {canCreate && (
                        <Button onClick={handleAddNew} className="flex-shrink-0">
                            <PlusCircle className="mr-2" />
                            {t('tenants.addTenant')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <TenantList 
                    tenants={paginatedTenants} 
                    onEdit={canUpdate ? handleEdit : undefined} 
                    onDelete={canDelete ? handleDelete : undefined}
                />
                 {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-sm text-muted-foreground">
                            {t('tenants.page')} {currentPage} {t('tenants.of')} {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            {t('tenants.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            {t('tenants.next')}
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
      </main>

      {isSheetOpen && (
        <TenantSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            tenant={editingTenant}
            onSave={onSheetSave}
            loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
