import { createEvents, EventAttributes } from 'ics';
import type { CalendarEvent } from './types';

// دالة لتحويل أحداث التقويم إلى صيغة .ics
export function exportCalendarToICS(events: CalendarEvent[]): string | null {
  try {
    const icsEvents: EventAttributes[] = events.map((event) => {
      // التعامل مع Date أو string
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      
      return {
        start: [
          eventDate.getFullYear(),
          eventDate.getMonth() + 1,
          eventDate.getDate(),
          eventDate.getHours(),
          eventDate.getMinutes(),
        ] as [number, number, number, number, number],
        duration: { hours: 1, minutes: 0 },
        title: event.title,
        description: event.details || '',
        location: 'أم القيوين، الإمارات',
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'نظام إدارة العقارات - UAQ907', email: 'no-reply@uaq907.com' },
        uid: `${event.id}@uaq907.com`,
      };
    });

    const { error, value } = createEvents(icsEvents);

    if (error) {
      console.error('Error creating ICS file:', error);
      return null;
    }

    return value || null;
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return null;
  }
}

// دالة لتحويل حدث واحد إلى .ics
export function exportSingleEventToICS(event: CalendarEvent): string | null {
  return exportCalendarToICS([event]);
}


