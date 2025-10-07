import { AppHeader } from '@/components/layout/header';
import { getEmployeeFromSession } from '@/lib/auth';
import { getEvictionRequests, getTenants } from '@/lib/db';
import EvictionPageClient from './eviction-client';

export const dynamic = 'force-dynamic';

export default async function EvictionPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  // Fetch real data from database
  const evictionRequests = await getEvictionRequests();
  const tenants = await getTenants();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <EvictionPageClient 
        loggedInEmployee={loggedInEmployee} 
        initialEvictionRequests={evictionRequests}
        tenants={tenants}
      />
    </div>
  );
}
