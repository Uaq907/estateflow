

'use client';

import { useRef, useEffect, useState, useMemo, useActionState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Unit, Property, UnitConfiguration } from '@/lib/types';
import { Label } from './ui/label';
import { addUnit, getUnitConfigurations, updateUnit } from '@/lib/db';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ServerCrash } from 'lucide-react';

interface UnitSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  unit: Unit | null;
  property: Property;
  propertyType: string;
  onSave: (message: string) => void;
}

const defaultValues = {
    unitNumber: '',
    type: 'Residential',
    status: 'Available',
    size: 0,
    sizeUnit: 'sqft',
    price: 0,
    description: '',
    floor: null,
    accountNumber: '',
    configuration: '',
};

const unitTypeOptions: string[] = ['Residential', 'Commercial', 'Office', 'Retail'];
const unitStatusOptions = ['Available', 'Under Maintenance'];
const sizeUnits = ['sqft', 'sqm'];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

export default function UnitSheet({
  isOpen,
  onOpenChange,
  unit,
  property,
  propertyType,
  onSave,
}: UnitSheetProps) {
  
  const [allConfigurations, setAllConfigurations] = useState<UnitConfiguration[]>([]);
  const [selectedUnitType, setSelectedUnitType] = useState<string>(unit?.type || defaultValues.type);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSaved = useRef(false);

  const handleSubmit = async (prevState: any, formData: FormData) => {
    const floorValue = formData.get('floor');
    
    const unitData: Omit<Unit, 'id'> = {
        propertyId: formData.get('propertyId') as string,
        unitNumber: formData.get('unitNumber') as string,
        type: formData.get('type') as string,
        status: formData.get('status') as string,
        size: Number(formData.get('size')) || undefined,
        sizeUnit: formData.get('sizeUnit') as string || undefined,
        price: Number(formData.get('price')) || undefined,
        description: formData.get('description') as string || undefined,
        floor: floorValue !== null && floorValue !== '' ? Number(floorValue) : null,
        accountNumber: formData.get('accountNumber') as string || undefined,
        configuration: formData.get('configuration') as string || undefined,
    };

    if (unit) {
        return await updateUnit(unit.id, unitData);
    } else {
        return await addUnit(unitData);
    }
  };

  const [state, formAction] = useActionState(handleSubmit, { success: false, message: '' });


  useEffect(() => {
    if (isOpen) {
        hasSaved.current = false; // Reset on open
        const fetchConfigs = async () => {
            const fetchedConfigs = await getUnitConfigurations();
            setAllConfigurations(fetchedConfigs);
        };
        fetchConfigs();
        setSelectedUnitType(unit?.type || defaultValues.type);
    }
  }, [isOpen, unit]);

  useEffect(() => {
    if (state.success && !hasSaved.current) {
      hasSaved.current = true;
      onSave(state.message);
    }
  }, [state, onSave]);

  const filteredConfigurations = useMemo(() => {
    return allConfigurations.filter(config => config.type === selectedUnitType);
  }, [allConfigurations, selectedUnitType]);

  const sheetTitle = unit ? 'Edit Unit' : 'Add New Unit';
  const sheetDescription = unit
    ? "Update the unit's details below."
    : 'Fill in the form to add a new unit to the property.';
    
  const currentValues = unit ? unit : defaultValues;
  const isRented = currentValues.status === 'Rented';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
          <form ref={formRef} action={formAction} className="flex flex-col h-full">
            <input type="hidden" name="propertyId" value={property.id} />
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription>{sheetDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 py-6 space-y-4 overflow-y-auto pr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="unitNumber">Unit Number / Name</Label>
                        <Input id="unitNumber" name="unitNumber" placeholder="e.g., A-101, Plot 5" defaultValue={currentValues.unitNumber} required />
                    </div>

                    {propertyType === 'Building' && (
                        <div className="space-y-2">
                            <Label htmlFor="floor">Floor</Label>
                            <Input id="floor" name="floor" type="number" placeholder="e.g., 0 for Ground Floor" defaultValue={currentValues.floor ?? ''} required />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="type">Unit Type</Label>
                        <Select name="type" value={selectedUnitType} onValueChange={setSelectedUnitType}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                {unitTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="configuration">Configuration</Label>
                        <Select name="configuration" defaultValue={currentValues.configuration ?? undefined} disabled={filteredConfigurations.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Select configuration" /></SelectTrigger>
                            <SelectContent>
                                {filteredConfigurations.map(config => <SelectItem key={config.id} value={config.name}>{config.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        {isRented && <input type="hidden" name="status" value="Rented" />}
                        <Select name="status" defaultValue={currentValues.status} disabled={isRented}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                {isRented && (
                                    <SelectItem value="Rented">Rented</SelectItem>
                                )}
                                {unitStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {isRented && <p className="text-xs text-muted-foreground">Status cannot be changed for a rented unit. End the lease to make it available.</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price (AED)</Label>
                        <Input id="price" name="price" type="number" placeholder="100000" defaultValue={currentValues.price ?? ''} />
                    </div>
                </div>
                
                <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-grow">
                        <Label htmlFor="size">Size</Label>
                        <Input id="size" name="size" type="number" placeholder="800" defaultValue={currentValues.size ?? ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sizeUnit">Unit</Label>
                            <Select name="sizeUnit" defaultValue={currentValues.sizeUnit ?? 'sqft'}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {sizeUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" placeholder="Unit-specific account number" defaultValue={currentValues.accountNumber ?? ''} />
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="A brief description of the unit..." defaultValue={currentValues.description ?? ''} />
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
              <SubmitButton />
            </SheetFooter>
          </form>
      </SheetContent>
    </Sheet>
  );
}
