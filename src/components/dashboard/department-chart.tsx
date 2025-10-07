'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { Employee } from '@/lib/types';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';

interface DepartmentChartProps {
  employees: Employee[];
}

export default function DepartmentChart({ employees }: DepartmentChartProps) {
  const departmentData = employees.reduce((acc, employee) => {
    const department = employee.department || 'N/A';
    if (!acc[department]) {
      acc[department] = { name: department, count: 0 };
    }
    acc[department].count += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  const chartData = Object.values(departmentData);
  
  const chartConfig = {
    employees: {
      label: "Employees",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                 />
                <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
