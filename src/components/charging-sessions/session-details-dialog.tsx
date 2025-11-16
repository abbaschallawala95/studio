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
import { Timer, Zap } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0 w-[85vw] max-w-lg rounded-lg">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Charging History</DialogTitle>
          <DialogDescription>
            {format(sessionDate, 'd MMMM, ')} {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 px-6 pb-6">
                <div className="grid gap-4 rounded-lg border bg-card text-card-foreground">
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
                                <span className="font-medium text-muted-foreground">Start SOC</span>
                                <span className="font-bold">{session.startPercentage}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">End SOC</span>
                                <span className="font-bold">{session.endPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] w-full bg-card rounded-b-lg -mt-6">
                        <SingleSessionChart session={session} />
                    </div>
                </div>
            
            {session.notes && (
                <div className="space-y-2">
                 <p className="text-sm font-medium text-muted-foreground">Notes</p>
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
