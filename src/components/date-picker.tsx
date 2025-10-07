
'use client';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button, buttonVariants } from './ui/button';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function DatePicker({ name, required, placeholder, value, onSelect, className }: { name: string, required?: boolean, placeholder?: string, value?: Date, onSelect: (date?: Date) => void, className?: string }) {
    
    const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect(undefined);
    }

    return (
        <Popover>
            <input type="hidden" name={name} value={value ? format(value, 'yyyy-MM-dd', { locale: enUS }) : ''} required={required} />
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    lang="en"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "dd/MM/yy", { locale: enUS }) : <span>{placeholder || 'Pick a date'}</span>}
                     {value && (
                        <div
                            role="button"
                            aria-label="Clear date"
                            onClick={handleClear}
                            className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "h-6 w-6 ml-auto"
                            )}
                        >
                            <X className="h-4 w-4" />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
