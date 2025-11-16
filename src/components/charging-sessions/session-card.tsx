import type { ChargingSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarDays, Timer, Percent } from 'lucide-react';
import { format, intervalToDuration } from 'date-fns';
import { deleteChargingSession } from '@/lib/actions';
import { Badge } from '../ui/badge';

interface SessionCardProps {
  session: ChargingSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const { id, date, startTime, endTime, startPercentage, endPercentage } = session;

  const getDuration = () => {
    const startDate = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
    let endDate = new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const duration = intervalToDuration({ start: startDate, end: endDate });
    
    return `${duration.hours || 0}h ${duration.minutes || 0}m`;
  };

  const chargeGained = endPercentage - startPercentage;
  const deleteActionWithId = deleteChargingSession.bind(null, id);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{format(date, 'MMMM d, yyyy')}</CardTitle>
          <CardDescription>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{startTime} &rarr; {endTime}</span>
            </div>
          </CardDescription>
        </div>
        <form action={deleteActionWithId}>
          <Button variant="ghost" size="icon" aria-label="Delete session">
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    <span className="font-medium text-foreground">{startPercentage}% &rarr; {endPercentage}%</span>
                </div>
                <Badge variant="secondary">+{chargeGained}%</Badge>
            </div>
            <div className="font-medium text-right">{getDuration()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
