'use client';

import * as React from 'react';
import type { ChargingSession } from '@/lib/types';
import { format } from 'date-fns';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface ChargingChartProps {
  sessions: ChargingSession[];
}

const chartConfig = {
  startPercentage: {
    label: 'Start %',
    color: 'hsl(var(--chart-2))',
  },
  endPercentage: {
    label: 'End %',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function ChargingChart({ sessions }: ChargingChartProps) {
  const chartData = React.useMemo(() => {
    return sessions
      .map((session) => ({
        date: format(session.date, 'MMM d'),
        startPercentage: session.startPercentage,
        endPercentage: session.endPercentage,
      }))
      .reverse(); // reverse to show oldest to newest
  }, [sessions]);

  if (sessions.length < 2) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
        <p className="text-muted-foreground">Not enough data to display chart. At least 2 sessions are needed.</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 6)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="startPercentage"
          type="monotone"
          stroke="var(--color-startPercentage)"
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey="endPercentage"
          type="monotone"
          stroke="var(--color-endPercentage)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
