'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ChargingSession } from '@/lib/types';
import { format, intervalToDuration } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { SingleSessionChart } from './single-session-chart';
import { BatteryCharging, Calendar, Clock, StickyNote, Timer, Zap } from 'lucide-react';

interface SessionDetailsDialogProps {
  session: ChargingSession;
  children: React.ReactNode;
}

export function SessionDetailsDialog({ session, children }: SessionDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);

  const getSessionDate = (sessionDate: ChargingSession['date']) => {
    if (sessionDate instanceof Timestamp) return sessionDate.toDate();
    if (typeof sessionDate === 'string') return new Date(sessionDate);
    return sessionDate as Date;
  };

  const sessionDate = getSessionDate(session.date);

  const formatTime12h = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, 'hh:mm a');
  };
  
  const getDuration = () => {
    const startDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${session.startTime}`);
    let endDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${session.endTime}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const duration = intervalToDuration({ start: startDate, end: endDate });
    
    return `${duration.hours || 0}h ${duration.minutes || 0}m`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Charging History</DialogTitle>
          <DialogDescription>
            {format(sessionDate, 'd MMMM, ')} {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            <div className="grid gap-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Timer className="h-5 w-5" />
                                <span className="font-medium">Charging Time</span>
                            </div>
                            <span className="font-bold">{getDuration()}</span>
                        </div>
                        {session.energyConsumed && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Zap className="h-5 w-5" />
                                    <span className="font-medium">Energy Consumed</span>
                                </div>
                                <span className="font-bold">{session.energyConsumed} kWh</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BatteryCharging className="h-5 w-5" />
                                <span className="font-medium">Start SOC</span>
                            </div>
                            <span className="font-bold">{session.startPercentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <BatteryCharging className="h-5 w-5" />
                                <span className="font-medium">End SOC</span>
                            </div>
                            <span className="font-bold">{session.endPercentage}%</span>
                        </div>
                    </div>
                </div>
                 <div className="h-[250px] w-full border-t bg-card rounded-b-lg">
                    <SingleSessionChart session={session} />
                </div>
            </div>
          
          {session.notes && (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">Notes</h4>
                </div>
              <p className="text-sm text-muted-foreground rounded-md border p-3 bg-muted/50">
                {session.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
