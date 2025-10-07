
import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserPreferencesClient from './_components/user-preferences-client';

export const dynamic = 'force-dynamic';

export default async function UserPreferencesPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!loggedInEmployee) {
    redirect('/login');
  }

  return (
    <UserPreferencesClient
      loggedInEmployee={loggedInEmployee}
    />
  );
}

