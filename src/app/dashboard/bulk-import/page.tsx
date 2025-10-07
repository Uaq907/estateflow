
import { getEmployeeFromSession } from '@/lib/auth';
import BulkImportClient from '@/components/bulk-import-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BulkImportPage() {
    const loggedInEmployee = await getEmployeeFromSession();

    if (!hasPermission(loggedInEmployee, 'bulk-import:execute')) {
        redirect('/dashboard');
    }

    return <BulkImportClient loggedInEmployee={loggedInEmployee} />;
}
