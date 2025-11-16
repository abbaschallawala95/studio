'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Power, LayoutDashboard, User, Plus, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AddSessionDialog } from '../charging-sessions/add-session-dialog';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">
                {userProfile?.trackerName || 'eScotty'}
              </h1>
            </div>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton
                isActive={pathname === '/'}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/history">
              <SidebarMenuButton
                isActive={pathname === '/history'}
                tooltip="Charging History"
              >
                <History />
                <span>Charging History</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/profile">
              <SidebarMenuButton
                isActive={pathname === '/profile'}
                tooltip="Profile"
              >
                <User />
                <span>Profile</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AddSessionDialog>
           <SidebarMenuButton className='w-full'>
             <Plus />
             <span>Add Session</span>
           </SidebarMenuButton>
        </AddSessionDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
