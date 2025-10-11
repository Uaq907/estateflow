

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Employee, ActivityLog } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Input } from './ui/input';
import { AppHeader } from './layout/header';
import { ListOrdered, Search, User, Shield, CalendarDays, Trash2, AlertTriangle, Database, Eye, EyeOff } from 'lucide-react';
import { DatePicker } from './date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { handleDeleteActivityLog, handleDeleteAllActivityLogs } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';

function formatLogDetails(details: string | null | undefined, showAllVariables: boolean = false, t?: (key: string) => string, entityType?: string) {
    if (!details || details === 'null' || details === 'undefined') {
        return <span className="text-gray-400 italic text-xs">لا توجد تفاصيل</span>;
    }
    
    // إخفاء تفاصيل المصروفات
    if (entityType === 'Expense') {
        return null;
    }
    
    // عرض IP فقط لعمليات تسجيل الدخول
    if (entityType === 'System' || entityType?.includes('ip:') || entityType?.includes('.')) {
        try {
            const parsed = JSON.parse(details);
            if (parsed.ip) {
                return (
                    <div className="text-xs">
                        <span className="font-semibold text-blue-700">🌐 IP:</span>
                        <span className="ml-2 text-gray-800 font-medium">{parsed.ip}</span>
                    </div>
                );
            }
        } catch (e) {
            // إذا كان عنوان IP مباشر
            if (entityType?.includes('.')) {
                return (
                    <div className="text-xs">
                        <span className="font-semibold text-blue-700">🌐 IP:</span>
                        <span className="ml-2 text-gray-800 font-medium">{entityType}</span>
                    </div>
                );
            }
        }
    }
    
    try {
        // تنظيف البيانات قبل التحليل
        const cleanDetails = typeof details === 'string' ? details.trim() : details;
        if (cleanDetails === '' || cleanDetails === '{}' || cleanDetails === '[]') {
            return <span className="text-gray-400 italic text-xs">لا توجد تفاصيل</span>;
        }
        
        const parsed = JSON.parse(cleanDetails);
        
        // التحقق من أن parsed كائن صالح وليس array فارغ
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return <span className="text-gray-400 italic text-xs">لا توجد تفاصيل</span>;
        }
        
        // التحقق من عدم وجود مفاتيح
        if (Object.keys(parsed).length === 0) {
            return <span className="text-gray-400 italic text-xs">لا توجد تفاصيل</span>;
        }
        
        if (parsed.updatedFields) {
            const fields = parsed.updatedFields;
            const entries = Array.isArray(fields) ? Object.entries(fields) : Object.entries(fields);

            return (
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {t ? t('logAnalyzer.updatedFields') : 'Updated Fields:'}
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                        {entries.map(([key, value]: [string, any], index: number) => {
                            const fieldName = Array.isArray(fields) ? value[0] : key;
                            const fieldValues = Array.isArray(fields) ? value[1] : value;

                            // ترجمة أسماء الحقول
                            const fieldNameMap: Record<string, string> = {
                                'status': 'الحالة',
                                'amount': 'المبلغ',
                                'dueDate': 'تاريخ الاستحقاق',
                                'payeeName': 'اسم المستفيد',
                                'bankName': 'البنك',
                                'chequeNumber': 'رقم الشيك',
                                'notes': 'الملاحظات',
                                'clearedDate': 'تاريخ الصرف',
                                'name': 'الاسم',
                                'email': 'البريد الإلكتروني',
                                'phone': 'الهاتف',
                                'address': 'العنوان',
                                'type': 'النوع',
                                'location': 'الموقع',
                                'latitude': 'خط العرض',
                                'longitude': 'خط الطول',
                                'price': 'السعر',
                                'size': 'المساحة',
                                'bedrooms': 'غرف النوم',
                                'bathrooms': 'دورات المياه',
                                'description': 'الوصف',
                                'features': 'المميزات',
                                'ownerId': 'المالك',
                                'managerId': 'المدير',
                                'startDate': 'تاريخ البداية',
                                'endDate': 'تاريخ النهاية',
                                'totalLeaseAmount': 'إجمالي الإيجار',
                                'rentPaymentAmount': 'مبلغ الدفعة',
                                'numberOfPayments': 'عدد الدفعات',
                                // الحقول المختصرة
                                'p': 'العقار',
                                'd': 'التفاصيل',
                                's': 'الحالة',
                                'n': 'الاسم',
                                'e': 'البريد',
                                'a': 'المبلغ',
                                't': 'النوع'
                            };

                            // ترجمة قيم الحالات
                            const statusMap: Record<string, string> = {
                                'Pending': 'معلق',
                                'Cleared': 'تم الصرف',
                                'Bounced': 'مرتجع',
                                'Cancelled': 'ملغي'
                            };

                            const translatedFieldName = fieldNameMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1');
                            
                            let oldValue = fieldValues.old !== undefined && fieldValues.old !== null ? fieldValues.old : '';
                            let newValue = fieldValues.new !== undefined && fieldValues.new !== null ? fieldValues.new : '';

                            // ترجمة القيم إذا كانت حالات
                            if (fieldName === 'status') {
                                oldValue = statusMap[oldValue] || oldValue;
                                newValue = statusMap[newValue] || newValue;
                            }

                            // تنسيق التواريخ
                            if (fieldName.includes('Date') || fieldName.includes('date')) {
                                if (oldValue && oldValue !== '') {
                                    try {
                                        oldValue = new Date(oldValue).toLocaleDateString('en-GB');
                                    } catch (e) {}
                                }
                                if (newValue && newValue !== '') {
                                    try {
                                        newValue = new Date(newValue).toLocaleDateString('en-GB');
                                    } catch (e) {}
                                }
                            }

                            // تنسيق المبالغ
                            if (fieldName === 'amount' && typeof oldValue === 'number') {
                                oldValue = `AED ${oldValue.toLocaleString()}`;
                            }
                            if (fieldName === 'amount' && typeof newValue === 'number') {
                                newValue = `AED ${newValue.toLocaleString()}`;
                            }

                            // عرض القيم الفارغة كـ "-"
                            const displayOldValue = oldValue === '' ? '-' : String(oldValue);
                            const displayNewValue = newValue === '' ? '-' : String(newValue);

                            return (
                                <li key={`${fieldName}-${index}`} className="text-xs">
                                    <span className="font-semibold">{translatedFieldName}:</span>
                                    {' '}
                                    <span className="text-red-600 dark:text-red-400 line-through">{displayOldValue}</span>
                                    {' ← '}
                                    <span className="text-green-600 dark:text-green-400 font-medium">{displayNewValue}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }

        // Show all variables if requested
        if (showAllVariables) {
            return (
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                        {t ? t('logAnalyzer.allProgramVariables') : 'All Program Variables:'}
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                        {Object.entries(parsed).map(([key, value], index) => (
                            <li key={`${key}-${index}`} className="text-xs">
                                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> 
                                <span className="ml-2 text-muted-foreground">{JSON.stringify(value)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        // Generic JSON object formatting - عرض محسّن للتفاصيل
        const fieldNameMap: Record<string, string> = {
            'payeeName': '👤 اسم المستفيد',
            'bankName': '🏦 البنك',
            'chequeNumber': '📄 رقم الشيك',
            'amount': '💰 المبلغ',
            'dueDate': '📅 تاريخ الاستحقاق',
            'status': '🔵 الحالة',
            'notes': '📝 الملاحظات',
            'category': '📁 الفئة',
            'description': '📋 الوصف',
            'email': '📧 البريد',
            'name': '👤 الاسم',
            'tenantId': '🏠 المستأجر',
            'propertyId': '🏢 العقار',
            'unitId': '🏘️ الوحدة'
        };

        const statusMap: Record<string, string> = {
            'Pending': 'معلق',
            'Cleared': 'تم الصرف',
            'Bounced': 'مرتجع',
            'Cancelled': 'ملغي',
            'Approved': 'موافق عليه',
            'Rejected': 'مرفوض'
        };

        // قائمة الحقول التي يجب إخفاؤها
        const hiddenFields = [
            'category', 
            'description', 
            'supplier',
            'propertyId',
            'unitId',
            'tenantId',
            'employeeId',
            'managerId',
            'receiptUrl',
            'managerNotes',
            'taxNumber',
            'isVat',
            'baseAmount',
            'taxAmount',
            'isRecurring',
            'recurrenceType',
            'phone',
            'userAgent',
            'timestamp',
            'address',
            'nationality',
            'emiratesId',
            'emiratesIdUrl',
            'passportNumber',
            'passportUrl',
            'tradeLicenseNumber',
            'tradeLicenseUrl'
        ];

        return (
            <div className="space-y-1">
                {Object.entries(parsed)
                    .filter(([key]) => !hiddenFields.includes(key))
                    .map(([key, value], index) => {
                        const translatedKey = fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1') + ':';
                        let displayValue = value;

                        // ترجمة الحالات
                        if (key === 'status' && typeof value === 'string') {
                            displayValue = statusMap[value] || value;
                        }

                        // تنسيق التواريخ
                        if ((key.includes('Date') || key.includes('date')) && value && value !== 'N/A' && value !== null) {
                            try {
                                displayValue = new Date(value as string).toLocaleDateString('en-GB');
                            } catch (e) {
                                displayValue = value;
                            }
                        }

                        // تنسيق المبالغ
                        if (key === 'amount' && typeof value === 'number') {
                            displayValue = `AED ${value.toLocaleString()}`;
                        }

                        return (
                            <div key={`${key}-${index}`} className="flex items-start gap-2">
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 min-w-[110px]">
                                    {translatedKey}
                                </span>
                                <span className="text-xs text-gray-800 dark:text-gray-200 font-medium break-all">
                                    {typeof displayValue === 'object' ? JSON.stringify(displayValue) : String(displayValue)}
                                </span>
                            </div>
                        );
                    })}
            </div>
        );

    } catch (e) {
        // If it's not a JSON string or there's a parsing error, return a clean message
        console.error('Error parsing log details:', e, 'Details:', details);
        return <span className="text-gray-400 italic text-xs">تفاصيل غير صالحة</span>;
    }
}


function LogTimestamp({ timestamp }: { timestamp: Date }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [formattedDistance, setFormattedDistance] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(format(timestamp, 'dd/MM/yy HH:mm'));
    setFormattedDistance(formatDistanceToNow(timestamp, { addSuffix: true }));
  }, [timestamp]);

  if (!formattedDate) {
    return (
        <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
        </div>
    );
  }

  return (
    <div>
        <div className="font-medium">{formattedDate}</div>
        <div className="text-xs text-muted-foreground">{formattedDistance}</div>
    </div>
  );
}


// دالة لترجمة وتبسيط أسماء أنواع الكيانات
function formatEntityType(entityType: string | null | undefined): string {
    if (!entityType) return 'غير محدد';
    
    // إذا كان عنوان IP (يحتوي على نقاط أو أرقام)، عرضه مباشرة
    if (entityType.includes('.') || entityType.includes(':') || /^\d/.test(entityType)) {
        return entityType; // عنوان IP
    }
    
    const entityTypeMap: Record<string, string> = {
        'Employee': 'موظف',
        'Tenant': 'مستأجر',
        'Owner': 'مالك',
        'Property': 'عقار',
        'Unit': 'وحدة',
        'Lease': 'إيجار',
        'LeasePayment': 'دفعة إيجار',
        'PaymentTransaction': 'معاملة دفع',
        'Expense': 'مصروف',
        'MaintenanceContract': 'عقد صيانة',
        'Asset': 'أصل',
        'Cheque': 'شيك',
        'ChequeTransaction': 'معاملة شيك',
        'Payee': 'مستفيد',
        'Bank': 'بنك',
        'PropertyDocument': 'مستند عقار',
        'UnitConfiguration': 'تكوين وحدة',
        'EvictionRequest': 'طلب إخلاء',
        'ActivityLog': 'سجل نشاط',
        'System': 'النظام',
        'Unknown': 'غير معروف'
    };
    
    return entityTypeMap[entityType] || entityType;
}

// دالة لترجمة أسماء الإجراءات
function formatAction(action: string | null | undefined): string {
    if (!action) return 'غير محدد';
    
    const actionMap: Record<string, string> = {
        'LOGIN_SUCCESS': 'تسجيل دخول ناجح',
        'LOGOUT_SUCCESS': 'تسجيل خروج',
        'CREATE_EMPLOYEE': 'إضافة موظف',
        'UPDATE_EMPLOYEE': 'تحديث موظف',
        'DELETE_EMPLOYEE': 'حذف موظف',
        'CREATE_TENANT': 'إضافة مستأجر',
        'UPDATE_TENANT': 'تحديث مستأجر',
        'DELETE_TENANT': 'حذف مستأجر',
        'CREATE_OWNER': 'إضافة مالك',
        'UPDATE_OWNER': 'تحديث مالك',
        'DELETE_OWNER': 'حذف مالك',
        'ASSIGN_TENANT': 'تعيين مستأجر',
        'REMOVE_TENANT': 'إزالة مستأجر',
        'UPDATE_LEASE': 'تحديث إيجار',
        'ADD_LEASE_PAYMENT': 'إضافة دفعة إيجار',
        'UPDATE_LEASE_PAYMENT': 'تحديث دفعة',
        'DELETE_LEASE_PAYMENT': 'حذف دفعة',
        'CREATE_EXPENSE': 'إضافة مصروف',
        'UPDATE_EXPENSE': 'تحديث مصروف',
        'DELETE_EXPENSE': 'حذف مصروف',
        'CREATE_MAINTENANCE_CONTRACT': 'إضافة عقد صيانة',
        'UPDATE_MAINTENANCE_CONTRACT': 'تحديث عقد صيانة',
        'DELETE_MAINTENANCE_CONTRACT': 'حذف عقد صيانة',
        'CREATE_ASSET': 'إضافة أصل',
        'UPDATE_ASSET': 'تحديث أصل',
        'DELETE_ASSET': 'حذف أصل',
        'CREATE_CHEQUE': 'إضافة شيك',
        'UPDATE_CHEQUE': 'تحديث شيك',
        'DELETE_CHEQUE': 'حذف شيك',
        'CREATE_EVICTION_REQUEST': 'إضافة طلب إخلاء',
        'UPDATE_EVICTION_REQUEST': 'تحديث طلب إخلاء',
        'DELETE_EVICTION_REQUEST': 'حذف طلب إخلاء',
        'PASSWORD_CHANGE_SUCCESS': 'تغيير كلمة المرور',
        'PASSWORD_CHANGE_FAILURE': 'فشل تغيير كلمة المرور',
        'DELETE_ACTIVITY_LOG': 'حذف سجل',
        'DELETE_ALL_ACTIVITY_LOGS': 'حذف جميع السجلات'
    };
    
    return actionMap[action] || action;
}

export default function LogAnalyzerClient({ initialLogs, loggedInEmployee }: { initialLogs: ActivityLog[], loggedInEmployee: Employee | null }) {
    const { t } = useLanguage();
    console.log('LogAnalyzerClient received:', { 
        logsCount: initialLogs.length, 
        employee: loggedInEmployee?.name,
        firstLog: initialLogs[0] 
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
    const [actionFilter, setActionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllVariables, setShowAllVariables] = useState(false);
    const [logs, setLogs] = useState(initialLogs);
    const logsPerPage = 50;
    const router = useRouter();

    const uniqueActions = useMemo(() => {
        const actions = new Set(logs.map(log => log.action));
        return ['all', ...Array.from(actions)];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // إخفاء جميع سجلات المصروفات
            if (log.action === 'CREATE_EXPENSE' || log.action === 'UPDATE_EXPENSE' || log.action === 'DELETE_EXPENSE' || log.entityType === 'Expense') {
                return false;
            }
            
            const lowercasedQuery = searchQuery.toLowerCase();
            const matchesSearch = lowercasedQuery === '' ||
                (log.employeeName && log.employeeName.toLowerCase().includes(lowercasedQuery)) ||
                (log.action && log.action.toLowerCase().includes(lowercasedQuery)) ||
                (log.entityType && log.entityType.toLowerCase().includes(lowercasedQuery)) ||
                (log.entityId && log.entityId.toLowerCase().includes(lowercasedQuery)) ||
                (log.details && log.details.toLowerCase().includes(lowercasedQuery));

            const matchesAction = actionFilter === 'all' || log.action === actionFilter;

            const logDate = new Date(log.timestamp);
            const fromDate = dateFilter.from;
            const toDate = dateFilter.to;
            const matchesDate = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);

            return matchesSearch && matchesAction && matchesDate;
        });
    }, [logs, searchQuery, dateFilter, actionFilter]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * logsPerPage,
        currentPage * logsPerPage
    );

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    
    const logStats = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const logsLast7Days = logs.filter(log => new Date(log.timestamp) > sevenDaysAgo).length;
        const uniqueUsers = new Set(logs.map(log => log.employeeId)).size;
        const loginLogs = logs.filter(log => log.action.toLowerCase().includes('login')).length;
        return { totalLogs: logs.length, logsLast7Days, uniqueUsers, loginLogs };
    }, [logs]);

    const handleDeleteLog = async (logId: string) => {
        const result = await handleDeleteActivityLog(logId);
        if (result.success) {
            setLogs(prev => prev.filter(log => log.id !== logId));
        } else {
            alert(result.message);
        }
    };

    const handleDeleteAllLogs = async () => {
        const result = await handleDeleteAllActivityLogs();
        if (result.success) {
            setLogs([]);
        } else {
            alert(result.message);
        }
    };


    return (
        <div className="flex flex-col min-h-screen">
          <AppHeader loggedInEmployee={loggedInEmployee} />
          <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('logAnalyzer.totalLoggedEvents')}</CardTitle><ListOrdered className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{logStats.totalLogs}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('logAnalyzer.eventsLast7Days')}</CardTitle><CalendarDays className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{logStats.logsLast7Days}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('logAnalyzer.uniqueUsersActive')}</CardTitle><User className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{logStats.uniqueUsers}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('logAnalyzer.loginEvents')}</CardTitle><Shield className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{logStats.loginLogs}</div></CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{t('logAnalyzer.title')}</CardTitle>
                    <CardDescription>
                      {t('logAnalyzer.description')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showAllVariables ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowAllVariables(!showAllVariables)}
                    >
                      {showAllVariables ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showAllVariables ? t('logAnalyzer.hideVariables') : t('logAnalyzer.showAllVariables')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('logAnalyzer.deleteAllLogs')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('logAnalyzer.deleteAllLogs')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('logAnalyzer.deleteAllLogsMessage')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('logAnalyzer.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAllLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {t('logAnalyzer.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                  <div className="relative flex-grow min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('logAnalyzer.searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 w-full"
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[180px]"><SelectValue placeholder={t('logAnalyzer.filterByAction')}/></SelectTrigger>
                        <SelectContent>
                          {uniqueActions.map(action => (
                            <SelectItem key={action} value={action} className="capitalize">
                              {action === 'all' ? t('logAnalyzer.allActions') : formatAction(action)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    <DatePicker
                        name="date-from"
                        placeholder={t('logAnalyzer.dateFrom')}
                        value={dateFilter.from}
                        onSelect={date => setDateFilter(prev => ({ ...prev, from: date }))}
                        className="w-full sm:w-auto sm:w-[150px]"
                    />
                    <DatePicker
                        name="date-to"
                        placeholder={t('logAnalyzer.dateTo')}
                        value={dateFilter.to}
                        onSelect={date => setDateFilter(prev => ({ ...prev, to: date }))}
                        className="w-full sm:w-auto sm:w-[150px]"
                    />
                     <Button variant="ghost" onClick={() => { setSearchQuery(''); setActionFilter('all'); setDateFilter({}); }}>
                        {t('logAnalyzer.clearFilters')}
                    </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('logAnalyzer.timestamp')}</TableHead>
                        <TableHead className="text-right">{t('logAnalyzer.employeeName')}</TableHead>
                        <TableHead className="text-right">{t('logAnalyzer.action')}</TableHead>
                        <TableHead className="text-right">{t('logAnalyzer.details')}</TableHead>
                        <TableHead className="w-20"><span className="sr-only">{t('logAnalyzer.actions')}</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length > 0 ? (
                        paginatedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                               <LogTimestamp timestamp={log.timestamp} />
                            </TableCell>
                            <TableCell>{log.employeeName || 'النظام'}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{formatAction(log.action)}</Badge>
                            </TableCell>
                            <TableCell className="text-sm max-w-md">
                                <div className="text-muted-foreground break-words">
                                    {formatLogDetails(log.details, showAllVariables, t, log.entityType)}
                                </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('logAnalyzer.deleteLog')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('logAnalyzer.deleteLogMessage')}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('logAnalyzer.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLog(log.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      {t('logAnalyzer.deleteLog')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {t('logAnalyzer.noLogsFound')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </CardFooter>
                )}
            </Card>
          </main>
        </div>
      );
}
