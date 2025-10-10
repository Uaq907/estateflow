import { AppHeader } from '@/components/layout/header';
import { getEmployeeFromSession } from '@/lib/auth';
import PetitionTemplatesClient from './petition-templates-client';

export default async function PetitionTemplatesPage() {
  const loggedInEmployee = await getEmployeeFromSession();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-6">
        <PetitionTemplatesClient loggedInEmployee={loggedInEmployee} />
      </main>
    </div>
  );
}
