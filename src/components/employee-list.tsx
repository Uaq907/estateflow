
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">ID</TableHead>
              <TableHead className="hidden md:table-cell">Position</TableHead>
              <TableHead className="hidden lg:table-cell">Department</TableHead>
              <TableHead className="hidden sm:table-cell">Start Date</TableHead>
              {(onEdit || onDelete) && (
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarImage src={employee.profilePictureUrl ?? undefined} alt={employee.name} />
                         <AvatarFallback>
                           <User/>
                         </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{employee.position}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{employee.id}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{employee.position}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.department}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(new Date(employee.startDate), 'dd/MM/yyyy')}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(employee)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No employees found.
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
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record for{' '}
              <span className="font-semibold">{employeeToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
