
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, FileText, Wrench } from 'lucide-react';
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
import type { MaintenanceContract } from '@/lib/types';
import { format, differenceInDays, isPast } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

interface MaintenanceContractListProps {
  contracts: MaintenanceContract[];
  onEdit?: (contract: MaintenanceContract) => void;
  onDelete?: (contractId: string) => void;
}

export default function MaintenanceContractList({ contracts, onEdit, onDelete }: MaintenanceContractListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<MaintenanceContract | null>(null);

  const handleDeleteClick = (contract: MaintenanceContract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete && onDelete) {
      onDelete(contractToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setContractToDelete(null);
  };
  
  const getStatus = (contract: MaintenanceContract) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const endDate = new Date(contract.endDate);
    const daysLeft = differenceInDays(endDate, today);

    if (isPast(endDate)) {
        return <Badge variant="destructive">{t('maintenance.statusExpired')}</Badge>
    }
    if (daysLeft <= 90) {
        return <Badge variant="secondary">{t('maintenance.statusExpiringSoon')}</Badge>
    }
    return <Badge variant="default">{t('maintenance.statusActive')}</Badge>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('maintenance.serviceVendor')}</TableHead>
              <TableHead>{t('maintenance.property')}</TableHead>
              <TableHead>{t('maintenance.startDate')}</TableHead>
              <TableHead>{t('maintenance.endDate')}</TableHead>
              <TableHead>{t('maintenance.amount')}</TableHead>
              <TableHead>{t('maintenance.nextDueDate')}</TableHead>
              <TableHead>{t('maintenance.status')}</TableHead>
              <TableHead><span className="sr-only">{t('maintenance.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div className="font-medium">{contract.serviceType}</div>
                    <div className="text-sm text-muted-foreground">{contract.vendorName}</div>
                  </TableCell>
                  <TableCell>{contract.propertyName}</TableCell>
                  <TableCell>{format(new Date(contract.startDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(contract.endDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <div className="font-medium">AED {contract.contractAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    {contract.isVat && (
                        <div className="text-xs text-muted-foreground">
                        ({t('maintenance.base')}: {contract.baseAmount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} + {t('maintenance.vat')}: {contract.taxAmount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                        </div>
                    )}
                  </TableCell>
                  <TableCell>{contract.nextDueDate ? format(new Date(contract.nextDueDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                  <TableCell>{getStatus(contract)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && <DropdownMenuItem onClick={() => onEdit(contract)}><Edit className="mr-2 h-4 w-4" />{t('maintenance.edit')}</DropdownMenuItem>}
                        {contract.contractUrl && (
                             <DropdownMenuItem asChild>
                                <Link href={contract.contractUrl} target="_blank"><FileText className="mr-2 h-4 w-4" />{t('maintenance.viewDocument')}</Link>
                            </DropdownMenuItem>
                        )}
                        {onDelete && <DropdownMenuItem onClick={() => handleDeleteClick(contract)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('maintenance.delete')}</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('maintenance.noContractsFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('maintenance.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('maintenance.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('maintenance.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('maintenance.confirmDelete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
