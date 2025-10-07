
'use client';

import type { Employee, Property } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PropertyList from '@/components/property-list';
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface DashboardHomeClientProps {
    loggedInEmployee: Employee;
    assignedProperties: (Property & { canViewDetails?: boolean })[];
    canViewAllProperties: boolean;
}

export default function DashboardHomeClient({
    loggedInEmployee,
    assignedProperties,
    canViewAllProperties,
}: DashboardHomeClientProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
        <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20">
                <AvatarImage src={loggedInEmployee.profilePictureUrl ?? undefined} />
                <AvatarFallback>
                    <User className="h-10 w-10" />
                </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {t('dashboard.welcomeBack')}, {loggedInEmployee.name}!
                </h2>
                <p className="text-muted-foreground">
                    {t('dashboard.propertiesDescription')}
                </p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.yourProperties')}</CardTitle>
                <CardDescription>
                    {canViewAllProperties 
                        ? t('dashboard.allPropertiesAccess')
                        : t('dashboard.assignedProperties')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PropertyList properties={assignedProperties} />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
