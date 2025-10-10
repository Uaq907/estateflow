import { getEmployeeFromSession } from '@/lib/auth';
import { getEmployees } from '@/lib/db';
import { redirect } from 'next/navigation';
import MessagesClient from './_components/messages-client';

export default async function MessagesPage() {
  const employee = await getEmployeeFromSession();

  if (!employee) {
    redirect('/login');
  }

  // جلب جميع الموظفين لقائمة المرسل إليهم
  const allEmployees = await getEmployees();

  return <MessagesClient employee={employee} allEmployees={allEmployees} />;
}

