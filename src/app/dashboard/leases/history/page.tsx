import { getEmployeeFromSession } from '@/lib/auth';
import { getCompletedLeasesHistory } from '@/lib/db';
import { redirect } from 'next/navigation';
import LeaseHistoryClient from '@/components/lease-history-client';

export default async function LeaseHistoryPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!loggedInEmployee) {
    redirect('/login');
  }

  let leaseHistory = [];
  try {
    leaseHistory = await getCompletedLeasesHistory();
  } catch (error) {
    console.error('Error fetching lease history:', error);
  }

  return <LeaseHistoryClient leaseHistory={leaseHistory} loggedInEmployee={loggedInEmployee} />;
}

