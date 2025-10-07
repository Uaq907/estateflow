import { NextRequest, NextResponse } from 'next/server';

// بيانات العقود الوهمية
const mockLeases = [
  {
    id: "lease-1",
    tenantName: "أحمد محمد علي",
    unitNumber: "A101",
    propertyName: "مجمع السكن الحديث",
    monthlyRent: 7201,
    startDate: "2025-10-06",
    endDate: "2026-10-06",
    status: "Active",
    type: "Residential"
  },
  {
    id: "lease-2",
    tenantName: "فاطمة السالم",
    unitNumber: "A102",
    propertyName: "مجمع السكن الحديث",
    monthlyRent: 6409,
    startDate: "2025-10-06",
    endDate: "2026-10-06",
    status: "Active",
    type: "Residential"
  },
  {
    id: "lease-3",
    tenantName: "شركة التقنية المتقدمة",
    unitNumber: "B101",
    propertyName: "مجمع الأعمال التجارية",
    monthlyRent: 13445,
    startDate: "2025-10-06",
    endDate: "2027-10-06",
    status: "Active",
    type: "Commercial"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockLeases);
  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLease = {
      id: `lease-${Date.now()}`,
      ...body,
      status: 'Active'
    };
    
    mockLeases.push(newLease);
    
    return NextResponse.json({ message: 'Lease created successfully', lease: newLease }, { status: 201 });
  } catch (error) {
    console.error('Error creating lease:', error);
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 });
  }
}
