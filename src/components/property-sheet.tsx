

'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Building, MapPin, ShieldCheck, User as UserIcon, ServerCrash } from 'lucide-react';
import dynamic from 'next/dynamic';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Property, Employee, Owner } from '@/lib/types';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DatePicker } from './date-picker';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/contexts/language-context';

interface PropertySheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  property: Property | null;
  onSubmit: (data: FormData) => void;
  employees: Employee[];
  owners: Owner[];
}

const defaultValues: Omit<Property, 'id'> = {
    name: '',
    type: 'Flat',
    location: '',
    address: '',
    status: 'Available',
    purpose: 'For Sale',
    price: 0,
    size: 0,
    sizeUnit: 'sqft',
    description: '',
    imageUrl: null,
    dateListed: new Date(),
    floors: null,
    rooms: null,
    configuration: null,
    latitude: 25.2048, // Default to Dubai
    longitude: 55.2708,
    ownerId: '',
    managerId: '',
    accountNumber: '',
};

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PropertySheet({
  isOpen,
  onOpenChange,
  property,
  onSubmit,
  employees,
  owners,
}: PropertySheetProps) {
  
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [currentType, setCurrentType] = useState(property?.type || defaultValues.type);
  const [showMap, setShowMap] = useState(false);
  const [dateListed, setDateListed] = useState<Date | undefined>(property?.dateListed ? new Date(property.dateListed) : new Date());
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);

  const MapPicker = useMemo(() => dynamic(() => import('./map-picker'), { ssr: false }), []);

  useEffect(() => {
    if (isOpen) {
      setDateListed(property?.dateListed ? new Date(property.dateListed) : new Date());
      setFileError(null);
      setSelectedFileSize(null);
    }
  }, [isOpen, property]);

  const sheetTitle = property ? t('propertySheet.editTitle') : t('propertySheet.addTitle');
  const sheetDescription = property
    ? t('propertySheet.editDescription')
    : t('propertySheet.addDescription');

  const currentValues = property ? property : defaultValues;

  const propertyTypes = ['Building', 'Land', 'Flat', 'Villa', 'Office', 'Warehouse'];
  const propertyStatuses = ['Available', 'Sold', 'Rented', 'Under Construction', 'Off-plan'];
  const propertyPurposes = ['For Sale', 'For Rent'];
  const sizeUnits = ['sqft', 'sqm'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileSize(file.size);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`${t('propertySheet.fileSizeExceeds')} ${MAX_FILE_SIZE_MB}MB.`);
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
            title: t('propertySheet.fileError'),
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

  const handleLocationChange = (latlng: { lat: number, lng: number }, address: string) => {
    if (formRef.current) {
        (formRef.current.elements.namedItem('latitude') as HTMLInputElement).value = String(latlng.lat);
        (formRef.current.elements.namedItem('longitude') as HTMLInputElement).value = String(latlng.lng);
        (formRef.current.elements.namedItem('address') as HTMLInputElement).value = address;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-3xl sm:max-w-3xl">
          <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription>{sheetDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-6 overflow-y-auto pr-6">
              
               <h3 className="text-lg font-medium border-b pb-2 text-right">{t('propertySheet.propertyName')}</h3>
              <div className="space-y-2">
                 <Label className="block text-right">{t('propertySheet.propertyImage')}</Label>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-md">
                        <AvatarImage src={currentValues.imageUrl ?? undefined} className="rounded-md"/>
                        <AvatarFallback className="rounded-md">
                            <Building className="h-10 w-10" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Input id="propertyImage" name="propertyImage" type="file" className="max-w-xs" onChange={handleFileChange} />
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                            <span>{t('propertySheet.maxFileSize')}: {MAX_FILE_SIZE_MB}MB.</span>
                            {selectedFileSize && <span>{t('propertySheet.selected')}: {formatFileSize(selectedFileSize)}</span>}
                        </div>
                         {fileError && (
                            <Alert variant="destructive" className="mt-2">
                                <ServerCrash className="h-4 w-4" />
                                <AlertTitle>{t('propertySheet.fileError')}</AlertTitle>
                                <AlertDescription>{fileError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name" className="block text-right">{t('propertySheet.propertyName')}</Label>
                  <Input id="name" name="name" placeholder={t('propertySheet.propertyName')} defaultValue={currentValues.name} required />
                </div>
                
                <div className="space-y-2">
                     <Label htmlFor="type" className="block text-right">{t('propertySheet.propertyType')}</Label>
                     <Select name="type" defaultValue={currentValues.type ?? 'Flat'} onValueChange={setCurrentType}>
                        <SelectTrigger><SelectValue placeholder={t('propertySheet.selectType')} /></SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                 </div>

                 <div className="space-y-2">
                     <Label htmlFor="purpose" className="block text-right">{t('propertySheet.purpose')}</Label>
                     <Select name="purpose" defaultValue={currentValues.purpose ?? 'For Sale'}>
                          <SelectTrigger><SelectValue placeholder={t('propertySheet.selectPurpose')} /></SelectTrigger>
                        <SelectContent>
                          {propertyPurposes.map(purpose => <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>)}
                        </SelectContent>
                      </Select>
                 </div>

                 <div className="space-y-2">
                     <Label htmlFor="status" className="block text-right">{t('propertySheet.status')}</Label>
                     <Select name="status" defaultValue={currentValues.status ?? 'Available'}>
                          <SelectTrigger><SelectValue placeholder={t('propertySheet.selectStatus')} /></SelectTrigger>
                        <SelectContent>
                          {propertyStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                      </Select>
                 </div>

                <div className="space-y-2">
                    <Label htmlFor="price" className="block text-right">{t('propertySheet.price')}</Label>
                    <Input id="price" name="price" type="number" placeholder="1000000" defaultValue={currentValues.price ?? ''} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="block text-right">{t('propertySheet.accountNumber')}</Label>
                    <Input id="accountNumber" name="accountNumber" placeholder={t('propertySheet.accountPlaceholder')} defaultValue={currentValues.accountNumber ?? ''} />
                </div>
              </div>

              {currentType === 'Building' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                    <div className="space-y-2">
                        <Label htmlFor="floors" className="block text-right">{t('propertySheet.floors')}</Label>
                        <Input id="floors" name="floors" type="number" placeholder="10" defaultValue={currentValues.floors ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rooms" className="block text-right">{t('propertySheet.rooms')}</Label>
                        <Input id="rooms" name="rooms" type="number" placeholder="50" defaultValue={currentValues.rooms ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="configuration" className="block text-right">{t('propertySheet.configuration')}</Label>
                        <Input id="configuration" name="configuration" placeholder="G+M+10" defaultValue={currentValues.configuration ?? ''} />
                    </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex gap-2">
                    <div className="space-y-2 flex-grow">
                        <Label htmlFor="size" className="block text-right">{t('propertySheet.size')}</Label>
                        <Input id="size" name="size" type="number" placeholder="1200" defaultValue={currentValues.size ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sizeUnit" className="block text-right">{t('propertySheet.sizeUnit')}</Label>
                            <Select name="sizeUnit" defaultValue={currentValues.sizeUnit ?? 'sqft'}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {sizeUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="dateListed" className="block text-right">{t('propertySheet.dateListed')}</Label>
                    <Input 
                      id="dateListed" 
                      name="dateListed" 
                      type="date" 
                      value={dateListed ? format(dateListed, 'yyyy-MM-dd') : ''} 
                      onChange={(e) => setDateListed(e.target.value ? new Date(e.target.value) : undefined)}
                      lang="en"
                    />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="block text-right">{t('propertySheet.location')}</Label>
                {showMap ? (
                    <div className="h-64 w-full rounded-md border overflow-hidden">
                        <MapPicker
                            initialPosition={[currentValues.latitude!, currentValues.longitude!]}
                            onLocationChange={handleLocationChange}
                        />
                    </div>
                ) : (
                    <Button type="button" variant="outline" className="w-full" onClick={() => setShowMap(true)}>
                        <MapPin className="mr-2 h-4 w-4"/>
                        {t('propertySheet.selectOnMap')}
                    </Button>
                )}
                <Input type="hidden" name="latitude" defaultValue={currentValues.latitude ?? ''} />
                <Input type="hidden" name="longitude" defaultValue={currentValues.longitude ?? ''} />
                <Label className="block text-right">{t('propertySheet.address')}</Label>
                <Textarea name="address" placeholder={t('propertySheet.addressPlaceholder')} defaultValue={currentValues.address ?? ''} />
                <input type="hidden" id="location" name="location" defaultValue={currentValues.location ?? ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="block text-right">{t('propertySheet.description')}</Label>
                <Textarea id="description" name="description" placeholder={t('propertySheet.descriptionPlaceholder')} defaultValue={currentValues.description ?? ''} />
              </div>
              
              <h3 className="text-lg font-medium pt-4 border-b pb-2 flex items-center gap-2 justify-end flex-row-reverse"><UserIcon /> {t('propertySheet.owner')}</h3>
              <div className="grid grid-cols-1 pt-2">
                 <div className="space-y-2">
                     <Label htmlFor="ownerId" className="block text-right">{t('propertySheet.owner')}</Label>
                      <Select name="ownerId" defaultValue={currentValues.ownerId ?? 'no-owner'}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('propertySheet.selectOwner')} />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-owner">{t('propertySheet.selectOwner')}</SelectItem>
                          {owners.map((owner) => (
                              <SelectItem key={owner.id} value={owner.id}>
                                  {owner.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                 </div>
              </div>


              <h3 className="text-lg font-medium pt-4 border-b pb-2 flex items-center gap-2 justify-end flex-row-reverse"><ShieldCheck /> {t('propertySheet.manager')}</h3>
               <div className="grid grid-cols-1 pt-2">
                 <div className="space-y-2">
                     <Label htmlFor="managerId" className="block text-right">{t('propertySheet.manager')}</Label>
                      <Select name="managerId" defaultValue={currentValues.managerId ?? 'no-manager'}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('propertySheet.selectManager')} />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-manager">{t('propertySheet.selectManager')}</SelectItem>
                          {employees.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                 </div>
              </div>


            </div>
            <SheetFooter className="mt-auto pt-6 flex-row-reverse">
              <Button type="submit">{t('propertySheet.save')}</Button>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  {t('propertySheet.cancel')}
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
      </SheetContent>
    </Sheet>
  );
}
