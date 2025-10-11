
'use client';

import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { CalendarEvent, Employee } from '@/lib/types';
import { format, isToday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { FileSignature, Banknote, Wrench, WalletCards, ChevronLeft, ChevronRight, Receipt, Calendar, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { CustomCalendar } from './custom-calendar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

const eventTypeConfig = {
    lease: { icon: FileSignature, color: 'bg-blue-500' },
    payment: { icon: Banknote, color: 'bg-green-500' },
    maintenance: { icon: Wrench, color: 'bg-yellow-500' },
    cheque: { icon: WalletCards, color: 'bg-purple-500' },
    expense: { icon: Receipt, color: 'bg-orange-500' },
};

export default function CalendarClient({
    initialEvents,
    loggedInEmployee,
}: {
    initialEvents: CalendarEvent[];
    loggedInEmployee: Employee | null;
}) {
    const { t, language } = useLanguage();
    const locale = language === 'ar' ? ar : enUS;
    const [date, setDate] = useState<Date>(new Date());
    
    // تفضيلات عرض الأحداث
    const [eventVisibility, setEventVisibility] = useState(() => {
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
            console.error('Error parsing calendar visibility:', e);
            return {
                lease: true,
                payment: true,
                maintenance: true,
                cheque: true
            };
        }
    });
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>(() => {
        if (typeof window === 'undefined') return 'monthly';
        const saved = localStorage.getItem('calendarViewMode');
        return (saved === 'yearly' || saved === 'monthly') ? saved : 'monthly';
    });
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [hasSelectedDate, setHasSelectedDate] = useState(false); // تتبع إذا تم اختيار تاريخ
    
    // حفظ viewMode في localStorage عند تغييره
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('calendarViewMode', viewMode);
        }
    }, [viewMode]);

    // الاستماع لتغييرات تفضيلات عرض الأحداث
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('calendarEventVisibility');
                if (saved && saved !== '') {
                    try {
                        setEventVisibility(JSON.parse(saved));
                    } catch (e) {
                        console.error('Error parsing calendar visibility on change:', e);
                    }
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('calendarEventVisibilityChanged', handleVisibilityChange);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('calendarEventVisibilityChanged', handleVisibilityChange);
            }
        };
    }, []);
    
    // فلترة الأحداث حسب التفضيلات
    const filteredEvents = useMemo(() => {
        return initialEvents.filter(event => eventVisibility[event.type] !== false);
    }, [initialEvents, eventVisibility]);
    
    const eventsByDay = useMemo(() => {
        return filteredEvents.reduce((acc, event) => {
            const day = format(event.date, 'yyyy-MM-dd');
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [filteredEvents]);

    const selectedDay = format(date, 'yyyy-MM-dd');
    const selectedDayEvents = hasSelectedDate ? (eventsByDay[selectedDay] || []) : [];

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{t('calendar.title')}</CardTitle>
                                <CardDescription>
                                    {t('calendar.description')}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2" suppressHydrationWarning>
                                <Button
                                    variant={viewMode === 'monthly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('monthly')}
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    {t('calendar.monthly')}
                                </Button>
                                <Button
                                    variant={viewMode === 'yearly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('yearly')}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {t('calendar.yearly')}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={viewMode === 'monthly' ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""} suppressHydrationWarning>
                        {viewMode === 'monthly' ? (
                            <>
                                <div className="lg:col-span-2">
                                    <CustomCalendar
                                        date={date}
                                        setDate={(newDate: Date) => {
                                            setDate(newDate);
                                            setHasSelectedDate(true);
                                        }}
                                        eventsByDay={eventsByDay}
                                        eventTypeConfig={eventTypeConfig}
                                    />
                                </div>

                                <div className="lg:col-span-1 space-y-4">
                                    <h3 className="text-xl font-semibold">{t('calendar.eventsFor')} {format(date, 'do MMMM yyyy', { locale })}</h3>
                                    <Separator />
                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-4">
                                            {selectedDayEvents.length > 0 ? (
                                                selectedDayEvents.map(event => {
                                                    const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                                                    if (!config) return null;
                                                    const Icon = config.icon;
                                                    return (
                                                        <Link 
                                                            href={event.link} 
                                                            key={event.id} 
                                                            className="block hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className={`p-2 rounded-full text-primary-foreground ${config.color}`}>
                                                                    <Icon className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm">
                                                                        {event.title === 'Lease Start' ? t('calendar.leaseStart') :
                                                                         event.title === 'Lease End' ? t('calendar.leaseEnd') :
                                                                         event.title === 'Payment Due' ? t('calendar.paymentDue') :
                                                                         event.title === 'Contract Expiry' ? t('calendar.contractExpiry') :
                                                                         event.title === 'Cheque Due' ? t('calendar.chequeDue') :
                                                                         event.title === 'Expense Submitted' ? t('calendar.expenseSubmitted') :
                                                                         event.title}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{event.details}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                                            {t(`calendar.event.${event.type}`)}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {format(new Date(event.date), 'HH:mm')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )
                                                })
                                            ) : (
                                                <div className="text-center text-muted-foreground pt-10">
                                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    {hasSelectedDate ? (
                                                        <>
                                                            <p className="text-lg font-medium">{t('calendar.noEvents')}</p>
                                                            <p className="text-sm">{t('calendar.selectDate')}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-lg font-medium">{t('calendar.selectDateToView')}</p>
                                                            <p className="text-sm">{t('calendar.clickOnDate')}</p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                                <div className="lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold">{date.getFullYear()}</h3>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
                                                setDate(new Date(date.getFullYear() - 1, 0, 1));
                                                setSelectedMonth(null);
                                                setHasSelectedDate(false);
                                            }}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                <Button variant="outline" size="sm" className="h-9 text-sm" onClick={() => {
                                    const today = new Date();
                                    setDate(today);
                                    setSelectedMonth(today.getMonth());
                                    setHasSelectedDate(true);
                                }}>{t('calendar.today')}</Button>
                                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
                                                setDate(new Date(date.getFullYear() + 1, 0, 1));
                                                setSelectedMonth(null);
                                                setHasSelectedDate(false);
                                            }}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const monthDate = new Date(date.getFullYear(), i, 1);
                                            const monthKey = format(monthDate, 'yyyy-MM');
                                            const daysInMonth = new Date(date.getFullYear(), i + 1, 0).getDate();
                                            const firstDayOfMonth = new Date(date.getFullYear(), i, 1).getDay();
                                            const monthEvents = Object.keys(eventsByDay).filter(day => day.startsWith(monthKey));
                                            const isCurrentMonth = date.getMonth() === i && hasSelectedDate;
                                            
                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "border rounded-lg p-4 bg-card",
                                                        isCurrentMonth && "ring-2 ring-primary/50 bg-primary/5 border-primary/30"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-base">{format(monthDate, 'MMM', { locale })}</h4>
                                                        {monthEvents.length > 0 && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                                                {monthEvents.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Days header */}
                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                            <div key={idx} className="text-center text-[9px] font-semibold text-muted-foreground">
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Days grid */}
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {/* Empty cells */}
                                                        {Array.from({ length: firstDayOfMonth }, (_, idx) => (
                                                            <div key={`empty-${idx}`} className="aspect-square"></div>
                                                        ))}
                                                        
                                                        {/* Days */}
                                                        {Array.from({ length: daysInMonth }, (_, dayIdx) => {
                                                            const dayNum = dayIdx + 1;
                                                            const dayDate = new Date(date.getFullYear(), i, dayNum);
                                                            const dayKey = format(dayDate, 'yyyy-MM-dd');
                                                            const hasEvents = eventsByDay[dayKey] && eventsByDay[dayKey].length > 0;
                                                            const isCurrentDay = isToday(dayDate);
                                                            const isSelectedDay = format(date, 'yyyy-MM-dd') === dayKey && hasSelectedDate;
                                                            
                                                            return (
                                                                <div
                                                                    key={dayNum}
                                                                    className={cn(
                                                                        "aspect-square flex items-center justify-center text-[10px] rounded relative cursor-pointer hover:bg-primary/10 transition-colors",
                                                                        isCurrentDay && "bg-primary text-primary-foreground font-bold",
                                                                        isSelectedDay && "ring-1 ring-primary bg-primary/20 font-bold",
                                                                        hasEvents && !isCurrentDay && !isSelectedDay && "font-semibold text-primary"
                                                                    )}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDate(dayDate);
                                                                        setHasSelectedDate(true);
                                                                    }}
                                                                >
                                                                    {dayNum}
                                                                    {hasEvents && (
                                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="sticky top-24">
                                        <h3 className="text-xl font-semibold mb-4">
                                            {t('calendar.eventsFor')} {format(date, 'do MMMM yyyy', { locale })}
                                        </h3>
                                        <Separator className="mb-4" />
                                        <ScrollArea className="h-[500px]">
                                            <div className="space-y-3 pr-4">
                                                {(() => {
                                                    // عدم عرض أي أحداث إذا لم يتم اختيار يوم
                                                    if (!hasSelectedDate) {
                                                        return (
                                                            <div className="text-center text-muted-foreground pt-10">
                                                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                                <p className="text-lg font-medium">{t('calendar.selectDateToView')}</p>
                                                                <p className="text-sm">{t('calendar.clickOnDate')}</p>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    const selectedDayKey = format(date, 'yyyy-MM-dd');
                                                    const filteredEvents = eventsByDay[selectedDayKey] || [];

                                                    if (filteredEvents.length === 0) {
                                                        return (
                                                            <div className="text-center text-muted-foreground pt-10">
                                                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                                <p className="text-base font-medium">{t('calendar.noEvents')}</p>
                                                                <p className="text-sm">{t('calendar.selectDate')}</p>
                                                            </div>
                                                        );
                                                    }

                                                    return filteredEvents.map(event => {
                                                        const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                                                        if (!config) return null;
                                                        const Icon = config.icon;
                                                        return (
                                                            <Link 
                                                                href={event.link} 
                                                                key={event.id} 
                                                                className="block hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`p-2 rounded-full text-primary-foreground ${config.color} shrink-0`}>
                                                                        <Icon className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">
                                                                            {event.title === 'Lease Start' ? t('calendar.leaseStart') :
                                                                             event.title === 'Lease End' ? t('calendar.leaseEnd') :
                                                                             event.title === 'Payment Due' ? t('calendar.paymentDue') :
                                                                             event.title === 'Contract Expiry' ? t('calendar.contractExpiry') :
                                                                             event.title === 'Cheque Due' ? t('calendar.chequeDue') :
                                                                             event.title === 'Expense Submitted' ? t('calendar.expenseSubmitted') :
                                                                             event.title}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {format(new Date(event.date), 'do MMM yyyy', { locale })}
                                                                        </p>
                                                                        {event.details && (
                                                                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                                                                                {event.details}
                                                                            </p>
                                                                        )}
                                                                        <span className="inline-block text-xs px-2 py-1 bg-primary/10 text-primary rounded-full mt-2">
                                                                            {t(`calendar.event.${event.type}`)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
