

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { Asset, Property, Unit, Employee } from '@/lib/types';
import { FileText, ServerCrash } from 'lucide-react';
import { DatePicker } from './date-picker'; // A reusable date picker component
import { hasPermission } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/contexts/language-context';

interface AssetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  asset: Asset | null;
  properties: (Property & { units: Unit[] })[];
  onSubmit: (data: FormData) => void;
  loggedInEmployee: Employee | null;
}

const assetCategories = ['Appliances', 'Furniture', 'HVAC', 'Plumbing', 'Electrical', 'Fixtures', 'Other'];
const assetStatuses = ['In Service', 'Under Repair', 'Decommissioned', 'In Storage'];
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AssetDialog({ isOpen, onOpenChange, asset, properties, onSubmit, loggedInEmployee }: AssetDialogProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(asset?.propertyId);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(asset?.purchaseDate ? new Date(asset.purchaseDate) : undefined);
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState<Date | undefined>(asset?.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate) : undefined);
  
  const canUpdateDocuments = hasPermission(loggedInEmployee, 'assets:documents:update');
  
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        setSelectedPropertyId(asset?.propertyId);
        setPurchaseDate(asset?.purchaseDate ? new Date(asset.purchaseDate) : undefined);
        setWarrantyExpiryDate(asset?.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate) : undefined);
        setFileError(null);
        setSelectedFileSize(null);
    }
  }, [isOpen, asset]);

  const availableUnits = properties.find(p => p.id === selectedPropertyId)?.units ?? [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`${t('assets.fileSizeExceeds')} ${MAX_FILE_SIZE_MB}MB.`);
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
            title: t('assets.fileError'),
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>{asset ? t('assets.editAsset') : t('assets.addNew')}</DialogTitle>
            <DialogDescription>{t('assets.dialogDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="name">{t('assets.assetName')}</Label>
                <Input id="name" name="name" defaultValue={asset?.name} placeholder={t('assets.assetNamePlaceholder')} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="propertyId">{t('assets.propertyLabel')}</Label>
                    <Select name="propertyId" defaultValue={asset?.propertyId} onValueChange={setSelectedPropertyId} required>
                    <SelectTrigger><SelectValue placeholder={t('assets.selectProperty')} /></SelectTrigger>
                    <SelectContent>
                        {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unitId">{t('assets.unitLabel')}</Label>
                    <Select name="unitId" defaultValue={asset?.unitId ?? 'property-wide'} disabled={!selectedPropertyId}>
                    <SelectTrigger><SelectValue placeholder={t('assets.selectUnit')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="property-wide">{t('assets.propertyWideAsset')}</SelectItem>
                        {availableUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.unitNumber}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="locationInProperty">{t('assets.locationInProperty')}</Label>
                <Input id="locationInProperty" name="locationInProperty" defaultValue={asset?.locationInProperty ?? ''} placeholder={t('assets.locationPlaceholder')} />
            </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">{t('assets.categoryLabel')}</Label>
                    <Select name="category" defaultValue={asset?.category || undefined}>
                    <SelectTrigger><SelectValue placeholder={t('assets.selectCategory')} /></SelectTrigger>
                    <SelectContent>
                        {assetCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">{t('assets.statusLabel')}</Label>
                    <Select name="status" defaultValue={asset?.status ?? 'In Service'}>
                    <SelectTrigger><SelectValue placeholder={t('assets.selectStatus')} /></SelectTrigger>
                    <SelectContent>
                        {assetStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="manufacturer">{t('assets.manufacturer')}</Label>
                    <Input id="manufacturer" name="manufacturer" defaultValue={asset?.manufacturer ?? ''} placeholder={t('assets.manufacturerPlaceholder')} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="modelNumber">{t('assets.modelNumber')}</Label>
                    <Input id="modelNumber" name="modelNumber" defaultValue={asset?.modelNumber ?? ''} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="serialNumber">{t('assets.serialNumberLabel')}</Label>
                    <Input id="serialNumber" name="serialNumber" defaultValue={asset?.serialNumber ?? ''} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="purchaseDate">{t('assets.purchaseDate')}</Label>
                    <DatePicker name="purchaseDate" value={purchaseDate} onSelect={setPurchaseDate} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="purchasePrice">{t('assets.purchasePrice')}</Label>
                    <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" defaultValue={asset?.purchasePrice ?? ''} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="warrantyExpiryDate">{t('assets.warrantyExpiry')}</Label>
                    <DatePicker name="warrantyExpiryDate" value={warrantyExpiryDate} onSelect={setWarrantyExpiryDate} />
                 </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="invoiceFile">{t('assets.uploadInvoice')}</Label>
                <Input id="invoiceFile" name="invoiceFile" type="file" disabled={!canUpdateDocuments} onChange={handleFileChange}/>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{t('assets.maxFileSize')}: {MAX_FILE_SIZE_MB}MB.</span>
                    {selectedFileSize && <span>{t('assets.selected')}: {formatFileSize(selectedFileSize)}</span>}
                </div>
                 {fileError && (
                    <Alert variant="destructive" className="mt-2">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>{t('assets.fileError')}</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                )}
                {asset?.invoiceUrl && !selectedFileSize && (
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href={asset.invoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <FileText className="h-4 w-4" />
                            {t('assets.viewCurrentDocument')}
                        </Link>
                    </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('assets.notesLabel')}</Label>
              <Textarea id="notes" name="notes" defaultValue={asset?.notes ?? ''} placeholder={t('assets.notesPlaceholder')} />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('assets.cancel')}</Button>
            <Button type="submit">{t('assets.saveAsset')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
