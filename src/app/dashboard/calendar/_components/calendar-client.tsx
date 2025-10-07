
'use client';

import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { CalendarEvent, Employee } from '@/lib/types';
import { format, isToday } from 'date-fns';
import { FileSignature, Banknote, Wrench, WalletCards, ChevronLeft, ChevronRight, Receipt, Calendar, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { CustomCalendar } from './custom-calendar';
import { cn } from '@/lib/utils';

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
    const [date, setDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    
    const eventsByDay = useMemo(() => {
        return initialEvents.reduce((acc, event) => {
            const day = format(event.date, 'yyyy-MM-dd');
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [initialEvents]);

    const selectedDay = format(date, 'yyyy-MM-dd');
    const selectedDayEvents = eventsByDay[selectedDay] || [];

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
                                <CardTitle>Portfolio Calendar</CardTitle>
                                <CardDescription>
                                    A comprehensive overview of all important dates and deadlines.
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'monthly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('monthly')}
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    Monthly
                                </Button>
                                <Button
                                    variant={viewMode === 'yearly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('yearly')}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Yearly
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={viewMode === 'monthly' ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
                        {viewMode === 'monthly' ? (
                            <>
                                <div className="lg:col-span-2">
                                    <CustomCalendar
                                        date={date}
                                        setDate={setDate}
                                        eventsByDay={eventsByDay}
                                        eventTypeConfig={eventTypeConfig}
                                    />
                                </div>

                                <div className="lg:col-span-1 space-y-4">
                                    <h3 className="text-xl font-semibold">Events for {format(date, 'do MMMM yyyy')}</h3>
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
                                                            className="block hover:bg-muted/50 rounded-lg border p-4 transition-colors hover:shadow-md"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className={`p-2 rounded-full text-primary-foreground ${config.color}`}>
                                                                    <Icon className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm">{event.title}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                                            {event.type}
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
                                                    <p className="text-lg font-medium">No events for this day</p>
                                                    <p className="text-sm">Select a different date to view events</p>
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
                                            <Button variant="outline" size="icon" onClick={() => {
                                                setDate(new Date(date.getFullYear() - 1, 0, 1));
                                                setSelectedMonth(null);
                                            }}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setDate(new Date());
                                                setSelectedMonth(new Date().getMonth());
                                            }}>Today</Button>
                                            <Button variant="outline" size="icon" onClick={() => {
                                                setDate(new Date(date.getFullYear() + 1, 0, 1));
                                                setSelectedMonth(null);
                                            }}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const monthDate = new Date(date.getFullYear(), i, 1);
                                            const monthKey = format(monthDate, 'yyyy-MM');
                                            const daysInMonth = new Date(date.getFullYear(), i + 1, 0).getDate();
                                            const firstDayOfMonth = new Date(date.getFullYear(), i, 1).getDay();
                                            const monthEvents = Object.keys(eventsByDay).filter(day => day.startsWith(monthKey));
                                            const isSelected = selectedMonth === i;
                                            
                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "border rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer bg-card",
                                                        isSelected && "ring-2 ring-primary shadow-lg"
                                                    )}
                                                    onClick={() => setSelectedMonth(i)}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-base">{format(monthDate, 'MMM')}</h4>
                                                        {monthEvents.length > 0 && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                                {monthEvents.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Days header */}
                                                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                                            <div key={idx} className="text-center text-[9px] font-semibold text-muted-foreground">
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Days grid */}
                                                    <div className="grid grid-cols-7 gap-0.5">
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
                                                            
                                                            return (
                                                                <div
                                                                    key={dayNum}
                                                                    className={cn(
                                                                        "aspect-square flex items-center justify-center text-[10px] rounded relative",
                                                                        isCurrentDay && "bg-primary text-primary-foreground font-bold",
                                                                        hasEvents && !isCurrentDay && "font-semibold text-primary"
                                                                    )}
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
                                            {selectedMonth !== null 
                                                ? `${format(new Date(date.getFullYear(), selectedMonth, 1), 'MMMM yyyy')} Events`
                                                : `${date.getFullYear()} Events`
                                            }
                                        </h3>
                                        <Separator className="mb-4" />
                                        <ScrollArea className="h-[calc(100vh-200px)]">
                                            <div className="space-y-3 pr-4">
                                                {(() => {
                                                    const filteredEvents = selectedMonth !== null
                                                        ? initialEvents.filter(event => {
                                                            const eventDate = new Date(event.date);
                                                            return eventDate.getFullYear() === date.getFullYear() && 
                                                                   eventDate.getMonth() === selectedMonth;
                                                        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                                        : initialEvents.filter(event => {
                                                            return new Date(event.date).getFullYear() === date.getFullYear();
                                                        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                                                    if (filteredEvents.length === 0) {
                                                        return (
                                                            <div className="text-center text-muted-foreground pt-10">
                                                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                                <p className="text-base font-medium">No events</p>
                                                                <p className="text-sm">
                                                                    {selectedMonth !== null 
                                                                        ? 'No events for this month'
                                                                        : 'No events for this year'
                                                                    }
                                                                </p>
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
                                                                className="block hover:bg-muted/50 rounded-lg border p-3 transition-colors hover:shadow-md"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`p-2 rounded-full text-primary-foreground ${config.color} shrink-0`}>
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">{event.title}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            {format(new Date(event.date), 'do MMM yyyy')}
                                                                        </p>
                                                                        {event.details && (
                                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                                {event.details}
                                                                            </p>
                                                                        )}
                                                                        <span className="inline-block text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-2">
                                                                            {event.type}
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
