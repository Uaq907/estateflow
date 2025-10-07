
import { getEmployeeFromSession } from '@/lib/auth';
import { getLeasesWithDetails } from '@/lib/db';
import LeaseManagementClient from '@/components/lease-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import type { LeaseWithDetails } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LeasesPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!hasPermission(loggedInEmployee, 'leases:read')) {
    redirect('/dashboard');
  }

  let allLeases: LeaseWithDetails[] = [];
  let errorMessage: string | null = null;
  try {
    allLeases = await getLeasesWithDetails();
  } catch (error: any) {
    // Capture the error message to display it on the page
    errorMessage = error.message || "An unknown error occurred while fetching leases.";
    console.error("Error fetching leases for /dashboard/leases:", error);
  }

  return (
    <LeaseManagementClient
      initialLeases={allLeases}
      loggedInEmployee={loggedInEmployee}
      error={errorMessage}
    />
  );
}
