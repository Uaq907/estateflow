
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Copy, FileText } from 'lucide-react';
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
import type { Owner } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';


interface OwnerListProps {
  owners: Owner[];
  onEdit: (owner: Owner) => void;
  onDelete: (ownerId: string) => void;
}

export default function OwnerList({ owners, onEdit, onDelete }: OwnerListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (owner: Owner) => {
    setOwnerToDelete(owner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ownerToDelete) {
      onDelete(ownerToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setOwnerToDelete(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('owners.copied'),
      description: t('owners.copiedDescription'),
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{t('owners.ownerName')}</TableHead>
              <TableHead className="text-right">{t('owners.id')}</TableHead>
              <TableHead className="text-right">{t('owners.contact')}</TableHead>
              <TableHead className="text-right">{t('owners.email')}</TableHead>
              <TableHead className="text-right">{t('owners.taxNumber')}</TableHead>
              <TableHead><span className="sr-only">{t('owners.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.length > 0 ? (
              owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                     <div className="flex items-center gap-2">
                      <span className="truncate max-w-[100px]">{owner.id}</span>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(owner.id)}>
                                    <Copy className="h-3 w-3"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('owners.copyId')}</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{owner.contact || 'N/A'}</TableCell>
                  <TableCell>{owner.email || 'N/A'}</TableCell>
                  <TableCell>{owner.taxNumber || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(owner)}><Edit className="mr-2 h-4 w-4" />{t('owners.edit')}</DropdownMenuItem>
                        {owner.emiratesIdUrl && (
                             <DropdownMenuItem asChild>
                                <Link href={owner.emiratesIdUrl} target="_blank"><FileText className="mr-2 h-4 w-4" />{t('owners.viewEmiratesId')}</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteClick(owner)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('owners.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t('owners.noOwnersFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('owners.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">{t('owners.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('owners.confirmDelete')}</AlertDialogAction>
            <AlertDialogCancel>{t('owners.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
