
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, User, FileText } from 'lucide-react';
import Link from 'next/link';
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
import type { Tenant } from '@/lib/types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';


interface TenantListProps {
  tenants: Tenant[];
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenantId: string) => void;
}

export default function TenantList({ tenants, onEdit, onDelete }: TenantListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const router = useRouter();

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tenantToDelete?.id && onDelete) {
      onDelete(tenantToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setTenantToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border" dir="rtl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{t('tenants.name')}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{t('tenants.id')}</TableHead>
              <TableHead className="hidden md:table-cell text-right">{t('tenants.phone')}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{t('tenants.idNumber')}</TableHead>
              <TableHead className="hidden sm:table-cell text-right">{t('tenants.nationality')}</TableHead>
              <TableHead className="text-right">{t('tenants.document')}</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">
                  <span className="sr-only">{t('tenants.actions')}</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length > 0 ? (
              tenants.map((tenant) => (
                <TableRow key={tenant.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarFallback>
                           <User/>
                         </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <div className="font-medium hover:underline">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">{tenant.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground text-right">{tenant.id}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    {tenant.phone || 'N/A'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    {tenant.idNumber ? `${tenant.idNumber} (${tenant.idType})` : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {tenant.nationality || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {tenant.idDocumentUrl ? (
                        <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Link href={tenant.idDocumentUrl} target="_blank">
                                {t('tenants.view')} <FileText className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">{t('tenants.noDocument')}</span>
                    )}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('tenants.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(tenant)}>
                              <span>{t('tenants.edit')}</span>
                              <Edit className="ml-2 h-4 w-4" />
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(tenant)} className="text-destructive focus:text-destructive">
                              <span>{t('tenants.delete')}</span>
                              <Trash2 className="ml-2 h-4 w-4" />
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-right">
                  {t('tenants.noTenantsFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tenants.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tenants.deleteDescription')}{' '}
              <span className="font-semibold">{tenantToDelete?.name}</span> {t('tenants.deleteDescriptionNote')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('tenants.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t('tenants.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
