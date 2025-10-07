
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Building2, Home, CheckCircle, Settings, Wrench, FileWarning, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadFile } from '@/app/dashboard/actions';
import { addProperty, updateProperty, deleteProperty, getProperties, getPropertiesForEmployee } from '@/lib/db';
import PropertyList from '@/components/property-list';
import PropertySheet from '@/components/property-sheet';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Property, Owner, Unit } from '@/lib/types';
import { AppHeader } from './layout/header';
import PropertyTypeChart from './dashboard/property-type-chart';
import { hasPermission } from '@/lib/permissions';
import { useLanguage } from '@/contexts/language-context';

export default function PropertyManagementClient({ 
    initialProperties, 
    initialUnits,
    initialEmployees,
    initialOwners,
    loggedInEmployee 
}: { 
    initialProperties: Property[], 
    initialUnits: Unit[],
    initialEmployees: Employee[],
    initialOwners: Owner[],
    loggedInEmployee: Employee | null 
}) {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  
  const canManageSettings = hasPermission(loggedInEmployee, 'settings:manage');
  const canCreateProperty = hasPermission(loggedInEmployee, 'properties:create');
  const canUpdateProperty = hasPermission(loggedInEmployee, 'properties:update');
  const canDeleteProperty = hasPermission(loggedInEmployee, 'properties:delete');
  const canViewAllProperties = hasPermission(loggedInEmployee, 'properties:read');

  const handleAddNew = () => {
    setEditingProperty(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsSheetOpen(true);
  };

  const handleDelete = async (propertyId: string) => {
    if (!canDeleteProperty) {
        toast({ variant: 'destructive', title: 'Error', description: 'You do not have permission to perform this action.'});
        return;
    }
    try {
        await deleteProperty(propertyId);
        setProperties(properties.filter((p) => p.id !== propertyId));
        toast({ title: 'Success', description: 'Property deleted successfully.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    }
  };

  const handleSubmit = async (formData: FormData) => {
     if (!loggedInEmployee) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.'});
        return;
    }

    let imageUrl: string | undefined | null = editingProperty?.imageUrl;
    
    const pictureFile = formData.get('propertyImage') as File;
    if (pictureFile && pictureFile.size > 0) {
      const uploadResult = await uploadFile(formData, 'propertyImage', 'properties');
      if (!uploadResult.success) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message });
        return;
      }
      imageUrl = uploadResult.filePath;
    }

    const data: Omit<Property, 'id'> = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      location: formData.get('location') as string,
      address: formData.get('address') as string,
      status: formData.get('status') as string,
      purpose: formData.get('purpose') as string,
      price: Number(formData.get('price')),
      size: Number(formData.get('size')),
      sizeUnit: formData.get('sizeUnit') as string,
      description: formData.get('description') as string,
      dateListed: formData.get('dateListed') ? new Date(formData.get('dateListed') as string) : null,
      imageUrl: imageUrl,
      floors: Number(formData.get('floors')),
      rooms: Number(formData.get('rooms')),
      configuration: formData.get('configuration') as string,
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      ownerId: formData.get('ownerId') === 'no-owner' ? null : formData.get('ownerId') as string,
      managerId: formData.get('managerId') === 'no-manager' ? null : (formData.get('managerId') as string),
      accountNumber: formData.get('accountNumber') as string,
    };
    
    if (editingProperty) {
      await updateProperty(editingProperty.id, data);
    } else {
      await addProperty(data);
    }
    
    const updatedProperties = canViewAllProperties ? await getProperties() : await getPropertiesForEmployee(loggedInEmployee.id);
    setProperties(updatedProperties);
    
    toast({ title: 'Success', description: `Property ${editingProperty ? 'updated' : 'added'} successfully.` });
    setIsSheetOpen(false);
    setEditingProperty(null);
  };
  
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalUnits = properties.reduce((acc, p) => acc + (p.totalUnits ?? 0), 0);
    const rentedUnits = properties.reduce((acc, p) => acc + (p.occupiedUnits ?? 0), 0);
    const availableUnits = totalUnits - rentedUnits;
    const leasesWithoutContract = properties.reduce((acc, p) => acc + (p.leasesWithoutContract ?? 0), 0);
    const occupancy = totalUnits > 0 ? (rentedUnits / totalUnits) * 100 : 0;
    
    // This is simplified. For a more accurate maintenance count, we'd need to fetch units differently.
    const maintenanceUnits = initialUnits.filter(u => u.status === 'Under Maintenance' && properties.some(p => p.id === u.propertyId)).length;

    return { totalProperties, totalUnits, occupancy, rentedUnits, availableUnits, maintenanceUnits, leasesWithoutContract };
  }, [properties, initialUnits]);


  return (
    <div className="flex flex-col min-h-screen">
       <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('properties.title')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('properties.description')}
                </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/owners">{t('properties.manageOwners')}</Link>
                </Button>
                 {canManageSettings && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/settings/unit-configurations"><Settings className="mr-2"/>{t('properties.manageConfigurations')}</Link>
                    </Button>
                )}
                {canCreateProperty && (
                    <Button onClick={handleAddNew} className="w-full">
                        <PlusCircle className="mr-2" />
                        {t('properties.addProperty')}
                    </Button>
                )}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.totalProperties')}</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalProperties}</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.totalUnits')}</CardTitle><Home className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUnits}</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.occupiedUnits')}</CardTitle><KeyRound className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.rentedUnits}</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.availableUnits')}</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.availableUnits}</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.maintenanceUnits')}</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.maintenanceUnits}</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Occupancy</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.occupancy.toFixed(1)}%</div></CardContent></Card>
              <Card className="col-span-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('properties.leasesWithoutContract')}</CardTitle><FileWarning className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.leasesWithoutContract}</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle>{t('properties.allProperties')}</CardTitle>
                <CardDescription>
                    {loggedInEmployee ? t('properties.listDescription') : t('properties.browseDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PropertyList 
                    properties={properties} 
                    onEdit={canUpdateProperty ? handleEdit : undefined} 
                    onDelete={canDeleteProperty ? handleDelete : undefined}
                />
            </CardContent>
          </Card>
      </main>

      {isSheetOpen && (
        <PropertySheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            property={editingProperty}
            onSubmit={handleSubmit}
            employees={initialEmployees}
            owners={initialOwners}
        />
      )}
    </div>
  );
}
