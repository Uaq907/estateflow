
'use client';

import { useState, useEffect, useRef } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Employee, NotificationPreferences } from '@/lib/types';
import { handleUpdateEmployee, sendTestTelegramMessage } from '@/app/dashboard/actions';
import { Bot, Send, Globe, Bell, Banknote, FileSignature, WalletCards, Calendar as CalendarIcon, Wrench, Receipt, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-context';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const notificationTypes: { key: keyof NotificationPreferences, label: string, description: string, icon?: string }[] = [
    { key: 'new_expense_submitted', label: 'New Expense Submitted', description: 'When any employee submits a new expense for approval.', icon: '📋' },
    { key: 'expense_approved', label: 'Expense Approved', description: 'When your expense request is approved by a manager.', icon: '✅' },
    { key: 'expense_rejected', label: 'Expense Rejected', description: 'When your expense request is rejected.', icon: '❌' },
    { key: 'lease_expiring', label: 'Lease Expiring Soon', description: 'Get a reminder before a lease contract expires.', icon: '📄' },
    { key: 'contract_expiring', label: 'Contract Expiring Soon', description: 'Get a reminder before a maintenance contract expires.', icon: '📝' },
    { key: 'payment_due', label: 'Payment Due Soon', description: 'Get a reminder when a tenant payment is due soon.', icon: '💰' },
    { key: 'cheque_due', label: 'Cheque Due Soon', description: 'Get a reminder before a cheque is due.', icon: '🏦' },
    { key: 'contract_renewal', label: 'Contract Renewal', description: 'Get a reminder before a contract needs renewal.', icon: '🔄' },
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
    
    // تفضيلات عرض الأحداث في التقويم
    const [calendarEventVisibility, setCalendarEventVisibility] = useState(() => {
        if (typeof window === 'undefined') return {
            lease: true,
            payment: true,
            maintenance: true,
            cheque: true
        };
        const saved = localStorage.getItem('calendarEventVisibility');
        try {
            return (saved && saved !== '') ? JSON.parse(saved) : {
                lease: true,
                payment: true,
                maintenance: true,
                cheque: true
            };
        } catch (e) {
            console.error('Error parsing calendar visibility preferences:', e);
            return {
                lease: true,
                payment: true,
                maintenance: true,
                cheque: true
            };
        }
    });
    
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
            payment_due_days: 7,
            cheque_due: true,
            cheque_due_days: 7,
            contract_renewal: true,
            contract_renewal_days: 60
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

    const handleEventVisibilityChange = (eventType: string, visible: boolean) => {
        const newVisibility = { ...calendarEventVisibility, [eventType]: visible };
        setCalendarEventVisibility(newVisibility);
        // حفظ في localStorage فوراً
        localStorage.setItem('calendarEventVisibility', JSON.stringify(newVisibility));
        // إرسال حدث لتحديث التقويم
        window.dispatchEvent(new Event('calendarEventVisibilityChanged'));
    };

    const handleSaveChanges = async () => {
        if (!loggedInEmployee) return;
        setIsSaving(true);
        
        // حفظ الإعدادات في localStorage للاستخدام الفوري في الإشعارات
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        
        // إرسال حدث مخصص لتحديث الإشعارات في الوقت الفعلي
        window.dispatchEvent(new Event('notificationPreferencesUpdated'));
        
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
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Page Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {language === 'ar' ? 'إعدادات المستخدم' : 'User Settings'}
                        </h1>
                        <p className="text-muted-foreground">
                            {language === 'ar' 
                                ? 'قم بتخصيص تفضيلاتك وإعداداتك الشخصية' 
                                : 'Customize your preferences and personal settings'}
                        </p>
                    </div>
                    
                    {/* Language Preferences Card - First */}
                    <Card className="border-2">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Globe className="h-6 w-6 text-blue-600" />
                                {t('userPreferences.languagePreferences')}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {t('userPreferences.choosePreferredLanguage')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="language-select" className="text-sm font-medium">
                                    {language === 'ar' ? 'اللغة' : 'Language'}
                                </Label>
                                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                                    <SelectTrigger id="language-select" className="w-full h-11 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ar">
                                            🇸🇦 العربية
                                        </SelectItem>
                                        <SelectItem value="en">
                                            🇬🇧 English
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar Display Preferences Card */}
                    <Card className="border-2">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <CalendarIcon className="h-6 w-6 text-green-600" />
                                {language === 'ar' ? 'إعدادات عرض التقويم' : 'Calendar Display Settings'}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {language === 'ar' 
                                    ? 'اختر أنواع الأحداث التي تريد عرضها في التقويم' 
                                    : 'Choose which event types to display in the calendar'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-6 shadow-sm">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-green-600" />
                                    {language === 'ar' 
                                        ? '✨ التغييرات تُطبق فوراً على التقويم بدون الحاجة للحفظ' 
                                        : '✨ Changes apply immediately to the calendar without needing to save'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { 
                                        key: 'lease', 
                                        icon: FileSignature, 
                                        color: 'text-blue-500',
                                        label: language === 'ar' ? 'أحداث الإيجار' : 'Lease Events',
                                        description: language === 'ar' ? 'بداية ونهاية عقود الإيجار' : 'Lease start and end dates'
                                    },
                                    { 
                                        key: 'payment', 
                                        icon: Banknote, 
                                        color: 'text-green-500',
                                        label: language === 'ar' ? 'الدفعات المستحقة' : 'Payment Due',
                                        description: language === 'ar' ? 'دفعات الإيجار المستحقة' : 'Rent payments due'
                                    },
                                    { 
                                        key: 'maintenance', 
                                        icon: Wrench, 
                                        color: 'text-yellow-500',
                                        label: language === 'ar' ? 'عقود الصيانة' : 'Maintenance Contracts',
                                        description: language === 'ar' ? 'انتهاء عقود الصيانة' : 'Maintenance contract expiry'
                                    },
                                    { 
                                        key: 'cheque', 
                                        icon: WalletCards, 
                                        color: 'text-purple-500',
                                        label: language === 'ar' ? 'الشيكات' : 'Cheques',
                                        description: language === 'ar' ? 'شيكات مستحقة' : 'Cheques due'
                                    }
                                ].map((eventType) => {
                                    const Icon = eventType.icon;
                                    const isVisible = calendarEventVisibility[eventType.key];
                                    return (
                                        <div 
                                            key={eventType.key} 
                                            className={`group flex items-start justify-between p-5 border-2 rounded-xl transition-all duration-200 ${
                                                isVisible 
                                                    ? 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300' 
                                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-3 rounded-lg ${
                                                    isVisible ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-gray-200'
                                                }`}>
                                                    <Icon className={`h-6 w-6 ${eventType.color} ${!isVisible && 'opacity-50'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <Label 
                                                        htmlFor={`visibility-${eventType.key}`} 
                                                        className="font-bold text-base cursor-pointer block mb-1"
                                                    >
                                                        {eventType.label}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">{eventType.description}</p>
                                                    {isVisible && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                                            <Eye className="h-3.5 w-3.5" />
                                                            {language === 'ar' ? 'مرئي في التقويم' : 'Visible in calendar'}
                                                        </div>
                                                    )}
                                                    {!isVisible && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                            <EyeOff className="h-3.5 w-3.5" />
                                                            {language === 'ar' ? 'مخفي من التقويم' : 'Hidden from calendar'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Switch
                                                id={`visibility-${eventType.key}`}
                                                checked={isVisible}
                                                onCheckedChange={(checked) => handleEventVisibilityChange(eventType.key, checked)}
                                                className="shrink-0 mt-1"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences Card */}
                    <Card className="border-2">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Bell className="h-6 w-6 text-amber-600" />
                                {t('userPreferences.notificationPreferences')}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {t('settings.chooseEvents')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* وصف توضيحي محسّن */}
                            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Bell className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-blue-900 mb-1">
                                            {language === 'ar' ? 'ابق على اطلاع بالمواعيد النهائية' : 'Stay Updated on Deadlines'}
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            {language === 'ar' 
                                                ? 'قم بضبط المدة التي ترغب بالحصول على إشعار قبلها. ستتلقى تنبيهات عن المدفوعات المتأخرة، العقود القادمة للانتهاء، الشيكات المستحقة، وتجديد العقود.'
                                                : 'Set the duration you want to be notified before events. You will receive alerts about overdue payments, expiring contracts, upcoming cheques, and contract renewals.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 flex items-center gap-2">
                                        <div className="p-1.5 bg-green-100 rounded">
                                            <Banknote className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {language === 'ar' ? 'المدفوعات' : 'Payments'}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 rounded">
                                            <FileSignature className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {language === 'ar' ? 'العقود' : 'Contracts'}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 rounded">
                                            <WalletCards className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {language === 'ar' ? 'الشيكات' : 'Cheques'}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 rounded">
                                            <CalendarIcon className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {language === 'ar' ? 'التجديدات' : 'Renewals'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Telegram Section */}
                            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Bot className="h-6 w-6 text-cyan-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-base">{t('settings.telegramNotifications')}</h4>
                                            <p className="text-sm text-muted-foreground">{t('settings.receiveAlerts')}</p>
                                            {!telegramConfigured && (
                                                <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 mt-2">
                                                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                                                        <span>⚠️</span>
                                                        <span>{t('settings.telegramNotConfigured')}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleSendTestNotification} 
                                        disabled={isTesting || !telegramConfigured}
                                        size="lg"
                                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 whitespace-nowrap"
                                    >
                                        <Send className="mr-2 h-4 w-4"/> 
                                        {isTesting ? t('settings.sending') : t('settings.sendTestMessage')}
                                    </Button>
                                </div>
                            </div>

                            {/* Notification Types Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                                    <h3 className="text-lg font-bold text-gray-700">{t('settings.notificationTypes')}</h3>
                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {notificationTypes.map(type => {
                                        const hasDaysField = type.key === 'lease_expiring' || type.key === 'contract_expiring' || type.key === 'payment_due' || type.key === 'cheque_due' || type.key === 'contract_renewal';
                                        const daysKey = `${type.key}_days` as keyof NotificationPreferences;
                                        const isEnabled: boolean = typeof preferences[type.key] === 'boolean' ? preferences[type.key] as boolean : false;
                                        
                                        return (
                                            <div 
                                                key={type.key} 
                                                className={`group border-2 rounded-xl p-5 transition-all duration-200 ${
                                                    isEnabled 
                                                        ? 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300' 
                                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className={`text-2xl ${!isEnabled && 'opacity-50'}`}>
                                                            {type.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label 
                                                                htmlFor={type.key} 
                                                                className="font-bold text-base cursor-pointer block mb-1"
                                                            >
                                                                {t(`settings.${type.key}` as any)}
                                                            </Label>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                {t(`settings.${type.key}Description` as any)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        id={type.key}
                                                        checked={isEnabled}
                                                        onCheckedChange={(checked) => handlePreferenceChange(type.key, checked)}
                                                        className="shrink-0"
                                                    />
                                                </div>
                                                
                                                {hasDaysField && isEnabled && (
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-3">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <Label htmlFor={daysKey} className="text-sm font-bold text-blue-900 whitespace-nowrap">
                                                                {t('settings.daysBefore')}:
                                                            </Label>
                                                            <Input
                                                                id={daysKey}
                                                                type="number"
                                                                min="1"
                                                                max="365"
                                                                value={typeof preferences[daysKey] === 'number' ? preferences[daysKey] : (
                                                                    type.key === 'payment_due' || type.key === 'cheque_due' ? 7 :
                                                                    type.key === 'contract_renewal' ? 60 : 90
                                                                )}
                                                                onChange={(e) => handlePreferenceChange(daysKey, parseInt(e.target.value) || 1)}
                                                                className="w-24 h-10 text-center font-bold text-base border-2 border-blue-300 focus:border-blue-500"
                                                                lang="en"
                                                            />
                                                            <span className="text-sm font-bold text-blue-900">{t('settings.days')}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="bg-gray-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6">
                            <Button 
                                onClick={handleSaveChanges} 
                                disabled={isSaving} 
                                size="lg" 
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-8 shadow-md"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        {t('settings.saving')}
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">💾</span>
                                        {t('settings.savePreferences')}
                                    </>
                                )}
                            </Button>
                            {selectedLanguage !== savedLanguageRef.current && (
                                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>{t('userPreferences.languageNotSaved')}</span>
                                    </p>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}


