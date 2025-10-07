
import { getEmployeeFromSession } from '@/lib/auth';
import { getOwners } from '@/lib/db';
import OwnerManagementClient from '@/components/owner-management-client';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Demo owners data
const demoOwners = [
  { 
    id: '1', 
    name: 'أحمد محمد', 
    email: 'ahmed@owner.com', 
    phone: '+971501234567',
    contact: '+971501234567',
    nationality: 'Emirati',
    emiratesId: '784-1980-1234567-8',
    emiratesIdUrl: null,
    taxNumber: 'TAX001'
  },
  { 
    id: '2', 
    name: 'فاطمة علي', 
    email: 'fatima@owner.com', 
    phone: '+971509876543',
    contact: '+971509876543',
    nationality: 'Emirati',
    emiratesId: '784-1985-9876543-2',
    emiratesIdUrl: null,
    taxNumber: 'TAX002'
  },
  { 
    id: '3', 
    name: 'خالد أحمد', 
    email: 'khalid@owner.com', 
    phone: '+971507654321',
    contact: '+971507654321',
    nationality: 'Saudi',
    emiratesId: '784-1990-7654321-5',
    emiratesIdUrl: null,
    taxNumber: 'TAX003'
  }
];

export default async function OwnerManagementPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  if (!hasPermission(loggedInEmployee, 'properties:read')) {
    redirect('/dashboard');
  }

  let allOwners = [];
  
  // Try to get owners from database, fallback to demo data
  try {
    allOwners = await getOwners();
    console.log('Owners Page - Loaded from database:', allOwners.length);
  } catch (error) {
    console.error('Owners Page - Database error, using demo data:', error);
    allOwners = demoOwners;
  }

  return (
    <OwnerManagementClient
      initialOwners={allOwners}
      loggedInEmployee={loggedInEmployee}
    />
  );
}
