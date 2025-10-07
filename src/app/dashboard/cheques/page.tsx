
import { getEmployeeFromSession } from '@/lib/auth';
import { getCheques, getPayees, getTenants, getBanks, getLeases } from '@/lib/db';
import ChequeManagementClient from '@/components/cheque-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function ChequeManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!loggedInEmployee || (!hasPermission(loggedInEmployee, 'cheques:read') && !hasPermission(loggedInEmployee, 'cheques:create'))) {
    redirect('/dashboard');
  }

  const canViewAll = hasPermission(loggedInEmployee, 'cheques:read');

  // Check if this is demo admin (no database needed)
  let allCheques = [];
  let allPayees = [];
  let allTenants = [];
  let allBanks = [];
  let businessNames = [];

  if (loggedInEmployee?.id === 'demo-admin') {
    // Provide demo data (1000 cheques with different statuses)
    const demoData = getFullDemoData(50);
    allCheques = demoData.cheques as any[];
    
    // Generate demo payees
    allPayees = [
      { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+971501111111', type: 'Individual' },
      { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', phone: '+971502222222', type: 'Individual' },
      { id: '3', name: 'خالد أحمد', email: 'khalid@example.com', phone: '+971503333333', type: 'Individual' },
      { id: '4', name: 'نور الدين', email: 'nour@example.com', phone: '+971504444444', type: 'Individual' },
      { id: '5', name: 'مريم حسن', email: 'mariam@example.com', phone: '+971505555555', type: 'Individual' },
      { id: '6', name: 'عبدالله سالم', email: 'abdullah@example.com', phone: '+971506666666', type: 'Individual' },
      { id: '7', name: 'عائشة محمد', email: 'aisha@example.com', phone: '+971507777777', type: 'Individual' },
      { id: '8', name: 'يوسف أحمد', email: 'youssef@example.com', phone: '+971508888888', type: 'Individual' },
      { id: '9', name: 'زينب علي', email: 'zainab@example.com', phone: '+971509999999', type: 'Individual' },
      { id: '10', name: 'محمد حسن', email: 'mohammed@example.com', phone: '+971500000000', type: 'Individual' }
    ] as any[];
    
    allTenants = demoData.tenants as any[];
    
    // Extract business names from leases
    businessNames = demoData.leases
      .filter((lease: any) => lease.businessName)
      .map((lease: any) => ({
        id: lease.id,
        name: lease.businessName,
        tenantId: lease.tenantId,
        tenantName: lease.tenantName
      }));
    
    // Generate demo banks
    allBanks = [
      { id: '1', name: 'Emirates NBD', code: 'EBILAEAD', swift: 'EBILAEADXXX', address: 'Sheikh Zayed Road, Dubai', phone: '+971444444444' },
      { id: '2', name: 'ADCB', code: 'ADCBAEAA', swift: 'ADCBAEAAXXX', address: 'Al Markaziyah, Abu Dhabi', phone: '+971244444444' },
      { id: '3', name: 'FAB', code: 'FABLAEAD', swift: 'FABLAEADXXX', address: 'Corniche Road, Abu Dhabi', phone: '+971244444444' },
      { id: '4', name: 'Mashreq Bank', code: 'MSHQAEAD', swift: 'MSHQAEADXXX', address: 'Sheikh Zayed Road, Dubai', phone: '+971444444444' },
      { id: '5', name: 'RAKBANK', code: 'RAKBAEAD', swift: 'RAKBAEADXXX', address: 'Ras Al Khaimah', phone: '+971744444444' },
      { id: '6', name: 'Dubai Islamic Bank', code: 'DUIBAEAD', swift: 'DUIBAEADXXX', address: 'Dubai', phone: '+971444444444' },
      { id: '7', name: 'ADIB', code: 'ADIBAEAD', swift: 'ADIBAEADXXX', address: 'Abu Dhabi', phone: '+971244444444' }
    ] as any[];
  } else {
    try {
      allCheques = await getCheques({ createdById: canViewAll ? undefined : loggedInEmployee.id });
      allPayees = await getPayees();
      allTenants = await getTenants();
      allBanks = await getBanks();
      
      // Get leases to extract business names
      const leases = await getLeases();
      businessNames = leases
        .filter((lease: any) => lease.businessName)
        .map((lease: any) => ({
          id: lease.id,
          name: lease.businessName,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName
        }));
    } catch (error) {
      console.error('Error fetching cheque data:', error);
      // Fallback to demo data if database fails
      const demoData = getFullDemoData(50);
      allCheques = demoData.cheques as any[];
      
      allPayees = [
        { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+971501111111', type: 'Individual' },
        { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', phone: '+971502222222', type: 'Individual' },
        { id: '3', name: 'خالد أحمد', email: 'khalid@example.com', phone: '+971503333333', type: 'Individual' },
        { id: '4', name: 'نور الدين', email: 'nour@example.com', phone: '+971504444444', type: 'Individual' },
        { id: '5', name: 'مريم حسن', email: 'mariam@example.com', phone: '+971505555555', type: 'Individual' },
        { id: '6', name: 'عبدالله سالم', email: 'abdullah@example.com', phone: '+971506666666', type: 'Individual' },
        { id: '7', name: 'عائشة محمد', email: 'aisha@example.com', phone: '+971507777777', type: 'Individual' },
        { id: '8', name: 'يوسف أحمد', email: 'youssef@example.com', phone: '+971508888888', type: 'Individual' },
        { id: '9', name: 'زينب علي', email: 'zainab@example.com', phone: '+971509999999', type: 'Individual' },
        { id: '10', name: 'محمد حسن', email: 'mohammed@example.com', phone: '+971500000000', type: 'Individual' }
      ] as any[];
      
      allTenants = demoData.tenants as any[];
      
      // Extract business names from demo leases
      businessNames = demoData.leases
        .filter((lease: any) => lease.businessName)
        .map((lease: any) => ({
          id: lease.id,
          name: lease.businessName,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName
        }));
      
      allBanks = [
        { id: '1', name: 'Emirates NBD', code: 'EBILAEAD', swift: 'EBILAEADXXX', address: 'Sheikh Zayed Road, Dubai', phone: '+971444444444' },
        { id: '2', name: 'ADCB', code: 'ADCBAEAA', swift: 'ADCBAEAAXXX', address: 'Al Markaziyah, Abu Dhabi', phone: '+971244444444' },
        { id: '3', name: 'FAB', code: 'FABLAEAD', swift: 'FABLAEADXXX', address: 'Corniche Road, Abu Dhabi', phone: '+971244444444' },
        { id: '4', name: 'Mashreq Bank', code: 'MSHQAEAD', swift: 'MSHQAEADXXX', address: 'Sheikh Zayed Road, Dubai', phone: '+971444444444' },
        { id: '5', name: 'RAKBANK', code: 'RAKBAEAD', swift: 'RAKBAEADXXX', address: 'Ras Al Khaimah', phone: '+971744444444' },
        { id: '6', name: 'Dubai Islamic Bank', code: 'DUIBAEAD', swift: 'DUIBAEADXXX', address: 'Dubai', phone: '+971444444444' },
        { id: '7', name: 'ADIB', code: 'ADIBAEAD', swift: 'ADIBAEADXXX', address: 'Abu Dhabi', phone: '+971244444444' }
      ] as any[];
    }
  }

  return (
    <ChequeManagementClient
      initialCheques={allCheques}
      savedPayees={allPayees}
      tenants={allTenants}
      businessNames={businessNames}
      banks={allBanks}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
