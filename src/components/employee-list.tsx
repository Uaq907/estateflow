
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, User } from 'lucide-react';
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
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface EmployeeListProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete?.id && onDelete) {
      onDelete(employeeToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border" dir="rtl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="hidden lg:table-cell text-right">المعرف</TableHead>
              <TableHead className="hidden md:table-cell text-right">المنصب</TableHead>
              <TableHead className="hidden lg:table-cell text-right">القسم</TableHead>
              <TableHead className="hidden sm:table-cell text-right">تاريخ البدء</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">
                  <span className="sr-only">إجراءات</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarImage src={employee.profilePictureUrl ?? undefined} alt={employee.name} />
                         <AvatarFallback>
                           <User/>
                         </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{employee.position}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground text-right">{employee.id}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <Badge variant="secondary">{employee.position}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">{employee.department}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {format(new Date(employee.startDate), 'dd/MM/yyyy')}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(employee)}>
                              <span>تعديل</span>
                              <Edit className="ml-2 h-4 w-4" />
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(employee)} className="text-destructive focus:text-destructive">
                              <span>حذف</span>
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
                <TableCell colSpan={6} className="h-24 text-right">
                  لا يوجد موظفون.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف سجل الموظف{' '}
              <span className="font-semibold">{employeeToDelete?.name}</span> بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
