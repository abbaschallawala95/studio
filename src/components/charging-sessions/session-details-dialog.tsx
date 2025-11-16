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
import { BatteryCharging, Calendar, Clock, StickyNote, Timer, Percent } from 'lucide-react';
import { Badge } from '../ui/badge';

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

  const chargeGained = session.endPercentage - session.startPercentage;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            Detailed view of your charging session on {format(sessionDate, 'MMMM d, yyyy')}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="h-[250px] w-full">
            <SingleSessionChart session={session} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{format(sessionDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>
                {formatTime12h(session.startTime)} &rarr; {formatTime12h(session.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duration:</span>
              <span>{getDuration()}</span>
            </div>
             <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Charge Level:</span>
              <span>{session.startPercentage}% &rarr; {session.endPercentage}%</span>
            </div>
             <div className="flex items-center gap-2">
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Charge Gained:</span>
              <Badge variant="secondary">+{chargeGained}%</Badge>
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
