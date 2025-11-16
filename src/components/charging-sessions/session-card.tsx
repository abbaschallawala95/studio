import type { ChargingSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Timer, Percent, Edit, ChevronRight } from 'lucide-react';
import { format, intervalToDuration } from 'date-fns';
import { Badge } from '../ui/badge';
import { useUser, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditSessionDialog } from './edit-session-dialog';
import { Timestamp, doc } from 'firebase/firestore';
import { SessionDetailsDialog } from './session-details-dialog';


interface SessionCardProps {
  session: ChargingSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const { id, date, startTime, endTime, startPercentage, endPercentage, notes } = session;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const getSessionDate = (sessionDate: ChargingSession['date']) => {
    if (sessionDate instanceof Timestamp) return sessionDate.toDate();
    if (typeof sessionDate === 'string') return new Date(sessionDate);
    return sessionDate as Date;
  }
  const sessionDate = getSessionDate(date);

  const getDuration = () => {
    const startDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${startTime}`);
    let endDate = new Date(`${format(sessionDate, 'yyyy-MM-dd')}T${endTime}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const duration = intervalToDuration({ start: startDate, end: endDate });
    
    return `${duration.hours || 0}h ${duration.minutes || 0}m`;
  };

  const chargeGained = endPercentage - startPercentage;
  
  const handleDelete = async () => {
    if (!user || !firestore) {
      toast({ title: 'Error', description: 'You must be logged in to delete a session.', variant: 'destructive' });
      return;
    }
    const docRef = doc(firestore, 'users', user.uid, 'charging_sessions', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Success', description: 'Session deleted successfully.'});
  }
  
  const formatTime12h = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return format(date, 'hh:mm a');
    } catch {
      return 'Invalid time'
    }
  };

  return (
    <SessionDetailsDialog session={session}>
      <Card className="transition-all hover:shadow-md cursor-pointer hover:border-primary/50">
        <div className="flex items-center justify-between p-6 pb-2">
            <div className="grid gap-1.5" onClick={(e) => e.stopPropagation()}>
                <CardTitle className="text-lg font-medium">{format(sessionDate, 'MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>{formatTime12h(startTime)} &rarr; {formatTime12h(endTime)}</span>
                </div>
                </CardDescription>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardContent>
          <div className="flex flex-col gap-3">
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
            {notes && (
              <p className="text-sm text-muted-foreground border-t pt-3 truncate">{notes}</p>
            )}
             <div className="flex items-center gap-1 -mb-4 -mr-4 justify-end" onClick={(e) => e.stopPropagation()}>
                <EditSessionDialog session={session}>
                <Button variant="ghost" size="icon" aria-label="Edit session">
                    <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
                </EditSessionDialog>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete session">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your charging session.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </SessionDetailsDialog>
  );
}
