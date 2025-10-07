

'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { Property } from '@/lib/types';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';

interface PropertyTypeChartProps {
  properties: Property[];
}

export default function PropertyTypeChart({ properties }: PropertyTypeChartProps) {
  const typeData = properties.reduce((acc, property) => {
    const type = property.type || 'N/A';
    if (!acc[type]) {
      acc[type] = { name: type, count: 0 };
    }
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  const chartData = Object.values(typeData);
  
  const chartConfig = {
    count: {
      label: "Properties",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
        <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                 />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
