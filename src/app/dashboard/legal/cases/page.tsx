import { getEmployeeFromSession } from '@/lib/auth';
import { AppHeader } from '@/components/layout/header';
import { CasesPageClient } from './cases-client';

export default async function CasesPage() {
  const loggedInEmployee = await getEmployeeFromSession();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <CasesPageClient />
    </div>
  );
}