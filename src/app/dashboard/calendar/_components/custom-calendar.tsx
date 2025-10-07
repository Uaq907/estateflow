
'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { CalendarEvent } from '@/lib/types';
import { format, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomCalendarProps {
    date: Date;
    setDate: (date: Date) => void;
    eventsByDay: Record<string, CalendarEvent[]>;
    eventTypeConfig: Record<string, { icon: React.ElementType, color: string }>;
}

export function CustomCalendar({ date, setDate, eventsByDay, eventTypeConfig }: CustomCalendarProps) {

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setDate(new Date(date.getFullYear(), date.getMonth() + (direction === 'next' ? 1 : -1), 1));
    };

    return (
        <div className="rounded-md border">
            <div className="flex justify-between items-center p-4">
                <h3 className="text-xl font-semibold">{format(date, 'MMMM yyyy')}</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>Today</Button>
                    <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                month={date}
                onMonthChange={setDate}
                className="p-0 w-full"
                classNames={{
                    months: 'm-0',
                    month: 'p-0',
                    table: 'w-full border-collapse',
                    head_row: 'flex border-b',
                    head_cell: 'w-full text-muted-foreground font-normal text-sm justify-center flex p-2',
                    row: 'flex w-full mt-0',
                    cell: 'w-full h-24 border text-center text-sm p-0 relative',
                    day: 'w-full h-full p-2 flex flex-col items-start justify-start font-normal',
                    day_selected: 'bg-primary/10 text-primary-foreground',
                }}
                components={{
                    DayContent: ({ date: dayDate }) => {
                        const dayKey = format(dayDate, 'yyyy-MM-dd');
                        const dayEvents = eventsByDay[dayKey] || [];
                        const isCurrentMonth = isSameMonth(dayDate, date);
                        const isTodaysDate = isToday(dayDate);
                        
                        return (
                            <div className={cn(
                                "flex flex-col items-start w-full h-full",
                                !isCurrentMonth && 'opacity-50'
                            )}>
                                <p className={cn(
                                    "mb-1",
                                    isTodaysDate && 'bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center font-bold'
                                )}>{format(dayDate, 'd')}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {dayEvents.slice(0, 3).map(event => {
                                        const config = eventTypeConfig[event.type];
                                        return <div key={event.id} title={event.title} className={cn("h-2 w-2 rounded-full", config.color)} />;
                                    })}
                                    {dayEvents.length > 3 && (
                                        <div className="text-xs text-muted-foreground font-bold">+ {dayEvents.length - 3}</div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                }}
            />
        </div>
    );
}
