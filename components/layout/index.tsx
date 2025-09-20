import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from './components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { ScrollArea } from '@/components/ui/scroll-area';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <ScrollArea className="h-[calc(100vh-65px)] w-full overflow-y-auto">
              <div className="container mx-auto py-6 px-8">{children}</div>
            </ScrollArea>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
