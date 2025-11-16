'use client';

import * as React from 'react';
import type { ChargingSession } from '@/lib/types';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { format } from 'date-fns';

interface SingleSessionChartProps {
  session: ChargingSession;
}

const chartConfig = {
  percentage: {
    label: 'SOC %',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function SingleSessionChart({ session }: SingleSessionChartProps) {
  const chartData = [
    { time: session.startTime, percentage: session.startPercentage, label: 'Start' },
    { time: session.endTime, percentage: session.endPercentage, label: 'End' },
  ];
  
  const formatTime12h = (time: string) => {
    try {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return format(date, 'hh:mm a');
    } catch {
        return ""
    }
  };

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
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
          tickFormatter={(value) => `${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" labelKey="label" />}
        />
        <defs>
          <linearGradient id="fillPercentage" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-percentage)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-percentage)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="percentage"
          type="monotone"
          fill="url(#fillPercentage)"
          stroke="var(--color-percentage)"
          strokeWidth={2}
          dot={{
            fill: 'var(--color-percentage)',
            r: 4,
          }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
