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
import { Power, LayoutDashboard, User, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AddSessionDialog } from '../charging-sessions/add-session-dialog';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">
                eScotty
              </h1>
            </div>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
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
            <Link href="/profile" legacyBehavior passHref>
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
