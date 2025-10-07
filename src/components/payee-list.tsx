
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import type { Payee } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';

interface PayeeListProps {
  payees: Payee[];
  onEdit: (payee: Payee) => void;
  onDelete: (payeeId: string) => void;
}

export default function PayeeList({ payees, onEdit, onDelete }: PayeeListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [payeeToDelete, setPayeeToDelete] = useState<Payee | null>(null);

  const handleDeleteClick = (payee: Payee) => {
    setPayeeToDelete(payee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (payeeToDelete) {
      onDelete(payeeToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setPayeeToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{t('payeeList.name')}</TableHead>
              <TableHead className="text-right">{t('payeeList.id')}</TableHead>
              <TableHead className="text-right">{t('payeeList.contactPerson')}</TableHead>
              <TableHead className="text-right">{t('payeeList.contactEmail')}</TableHead>
              <TableHead><span className="sr-only">{t('payeeList.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payees.length > 0 ? (
              payees.map((payee) => (
                <TableRow key={payee.id}>
                  <TableCell className="font-medium">{payee.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{payee.id}</TableCell>
                  <TableCell>{payee.contactPerson || 'N/A'}</TableCell>
                  <TableCell>{payee.contactEmail || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(payee)}><Edit className="mr-2 h-4 w-4" />{t('payeeList.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(payee)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('payeeList.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('payeeList.noPayees')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('payeeList.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">{t('payeeList.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('payeeList.confirmDelete')}</AlertDialogAction>
            <AlertDialogCancel>{t('payeeList.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
