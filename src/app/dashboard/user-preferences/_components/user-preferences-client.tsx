
'use client';

import { useState, useEffect, useRef } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Employee, NotificationPreferences } from '@/lib/types';
import { handleUpdateEmployee } from '@/app/dashboard/actions';
import { Bot, Send, Globe, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { sendTestTelegramMessage } from '@/app/dashboard/actions';
import { useLanguage } from '@/contexts/language-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

const notificationTypes: { key: keyof NotificationPreferences, label: string, description: string }[] = [
    { key: 'new_expense_submitted', label: 'New Expense Submitted', description: 'When any employee submits a new expense for approval.' },
    { key: 'expense_approved', label: 'Expense Approved', description: 'When your expense request is approved by a manager.' },
    { key: 'expense_rejected', label: 'Expense Rejected', description: 'When your expense request is rejected.' },
    { key: 'lease_expiring', label: 'Lease Expiring Soon', description: 'Get a reminder 90 days before a lease contract expires.' },
    { key: 'contract_expiring', label: 'Contract Expiring Soon', description: 'Get a reminder 90 days before a maintenance contract expires.' },
    { key: 'payment_due', label: 'Payment Due Soon', description: 'Get a reminder when a tenant payment is due soon.' },
];


export default function UserPreferencesClient({ loggedInEmployee }: { loggedInEmployee: Employee | null }) {
    const { language, setLanguage, t } = useLanguage();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    
    // Store original language from database
    const originalLanguage = loggedInEmployee?.preferredLanguage || 'ar';
    
    // Use ref to track saved language for cleanup
    const savedLanguageRef = useRef<'ar' | 'en'>(originalLanguage);
    const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>(originalLanguage);
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

    // Apply user's preferred language on component mount
    useEffect(() => {
        // Set initial language on mount
        if (originalLanguage && originalLanguage !== language) {
            setLanguage(originalLanguage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Restore saved language on unmount if changes weren't saved
    useEffect(() => {
        return () => {
            // Restore saved language from ref when leaving page
            setLanguage(savedLanguageRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on unmount

    const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | number) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleLanguageChange = (newLang: 'ar' | 'en') => {
        setSelectedLanguage(newLang);
        // Apply language change immediately
        setLanguage(newLang);
    };

    const handleSaveChanges = async () => {
        if (!loggedInEmployee) return;
        setIsSaving(true);
        const result = await handleUpdateEmployee(loggedInEmployee.id, { 
            notificationPreferences: preferences,
            preferredLanguage: selectedLanguage
        });
        if (result.success) {
            // Update saved language ref after successful save
            savedLanguageRef.current = selectedLanguage;
            toast({ 
                title: t('userPreferences.success'), 
                description: t('userPreferences.savedSuccessfully')
            });
        } else {
            toast({ 
                variant: 'destructive', 
                title: t('userPreferences.error'), 
                description: result.message 
            });
        }
        setIsSaving(false);
    };

    const handleSendTestNotification = async () => {
        setIsTesting(true);
        const result = await sendTestTelegramMessage();
        if (result.success) {
            toast({ 
                title: t('settings.testMessageSent'), 
                description: result.message 
            });
        } else {
            toast({ 
                variant: 'destructive', 
                title: t('settings.failedToSend'), 
                description: result.message 
            });
        }
        setIsTesting(false);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Language Preferences Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                {t('userPreferences.languagePreferences')}
                            </CardTitle>
                            <CardDescription>
                                {t('userPreferences.choosePreferredLanguage')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange}>
                                <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <RadioGroupItem value="ar" id="lang-ar" />
                                    <Label htmlFor="lang-ar" className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{t('user.arabic')}</p>
                                                <p className="text-sm text-muted-foreground">العربية - اللغة الافتراضية</p>
                                            </div>
                                            {selectedLanguage === 'ar' && <span className="text-primary font-bold">✓</span>}
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <RadioGroupItem value="en" id="lang-en" />
                                    <Label htmlFor="lang-en" className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{t('user.english')}</p>
                                                <p className="text-sm text-muted-foreground">English - Default Language</p>
                                            </div>
                                            {selectedLanguage === 'en' && <span className="text-primary font-bold">✓</span>}
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                {t('userPreferences.notificationPreferences')}
                            </CardTitle>
                            <CardDescription>
                                {t('settings.chooseEvents')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                <h3 className="text-lg font-semibold mb-2">{t('settings.notificationTypes')}</h3>
                                <Separator className="my-4"/>
                                <div className="space-y-3">
                                    {notificationTypes.map(type => {
                                        const hasDaysField = type.key === 'lease_expiring' || type.key === 'contract_expiring' || type.key === 'payment_due';
                                        const daysKey = `${type.key}_days` as keyof NotificationPreferences;
                                        
                                        return (
                                            <div key={type.key} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                            <Label htmlFor={type.key} className="font-semibold cursor-pointer whitespace-nowrap">
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
                        <CardFooter className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <Button onClick={handleSaveChanges} disabled={isSaving} size="lg" className="w-full sm:w-auto">
                                {isSaving ? t('settings.saving') : t('settings.savePreferences')}
                            </Button>
                            {selectedLanguage !== savedLanguageRef.current && (
                                <p className="text-sm text-amber-600 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>{t('userPreferences.languageNotSaved')}</span>
                                </p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}

