

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Building, LogOut, PlusCircle, LogIn, Home, Users, ChevronDown, LandPlot, MapPin, Edit, Trash2, UserSquare, UserMinus, UserPlus, User, ShieldCheck, Mail, Phone, Fingerprint, Receipt, Wrench, Package, WalletCards, HomeIcon, CheckCircle2, XCircle, Banknote, Tv, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { uploadFile, handleAssignTenant, handleRemoveTenant, handleAssignEmployeeToProperty, handleRemoveEmployeeFromProperty } from '@/app/dashboard/actions';
import { updateProperty, deleteProperty, addUnit, updateUnit, getUnitsForProperty, getEmployeesForProperty, getOwners, deleteUnit as dbDeleteUnit } from '@/lib/db';
import PropertySheet from '@/components/property-sheet';
import UnitSheet from '@/components/unit-sheet';
import UnitList from '@/components/unit-list';
import AssignTenantDialog from '@/components/assign-tenant-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Property, Unit, Tenant, Lease, Owner, PropertyDocument } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { AppHeader } from './layout/header';
import { hasPermission } from '@/lib/permissions';
import PropertyDocuments from './property-documents';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/contexts/language-context';


export default function PropertyDetailClient({
  initialProperty,
  initialUnits,
  allEmployees,
  allOwners,
  assignedEmployees: initialAssignedEmployees,
  tenants,
  documents,
  loggedInEmployee
}: {
  initialProperty: Property & { owner?: Owner | null },
  initialUnits: Unit[],
  allEmployees: Employee[],
  allOwners: Owner[],
  assignedEmployees: Employee[],
  tenants: Tenant[],
  documents: PropertyDocument[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const [property, setProperty] = useState<Property & { owner?: Owner | null }>(initialProperty);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>(initialAssignedEmployees);
  const [isPropertySheetOpen, setIsPropertySheetOpen] = useState(false);
  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);
  const [isAssignTenantDialogOpen, setIsAssignTenantDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitToAssign, setUnitToAssign] = useState<Unit | null>(null);
  const [employeeToAssign, setEmployeeToAssign] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRemoveEmployeeDialogOpen, setIsRemoveEmployeeDialogOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<{id: string, name: string} | null>(null);


  const { toast } = useToast();
  const router = useRouter();
  
  const propertyManager = allEmployees.find(emp => emp.id === property.managerId);
  const propertyOwner = property.owner;
  
  const canUpdateProperty = hasPermission(loggedInEmployee, 'properties:update');
  const canDeleteProperty = hasPermission(loggedInEmployee, 'properties:delete');
  const canCreateUnit = hasPermission(loggedInEmployee, 'properties:create'); // Units are part of properties
  const canEditUnit = hasPermission(loggedInEmployee, 'properties:update');
  const canDeleteUnit = hasPermission(loggedInEmployee, 'properties:delete');
  const canAssignTenant = hasPermission(loggedInEmployee, 'leases:create');
  const canAssignStaff = hasPermission(loggedInEmployee, 'properties:update');


  const unitTypes = useMemo(() => {
    const types = new Set(units.map(u => u.type));
    return ['all', ...Array.from(types)];
  }, [units]);

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const statusMatch = statusFilter === 'all' || unit.status === statusFilter;
      const typeMatch = typeFilter === 'all' || unit.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [units, statusFilter, typeFilter]);
  
  const unitStats = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'Rented').length;
    const availableUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    const types = units.reduce((acc, unit) => {
        acc[unit.type] = (acc[unit.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { totalUnits, occupiedUnits, availableUnits, occupancyRate, types };
  }, [units]);
  
  const unitsWithLeaseConflict = useMemo(() => {
    return units.filter(u => u.status === 'Available' && u.activeLeaseId).map(u => u.unitNumber);
  }, [units]);


  const handleEditProperty = () => {
    setIsPropertySheetOpen(true);
  };

  const handleDeleteProperty = async () => {
     await deleteProperty(property.id);
     toast({ title: "Success", description: "Property deleted successfully." });
     router.push('/dashboard/properties');
     setIsDeleteAlertOpen(false);
  }

  const handleAddNewUnit = () => {
    setEditingUnit(null);
    setIsUnitSheetOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsUnitSheetOpen(true);
  };

  const handleUnitSheetOpenChange = (isOpen: boolean) => {
    setIsUnitSheetOpen(isOpen);
    if (!isOpen) {
      setEditingUnit(null);
    }
  };


  const handleDeleteUnit = async (unitId: string) => {
    const result = await dbDeleteUnit(unitId);
    if (result.success) {
        setUnits(units.filter(u => u.id !== unitId));
        toast({ title: 'Success', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
    }
  };
  
  const handleRemoveTenantFromUnit = async (unitId: string, leaseId: string) => {
     const result = await handleRemoveTenant(unitId, leaseId);
     if (result.success) {
        toast({ title: 'Success', description: result.message });
        const newUnits = await getUnitsForProperty(property.id);
        setUnits(newUnits);
     } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
     }
  }

  const handleOpenAssignTenant = (unit: Unit) => {
    setUnitToAssign(unit);
    setIsAssignTenantDialogOpen(true);
  }
  
  const handlePropertySubmit = async (formData: FormData) => {
    let imageUrl: string | undefined | null = property?.imageUrl;
    
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
      ownerId: formData.get('ownerId') as string,
      managerId: formData.get('managerId') as string,
      accountNumber: formData.get('accountNumber') as string,
    };
    
    await updateProperty(property.id, data);
    const updatedOwner = allOwners.find(o => o.id === data.ownerId);
    setProperty({ ...property, ...data, owner: updatedOwner });
    
    toast({ title: 'Success', description: `Property updated successfully.` });
    setIsPropertySheetOpen(false);
  };

  const onUnitSheetSave = useCallback(async (message: string) => {
    const newUnits = await getUnitsForProperty(property.id);
    setUnits(newUnits);
    setIsUnitSheetOpen(false);
    setEditingUnit(null);
    toast({ title: 'Success', description: message });
  }, [property.id, toast]);

  const handleAssignTenantSubmit = async (formData: FormData) => {
    if (!unitToAssign) return;
    
    let contractUrl: string | undefined;
    const contractFile = formData.get('contract') as File;
    if (contractFile && contractFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'contract', 'leases');
        if (!uploadResult.success) {
            toast({ variant: 'destructive', title: 'Contract Upload Failed', description: uploadResult.message });
            return;
        }
        contractUrl = uploadResult.filePath;
    }

    let guaranteeChequeUrl: string | undefined;
    const chequeFile = formData.get('guaranteeCheque') as File;
     if (chequeFile && chequeFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'guaranteeCheque', 'leases');
        if (!uploadResult.success) {
            toast({ variant: 'destructive', title: 'Cheque Upload Failed', description: uploadResult.message });
            return;
        }
        guaranteeChequeUrl = uploadResult.filePath;
    }

    let tradeLicenseUrl: string | undefined;
    const licenseFile = formData.get('tradeLicense') as File;
    if (licenseFile && licenseFile.size > 0) {
        const uploadResult = await uploadFile(formData, 'tradeLicense', 'leases');
        if (!uploadResult.success) {
            toast({ variant: 'destructive', title: 'Trade License Upload Failed', description: uploadResult.message });
            return;
        }
        tradeLicenseUrl = uploadResult.filePath;
    }

    const leaseDetails: Omit<Lease, 'id' | 'unitId' | 'tenantId'> = {
      status: 'Active',
      tenantSince: formData.get('tenantSince') ? new Date(formData.get('tenantSince') as string) : null,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      totalLeaseAmount: Number(formData.get('totalLeaseAmount')) || null,
      taxedAmount: Number(formData.get('taxedAmount')) || null,
      rentPaymentAmount: Number(formData.get('totalLeaseAmount')) || null, // For now, let's keep it simple
      numberOfPayments: Number(formData.get('numberOfPayments')) || null,
      renewalIncreasePercentage: Number(formData.get('renewalIncreasePercentage')) || null,
      contractUrl,
      guaranteeChequeAmount: Number(formData.get('guaranteeChequeAmount')) || null,
      guaranteeChequeUrl,
      businessName: formData.get('businessName') as string || null,
      businessType: formData.get('businessType') as string || null,
      tradeLicenseNumber: formData.get('tradeLicenseNumber') as string || null,
      tradeLicenseUrl: tradeLicenseUrl || null,
    };

    const tenantId = formData.get('tenantId') as string;
    const result = await handleAssignTenant(unitToAssign.id, tenantId, leaseDetails);
    
    if (result.success) {
        toast({ title: "Success", description: result.message });
        const newUnits = await getUnitsForProperty(property.id);
        setUnits(newUnits);
        setIsAssignTenantDialogOpen(false);
        setUnitToAssign(null);
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  const handleAssignEmployee = async () => {
    if (!employeeToAssign) return;
    
    try {
      const result = await handleAssignEmployeeToProperty(employeeToAssign, property.id);
      if (result.success) {
        toast({ title: 'نجح', description: 'تم تعيين الموظف للعقار بنجاح' });
        
        // تحديث القائمة فوراً
        const updatedAssigned = await getEmployeesForProperty(property.id);
        setAssignedEmployees(updatedAssigned);
        setEmployeeToAssign('');
      } else {
        toast({ variant: 'destructive', title: 'خطأ', description: result.message || 'فشل تعيين الموظف' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message || 'حدث خطأ غير متوقع' });
      console.error('Error assigning employee:', error);
    }
  };

  const handleRemoveEmployeeClick = (employeeId: string, employeeName: string) => {
    setEmployeeToRemove({ id: employeeId, name: employeeName });
    setIsRemoveEmployeeDialogOpen(true);
  };

  const confirmRemoveEmployee = async () => {
    if (!employeeToRemove) return;
    
    try {
      const result = await handleRemoveEmployeeFromProperty(employeeToRemove.id, property.id);
      if (result.success) {
        toast({ title: 'نجح', description: 'تم إزالة الموظف من العقار بنجاح' });
        
        // تحديث القائمة فوراً
        const updatedList = assignedEmployees.filter(e => e.id !== employeeToRemove.id);
        setAssignedEmployees(updatedList);
        
        // إعادة جلب البيانات من السيرفر للتأكد
        setTimeout(async () => {
          const freshList = await getEmployeesForProperty(property.id);
          setAssignedEmployees(freshList);
        }, 500);
      } else {
        toast({ variant: 'destructive', title: 'خطأ', description: result.message || 'فشل إزالة الموظف' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message || 'حدث خطأ غير متوقع' });
      console.error('Error removing employee:', error);
    }
    
    setIsRemoveEmployeeDialogOpen(false);
    setEmployeeToRemove(null);
  };
  
  const unassignedEmployees = allEmployees.filter(emp => !assignedEmployees.some(assigned => assigned.id === emp.id));


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 pt-24">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24 rounded-lg hidden sm:flex">
                            <AvatarImage src={property.imageUrl ?? ''} alt={property.name ?? 'Property'} className="object-cover rounded-lg" />
                            <AvatarFallback className="rounded-lg"><Building className="h-12 w-12" /></AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl">{property.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <MapPin className="h-4 w-4" />
                                {property.address || 'No address specified'}
                            </CardDescription>
                             <div className="text-xs text-muted-foreground pt-1 flex items-center gap-4">
                                <span>ID: {property.id}</span>
                                {property.accountNumber && 
                                    <span className="flex items-center gap-1"><Banknote className="h-3 w-3"/> A/C: {property.accountNumber}</span>
                                }
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="secondary">{property.type}</Badge>
                                <Badge variant="outline">{property.purpose}</Badge>
                                <Badge>{property.status}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {canUpdateProperty && <Button variant="outline" onClick={handleEditProperty} className="flex-1 sm:flex-initial"><Edit className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">Edit</span></Button>}
                        {canDeleteProperty && <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)} className="flex-1 sm:flex-initial"><Trash2 className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">Delete</span></Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{property.description}</p>
                </CardContent>
            </Card>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('propertyDetail.totalUnits')}</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{unitStats.totalUnits}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('propertyDetail.occupied')}</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{unitStats.occupiedUnits}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('propertyDetail.available')}</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{unitStats.availableUnits}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('propertyDetail.occupancy')}</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{unitStats.occupancyRate.toFixed(1)}%</div></CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>{t('propertyDetail.unitTypeBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(unitStats.types).length > 0 ? (
                        Object.entries(unitStats.types).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-3 p-3 border rounded-lg">
                                <HomeIcon className="h-6 w-6 text-primary"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">{type}</p>
                                    <p className="text-xl font-bold">{count}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground col-span-full text-center">{t('propertyDetail.noUnits')}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-grow">
                            <CardTitle>{t('propertyDetail.unitsTitle')} ({filteredUnits.length})</CardTitle>
                            <CardDescription>
                                {t('propertyDetail.manageUnits')}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t('propertyDetail.filterByStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('propertyDetail.allStatuses')}</SelectItem>
                                    <SelectItem value="Available">{t('propertyDetail.available')}</SelectItem>
                                    <SelectItem value="Rented">{t('propertyDetail.rented')}</SelectItem>
                                    <SelectItem value="Under Maintenance">{t('propertyDetail.underMaintenance')}</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t('propertyDetail.filterByType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {unitTypes.map(type => (
                                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {canCreateUnit && (
                                <Button onClick={handleAddNewUnit} className="w-full sm:w-auto">
                                    <PlusCircle className="mr-2" />
                                    {t('propertyDetail.addUnit')}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {unitsWithLeaseConflict.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t('propertyDetail.leaseConflict')}</AlertTitle>
                            <AlertDescription>
                                {t('propertyDetail.leaseConflictDesc')}: {unitsWithLeaseConflict.join(', ')}. {t('propertyDetail.resolveConflict')}
                            </AlertDescription>
                        </Alert>
                    )}
                    <UnitList 
                        units={filteredUnits}
                        propertyType={property.type} 
                        onEdit={canEditUnit ? handleEditUnit : undefined} 
                        onDelete={canDeleteUnit ? handleDeleteUnit : undefined}
                        onAssignTenant={canAssignTenant ? handleOpenAssignTenant : undefined}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('propertyDetail.ownerDetails')} & {t('propertyDetail.propertyManager')}</CardTitle>
                    <CardDescription>{t('propertyDetail.contactInfo')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-md flex items-center gap-2 mb-2"><User /> {t('propertyDetail.ownerDetails')}</h4>
                        <Separator/>
                        <div className="text-sm text-muted-foreground mt-3 space-y-2">
                            {propertyOwner ? (
                                <>
                                    <p><strong>{t('propertyDetail.name')}:</strong> {propertyOwner.name}</p>
                                    <p><strong>{t('propertyDetail.nationality')}:</strong> {propertyOwner.nationality || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone/> {propertyOwner.contact || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Mail/> {propertyOwner.email || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Fingerprint/> {propertyOwner.emiratesId || 'N/A'}</p>
                                </>
                            ) : (
                                <p>{t('propertyDetail.noOwner')}</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md flex items-center gap-2 mb-2"><ShieldCheck /> {t('propertyDetail.propertyManager')}</h4>
                        <Separator/>
                         <div className="text-sm text-muted-foreground mt-3 space-y-2">
                           {propertyManager ? (
                                <>
                                <p><strong>{t('propertyDetail.name')}:</strong> {propertyManager.name}</p>
                                <p className="flex items-center gap-2"><Phone/> {propertyManager.phone || 'N/A'}</p>
                                <p className="flex items-center gap-2"><Mail/> {propertyManager.email || 'N/A'}</p>
                                </>
                           ) : (
                            <p>{t('propertyDetail.noManager')}</p>
                           )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('propertyDetail.assignedStaff')}</CardTitle>
                    <CardDescription>{t('propertyDetail.manageStaff')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignedEmployees.map(employee => (
                        <div key={employee.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={employee.profilePictureUrl ?? undefined} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">{employee.position}</p>
                            </div>
                           </div>
                           {canAssignStaff && (
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveEmployeeClick(employee.id, employee.name)}>
                                <UserMinus className="h-4 w-4 text-destructive" />
                            </Button>
                           )}
                        </div>
                    ))}
                    {assignedEmployees.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-4">{t('propertyDetail.noStaff')}</p>
                    )}
                </CardContent>
                {canAssignStaff && (
                  <CardFooter className="flex flex-col items-start gap-2">
                        <p className="text-sm font-medium">{t('propertyDetail.assignNewStaff')}</p>
                        <div className="flex w-full gap-2">
                        <Select value={employeeToAssign} onValueChange={setEmployeeToAssign}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('propertyDetail.selectEmployee')} />
                            </SelectTrigger>
                            <SelectContent>
                                {unassignedEmployees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAssignEmployee} disabled={!employeeToAssign}>
                            <UserPlus />
                        </Button>
                        </div>
                  </CardFooter>
                )}
            </Card>
            <PropertyDocuments
                propertyId={property.id}
                initialDocuments={documents}
                loggedInEmployee={loggedInEmployee}
            />
        </div>
      </main>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property and all its associated units.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRemoveEmployeeDialogOpen} onOpenChange={setIsRemoveEmployeeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('propertyDetail.removeEmployeeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('propertyDetail.removeEmployeeDesc')} <span className="font-semibold">{employeeToRemove?.name}</span> {t('propertyDetail.fromProperty')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('unitList.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveEmployee} className="bg-destructive hover:bg-destructive/90">
              {t('propertyDetail.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loggedInEmployee && (
        <>
            <PropertySheet
                isOpen={isPropertySheetOpen}
                onOpenChange={setIsPropertySheetOpen}
                property={property}
                onSubmit={handlePropertySubmit}
                employees={allEmployees}
                owners={allOwners}
            />
             <UnitSheet
                isOpen={isUnitSheetOpen}
                onOpenChange={handleUnitSheetOpenChange}
                unit={editingUnit}
                property={property}
                propertyType={property.type}
                onSave={onUnitSheetSave}
            />
            <AssignTenantDialog
                isOpen={isAssignTenantDialogOpen}
                onOpenChange={setIsAssignTenantDialogOpen}
                unit={unitToAssign}
                tenants={tenants}
                onSubmit={handleAssignTenantSubmit}
            />
        </>
      )}
    </div>
  );
}
