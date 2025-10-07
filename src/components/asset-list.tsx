
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, FileText, ChevronDown, Calendar, DollarSign, Hash, MapPin, FileEdit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import type { Asset } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import React from 'react';
import { useLanguage } from '@/contexts/language-context';

interface AssetListProps {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
}

export default function AssetList({ assets, onEdit, onDelete }: AssetListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete && onDelete) {
      onDelete(assetToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'In Service': return 'default';
      case 'Under Repair': return 'secondary';
      case 'In Storage': return 'outline';
      case 'Decommissioned': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getWarrantyBadge = (date: Date | null | undefined) => {
    if (!date) return null;
    const today = new Date();
    const expiry = new Date(date);
    const daysLeft = differenceInDays(expiry, today);

    if (daysLeft < 0) {
        return <Badge variant="destructive">{t('assets.statusExpired')}</Badge>
    }
    if (daysLeft <= 30) {
        return <Badge variant="secondary">{t('assets.statusExpiresIn')} {daysLeft} {t('assets.statusDays')}</Badge>
    }
    return <Badge variant="outline">{t('assets.statusActive')}</Badge>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('assets.asset')}</TableHead>
              <TableHead>{t('assets.id')}</TableHead>
              <TableHead>{t('assets.location')}</TableHead>
              <TableHead>{t('assets.category')}</TableHead>
              <TableHead>{t('assets.status')}</TableHead>
              <TableHead>{t('assets.warranty')}</TableHead>
              <TableHead><span className="sr-only">{t('assets.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          
            {assets.length > 0 ? (
              assets.map((asset) => (
                <Collapsible asChild key={asset.id}>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                        <span className="sr-only">{t('assets.toggleDetails')}</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-sm text-muted-foreground">{asset.manufacturer} {asset.modelNumber}</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{asset.id}</TableCell>
                            <TableCell>
                                <div>{asset.propertyName}</div>
                                {asset.unitNumber && <div className="text-sm text-muted-foreground">{t('assets.unit')}: {asset.unitNumber}</div>}
                            </TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(asset.status)}>{asset.status}</Badge>
                            </TableCell>
                            <TableCell>
                                {getWarrantyBadge(asset.warrantyExpiryDate)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onEdit && <DropdownMenuItem onClick={() => onEdit(asset)}><Edit className="mr-2 h-4 w-4" />{t('assets.edit')}</DropdownMenuItem>}
                                    {asset.invoiceUrl && (
                                        <DropdownMenuItem asChild>
                                            <Link href={asset.invoiceUrl} target="_blank"><FileText className="mr-2 h-4 w-4" />{t('assets.viewInvoice')}</Link>
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && <DropdownMenuItem onClick={() => handleDeleteClick(asset)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('assets.delete')}</DropdownMenuItem>}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                           <tr className="bg-muted/50 hover:bg-muted">
                            <TableCell colSpan={8} className="p-0">
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4"/> {t('assets.purchaseDetails')}</h4>
                                        <p><strong>{t('assets.date')}:</strong> {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                        <p><strong>{t('assets.price')}:</strong> AED {asset.purchasePrice?.toLocaleString() ?? 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/> {t('assets.warranty')}</h4>
                                        <p><strong>{t('assets.expiresOn')}:</strong> {asset.warrantyExpiryDate ? format(new Date(asset.warrantyExpiryDate), 'dd/MM/yyyy') : 'N/A'}</p>
                                    </div>
                                     <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4"/> {t('assets.identification')}</h4>
                                        <p><strong>{t('assets.serialNumber')}:</strong> {asset.serialNumber || 'N/A'}</p>
                                        <p><strong>{t('assets.model')}:</strong> {asset.modelNumber || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4"/> {t('assets.locationDetails')}</h4>
                                        <p>{asset.locationInProperty || t('assets.noSpecificLocation')}</p>
                                    </div>
                                    <div className="space-y-2 col-span-1 lg:col-span-2">
                                        <h4 className="font-semibold flex items-center gap-2"><FileEdit className="h-4 w-4"/> {t('assets.notes')}</h4>
                                        <p className="text-muted-foreground">{asset.notes || t('assets.noNotes')}</p>
                                    </div>
                                </div>
                            </TableCell>
                           </tr>
                        </CollapsibleContent>
                    </TableBody>
                </Collapsible>
              ))
            ) : (
             <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('assets.noAssetsFound')}
                </TableCell>
              </TableRow>
             </TableBody>
            )}
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('assets.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('assets.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('assets.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('assets.confirmDelete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
