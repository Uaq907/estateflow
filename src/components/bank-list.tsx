
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
import type { Bank } from '@/lib/types';

interface BankListProps {
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (bankId: string) => void;
}

export default function BankList({ banks, onEdit, onDelete }: BankListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  const handleDeleteClick = (bank: Bank) => {
    setBankToDelete(bank);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bankToDelete) {
      onDelete(bankToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setBankToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks.length > 0 ? (
              banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell className="font-medium">{bank.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bank.id}</TableCell>
                  <TableCell>{bank.branch || 'N/A'}</TableCell>
                  <TableCell>{bank.accountNumber || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(bank)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(bank)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No saved banks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the bank account record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
