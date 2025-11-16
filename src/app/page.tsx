import { getChargingSessions } from '@/lib/actions';
import Header from '@/components/layout/header';
import ChargingSummary from '@/components/charging-sessions/charging-summary';
import ChargingChart from '@/components/charging-sessions/charging-chart';
import SessionList from '@/components/charging-sessions/session-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default async function Home() {
  const sessions = await getChargingSessions();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <ChargingSummary sessions={sessions} />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Charging Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChargingChart sessions={sessions} />
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            <SessionList initialSessions={sessions} />
          </div>
        </div>
      </main>
    </div>
  );
}
