'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionCard } from './session-card';
import type { ChargingSession } from '@/lib/types';
import { History } from 'lucide-react';

interface SessionListProps {
  initialSessions: ChargingSession[];
}

type SortOption = 'newest' | 'oldest' | 'duration';

export default function SessionList({ initialSessions }: SessionListProps) {
  const [sortOrder, setSortOrder] = React.useState<SortOption>('newest');
  const [sessions, setSessions] = React.useState(initialSessions);

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);

    if (end < start) {
      end.setDate(end.getDate() + 1); // Handles overnight charging
    }

    return end.getTime() - start.getTime();
  };


  React.useEffect(() => {
    const sorted = [...initialSessions].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return a.date.getTime() - b.date.getTime();
        case 'duration':
          const durationA = getDuration(a.startTime, a.endTime);
          const durationB = getDuration(b.startTime, b.endTime);
          return durationB - durationA;
        case 'newest':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });
    setSessions(sorted);
  }, [sortOrder, initialSessions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Session History</CardTitle>
        </div>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="duration">Longest Duration</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {sessions.length > 0 ? (
            <div className="space-y-4 pr-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="flex h-[380px] items-center justify-center">
              <p className="text-muted-foreground">No charging sessions logged yet.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
