

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getOwners } from '@/lib/db';
import type { Employee, Owner } from '@/lib/types';
import { handleDeleteOwner } from '@/app/dashboard/actions';
import { AppHeader } from './layout/header';
import OwnerList from './owner-list';
import OwnerDialog from './owner-dialog';
import { useLanguage } from '@/contexts/language-context';

export default function OwnerManagementClient({
  initialOwners,
  loggedInEmployee
}: {
  initialOwners: Owner[],
  loggedInEmployee: Employee | null
}) {
  const { t } = useLanguage();
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const { toast } = useToast();

  const refreshOwners = async () => {
    console.log('Owner Management - Refreshing owners...');
    try {
      const updatedOwners = await getOwners();
      console.log('Owner Management - Fetched owners:', updatedOwners.length);
      setOwners(updatedOwners);
      console.log('Owner Management - State updated with new owners');
    } catch (error) {
      console.error('Owner Management - Error refreshing owners, keeping current state:', error);
      // Don't update state if refresh fails - keep current owners
    }
  }

  const handleAddNew = () => {
    setEditingOwner(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setIsDialogOpen(true);
  };

  const handleDelete = async (ownerId: string) => {
    const result = await handleDeleteOwner(ownerId);
    if (result.success) {
      toast({ title: t('owners.success'), description: result.message });
      await refreshOwners();
    } else {
      toast({ variant: 'destructive', title: t('owners.error'), description: result.message });
    }
  };

  const onSave = async (message: string, newOwner?: Owner) => {
      console.log('Owner Management - onSave called with message:', message, 'newOwner:', newOwner);
      
      // If we have a new owner object, add it to state immediately
      if (newOwner) {
        console.log('Owner Management - Adding new owner to local state:', newOwner);
        setOwners(prevOwners => [...prevOwners, newOwner]);
      } else {
        // For edit mode, try to refresh from database
        await refreshOwners();
      }
      
      console.log('Owner Management - Owners updated');
      toast({ title: t('owners.success'), description: message });
      console.log('Owner Management - Toast shown');
      setIsDialogOpen(false);
      console.log('Owner Management - Dialog closed');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />

      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="text-right">
              <CardTitle>{t('owners.title')}</CardTitle>
              <CardDescription>{t('owners.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2" />
                    {t('owners.addOwner')}
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OwnerList
              owners={owners}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      {isDialogOpen && (
        <OwnerDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          owner={editingOwner}
          onSave={onSave}
          loggedInEmployee={loggedInEmployee}
        />
      )}
    </div>
  );
}
