

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building, LogOut, PlusCircle, LogIn, Home, Users, ChevronDown, LandPlot, UserSquare, Receipt, Wrench, Package, WalletCards, Users2, Building2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleAddEmployee, handleUpdateEmployee, handleDeleteEmployee, uploadFile } from '@/app/dashboard/actions';
import EmployeeList from '@/components/employee-list';
import EmployeeSheet from '@/components/employee-sheet';
import { useToast } from '@/hooks/use-toast';
import { getEmployees } from '@/lib/db';
import type { Employee } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';
import { AppHeader } from './layout/header';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '@/contexts/language-context';

export default function EmployeeManagementClient({ initialEmployees, loggedInEmployee }: { initialEmployees: Employee[], loggedInEmployee: Employee | null }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const canCreate = hasPermission(loggedInEmployee, 'employees:create');
  const canUpdate = hasPermission(loggedInEmployee, 'employees:update');
  const canDelete = hasPermission(loggedInEmployee, 'employees:delete');
  const canRead = hasPermission(loggedInEmployee, 'employees:read');
  const canManagePermissions = hasPermission(loggedInEmployee, 'employees:manage-permissions');

  const employeeStats = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const departments = new Set(employees.map(e => e.department));
    return {
      total: employees.length,
      active: activeEmployees,
      departments: departments.size,
    }
  }, [employees]);

  const departmentOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return employees.filter(employee => {
      const matchesSearch = (
        employee.name.toLowerCase().includes(lowercasedQuery) ||
        employee.email.toLowerCase().includes(lowercasedQuery) ||
        employee.position.toLowerCase().includes(lowercasedQuery)
      );
      const matchesDept = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsSheetOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (!canDelete) {
        toast({ 
          variant: 'destructive', 
          title: 'خطأ في الصلاحيات', 
          description: 'ليس لديك صلاحية حذف الموظفين.'
        });
        return;
    }
    
    try {
      const result = await handleDeleteEmployee(employeeId);
      if (result.success) {
        // تحديث القائمة فوراً
        setEmployees(employees.filter((e) => e.id !== employeeId));
        
        // إعادة جلب البيانات للتأكد
        setTimeout(async () => {
          const updated = await getEmployees();
          setEmployees(updated);
        }, 500);
        
        toast({
          title: 'نجح',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل الحذف',
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ غير متوقع أثناء الحذف',
      });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    let profilePictureUrl: string | undefined | null = editingEmployee?.profilePictureUrl;
    
    const pictureFile = formData.get('profilePicture') as File;
    if (pictureFile && pictureFile.size > 0) {
      const uploadResult = await uploadFile(formData, 'profilePicture', 'employees');
      if (!uploadResult.success) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: uploadResult.message });
        return;
      }
      profilePictureUrl = uploadResult.filePath;
    }

    const data: Omit<Employee, 'id'> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string || undefined,
      position: formData.get('position') as string,
      department: formData.get('department') as string,
      startDate: new Date(formData.get('startDate') as string),
      phone: formData.get('phone') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      emiratesId: formData.get('emiratesId') as string,
      passportNumber: formData.get('passportNumber') as string,
      allowLogin: formData.get('allowLogin') === 'on',
      dateOfBirth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth') as string) : null,
      status: formData.get('status') as string,
      nationality: formData.get('nationality') as string,
      managerId: formData.get('managerId') === 'no-manager' ? null : formData.get('managerId') as string,
      salary: Number(formData.get('salary')),
      visaNumber: formData.get('visaNumber') as string,
      visaExpiryDate: formData.get('visaExpiryDate') ? new Date(formData.get('visaExpiryDate') as string) : null,
      insuranceNumber: formData.get('insuranceNumber') as string,
      insuranceExpiryDate: formData.get('insuranceExpiryDate') ? new Date(formData.get('insuranceExpiryDate') as string) : null,
      telegramBotToken: formData.get('telegramBotToken') as string,
      telegramChannelId: formData.get('telegramChannelId') as string,
      enableEmailAlerts: formData.get('enableEmailAlerts') === 'on',
      profilePictureUrl: profilePictureUrl,
      permissions: formData.getAll('permissions') as string[],
    };
    
    let result;
    if (editingEmployee) {
       if (!canUpdate) {
         toast({ variant: 'destructive', title: 'Error', description: 'You do not have permission to update employees.'});
         return;
       }
      result = await handleUpdateEmployee(editingEmployee.id, data as any);
      if (result.success) {
         const updatedEmployees = await getEmployees();
         setEmployees(updatedEmployees);
      }
    } else {
       if (!canCreate) {
         toast({ variant: 'destructive', title: 'Error', description: 'You do not have permission to create employees.'});
         return;
       }
      result = await handleAddEmployee(data as any);
      if (result.success) {
        const updatedEmployees = await getEmployees();
        setEmployees(updatedEmployees);
      }
    }

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setIsSheetOpen(false);
      setEditingEmployee(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
           <div className="grid gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('employees.totalEmployees')}</CardTitle>
                      <Users2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{employeeStats.total}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('employees.activeEmployees')}</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{employeeStats.active}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('employees.departments')}</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{employeeStats.departments}</div>
                  </CardContent>
              </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>{t('employees.title')}</CardTitle>
                    <CardDescription>
                        {loggedInEmployee ? t('employees.description') : t('employees.noPermissionPage')}
                    </CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                    <Input 
                        placeholder={t('employees.searchEmployees')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-[250px]"
                    />
                     <Select value={departmentFilter} onValueChange={(value) => { setDepartmentFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder={t('employees.filterDepartment')} />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentOptions.map(dept => (
                                <SelectItem key={dept} value={dept} className="capitalize">{dept === 'all' ? t('employees.allDepartments') : dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder={t('employees.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('employees.allStatuses')}</SelectItem>
                            <SelectItem value="Active">{t('employees.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('employees.inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {canCreate && (
                        <Button onClick={handleAddNew} className="w-full md:w-auto mt-2 sm:mt-0">
                            <PlusCircle className="mr-2" />
                            {t('employees.add')}
                        </Button>
                    )}
                 </div>
            </CardHeader>
            <CardContent>
              {canRead ? (
                  <>
                    <EmployeeList 
                        employees={paginatedEmployees} 
                        onEdit={canUpdate ? handleEdit : undefined} 
                        onDelete={canDelete ? handleDelete : undefined}
                    />
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <span className="text-sm text-muted-foreground">
                                {t('employees.page')} {currentPage} {t('employees.of')} {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                {t('employees.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                {t('employees.next')}
                            </Button>
                        </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground">{t('employees.noPermissionView')}</p>
                )}
            </CardContent>
          </Card>
      </main>

      
        <EmployeeSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            employee={editingEmployee}
            onSubmit={handleSubmit}
            employees={employees}
            canManagePermissions={canManagePermissions}
        />
      
    </div>
  );
}
