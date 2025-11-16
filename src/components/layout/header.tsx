import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
       <SidebarTrigger className="md:hidden" />
       <div className="flex-1">
         {/* You can add a title or breadcrumbs here if needed */}
       </div>
    </header>
  );
}
