import { NextRequest, NextResponse } from 'next/server';
import { getLeases, assignTenantToUnit } from '@/lib/db';

export async function GET() {
  try {
    const leases = await getLeases();
    return NextResponse.json(leases);
  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId, tenantId, ...leaseDetails } = body;
    
    await assignTenantToUnit(unitId, tenantId, leaseDetails);
    
    return NextResponse.json({ message: 'Lease created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating lease:', error);
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 });
  }
}
