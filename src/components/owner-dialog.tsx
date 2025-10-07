

'use client';

import { useRef, useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import type { Employee, Owner } from '@/lib/types';
import { FileText, ServerCrash } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { handleAddOwner, handleUpdateOwner, uploadFile } from '@/app/dashboard/actions';
import { useFormStatus } from 'react-dom';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

interface OwnerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  owner: Owner | null;
  onSave: (message: string, newOwner?: Owner) => void;
  loggedInEmployee: Employee | null;
}

function SubmitButton() {
    const { t } = useLanguage();
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? t('ownerDialog.saving') : t('ownerDialog.saveOwner')}</Button>
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function OwnerDialog({ isOpen, onOpenChange, owner, onSave, loggedInEmployee }: OwnerDialogProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'owners:documents:update');
  const hasSaved = useRef(false);
  const { toast } = useToast();
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`${t('ownerDialog.fileSizeExceeds')} ${MAX_FILE_SIZE_MB}MB.`);
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

  const serverAction = async (prevState: any, formData: FormData) => {
    console.log('Owner Dialog - Server Action Started');
    
    if (fileError) {
        console.log('Owner Dialog - File Error:', fileError);
        return { success: false, message: fileError };
    }

    let emiratesIdUrl: string | undefined | null = owner?.emiratesIdUrl;
    
    const idFile = formData.get('emiratesIdFile') as File;
    if (idFile && idFile.size > 0) {
      console.log('Owner Dialog - Uploading file:', idFile.name, idFile.size);
      if (!canUpdateDocuments) {
        console.log('Owner Dialog - No permission to update documents');
        return { success: false, message: t('ownerDialog.noPermission') };
      }
      const uploadResult = await uploadFile(formData, 'emiratesIdFile', 'owners');
      if (!uploadResult.success) {
        console.log('Owner Dialog - Upload failed:', uploadResult.message);
        toast({ variant: 'destructive', title: t('ownerDialog.uploadFailed'), description: uploadResult.message });
        return { success: false, message: uploadResult.message }; // Stop execution
      }
      emiratesIdUrl = uploadResult.filePath;
      console.log('Owner Dialog - File uploaded successfully:', emiratesIdUrl);
    }
    
    const ownerData = {
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      nationality: formData.get('nationality') as string,
      emiratesId: formData.get('emiratesId') as string,
      taxNumber: formData.get('taxNumber') as string,
      emiratesIdUrl: emiratesIdUrl,
    };
    
    console.log('Owner Dialog - Saving owner data:', ownerData);
    
    let result;
    if (owner) {
        console.log('Owner Dialog - Updating existing owner:', owner.id);
        result = await handleUpdateOwner(owner.id, ownerData);
    } else {
        console.log('Owner Dialog - Adding new owner');
        result = await handleAddOwner(ownerData);
    }
    
    console.log('Owner Dialog - Server Action Result:', result);
    return result;
  }

  const [state, formAction] = useActionState(serverAction, { success: false, message: ''});

  useEffect(() => {
    if (isOpen) {
      hasSaved.current = false;
      setFileError(null);
      setSelectedFileSize(null);
      formRef.current?.reset();
    }
  }, [isOpen]);
  
  useEffect(() => {
    console.log('Owner Dialog - State Changed:', state);
    if (state.success && !hasSaved.current) {
        console.log('Owner Dialog - Success detected, calling onSave');
        hasSaved.current = true;
        
        // Create a temporary owner object for in-memory storage
        let newOwner: Owner | undefined;
        if (!owner && formRef.current) {
          const formData = new FormData(formRef.current);
          newOwner = {
            id: `temp-${Date.now()}`, // Temporary ID
            name: formData.get('name') as string,
            contact: formData.get('contact') as string || null,
            email: formData.get('email') as string || null,
            phone: formData.get('contact') as string || null,
            nationality: formData.get('nationality') as string || null,
            emiratesId: formData.get('emiratesId') as string || null,
            emiratesIdUrl: null,
            taxNumber: formData.get('taxNumber') as string || null,
          };
          console.log('Owner Dialog - Created temp owner for local storage:', newOwner);
        }
        
        onSave(state.message, newOwner);
    }
  }, [state, onSave, owner]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} action={formAction}>
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">{owner ? t('ownerDialog.editTitle') : t('ownerDialog.addTitle')}</DialogTitle>
            <DialogDescription className="text-right">{t('ownerDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-right">{t('ownerDialog.ownerName')}</Label>
              <Input id="name" name="name" defaultValue={owner?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="block text-right">{t('ownerDialog.contactNumber')}</Label>
              <Input id="contact" name="contact" defaultValue={owner?.contact ?? ''} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email" className="block text-right">{t('ownerDialog.email')}</Label>
              <Input id="email" name="email" type="email" defaultValue={owner?.email ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality" className="block text-right">{t('ownerDialog.nationality')}</Label>
              <Input id="nationality" name="nationality" defaultValue={owner?.nationality ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emiratesId" className="block text-right">{t('ownerDialog.emiratesId')}</Label>
              <Input id="emiratesId" name="emiratesId" defaultValue={owner?.emiratesId ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emiratesIdFile" className="block text-right">{t('ownerDialog.uploadEmiratesId')}</Label>
              <Input id="emiratesIdFile" name="emiratesIdFile" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange}/>
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>{t('ownerDialog.maxFileSize')}: {MAX_FILE_SIZE_MB}MB.</span>
                {selectedFileSize && <span>{t('ownerDialog.selected')}: {formatFileSize(selectedFileSize)}</span>}
              </div>
              {fileError && (
                <Alert variant="destructive" className="mt-2">
                  <ServerCrash className="h-4 w-4" />
                  <AlertTitle>{t('ownerDialog.fileError')}</AlertTitle>
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}
              {owner?.emiratesIdUrl && !selectedFileSize && (
                <div className="text-sm text-muted-foreground mt-2">
                  <Link href={owner.emiratesIdUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <FileText className="h-4 w-4" />
                    {t('ownerDialog.viewCurrentDocument')}
                  </Link>
                </div>
              )}
            </div>
             <div className="space-y-2">
              <Label htmlFor="taxNumber" className="block text-right">{t('ownerDialog.taxNumber')}</Label>
              <Input id="taxNumber" name="taxNumber" defaultValue={owner?.taxNumber ?? ''} />
            </div>
            {!state.success && state.message && (
                <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>{t('ownerDialog.saveFailed')}</AlertTitle>
                    <AlertDescription className="whitespace-pre-line text-right">{state.message}</AlertDescription>
                </Alert>
            )}
          </div>
          <DialogFooter className="flex-row-reverse">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('ownerDialog.cancel')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
