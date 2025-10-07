

'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from './ui/label';
import type { Employee, Tenant } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Lock, ServerCrash } from 'lucide-react';
import { Switch } from './ui/switch';
import { handleAddTenant, handleUpdateTenant, uploadFile } from '@/app/dashboard/actions';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { hasPermission } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';

interface TenantSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenant: Tenant | null;
  onSave: (message: string) => void;
  loggedInEmployee: Employee | null;
}

const defaultValues: Omit<Tenant, 'id'> = {
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    idType: 'Emirates ID',
    nationality: '',
    idDocumentUrl: null,
    allowLogin: false,
    password: '',
};

const idTypes = ['Emirates ID', 'Passport', 'National ID'];

function SubmitButton({ isEditing, canCreate, canUpdate }: { isEditing: boolean, canCreate: boolean, canUpdate: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = pending || (isEditing ? !canUpdate : !canCreate);
    return (
        <Button type="submit" disabled={isDisabled}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function TenantSheet({
  isOpen,
  onOpenChange,
  tenant,
  onSave,
  loggedInEmployee,
}: TenantSheetProps) {
  
  const sheetTitle = tenant ? 'Edit Tenant' : 'Add New Tenant';
  const sheetDescription = tenant
    ? "Update the tenant's details below."
    : 'Fill in the form to add a new tenant to the system.';
    
  const currentValues = tenant ? {...tenant, password: ''} : defaultValues;

  const canCreate = hasPermission(loggedInEmployee, 'tenants:create');
  const canUpdate = hasPermission(loggedInEmployee, 'tenants:update');
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'tenants:documents:update');
  const { toast } = useToast();
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        setFileError(null);
        setSelectedFileSize(null);
    }
  }, [isOpen]);

  const handleSubmit = async (prevState: any, formData: FormData) => {
    if (fileError) {
      return { success: false, message: fileError };
    }

    let idDocumentUrl: string | undefined | null = tenant?.idDocumentUrl;
    
    const docFile = formData.get('idDocument') as File;
    if (docFile && docFile.size > 0) {
      if (!canUpdateDocuments) {
        return { success: false, message: "You don't have permission to upload documents." };
      }
      const uploadResult = await uploadFile(formData, 'idDocument', 'tenants');
      if (!uploadResult.success) {
        return { success: false, message: uploadResult.message };
      }
      idDocumentUrl = uploadResult.filePath;
    }

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string || undefined,
      phone: formData.get('phone') as string,
      idNumber: formData.get('idNumber') as string,
      idType: formData.get('idType') as string,
      nationality: formData.get('nationality') as string,
      idDocumentUrl: idDocumentUrl,
      allowLogin: formData.get('allowLogin') === 'on',
    };
    
    if (tenant) {
      return await handleUpdateTenant(tenant.id, data);
    } else {
      return await handleAddTenant(data);
    }
  };

  const [state, formAction] = useActionState(handleSubmit, { success: false, message: '' });
  
  useEffect(() => {
    if (state.success) {
      onSave(state.message);
    }
  }, [state, onSave]);
  
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
  
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
          <form action={formAction} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription>{sheetDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-4 overflow-y-auto pr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" defaultValue={currentValues.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="tenant@example.com" defaultValue={currentValues.email} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" placeholder="+971 50 123 4567" defaultValue={currentValues.phone ?? ''} />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="idType">ID Type</Label>
                         <Select name="idType" defaultValue={currentValues.idType ?? 'Emirates ID'}>
                            <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                            <SelectContent>
                                {idTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input id="idNumber" name="idNumber" placeholder="784-XXXX-XXXXXXX-X" defaultValue={currentValues.idNumber ?? ''} />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input id="nationality" name="nationality" placeholder="e.g., Emirati" defaultValue={currentValues.nationality ?? ''} />
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="idDocument">ID Document</Label>
                    <Input id="idDocument" name="idDocument" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange} />
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
                    {currentValues.idDocumentUrl && !selectedFileSize && (
                        <div className="text-sm text-muted-foreground mt-2">
                            <Link href={currentValues.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                <FileText className="h-4 w-4" />
                                View Current Document
                            </Link>
                        </div>
                    )}
                 </div>
                
                 <h3 className="text-lg font-medium pt-4 border-b pb-2 flex items-center gap-2"><Lock/> System Access</h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder={tenant ? "Leave blank to keep unchanged" : "Set initial password"} required={!tenant} />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                        <div className="space-y-0.5">
                        <Label htmlFor="allowLogin" className="text-base">Allow Login</Label>
                        <p className="text-sm text-muted-foreground">Allow this tenant to log in to their portal.</p>
                        </div>
                        <Switch id="allowLogin" name="allowLogin" defaultChecked={currentValues.allowLogin} />
                    </div>
                 </div>

                {!state.success && state.message && (
                    <Alert variant="destructive">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Save Failed</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
            </div>
            <SheetFooter className="mt-auto pt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              <SubmitButton isEditing={!!tenant} canCreate={canCreate} canUpdate={canUpdate} />
            </SheetFooter>
          </form>
      </SheetContent>
    </Sheet>
  );
}
