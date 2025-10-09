import { getEmployeeFromSession } from '@/lib/auth';
import { getPurchaseRequests, getProperties } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import PurchaseRequestsClient from '@/components/purchase-requests-client';

export const dynamic = 'force-dynamic';

export default async function PurchaseRequestsPage() {
    const loggedInEmployee = await getEmployeeFromSession();

    if (!hasPermission(loggedInEmployee, 'expenses:create')) {
        redirect('/dashboard');
    }

    const canApprove = hasPermission(loggedInEmployee, 'expenses:approve');
    
    // Get all purchase requests or only employee's requests
    const purchaseRequests = await getPurchaseRequests(
        canApprove ? {} : { employeeId: loggedInEmployee!.id }
    );
    
    const properties = await getProperties();

    return (
        <PurchaseRequestsClient
            loggedInEmployee={loggedInEmployee}
            initialPurchaseRequests={purchaseRequests}
            properties={properties}
            canApprove={canApprove}
        />
    );
}

