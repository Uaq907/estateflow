
'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { Property } from '@/lib/types';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';

interface PropertyStatusChartProps {
  properties: Property[];
}

const COLORS = {
  'Available': 'hsl(var(--chart-2))',
  'Rented': 'hsl(var(--chart-1))',
  'Under Construction': 'hsl(var(--chart-3))',
  'Sold': 'hsl(var(--chart-4))',
  'Off-plan': 'hsl(var(--chart-5))'
};

export default function PropertyStatusChart({ properties }: PropertyStatusChartProps) {
  const statusData = properties.reduce((acc, property) => {
    const status = property.status || 'N/A';
    const currentCount = acc.find(item => item.name === status);
    if (currentCount) {
        currentCount.value += 1;
    } else {
        acc.push({ name: status, value: 1, fill: COLORS[status as keyof typeof COLORS] || '#cccccc' });
    }
    return acc;
  }, [] as { name: string; value: number, fill: string }[]);

  
  const chartConfig = Object.fromEntries(
    Object.entries(COLORS).map(([key, value]) => [key, { label: key, color: value }])
  );

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                 />
                <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                    }) => {
                        const RADIAN = Math.PI / 180
                        const radius = 25 + innerRadius + (outerRadius - innerRadius)
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                        return (
                        <text
                            x={x}
                            y={y}
                            className="fill-muted-foreground text-xs"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                        >
                           {value}
                        </text>
                        )
                    }}
                >
                    {statusData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
