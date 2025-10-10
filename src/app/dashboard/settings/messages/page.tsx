import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MessagesClient from './_components/messages-client';

export default async function MessagesPage() {
  const employee = await getEmployeeFromSession();

  if (!employee) {
    redirect('/login');
  }

  return <MessagesClient employee={employee} />;
}

