
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building, LogOut, PlusCircle, LogIn, Home, Users, ArrowLeft, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logout, handleAddBank, handleUpdateBank, handleDeleteBank } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import { getBanks } from '@/lib/db';
import type { Employee, Bank as BankType } from '@/lib/types';
import BankList from './bank-list';
import BankDialog from './bank-dialog';
import { AppHeader } from './layout/header';

export default function BankManagementClient({
  initialBanks,
  loggedInEmployee
}: {
  initialBanks: BankType[],
  loggedInEmployee: Employee | null
}) {
  const [banks, setBanks] = useState<BankType[]>(initialBanks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankType | null>(null);
  const { toast } = useToast();

  const refreshBanks = async () => {
    const updatedBanks = await getBanks();
    setBanks(updatedBanks);
  }

  const handleAddNew = () => {
    setEditingBank(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (bank: BankType) => {
    setEditingBank(bank);
    setIsDialogOpen(true);
  };

  const handleDelete = async (bankId: string) => {
    const result = await handleDeleteBank(bankId);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshBanks();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const bankData = {
      name: formData.get('name') as string,
      branch: formData.get('branch') as string,
      accountNumber: formData.get('accountNumber') as string,
      notes: formData.get('notes') as string,
    };

    const result = editingBank
      ? await handleUpdateBank(editingBank.id, bankData)
      : await handleAddBank(bankData);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshBanks();
      setIsDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Manage Bank Accounts</CardTitle>
              <CardDescription>Add, edit, or remove company bank accounts for cheque creation.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/dashboard/cheques"><ArrowLeft className="mr-2"/>Back to Cheques</Link>
                </Button>
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2" />
                    Add Bank
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BankList
              banks={banks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      {isDialogOpen && (
        <BankDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          bank={editingBank}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
