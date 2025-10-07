import { NextRequest, NextResponse } from 'next/server';
import { getTenants, addTenant } from '@/lib/db';

export async function GET() {
  try {
    const tenants = await getTenants();
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await addTenant(body);
    
    if (result.success) {
      return NextResponse.json({ id: result.id, message: result.message }, { status: 201 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding tenant:', error);
    return NextResponse.json({ error: 'Failed to add tenant' }, { status: 500 });
  }
}
