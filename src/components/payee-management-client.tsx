
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building, LogOut, PlusCircle, LogIn, Home, Users, ChevronDown, LandPlot, UserSquare, Receipt, Wrench, Package, ArrowLeft, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout, handleAddPayee, handleUpdatePayee, handleDeletePayee } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getPayees } from '@/lib/db';
import type { Employee, Payee } from '@/lib/types';
import PayeeList from './payee-list';
import PayeeDialog from './payee-dialog';
import { AppHeader } from './layout/header';
import { useLanguage } from '@/contexts/language-context';

export default function PayeeManagementClient({
  initialPayees,
  loggedInEmployee
}: {
  initialPayees: Payee[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const [payees, setPayees] = useState<Payee[]>(initialPayees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
  const { toast } = useToast();

  const refreshPayees = async () => {
    const updatedPayees = await getPayees();
    setPayees(updatedPayees);
  }

  const handleAddNew = () => {
    setEditingPayee(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (payee: Payee) => {
    setEditingPayee(payee);
    setIsDialogOpen(true);
  };

  const handleDelete = async (payeeId: string) => {
    const result = await handleDeletePayee(payeeId);
    if (result.success) {
      toast({ title: t('payees.success'), description: result.message });
      await refreshPayees();
    } else {
      toast({ variant: 'destructive', title: t('payees.error'), description: result.message });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const payeeData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      contactEmail: formData.get('contactEmail') as string,
      notes: formData.get('notes') as string,
    };

    const result = editingPayee
      ? await handleUpdatePayee(editingPayee.id, payeeData)
      : await handleAddPayee(payeeData);

    if (result.success) {
      toast({ title: t('payees.success'), description: result.message });
      await refreshPayees();
      setIsDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: t('payees.error'), description: result.message });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-right">
              <CardTitle>{t('payees.title')}</CardTitle>
              <CardDescription>{t('payees.description')}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/dashboard/cheques"><ArrowLeft className="mr-2"/>{t('payees.backToCheques')}</Link>
                </Button>
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2" />
                    {t('payees.addPayee')}
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PayeeList
              payees={payees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      {isDialogOpen && (
        <PayeeDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          payee={editingPayee}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
