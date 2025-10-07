
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, FileText, ChevronDown, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
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
import type { Cheque, ChequeTransaction } from '@/lib/types';
import { format, isPast } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';
import { useLanguage } from '@/contexts/language-context';

interface ChequeListProps {
  cheques: Cheque[];
  onEdit?: (cheque: Cheque) => void;
  onDelete?: (chequeId: string) => void;
  onAddTransaction: (cheque: Cheque) => void;
  onEditTransaction: (transaction: ChequeTransaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export default function ChequeList({ cheques, onEdit, onDelete, onAddTransaction, onEditTransaction, onDeleteTransaction }: ChequeListProps) {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chequeToDelete, setChequeToDelete] = useState<Cheque | null>(null);
  const [isDeleteTransactionDialogOpen, setIsDeleteTransactionDialogOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (cheque: Cheque) => {
    setChequeToDelete(cheque);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (chequeToDelete && onDelete) {
      onDelete(chequeToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setChequeToDelete(null);
  };
  
  const confirmDeleteTransaction = () => {
    if (transactionToDeleteId && onDeleteTransaction) {
        onDeleteTransaction(transactionToDeleteId);
    }
    setIsDeleteTransactionDialogOpen(false);
    setTransactionToDeleteId(null);
  }

  const getStatusBadge = (cheque: Cheque) => {
    if (cheque.status === 'Pending' && cheque.dueDate && isPast(new Date(cheque.dueDate))) {
        return <Badge variant="destructive">{t('chequeList.overdue')}</Badge>;
    }

    let variant: "default" | "secondary" | "destructive" | "outline" = 'outline';
    let statusText = '';
    
    switch (cheque.status) {
      case 'Cleared': 
        variant = 'default';
        statusText = t('chequeStatus.cleared');
        break;
      case 'Partially Paid':
        variant = 'secondary';
        statusText = t('chequeStatus.partiallyPaid');
        break;
      case 'Submitted':
        variant = 'secondary';
        statusText = t('chequeStatus.submitted');
        break;
      case 'Pending':
        variant = 'outline';
        statusText = t('chequeStatus.pending');
        break;
      case 'Bounced':
        variant = 'destructive';
        statusText = t('chequeStatus.bounced');
        break;
      case 'Cancelled':
        variant = 'outline';
        statusText = t('chequeStatus.cancelled');
        break;
      default:
        statusText = cheque.status;
    }
    return <Badge variant={variant}>{statusText}</Badge>;
  };
  
  const getPayeeName = (cheque: Cheque) => {
      if (cheque.payeeType === 'manual') return cheque.manualPayeeName;
      if (cheque.payeeType === 'saved') return cheque.savedPayeeName;
      if (cheque.payeeType === 'tenant') return cheque.tenantName;
      return 'N/A';
  }
  
  const { totalAmount, totalPaid } = useMemo(() => {
    return cheques.reduce(
      (acc, cheque) => {
        acc.totalAmount += cheque.amount;
        acc.totalPaid += cheque.totalPaidAmount ?? 0;
        return acc;
      },
      { totalAmount: 0, totalPaid: 0 }
    );
  }, [cheques]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-right">{t('chequeList.dueDate')}</TableHead>
              <TableHead className="text-right">{t('chequeList.payee')}</TableHead>
              <TableHead className="text-right">{t('chequeList.chequeNumber')}</TableHead>
              <TableHead className="text-right">{t('chequeList.amount')}</TableHead>
              <TableHead className="text-right">{t('chequeList.paid')}</TableHead>
              <TableHead className="text-right">{t('chequeList.status')}</TableHead>
              <TableHead className="text-right">{t('chequeList.createdBy')}</TableHead>
              <TableHead><span className="sr-only">{t('chequeList.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          
            {cheques.length > 0 ? (
              cheques.map((cheque) => {
                const progress = cheque.amount > 0 ? ((cheque.totalPaidAmount ?? 0) / cheque.amount) * 100 : 0;
                const balance = cheque.amount - (cheque.totalPaidAmount ?? 0);
                return (
                <Collapsible asChild key={cheque.id}>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                        <span className="sr-only">{t('chequeList.toggleDetails')}</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>
                                <div>{cheque.dueDate ? format(new Date(cheque.dueDate), 'dd/MM/yyyy') : 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{cheque.id}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{getPayeeName(cheque)}</div>
                                <div className="text-sm text-muted-foreground capitalize">{cheque.payeeType}</div>
                            </TableCell>
                            <TableCell>{cheque.chequeNumber || 'N/A'}</TableCell>
                            <TableCell>
                                <div>AED {cheque.amount.toLocaleString()}</div>
                                {balance > 0 && balance < cheque.amount && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('chequeList.balance')}: AED {balance.toLocaleString()}
                                  </div>
                                )}
                            </TableCell>
                            <TableCell>AED {(cheque.totalPaidAmount ?? 0).toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(cheque)}</TableCell>
                            <TableCell>
                                <div className="font-medium">{cheque.createdByName || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{format(new Date(cheque.createdAt), 'dd/MM/yyyy')}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onEdit && <DropdownMenuItem onClick={() => onEdit(cheque)}><Edit className="mr-2 h-4 w-4" />{t('chequeList.edit')}</DropdownMenuItem>}
                                    {cheque.chequeImageUrl && (
                                    <DropdownMenuItem asChild>
                                        <Link href={cheque.chequeImageUrl} target="_blank"><FileText className="mr-2 h-4 w-4" />{t('chequeList.viewImage')}</Link>
                                    </DropdownMenuItem>
                                    )}
                                    {onDelete && <DropdownMenuItem onClick={() => handleDeleteClick(cheque)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('chequeList.delete')}</DropdownMenuItem>}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                           <tr className="bg-muted/50 hover:bg-muted">
                            <TableCell colSpan={9} className="p-0">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-right">{t('chequeList.paymentProgress')}</h4>
                                        <Progress value={progress} className="h-2"/>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold">{t('chequeList.recordedTransactions')}</h4>
                                        <Button size="sm" variant="outline" onClick={() => onAddTransaction(cheque)}><PlusCircle className="mr-2"/>{t('chequeList.addTransaction')}</Button>
                                    </div>
                                    {cheque.transactions && cheque.transactions.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-right">{t('chequeList.datePaid')}</TableHead>
                                                  <TableHead className="text-right">{t('chequeList.amount')}</TableHead>
                                                  <TableHead className="text-right">{t('chequeList.method')}</TableHead>
                                                  <TableHead className="text-right">{t('chequeList.notes')}</TableHead>
                                                  <TableHead className="text-right">{t('chequeList.document')}</TableHead>
                                                  <TableHead><span className="sr-only">{t('chequeList.actions')}</span></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {cheque.transactions.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell>{format(new Date(tx.paymentDate), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>AED {tx.amountPaid.toLocaleString()}</TableCell>
                                                    <TableCell>{tx.paymentMethod}</TableCell>
                                                    <TableCell>{tx.notes}</TableCell>
                                                    <TableCell>
                                                        {tx.documentUrl && (
                                                            <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                                                <Link href={tx.documentUrl} target="_blank"><FileText className="mr-1 h-3 w-3" />{t('chequeList.view')}</Link>
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => onEditTransaction(tx)}><Edit className="mr-2 h-4 w-4"/>{t('chequeList.edit')}</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => { setTransactionToDeleteId(tx.id); setIsDeleteTransactionDialogOpen(true); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>{t('chequeList.delete')}</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    ) : <p className="text-sm text-center text-muted-foreground py-4">{t('chequeList.noTransactions')}</p>}
                                </div>
                            </TableCell>
                           </tr>
                        </CollapsibleContent>
                    </TableBody>
                </Collapsible>
              )})
            ) : (
             <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {t('chequeList.noChequesFound')}
                </TableCell>
              </TableRow>
             </TableBody>
            )}
             <TableFooter>
                <TableRow>
                    <TableCell colSpan={4} className="font-bold text-right">{t('chequeList.totals').replace('{count}', cheques.length.toString())}</TableCell>
                    <TableCell className="font-bold">AED {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-bold">AED {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell colSpan={3}></TableCell>
                </TableRow>
            </TableFooter>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('chequeList.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">{t('chequeList.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('chequeList.confirmDelete')}</AlertDialogAction>
            <AlertDialogCancel>{t('chequeList.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteTransactionDialogOpen} onOpenChange={setIsDeleteTransactionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-right">{t('chequeList.deleteTransactionTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">{t('chequeList.deleteTransactionDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse">
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-destructive hover:bg-destructive/90">{t('chequeList.confirmDelete')}</AlertDialogAction>
            <AlertDialogCancel>{t('chequeList.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
