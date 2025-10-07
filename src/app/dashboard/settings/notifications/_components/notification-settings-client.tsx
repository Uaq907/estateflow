

'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Employee, NotificationPreferences } from '@/lib/types';
import { handleUpdateEmployee } from '@/app/dashboard/actions';
import { Bot, Send } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { sendTestTelegramMessage } from '@/app/dashboard/actions';
import { useLanguage } from '@/contexts/language-context';
import { Input } from '@/components/ui/input';

const notificationTypes: { key: keyof NotificationPreferences, label: string, description: string }[] = [
    { key: 'new_expense_submitted', label: 'New Expense Submitted', description: 'When any employee submits a new expense for approval.' },
    { key: 'expense_approved', label: 'Expense Approved', description: 'When your expense request is approved by a manager.' },
    { key: 'expense_rejected', label: 'Expense Rejected', description: 'When your expense request is rejected.' },
    { key: 'lease_expiring', label: 'Lease Expiring Soon', description: 'Get a reminder 90 days before a lease contract expires.' },
    { key: 'contract_expiring', label: 'Contract Expiring Soon', description: 'Get a reminder 90 days before a maintenance contract expires.' },
    { key: 'payment_due', label: 'Payment Due Soon', description: 'Get a reminder when a tenant payment is due soon.' },
];


export default function NotificationSettingsClient({ loggedInEmployee }: { loggedInEmployee: Employee | null, allEmployees: Employee[] }) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>(
        loggedInEmployee?.notificationPreferences ?? {
            new_expense_submitted: true,
            expense_approved: true,
            expense_rejected: true,
            lease_expiring: true,
            lease_expiring_days: 90,
            contract_expiring: true,
            contract_expiring_days: 90,
            payment_due: true,
            payment_due_days: 7
        }
    );
    
    const telegramConfigured = loggedInEmployee?.telegramBotToken && loggedInEmployee?.telegramChannelId;

    const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveChanges = async () => {
        if (!loggedInEmployee) return;
        setIsSaving(true);
        const result = await handleUpdateEmployee(loggedInEmployee.id, { notificationPreferences: preferences });
        if (result.success) {
            toast({ title: 'Success', description: 'Your notification preferences have been saved.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsSaving(false);
    };

    const handleSendTestNotification = async () => {
        setIsTesting(true);
        const result = await sendTestTelegramMessage();
        if (result.success) {
            toast({ title: 'Test Message Sent', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Failed to Send', description: result.message });
        }
        setIsTesting(false);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>{t('settings.notificationSettings')}</CardTitle>
                        <CardDescription>
                            {t('settings.chooseEvents')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                            <div className="space-y-1">
                                <h4 className="font-semibold flex items-center gap-2"><Bot /> {t('settings.telegramNotifications')}</h4>
                                <p className="text-sm text-muted-foreground">{t('settings.receiveAlerts')}</p>
                                {!telegramConfigured && <p className="text-xs text-amber-600">{t('settings.telegramNotConfigured')}</p>}
                            </div>
                            <Button onClick={handleSendTestNotification} disabled={isTesting || !telegramConfigured}>
                                <Send className="mr-2"/> {isTesting ? t('settings.sending') : t('settings.sendTestMessage')}
                            </Button>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">{t('settings.notificationTypes')}</h3>
                            <p className="text-sm text-muted-foreground">{t('settings.chooseEvents')}</p>
                            <Separator className="my-4"/>
                            <div className="space-y-4">
                                {notificationTypes.map(type => {
                                    const hasDaysField = type.key === 'lease_expiring' || type.key === 'contract_expiring' || type.key === 'payment_due';
                                    const daysKey = `${type.key}_days` as keyof NotificationPreferences;
                                    
                                    return (
                                        <div key={type.key} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                        <Label htmlFor={type.key} className="font-semibold whitespace-nowrap">
                                                            {t(`settings.${type.key}` as any)}
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(`settings.${type.key}Description` as any)}
                                                        </p>
                                                        {hasDaysField && (preferences[type.key] ?? false) && (
                                                            <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                                                <span>{t('settings.daysBefore')}:</span>
                                                                <Input
                                                                    id={daysKey}
                                                                    type="number"
                                                                    min="1"
                                                                    max="365"
                                                                    value={preferences[daysKey] ?? (type.key === 'payment_due' ? 7 : 90)}
                                                                    onChange={(e) => handlePreferenceChange(daysKey, parseInt(e.target.value) || 1)}
                                                                    className="w-16 h-7 text-center shrink-0 inline-block"
                                                                    lang="en"
                                                                />
                                                                <span>{t('settings.days')}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Switch
                                                    id={type.key}
                                                    checked={preferences[type.key] ?? false}
                                                    onCheckedChange={(checked) => handlePreferenceChange(type.key, checked)}
                                                    className="shrink-0"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? t('settings.saving') : t('settings.savePreferences')}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
