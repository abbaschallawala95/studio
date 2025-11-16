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
import { Timer, Zap, BatteryCharging } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

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
    try {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return format(date, 'hh:mm a');
    } catch {
        return "Invalid time"
    }
  };
  
  const getDuration = () => {
    try {
        const startDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${session.startTime}`);
        let endDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${session.endTime}`);

        if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
        }
        
        const duration = intervalToDuration({ start: startDate, end: endDate });
        
        return `${duration.hours || 0} hr ${duration.minutes || 0} min`;
    } catch {
        return "N/A"
    }
  };

  const chargeGained = session.endPercentage - session.startPercentage;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0 w-[95vw] max-w-md rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Charging Details</DialogTitle>
          <DialogDescription>
            {format(sessionDate, 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6">
            <div className="grid gap-6">
                <div className="grid gap-4 rounded-lg border">
                    <div className="p-4 grid gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Timer className="h-5 w-5" />
                                <span className="font-medium">Charging Time</span>
                            </div>
                            <span className="font-bold">{getDuration()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <BatteryCharging className="h-5 w-5" />
                                <span className="font-medium">Charge Added</span>
                            </div>
                            <span className="font-bold text-green-600">+{chargeGained}%</span>
                        </div>
                        {session.energyConsumed && session.energyConsumed > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Zap className="h-5 w-5" />
                                    <span className="font-medium">Energy Used</span>
                                </div>
                                <span className="font-bold">{session.energyConsumed} kWh</span>
                            </div>
                        )}
                         <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">Start / End SOC</span>
                            <span className="font-bold">{session.startPercentage}% &rarr; {session.endPercentage}%</span>
                        </div>

                    </div>
                    <div className="h-[200px] w-full bg-card rounded-b-lg">
                        <SingleSessionChart session={session} />
                    </div>
                </div>
            
            {session.notes && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-card-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground rounded-md border p-3 bg-muted/50 break-words">
                        {session.notes}
                    </p>
                </div>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
