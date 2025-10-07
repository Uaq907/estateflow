
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Employee, UnitConfiguration } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { handleAddUnitConfiguration, handleUpdateUnitConfiguration, handleDeleteUnitConfiguration } from '@/app/dashboard/actions';
import { getUnitConfigurations } from '@/lib/db';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

const unitTypeOptions: string[] = ['Residential', 'Commercial', 'Office', 'Retail'];

export default function UnitConfigurationClient({
  initialConfigurations,
  loggedInEmployee
}: {
  initialConfigurations: UnitConfiguration[];
  loggedInEmployee: Employee | null;
}) {
  const { t } = useLanguage();
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<UnitConfiguration | null>(null);
  const [configToDelete, setConfigToDelete] = useState<UnitConfiguration | null>(null);
  const { toast } = useToast();

  const refreshConfigs = async () => {
    const updatedConfigs = await getUnitConfigurations();
    setConfigurations(updatedConfigs);
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (config: UnitConfiguration) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleDelete = (config: UnitConfiguration) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!configToDelete) return;
    const result = await handleDeleteUnitConfiguration(configToDelete.id);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshConfigs();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    const configData = { name, type };

    const result = editingConfig
      ? await handleUpdateUnitConfiguration(editingConfig.id, configData)
      : await handleAddUnitConfiguration(configData);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      await refreshConfigs();
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
              <CardTitle>{t('unitConfig.title')}</CardTitle>
              <CardDescription>{t('unitConfig.description')}</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2" />
              {t('unitConfig.addConfiguration')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('unitConfig.configurationName')}</TableHead>
                            <TableHead>{t('unitConfig.unitType')}</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead><span className="sr-only">{t('unitConfig.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {configurations.length > 0 ? (
                            configurations.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell className="font-medium">{config.name}</TableCell>
                                    <TableCell>{config.type}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{config.id}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(config)}><Edit className="mr-2 h-4 w-4" />{t('unitConfig.edit')}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(config)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('unitConfig.delete')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No configurations found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingConfig ? t('unitConfig.edit') : t('unitConfig.addConfiguration')}</DialogTitle>
              <DialogDescription>{t('unitConfig.description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('unitConfig.configurationName')}</Label>
                <Input id="name" name="name" defaultValue={editingConfig?.name ?? ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('unitConfig.unitType')}</Label>
                <Select name="type" defaultValue={editingConfig?.type ?? undefined} required>
                    <SelectTrigger><SelectValue placeholder="Select a unit type" /></SelectTrigger>
                    <SelectContent>
                        {unitTypeOptions.map(type => <SelectItem key={type} value={type}>{t(`unitConfig.${type.toLowerCase()}` as any)}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('unitConfig.cancel')}</Button>
              <Button type="submit">{t('unitConfig.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unitConfig.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('unitConfig.deleteMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('unitConfig.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('unitConfig.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
