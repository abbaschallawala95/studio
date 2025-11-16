'use client';

import * as React from 'react';
import type { ChargingSession } from '@/lib/types';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { format } from 'date-fns';

interface SingleSessionChartProps {
  session: ChargingSession;
}

const chartConfig = {
  percentage: {
    label: 'Charge %',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function SingleSessionChart({ session }: SingleSessionChartProps) {
  const chartData = [
    { time: session.startTime, percentage: session.startPercentage, label: 'Start' },
    { time: session.endTime, percentage: session.endPercentage, label: 'End' },
  ];
  
  const formatTime12h = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, 'hh:mm a');
  };

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => formatTime12h(value)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="percentage"
          type="monotone"
          stroke="var(--color-percentage)"
          strokeWidth={2}
          dot={{
            fill: 'var(--color-percentage)',
            r: 4,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}
