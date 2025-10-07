

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Building, LandPlot, Home, Warehouse, Briefcase, User } from 'lucide-react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { Progress } from './ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from '@/contexts/language-context';


interface PropertyListProps {
  properties: (Property & { canViewDetails?: boolean })[];
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
}

const typeIconMap: Record<string, React.ReactNode> = {
    Building: <Building />,
    Land: <LandPlot />,
    Flat: <Home />,
    Villa: <Home />,
    Office: <Briefcase />,
    Warehouse: <Warehouse />,
};

export default function PropertyList({ properties, onEdit, onDelete }: PropertyListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const router = useRouter();

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete?.id && onDelete) {
      onDelete(propertyToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };
  
  const handleRowClick = (property: Property & { canViewDetails?: boolean }) => {
    console.log('Row clicked:', property.id, 'canViewDetails:', property.canViewDetails);
    if (property.canViewDetails) {
        console.log('Navigating to:', `/dashboard/properties/${property.id}`);
        router.push(`/dashboard/properties/${property.id}`);
    } else {
        console.log('Cannot view details for property:', property.id);
    }
  };

  const canDelete = (property: Property): boolean => {
    return !property.occupiedUnits || property.occupiedUnits === 0;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{t('propertyList.name')}</TableHead>
              <TableHead className="hidden md:table-cell text-right">{t('propertyList.type')}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{t('propertyList.address')}</TableHead>
              <TableHead className="hidden sm:table-cell text-right">{t('propertyList.status')}</TableHead>
              <TableHead className="hidden md:table-cell text-right">{t('propertyList.occupancy')}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{t('propertyList.price')}</TableHead>
              {(onEdit || onDelete) && (
                <TableHead>
                  <span className="sr-only">{t('propertyList.actions')}</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length > 0 ? (
              properties.map((property) => {
                const occupancyRate = property.totalUnits ? ((property.occupiedUnits ?? 0) / property.totalUnits) * 100 : 0;
                const isDeletable = canDelete(property);
                const rowIsClickable = property.canViewDetails ?? false;

                return (
                <TableRow key={property.id} onClick={() => handleRowClick(property)} className={rowIsClickable ? "cursor-pointer" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarImage src={property.imageUrl ?? undefined} alt={property.name} />
                         <AvatarFallback>
                           {typeIconMap[property.type] || <Building />}
                         </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium ${rowIsClickable ? 'hover:underline' : ''}`}>{property.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {property.id}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{property.type} - {property.purpose}</div>
                         {property.ownerName && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="h-3 w-3"/> {property.ownerName}
                            </div>
                         )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{property.type}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{property.address}</TableCell>
                  <TableCell className="hidden sm:table-cell">{property.status}</TableCell>
                   <TableCell className="hidden md:table-cell">
                     {property.totalUnits !== null && property.totalUnits! > 0 ? (
                        <div className="w-32">
                          <p className="text-xs text-muted-foreground text-right">
                            {t('propertyList.occupied')}: {property.occupiedUnits} / {property.totalUnits}
                          </p>
                          <Progress value={occupancyRate} className="h-2 mt-1" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('propertyList.noUnits')}</span>
                      )}
                   </TableCell>
                   <TableCell className="hidden lg:table-cell">
                    {property.price ? `AED ${property.price.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('propertyList.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(property)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>{t('propertyList.edit')}</span>
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <DropdownMenuItem 
                                                onSelect={(e) => e.preventDefault()}
                                                onClick={() => handleDeleteClick(property)} 
                                                className={!isDeletable ? "text-muted-foreground focus:text-muted-foreground" : "text-destructive focus:text-destructive"}
                                                disabled={!isDeletable}
                                            >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>{t('propertyList.delete')}</span>
                                            </DropdownMenuItem>
                                        </div>
                                    </TooltipTrigger>
                                    {!isDeletable && (
                                        <TooltipContent>
                                            <p>{t('propertyList.cannotDeleteOccupied')}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t('propertyList.noPropertiesFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('propertyList.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {t('propertyList.deleteDescription')}{' '}
              <span className="font-semibold">{propertyToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t('propertyList.confirmDelete')}
            </AlertDialogAction>
            <AlertDialogCancel>{t('propertyList.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
