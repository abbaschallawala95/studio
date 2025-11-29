'use client';
import React, { useEffect, useMemo } from 'react';
import Header from '@/components/layout/header';
import ChargingSummary from '@/components/charging-sessions/charging-summary';
import ChargingChart from '@/components/charging-sessions/charging-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, CircleDashed } from 'lucide-react';
import {
  useAuth,
  useCollection,
  useDoc,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { ChargingSession, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

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
    
  if (isUserLoading || sessionsLoading || isProfileLoading) {
      return (
        <div className="flex min-h-screen w-full flex-col bg-background">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 pt-0">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                <Skeleton className="h-[118px] w-full" />
                <Skeleton className="h-[118px] w-full" />
                <Skeleton className="h-[118px] w-full" />
                <Skeleton className="h-[118px] w-full" />
              </div>
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
                <Skeleton className="lg:col-span-5 h-[414px]" />
              </div>
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
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 pt-0">
          <h1 className="text-2xl font-bold">{userProfile?.trackerName || 'Dashboard'}</h1>
          <ChargingSummary sessions={sortedSessions} />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
            <Card className="lg:col-span-5">
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Charging Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChargingChart sessions={sortedSessions} />
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
