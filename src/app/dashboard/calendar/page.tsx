
import { getEmployeeFromSession } from '@/lib/auth';
import { getCalendarEvents } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import CalendarClient from './_components/calendar-client';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'dashboard:view-calendar')) {
    redirect('/dashboard');
  }

  // Check if this is demo admin (no database needed)
  let events: any[] = [];
  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide empty events for demo
    events = [];
  } else {
    events = await getCalendarEvents();
  }

  return (
    <CalendarClient
      initialEvents={events}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
