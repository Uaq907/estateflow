
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Expense } from '@/lib/types';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';

interface RecentExpensesChartProps {
  expenses: Expense[];
}

export default function RecentExpensesChart({ expenses }: RecentExpensesChartProps) {
  // Aggregate expenses by category
  const expenseData = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = { name: category, total: 0 };
    }
    acc[category].total += expense.amount;
    return acc;
  }, {} as Record<string, { name: string; total: number }>);

  const chartData = Object.values(expenseData).map(item => ({
    ...item,
    total: parseFloat(item.total.toFixed(2)) // Ensure totals are numbers with 2 decimal places
  }));
  
  const chartConfig = {
    total: {
      label: "Total (AED)",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={80}/>
                <XAxis dataKey="total" type="number" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `AED ${value.toLocaleString()}`} />
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                 />
                <Bar dataKey="total" fill="var(--color-total)" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
