import { AppHeader } from '@/components/layout/header';
import { getEmployeeFromSession } from '@/lib/auth';
import IncreasePageClient from './increase-client';

export default async function IncreasePage() {
  const loggedInEmployee = await getEmployeeFromSession();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <IncreasePageClient loggedInEmployee={loggedInEmployee} />
    </div>
  );
}