import { Power, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddSessionDialog } from '../charging-sessions/add-session-dialog';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Power className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">eScotty Tracker</h1>
      </div>
      <div className="ml-auto">
        <AddSessionDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </AddSessionDialog>
      </div>
    </header>
  );
}
