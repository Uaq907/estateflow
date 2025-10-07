
import { getEmployeeFromSession } from '@/lib/auth';
import { getActivities } from '@/lib/db';
import LogAnalyzerClient from '@/components/log-analyzer-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LogAnalyzerPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  // Temporarily comment out permission check to test
  // if (!hasPermission(loggedInEmployee, 'settings:view-logs')) {
  //   redirect('/dashboard');
  // }

  try {
    const logs = await getActivities();
    console.log('Logs loaded:', logs.length);

    return (
      <LogAnalyzerClient
        initialLogs={logs}
        loggedInEmployee={loggedInEmployee}
      />
    );
  } catch (error) {
    console.error('Error loading logs:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Log Analyzer</h1>
        <p className="text-red-600">Error loading logs: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
