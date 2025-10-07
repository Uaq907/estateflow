import { AppHeader } from '@/components/layout/header';
import { getEmployeeFromSession } from '@/lib/auth';
import EnforcementPageClient from './enforcement-client';

export default async function EnforcementPage() {
  const loggedInEmployee = await getEmployeeFromSession();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <EnforcementPageClient loggedInEmployee={loggedInEmployee} />
    </div>
  );
}
