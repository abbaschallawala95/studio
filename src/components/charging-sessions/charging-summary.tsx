'use client';

import * as React from 'react';
import { getChargingInsights } from '@/lib/actions';
import type { ChargingDataInsightsOutput } from '@/ai/flows/charging-data-insights';
import type { ChargingSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BatteryCharging, Zap } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface ChargingSummaryProps {
  sessions: ChargingSession[];
}

export default function ChargingSummary({ sessions }: ChargingSummaryProps) {
  const [insights, setInsights] = React.useState<ChargingDataInsightsOutput | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchInsights() {
        if (sessions.length > 0) {
            setLoading(true);
            try {
                const result = await getChargingInsights(sessions);
                setInsights(result);
            } catch (error) {
                console.error("Failed to fetch charging insights:", error);
                setInsights(null);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            setInsights(null);
        }
    }

    fetchInsights();
  }, [sessions]);
  
  if (sessions.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charging Time</CardTitle>
            <BatteryCharging className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No sessions logged yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Charge / Session</CardTitle>
            <BatteryCharging className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No sessions logged yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Charging Hours</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No sessions logged yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !insights) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            <Skeleton className="h-[118px] w-full" />
            <Skeleton className="h-[118px] w-full" />
            <Skeleton className="h-[118px] w-full" />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap_8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Charging Time</CardTitle>
          <BatteryCharging className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.totalChargingTime}</div>
          <p className="text-xs text-muted-foreground">Across {sessions.length} sessions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Charge / Session</CardTitle>
          <BatteryCharging className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.averageChargePerSession}</div>
          <p className="text-xs text-muted-foreground">Average energy added per session</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Charging Hours</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.mostFrequentChargingTimes}</div>
          <p className="text-xs text-muted-foreground">Most common time to start charging</p>
        </CardContent>
      </Card>
    </div>
  );
}
