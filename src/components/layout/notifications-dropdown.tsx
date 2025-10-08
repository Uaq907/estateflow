'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Clock, FileSignature, Banknote, WalletCards, Calendar as CalendarIcon, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format, differenceInDays, parseISO, isBefore, addDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'payment' | 'lease' | 'contract' | 'cheque';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  link: string;
  date: Date;
  daysRemaining?: number;
  tenantName?: string;        // اسم المستأجر (للسكني)
  tradeName?: string;          // الاسم التجاري (للتجاري)
  propertyType?: 'residential' | 'commercial'; // نوع العقار
  amount?: string;             // المبلغ (للدفعات والشيكات)
  chequeNumber?: string;       // رقم الشيك
}

interface NotificationsDropdownProps {
  language: 'ar' | 'en';
  t: (key: string) => string;
}

export function NotificationsDropdown({ language, t }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkedAsRead, setIsMarkedAsRead] = useState(false);
  const locale = language === 'ar' ? ar : enUS;

  const fetchNotifications = async () => {
    try {
      // التحقق من أننا في المتصفح
      if (typeof window === 'undefined') return;
      
      // تحميل إعدادات المستخدم من localStorage
      const savedPreferences = localStorage.getItem('notificationPreferences');
      const userPreferences = savedPreferences ? JSON.parse(savedPreferences) : {
        payment_due: true,
        payment_due_days: 7,
        lease_expiring: true,
        lease_expiring_days: 90,
        contract_expiring: true,
        contract_expiring_days: 90,
        cheque_due: true,
        cheque_due_days: 7,
        contract_renewal: true,
        contract_renewal_days: 60
      };
      
      // محاكاة جلب البيانات - يمكن استبداله بـ API call حقيقي
      const mockNotifications: Notification[] = [];
      
      // إضافة إشعارات وهمية لأغراض التجربة
      const today = new Date();
      
      // مدفوعات متأخرة - سكني (أحمر)
      if (userPreferences.payment_due) {
        mockNotifications.push({
          id: '1',
          type: 'payment',
          severity: 'urgent',
          title: t('notifications.overduePayment'),
          description: language === 'ar' ? 'عقار النخيل - شقة 101' : 'Palm Estate - Apt 101',
          link: '/dashboard/financials',
          date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
          daysRemaining: -15,
          tenantName: language === 'ar' ? 'أحمد محمد الكعبي' : 'Ahmed Mohammed Al Kaabi',
          propertyType: 'residential',
          amount: '45,000'
        });
      }
      
      // عقود قريبة من الانتهاء - سكني (أصفر)
      if (userPreferences.lease_expiring) {
        mockNotifications.push({
          id: '2',
          type: 'lease',
          severity: 'warning',
          title: t('notifications.leasingExpiring'),
          description: language === 'ar' ? 'عقد إيجار - شقة 205' : 'Lease Contract - Apt 205',
          link: '/dashboard/financials',
          date: addDays(today, userPreferences.lease_expiring_days || 90),
          daysRemaining: userPreferences.lease_expiring_days || 90,
          tenantName: language === 'ar' ? 'سارة علي الشامسي' : 'Sara Ali Al Shamsi',
          propertyType: 'residential'
        });
      }
      
      // شيك قادم للصرف - تجاري (أصفر)
      if (userPreferences.cheque_due) {
        mockNotifications.push({
          id: '3',
          type: 'cheque',
          severity: 'warning',
          title: t('notifications.upcomingCheque'),
          description: language === 'ar' ? 'محل تجاري - الشارقة' : 'Commercial Shop - Sharjah',
          link: '/dashboard/cheques',
          date: addDays(today, userPreferences.cheque_due_days || 7),
          daysRemaining: userPreferences.cheque_due_days || 7,
          tradeName: language === 'ar' ? 'مؤسسة الإمارات التجارية' : 'Emirates Trading Est.',
          propertyType: 'commercial',
          amount: '50,000',
          chequeNumber: 'CHQ-2025-0345'
        });
      }
      
      // عقد منتهي - تجاري (أحمر)
      if (userPreferences.contract_expiring) {
        mockNotifications.push({
          id: '4',
          type: 'contract',
          severity: 'urgent',
          title: t('notifications.expiredContract'),
          description: language === 'ar' ? 'محل تجاري • منطقة الصناعية' : 'Commercial Shop • Industrial Area',
          link: '/dashboard/financials',
          date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
          daysRemaining: -5,
          tradeName: language === 'ar' ? 'شركة الخليج للتجارة' : 'Gulf Trading Company',
          propertyType: 'commercial'
        });
      }
      
      // شيك متأخر - سكني (أحمر)
      if (userPreferences.cheque_due) {
        mockNotifications.push({
          id: '5',
          type: 'cheque',
          severity: 'urgent',
          title: t('notifications.overdueCheque'),
          description: language === 'ar' ? 'شقة 303 - برج السلام' : 'Apartment 303 - Al Salam Tower',
          link: '/dashboard/cheques',
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          daysRemaining: -3,
          tenantName: language === 'ar' ? 'خالد عبدالله النعيمي' : 'Khalid Abdullah Al Nuaimi',
          propertyType: 'residential',
          amount: '30,000',
          chequeNumber: 'CHQ-2025-0128'
        });
      }
      
      // دفعة قادمة - تجاري (أصفر)
      if (userPreferences.payment_due) {
        mockNotifications.push({
          id: '6',
          type: 'payment',
          severity: 'warning',
          title: language === 'ar' ? 'دفعة قادمة' : 'Upcoming Payment',
          description: language === 'ar' ? 'دفعة إيجار - مكتب 301' : 'Rent Payment - Office 301',
          link: '/dashboard/financials',
          date: addDays(today, userPreferences.payment_due_days || 7),
          daysRemaining: userPreferences.payment_due_days || 7,
          tradeName: language === 'ar' ? 'مكتب المحاماة الدولي' : 'International Law Office',
          propertyType: 'commercial',
          amount: '65,000'
        });
      }
      
      // عقد سكني قادم للتجديد (أصفر)
      if (userPreferences.contract_renewal) {
        mockNotifications.push({
          id: '7',
          type: 'lease',
          severity: 'warning',
          title: language === 'ar' ? 'عقد قادم للتجديد' : 'Lease Renewal Due',
          description: language === 'ar' ? 'فيلا - منطقة الراشدية' : 'Villa - Al Rashidiya',
          link: '/dashboard/financials',
          date: addDays(today, userPreferences.contract_renewal_days || 60),
          daysRemaining: userPreferences.contract_renewal_days || 60,
          tenantName: language === 'ar' ? 'فاطمة حسن المزروعي' : 'Fatima Hassan Al Mazrouei',
          propertyType: 'residential'
        });
      }

      setNotifications(mockNotifications);
      
      // تحديث عداد غير المقروءة بناءً على حالة المقروء
      if (isMarkedAsRead) {
        setUnreadCount(0);
      } else {
        setUnreadCount(mockNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // التحقق من أننا في المتصفح
    if (typeof window === 'undefined') return;
    
    // التحقق من حالة المقروء
    const markedAsRead = localStorage.getItem('notificationsMarkedAsRead');
    if (markedAsRead === 'true') {
      setIsMarkedAsRead(true);
    } else {
      setIsMarkedAsRead(false);
    }
    
    // جلب الإشعارات من API
    fetchNotifications();
    
    // تحديث الإشعارات عند تغيير الإعدادات
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationPreferences') {
        fetchNotifications();
      }
      // تحديث حالة المقروء عند التغيير
      if (e.key === 'notificationsMarkedAsRead') {
        const newValue = e.newValue === 'true';
        setIsMarkedAsRead(newValue);
        if (newValue) {
          setUnreadCount(0);
        } else {
          fetchNotifications();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // إضافة مستمع مخصص للتحديثات من نفس النافذة
    const handleLocalUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notificationPreferencesUpdated', handleLocalUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationPreferencesUpdated', handleLocalUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return Banknote;
      case 'lease':
        return FileSignature;
      case 'contract':
        return FileSignature;
      case 'cheque':
        return WalletCards;
      default:
        return CalendarIcon;
    }
  };

  const formatDaysRemaining = (days: number | undefined) => {
    if (days === undefined) return '';
    
    if (days < 0) {
      return language === 'ar' 
        ? `متأخر ${Math.abs(days)} يوم` 
        : `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else {
      return language === 'ar' 
        ? `خلال ${days} يوم` 
        : `In ${days} days`;
    }
  };

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
    setIsMarkedAsRead(true);
    const currentTime = new Date().getTime().toString();
    // حفظ حالة المقروء ووقت القراءة في localStorage
    localStorage.setItem('notificationsMarkedAsRead', 'true');
    localStorage.setItem('notificationsReadTime', currentTime);
  };
  
  // تحديث الإشعارات عند فتح القائمة
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // تحديث الإشعارات عند فتح القائمة
      fetchNotifications();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {!isMarkedAsRead && unreadCount > 0 && (
            <Badge 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]",
                "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>{t('notifications.title')}</span>
            {isMarkedAsRead && notifications.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-green-50 border-green-300 text-green-700">
                ✓ {language === 'ar' ? 'مقروء' : 'Read'}
              </Badge>
            )}
          </div>
          {!isMarkedAsRead && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllAsRead}
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-2">
              {notifications.map((notification) => {
                const Icon = getTypeIcon(notification.type);
                const isOverdue = notification.daysRemaining !== undefined && notification.daysRemaining < 0;
                
                return (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block p-3 rounded-lg border-2 transition-all hover:shadow-md",
                      notification.severity === 'urgent' && "border-red-300 bg-red-50 hover:bg-red-100",
                      notification.severity === 'warning' && "border-yellow-300 bg-yellow-50 hover:bg-yellow-100",
                      notification.severity === 'info' && "border-blue-300 bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full shrink-0",
                        notification.severity === 'urgent' && "bg-red-200 text-red-700",
                        notification.severity === 'warning' && "bg-yellow-200 text-yellow-700",
                        notification.severity === 'info' && "bg-blue-200 text-blue-700"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-gray-900">
                            {notification.title}
                            {notification.type === 'cheque' && notification.chequeNumber && (
                              <span className="text-xs font-normal text-gray-500 ml-1">
                                ({language === 'ar' ? 'رقم: ' : 'No: '}{notification.chequeNumber})
                              </span>
                            )}
                          </p>
                          {notification.severity === 'urgent' && (
                            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 animate-pulse" />
                          )}
                        </div>
                        
                        {/* عرض الاسم التجاري ونوع العقار والمنطقة للعقود التجارية */}
                        {notification.type === 'contract' && notification.propertyType === 'commercial' && notification.tradeName ? (
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className="text-[11px] px-2.5 py-1 font-bold bg-purple-50 border-purple-300 text-purple-700"
                              >
                                <Building className="h-3 w-3 mr-1" />
                                {notification.tradeName}
                              </Badge>
                              
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-2 py-0.5 font-semibold bg-orange-50 border-orange-300 text-orange-700"
                              >
                                {language === 'ar' ? 'تجاري' : 'Commercial'}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600">
                              {notification.description}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            
                            {/* عرض المبلغ والاسم في سطر واحد للشيكات */}
                            {notification.type === 'cheque' && notification.amount && (notification.tenantName || notification.tradeName) ? (
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs px-2.5 py-1 font-bold",
                                    notification.severity === 'urgent' && "bg-red-50 border-red-400 text-red-700",
                                    notification.severity === 'warning' && "bg-green-50 border-green-400 text-green-700"
                                  )}
                                >
                                  <Banknote className="h-3 w-3 mr-1" />
                                  {notification.amount} {language === 'ar' ? 'درهم' : 'AED'}
                                </Badge>
                                
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[10px] px-2 py-0.5 font-semibold",
                                    notification.propertyType === 'residential' && "bg-blue-50 border-blue-300 text-blue-700",
                                    notification.propertyType === 'commercial' && "bg-purple-50 border-purple-300 text-purple-700"
                                  )}
                                >
                                  {notification.propertyType === 'residential' && (
                                    <User className="h-3 w-3 mr-1" />
                                  )}
                                  {notification.propertyType === 'commercial' && (
                                    <Building className="h-3 w-3 mr-1" />
                                  )}
                                  {notification.tenantName || notification.tradeName}
                                </Badge>
                              </div>
                            ) : (
                              <>
                                {/* عرض المبلغ للمدفوعات */}
                                {notification.amount && (
                                  <div className="mt-2">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs px-2.5 py-1 font-bold",
                                        notification.severity === 'urgent' && "bg-red-50 border-red-400 text-red-700",
                                        notification.severity === 'warning' && "bg-green-50 border-green-400 text-green-700"
                                      )}
                                    >
                                      <Banknote className="h-3 w-3 mr-1" />
                                      {notification.amount} {language === 'ar' ? 'درهم' : 'AED'}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* عرض اسم المستأجر أو الاسم التجاري */}
                                {(notification.tenantName || notification.tradeName) && (
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[10px] px-2 py-0.5 font-semibold",
                                        notification.propertyType === 'residential' && "bg-blue-50 border-blue-300 text-blue-700",
                                        notification.propertyType === 'commercial' && "bg-purple-50 border-purple-300 text-purple-700"
                                      )}
                                    >
                                      {notification.propertyType === 'residential' && (
                                        <User className="h-3 w-3 mr-1" />
                                      )}
                                      {notification.propertyType === 'commercial' && (
                                        <Building className="h-3 w-3 mr-1" />
                                      )}
                                      {notification.tenantName || notification.tradeName}
                                    </Badge>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-2 py-0.5",
                              notification.severity === 'urgent' && "border-red-400 text-red-700 bg-red-50",
                              notification.severity === 'warning' && "border-yellow-400 text-yellow-700 bg-yellow-50"
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDaysRemaining(notification.daysRemaining)}
                          </Badge>
                          
                          <span className="text-[10px] text-gray-500">
                            {format(notification.date, 'dd/MM/yyyy', { locale })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {t('notifications.noNotifications')}
            </p>
            <p className="text-xs mt-1">
              {t('notifications.willAppearHere')}
            </p>
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link 
                href="/dashboard/calendar"
                onClick={() => setIsOpen(false)}
                className="block w-full"
              >
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                  <CalendarIcon className={cn("h-3 w-3", language === 'ar' ? 'ml-2' : 'mr-2')} />
                  {t('notifications.viewAll')}
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

