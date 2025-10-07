

'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, User, Shield, Lock, DollarSign, BadgeInfo, FileUp, Fingerprint, Briefcase, Mail, Phone, Bot, ServerCrash } from 'lucide-react';
import Image from 'next/image';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { employeeSchema, type Employee } from '@/lib/types';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ALL_PERMISSIONS, PERMISSION_GROUPS, type Permission } from '@/lib/permissions';
import { DatePicker } from './date-picker';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface EmployeeSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: FormData) => void;
  employees: Employee[];
  canManagePermissions: boolean;
}

const defaultValues = {
      name: 'New Employee',
      email: `employee-${Date.now()}@example.com`,
      password: 'password123',
      position: 'N/A',
      department: 'N/A',
      startDate: new Date(),
      phone: '',
      emergencyContact: '',
      emiratesId: '',
      passportNumber: '',
      allowLogin: true,
      dateOfBirth: null,
      status: 'Active',
      nationality: '',
      managerId: '',
      salary: 0,
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowance: 0,
      visaNumber: '',
      visaExpiryDate: null,
      insuranceNumber: '',
      insuranceExpiryDate: null,
      telegramBotToken: '',
      telegramChannelId: '',
      enableEmailAlerts: false,
      profilePictureUrl: null,
      permissions: [],
};

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function EmployeeSheet({
  isOpen,
  onOpenChange,
  employee,
  onSubmit,
  employees,
  canManagePermissions
}: EmployeeSheetProps) {
  
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>(employee?.startDate ? new Date(employee.startDate) : new Date());
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(employee?.dateOfBirth ? new Date(employee.dateOfBirth) : undefined);
  const [visaExpiryDate, setVisaExpiryDate] = useState<Date | undefined>(employee?.visaExpiryDate ? new Date(employee.visaExpiryDate) : undefined);
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState<Date | undefined>(employee?.insuranceExpiryDate ? new Date(employee.insuranceExpiryDate) : undefined);
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [adminQuickPermissions, setAdminQuickPermissions] = useState(false);
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
        setStartDate(employee?.startDate ? new Date(employee.startDate) : new Date());
        setDateOfBirth(employee?.dateOfBirth ? new Date(employee.dateOfBirth) : undefined);
        setVisaExpiryDate(employee?.visaExpiryDate ? new Date(employee.visaExpiryDate) : undefined);
        setInsuranceExpiryDate(employee?.insuranceExpiryDate ? new Date(employee.insuranceExpiryDate) : undefined);
        setFileError(null);
        setSelectedFileSize(null);
        
        // تهيئة حالة الصلاحيات
        const initialPermissionsState: any = {};
        Object.values(PERMISSION_GROUPS).flat().forEach((permission) => {
          initialPermissionsState[permission] = (currentValues.permissions as any)?.includes(permission) || false;
        });
        setPermissionsState(initialPermissionsState);
        
        // تحديث إحصائيات الصلاحيات عند فتح النافذة
        setTimeout(() => {
            updatePermissionsStats();
        }, 200);
    }
  }, [isOpen, employee]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      } else {
        setFileError(null);
      }
    } else {
        setSelectedFileSize(null);
        setFileError(null);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileError) {
        toast({
            variant: 'destructive',
            title: 'File Error',
            description: fileError,
        });
        return;
    }
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // دالة للتعامل مع Admin Quick Permissions
  const handleAdminQuickPermissionsChange = (checked: boolean) => {
    setAdminQuickPermissions(checked);
    
    // استخدام React state بدلاً من DOM manipulation
    const newPermissionsState: Record<string, boolean> = {};
    
    // الحصول على جميع الصلاحيات من PERMISSION_GROUPS
    Object.values(PERMISSION_GROUPS).flat().forEach((permission) => {
      if (checked) {
        // عند التفعيل: تفعيل جميع الصلاحيات عدا الحذف
        if (!permission.includes(':delete') && !permission.includes('delete:')) {
          newPermissionsState[permission] = true;
        } else {
          newPermissionsState[permission] = false;
        }
      } else {
        // عند الإلغاء: إلغاء جميع الصلاحيات عدا الدخول
        if (permission.includes('login') || permission.includes('auth:')) {
          newPermissionsState[permission] = true;
        } else {
          newPermissionsState[permission] = false;
        }
      }
    });
    
    setPermissionsState(newPermissionsState);
    
    // تحديث DOM بعد تحديث state
    setTimeout(() => {
      const permissionSwitches = document.querySelectorAll('input[name="permissions"]');
      
      console.log(`تم العثور على ${permissionSwitches.length} صلاحية`);
      
      permissionSwitches.forEach((switchElement) => {
        const input = switchElement as HTMLInputElement;
        const permission = input.value;
        const shouldBeChecked = newPermissionsState[permission] || false;
        
        if (input.checked !== shouldBeChecked) {
          input.checked = shouldBeChecked;
          console.log(`${shouldBeChecked ? 'تم تفعيل' : 'تم إلغاء'}: ${permission}`);
          // إرسال حدث التغيير
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      // تحديث الإحصائيات
      updatePermissionsStats();
      
      // إظهار رسالة تأكيد
      toast({
        title: checked ? "All Permissions Enabled" : "All Permissions Disabled",
        description: checked 
          ? "All permissions have been enabled except delete permissions" 
          : "All permissions have been disabled except login permission",
        variant: checked ? "default" : "destructive"
      });
    }, 300);
  };

  // دالة لمعالجة تغيير الصلاحيات الفردية
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissionsState(prev => ({
      ...prev,
      [permission]: checked
    }));
    
    // تحديث DOM مباشرة
    const input = document.querySelector(`input[name="permissions"][value="${permission}"]`) as HTMLInputElement;
    if (input) {
      input.checked = checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // تحديث الإحصائيات بعد التغيير
    setTimeout(() => {
      updatePermissionsStats();
    }, 100);
  };

  // دالة لتحديث إحصائيات الصلاحيات
  const updatePermissionsStats = () => {
    setTimeout(() => {
      const permissionSwitches = document.querySelectorAll('input[name="permissions"]');
      let enabledCount = 0;
      let disabledCount = 0;
      let deletePermissionsCount = 0;
      
      console.log(`تحديث الإحصائيات: ${permissionSwitches.length} صلاحية`);
      
      permissionSwitches.forEach((switchElement) => {
        const input = switchElement as HTMLInputElement;
        const permission = input.value;
        
        // عد صلاحيات الحذف الممنوعة
        if (permission.includes(':delete') || permission.includes('delete:')) {
          deletePermissionsCount++;
        }
        
        if (input.checked) {
          enabledCount++;
        } else {
          disabledCount++;
        }
      });
      
      const totalCount = enabledCount + disabledCount;
      
      console.log(`الإحصائيات: مفعلة=${enabledCount}, معطلة=${disabledCount}, المجموع=${totalCount}, حذف ممنوع=${deletePermissionsCount}`);
      
      const enabledElement = document.getElementById('enabledPermissionsCount');
      const disabledElement = document.getElementById('disabledPermissionsCount');
      const totalElement = document.getElementById('totalPermissionsCount');
      const deleteElement = document.getElementById('deletePermissionsCount');
      
      if (enabledElement) {
        enabledElement.textContent = enabledCount.toString();
        console.log('تم تحديث عدد الصلاحيات المفعلة');
      }
      if (disabledElement) {
        disabledElement.textContent = disabledCount.toString();
        console.log('تم تحديث عدد الصلاحيات المعطلة');
      }
      if (totalElement) {
        totalElement.textContent = totalCount.toString();
        console.log('تم تحديث المجموع الكلي');
      }
      if (deleteElement) {
        deleteElement.textContent = deletePermissionsCount.toString();
        console.log('تم تحديث عدد صلاحيات الحذف الممنوعة');
      }
    }, 100);
  };


  const sheetTitle = employee ? 'Edit Employee' : 'Add New Employee';
  const sheetDescription = employee
    ? "Update the employee's details below."
    : 'Fill in the form to add a new employee to the system.';

  const potentialManagers = employees.filter(e => e.id !== employee?.id);
  
  const currentValues = employee ? {
     ...employee,
     password: '',
  } : defaultValues;


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-4xl sm:max-w-4xl">
          <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription>{sheetDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-6 overflow-y-auto pr-6">

              <div className="border-b">
                 <nav className="-mb-px flex space-x-6">
                    <Button type="button" variant="ghost" onClick={() => setActiveTab('personal')} className={cn("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')}>
                        <Briefcase className="mr-2"/> Personal & Job
                    </Button>
                     <Button type="button" variant="ghost" onClick={() => setActiveTab('salary')} className={cn("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", activeTab === 'salary' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')}>
                        <DollarSign className="mr-2"/> Salary
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setActiveTab('permissions')} className={cn("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')}>
                        <Lock className="mr-2"/> Permissions
                    </Button>
                 </nav>
              </div>

            <div className={cn("space-y-6", activeTab !== 'personal' && 'hidden')}>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1 lg:col-span-3">
                 <Label>Profile Picture</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={currentValues.profilePictureUrl ?? undefined} />
                        <AvatarFallback>
                            <User className="h-10 w-10" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Input id="profilePicture" name="profilePicture" type="file" className="max-w-xs" onChange={handleFileChange} />
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                            <span>Max file size: {MAX_FILE_SIZE_MB}MB.</span>
                            {selectedFileSize && <span>Selected: {formatFileSize(selectedFileSize)}</span>}
                        </div>
                         {fileError && (
                            <Alert variant="destructive" className="mt-2">
                                <ServerCrash className="h-4 w-4" />
                                <AlertTitle>File Error</AlertTitle>
                                <AlertDescription>{fileError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                 </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" defaultValue={currentValues.name} required />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input id="email" name="email" type="email" placeholder="john.doe@example.com" defaultValue={currentValues.email} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="123-456-7890" defaultValue={currentValues.phone ?? ''} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" placeholder="Software Engineer" defaultValue={currentValues.position} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" placeholder="Technology" defaultValue={currentValues.department} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Join Date</Label>
                    <DatePicker name="startDate" value={startDate} onSelect={setStartDate} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <DatePicker name="dateOfBirth" value={dateOfBirth} onSelect={setDateOfBirth} />
                </div>
                 <div className="space-y-2">
                     <Label htmlFor="status">Status</Label>
                     <Select name="status" defaultValue={currentValues.status ?? 'Active'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee status" />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" name="nationality" placeholder="Emirati" defaultValue={currentValues.nationality ?? ''} />
                 </div>
                 <div className="space-y-2 col-span-1 lg:col-span-3">
                     <Label htmlFor="managerId">Manager</Label>
                      <Select name="managerId" defaultValue={currentValues.managerId ?? 'no-manager'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a manager" />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-manager">No Manager</SelectItem>
                          {potentialManagers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                 </div>
              </div>

              <h3 className="text-lg font-medium pt-4 border-b pb-2">Identification & Emergency</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input id="emiratesId" name="emiratesId" placeholder="784-XXXX-XXXXXXX-X" defaultValue={currentValues.emiratesId ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input id="passportNumber" name="passportNumber" placeholder="A12345678" defaultValue={currentValues.passportNumber ?? ''} />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Details</Label>
                  <Textarea id="emergencyContact" name="emergencyContact" placeholder="Name, Relationship, Phone Number" defaultValue={currentValues.emergencyContact ?? ''} />
                </div>
              </div>

              <h3 className="text-lg font-medium pt-4 border-b pb-2">Visa & Insurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="visaNumber">Visa Number</Label>
                    <Input id="visaNumber" name="visaNumber" placeholder="Visa Number" defaultValue={currentValues.visaNumber ?? ''} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="visaExpiryDate">Visa Expiry Date</Label>
                    <DatePicker name="visaExpiryDate" value={visaExpiryDate} onSelect={setVisaExpiryDate} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">Insurance Policy Number</Label>
                    <Input id="insuranceNumber" name="insuranceNumber" placeholder="Policy Number" defaultValue={currentValues.insuranceNumber ?? ''} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="insuranceExpiryDate">Insurance Expiry Date</Label>
                    <DatePicker name="insuranceExpiryDate" value={insuranceExpiryDate} onSelect={setInsuranceExpiryDate} />
                 </div>
              </div>
              
              <h3 className="text-lg font-medium pt-4 border-b pb-2">System & Alerts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                    <Input id="telegramBotToken" name="telegramBotToken" placeholder="Bot Token" defaultValue={currentValues.telegramBotToken ?? ''} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="telegramChannelId">Telegram Channel ID</Label>
                    <Input id="telegramChannelId" name="telegramChannelId" placeholder="Channel ID" defaultValue={currentValues.telegramChannelId ?? ''} />
                 </div>
              </div>
            </div>


            <div className={cn("space-y-6", activeTab !== 'salary' && 'hidden')}>
                <div className="space-y-2">
                    <Label htmlFor="salary">Total Salary (read-only)</Label>
                    <Input id="salary" name="salary" type="number" placeholder="50000" defaultValue={currentValues.salary ?? ''} readOnly className="bg-muted"/>
                    <p className="text-xs text-muted-foreground">This is auto-calculated from the fields below.</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="basicSalary">Basic Salary</Label>
                        <Input id="basicSalary" name="basicSalary" type="number" step="0.01" placeholder="30000" defaultValue={currentValues.basicSalary ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="housingAllowance">Housing Allowance</Label>
                        <Input id="housingAllowance" name="housingAllowance" type="number" step="0.01" placeholder="15000" defaultValue={currentValues.housingAllowance ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="transportAllowance">Transport Allowance</Label>
                        <Input id="transportAllowance" name="transportAllowance" type="number" step="0.01" placeholder="5000" defaultValue={currentValues.transportAllowance ?? 0} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="otherAllowance">Other Allowances</Label>
                        <Input id="otherAllowance" name="otherAllowance" type="number" step="0.01" placeholder="1000" defaultValue={currentValues.otherAllowance ?? 0} />
                    </div>
                 </div>
            </div>

            <div className={cn("space-y-6", activeTab !== 'permissions' && 'hidden')}>
              {canManagePermissions ? (
                 <>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder={employee ? "Leave blank to keep unchanged" : "Set initial password"} required={!employee} />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                        <Label htmlFor="allowLogin" className="text-base">Allow Login</Label>
                        <p className="text-sm text-muted-foreground">Allow this employee to log in to the system.</p>
                        </div>
                        <Switch id="allowLogin" name="allowLogin" defaultChecked={currentValues.allowLogin} />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                        <Label htmlFor="enableEmailAlerts" className="text-base">Enable Email Alerts</Label>
                        <p className="text-sm text-muted-foreground">Send email notifications for important events.</p>
                        </div>
                        <Switch id="enableEmailAlerts" name="enableEmailAlerts" defaultChecked={currentValues.enableEmailAlerts} />
                    </div>
                    {/* Admin Quick Permissions */}
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="adminQuickPermissions" className="text-base flex items-center gap-2 text-red-600">
                                <Shield className="h-5 w-5" />
                                Admin Quick Permissions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Enable/disable all permissions at once (except delete when enabling, except login when disabling)
                            </p>
                        </div>
                        <Switch 
                            id="adminQuickPermissions" 
                            checked={adminQuickPermissions}
                            onCheckedChange={handleAdminQuickPermissionsChange}
                        />
                    </div>
                        
                    {/* إحصائيات الصلاحيات */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-green-600" id="enabledPermissionsCount">0</p>
                                <p className="text-xs text-gray-600">Enabled</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600" id="disabledPermissionsCount">0</p>
                                <p className="text-xs text-gray-600">Disabled</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600" id="totalPermissionsCount">0</p>
                                <p className="text-xs text-gray-600">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600" id="deletePermissionsCount">0</p>
                                <p className="text-xs text-gray-600">Delete Restricted</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                            <div key={groupName} className="space-y-3">
                                <h4 className="font-semibold">{groupName}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissions.map((permission: any) => {
                                    const isEnabled = permissionsState[permission] !== undefined 
                                        ? permissionsState[permission] 
                                        : (currentValues.permissions as any)?.includes(permission);
                                    
                                    return (
                                        <div key={permission} className={`flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="space-y-0.5">
                                                <Label htmlFor={permission} className={`text-base font-normal capitalize ${isEnabled ? 'text-green-800' : 'text-gray-600'}`}>
                                                    {permission.replace(/[:]/g, ' ')}
                                                    {isEnabled && <span className="ml-2 text-green-600">✓</span>}
                                                </Label>
                                            </div>
                                            <Switch
                                                id={permission}
                                                name="permissions"
                                                value={permission}
                                                checked={isEnabled}
                                                onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                                            />
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-10">You do not have permission to manage permissions.</p>
              )}
            </div>

            </div>
            <SheetFooter className="mt-auto pt-6">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
      </SheetContent>
    </Sheet>
  );
}
