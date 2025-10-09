import { NextRequest, NextResponse } from 'next/server';
import { getExpenseHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const expenseId = searchParams.get('expenseId');

    if (!expenseId) {
      return NextResponse.json(
        { success: false, message: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const history = await getExpenseHistory(expenseId);

    return NextResponse.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error fetching expense history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expense history' },
      { status: 500 }
    );
  }
}

