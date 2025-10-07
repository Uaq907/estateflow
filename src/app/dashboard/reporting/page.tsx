
import { getEmployeeFromSession } from '@/lib/auth';
import ReportingClient from '@/components/reporting-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getLeasesWithDetails, getProperties, getUnitsForProperty, getTenants, getExpenses, getCheques } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ReportingPage() {
    const loggedInEmployee = await getEmployeeFromSession();

    if (!hasPermission(loggedInEmployee, 'reporting:execute')) {
        redirect('/dashboard');
    }

    const reportData = {
        getProperties,
        getUnitsForProperty,
        getTenants,
        getLeasesWithDetails,
        getExpenses,
        getCheques
    };

    return <ReportingClient loggedInEmployee={loggedInEmployee} />;
}
