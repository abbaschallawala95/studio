import { generateChargingInsights } from '@/ai/flows/charging-data-insights';
import type { ChargingSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BatteryCharging, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface ChargingSummaryProps {
  sessions: ChargingSession[];
}

export default async function ChargingSummary({ sessions }: ChargingSummaryProps) {
  if (sessions.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charging Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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

  const formattedSessions = sessions.map((s) => ({
    ...s,
    date: format(s.date, 'yyyy-MM-dd'),
  }));

  const insights = await generateChargingInsights({ chargingSessions: formattedSessions });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Charging Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
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
