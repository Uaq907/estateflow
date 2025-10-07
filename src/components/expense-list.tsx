
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Eye, Trash2, FileWarning, CheckCircle, HelpCircle, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Employee, Expense } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';
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
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';

interface ExpenseListProps {
  expenses: Expense[];
  loggedInEmployee: Employee | null;
  onAction: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function ClientFormattedDate({ date }: { date: Date }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        setFormattedDate(format(new Date(date), 'dd/MM/yyyy'));
    }, [date]);

    if (!formattedDate) {
        return <Skeleton className="h-4 w-20" />;
    }

    return <>{formattedDate}</>;
}


export default function ExpenseList({ expenses, loggedInEmployee, onAction, onDelete }: ExpenseListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      onDelete(expenseToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const getStatusBadgeVariant = (status: Expense['status']) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
      case 'Needs Correction':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const canDelete = hasPermission(loggedInEmployee, 'expenses:delete');

  const getActionDetails = (expense: Expense): { label: string; icon: React.ReactNode, isPrimary: boolean } => {
    const isOwner = loggedInEmployee?.id === expense.employeeId;
    const canApprove = hasPermission(loggedInEmployee, 'expenses:approve');

    if (canApprove && expense.status === 'Pending') {
        return { label: 'Review', icon: <FileWarning className="mr-2 h-4 w-4" />, isPrimary: true };
    }
    if (isOwner && expense.status === 'Needs Correction') {
        return { label: 'Correct', icon: <Edit className="mr-2 h-4 w-4" />, isPrimary: true };
    }
    if (isOwner && expense.status === 'Pending') {
        return { label: 'Edit', icon: <Edit className="mr-2 h-4 w-4" />, isPrimary: false };
    }
    // For Approved or Rejected statuses, the only action is to View.
    return { label: 'View', icon: <Eye className="mr-2 h-4 w-4" />, isPrimary: false };
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property / Unit</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => {
                const actionDetails = getActionDetails(expense);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div>{expense.propertyName}</div>
                      <div className="text-xs text-muted-foreground">ID: {expense.propertyId}</div>
                      {expense.unitNumber && (
                        <div className="mt-1">
                            <span className="text-muted-foreground text-sm block">Unit: {expense.unitNumber}</span>
                            <span className="text-xs text-muted-foreground">ID: {expense.unitId}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{expense.employeeName}</div>
                      <div className="text-xs text-muted-foreground">
                        <ClientFormattedDate date={expense.createdAt} />
                      </div>
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                          <span>AED {expense.amount.toLocaleString()}</span>
                          {expense.taxNumber && 
                            <div className="text-xs text-muted-foreground mt-1">
                              TRN: {expense.taxNumber}
                            </div>
                          }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusBadgeVariant(expense.status)}>{expense.status}</Badge>
                        {expense.managerName && (
                          <span className="text-xs text-muted-foreground">by {expense.managerName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                        {expense.receiptUrl ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={expense.receiptUrl} target="_blank">
                                    <FileText className="mr-2 h-4 w-4" /> View
                                </Link>
                            </Button>
                        ) : (
                           <span className="text-xs text-muted-foreground">Not uploaded</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {actionDetails.isPrimary ? (
                        <Button variant="outline" size="sm" onClick={() => onAction(expense)}>
                          {actionDetails.icon}
                          {actionDetails.label}
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onAction(expense)}>
                                    {actionDetails.icon}
                                    <span>{actionDetails.label}</span>
                                </DropdownMenuItem>
                            {canDelete && (
                              <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the expense record.</AlertDialogDescription>
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
