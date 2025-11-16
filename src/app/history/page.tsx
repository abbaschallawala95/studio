'use client';

import React, { useEffect, useMemo } from 'react';
import Header from '@/components/layout/header';
import SessionList from '@/components/charging-sessions/session-list';
import {
  useAuth,
  useCollection,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ChargingSession } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { CircleDashed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const sessionsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'charging_sessions');
  }, [user, firestore]);

  const sessionsQuery = useMemoFirebase(() => {
    if (!sessionsCollectionRef) return null;
    return query(sessionsCollectionRef, orderBy('date', 'desc'));
  }, [sessionsCollectionRef]);

  const { data: sessions, isLoading: sessionsLoading } =
    useCollection<ChargingSession>(sessionsQuery);

  const getSessionDate = (sessionDate: ChargingSession['date']) => {
    if (sessionDate instanceof Timestamp) return sessionDate.toDate();
    if (typeof sessionDate === 'string') return new Date(sessionDate);
    return sessionDate as Date;
  };

  const sortedSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.map(s => ({
        ...s,
        date: getSessionDate(s.date),
      })).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [sessions]);
    
  if (isUserLoading || sessionsLoading) {
      return (
        <div className="flex min-h-screen w-full flex-col bg-background">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
              <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <CircleDashed className="w-12 h-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Connecting to your session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-0">
            <SessionList sessions={sortedSessions} />
        </main>
      </SidebarInset>
    </div>
  );
}
