

'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, UserPlus, UserX, FileText, AlertCircle } from 'lucide-react';
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
  DropdownMenuSeparator,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Unit } from '@/lib/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

interface UnitListProps {
  units: Unit[];
  propertyType: string;
  onEdit?: (unit: Unit) => void;
  onDelete?: (unitId: string) => void;
  onAssignTenant?: (unit: Unit) => void;
}

export default function UnitList({ units, propertyType, onEdit, onDelete, onAssignTenant }: UnitListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const router = useRouter();

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (unitToDelete?.id && onDelete) {
      onDelete(unitToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  const getStatusVariant = (status: string, contractUrl?: string | null) => {
    if (status === 'Rented' || status === 'مشغول') return contractUrl ? 'default' : 'destructive';
    if (status === 'Available' || status === 'متاح') return 'secondary';
    return 'destructive';
  }

  const handleViewLease = (leaseId: string) => {
    router.push(`/dashboard/leases/${leaseId}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('unitList.unit')}</TableHead>
              <TableHead>{t('unitList.accountNo')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('unitList.type')}</TableHead>
              <TableHead>{t('unitList.status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('unitList.occupant')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('unitList.leaseEnd')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('unitList.price')}</TableHead>
              {(onEdit || onDelete) && (
                <TableHead>
                  <span className="sr-only">{t('unitList.actions')}</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div className="font-medium">{unit.unitNumber}</div>
                    {unit.floor !== null && unit.floor !== undefined && (
                        <div className="text-sm text-muted-foreground">{t('unitList.floor')}: {unit.floor === 0 ? t('unitList.ground') : unit.floor}</div>
                    )}
                    <div className="text-xs text-muted-foreground">ID: {unit.id}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{unit.accountNumber || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{unit.type}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={getStatusVariant(unit.status, unit.contractUrl)}>{unit.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        {unit.activeLeaseId ? (
                           <div className="flex flex-col">
                            <Link href={`/dashboard/leases/${unit.activeLeaseId}`} className="hover:underline font-medium">
                                {unit.type === 'Commercial' ? unit.businessName : unit.tenantName}
                            </Link>
                            {unit.type !== 'Commercial' && unit.businessName && <span className="text-xs text-muted-foreground">{unit.businessName}</span>}
                           </div>
                        ) : (
                            <span>N/A</span>
                        )}
                        {unit.hasPendingExtension && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('unitList.pendingExtension')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {unit.nextPaymentDueDate && (
                        <div className="text-xs text-muted-foreground">
                            {t('unitList.nextPayment')}: {format(new Date(unit.nextPaymentDueDate), 'dd/MM/yyyy')}
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{unit.leaseEndDate ? format(new Date(unit.leaseEndDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{unit.price?.toLocaleString() ?? 'N/A'}</TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('unitList.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {onAssignTenant && (unit.status === 'Available' || unit.status === 'متاح') && (
                                <DropdownMenuItem onClick={() => onAssignTenant(unit)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    <span>{t('unitList.assignTenant')}</span>
                                </DropdownMenuItem>
                           )}
                           {(unit.status === 'Rented' || unit.status === 'مشغول') && unit.activeLeaseId && (
                            <>
                                <DropdownMenuItem onClick={() => handleViewLease(unit.activeLeaseId!)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{t('unitList.viewLease')}</span>
                                </DropdownMenuItem>
                            </>
                           )}
                           <DropdownMenuSeparator />
                           {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(unit)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>{t('unitList.editUnit')}</span>
                            </DropdownMenuItem>
                           )}
                           {onDelete && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(unit)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>{t('unitList.deleteUnit')}</span>
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
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('unitList.noUnits')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unitList.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('unitList.deleteDescription')} <span className="font-semibold">{unitToDelete?.unitNumber}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('unitList.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t('unitList.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
