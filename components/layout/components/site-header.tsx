'use client';

import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Function to get page title based on pathname
function getPageTitle(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean);

  // Handle root path
  if (pathname === '/') {
    return 'Dashboard';
  }

  // Handle asset management paths
  if (pathname.startsWith('/asset-management')) {
    if (pathname.includes('/lipad-assets/manual-tag')) {
      return 'Manual Tag';
    }
    if (pathname.includes('/lipad-assets/system-generated')) {
      return 'System Generated';
    }
    if (pathname.includes('/lipad-assets/service-unit')) {
      return 'Service Unit';
    }
    if (pathname.includes('/transferred-assets')) {
      return 'Transferred Assets';
    }
    // Default for asset management
    return 'Asset Management';
  }

  // Handle other common paths
  const pathTitleMap: Record<string, string> = {
    '/analytics': 'Analytics',
    '/team': 'Team',
    '/settings': 'Settings',
    '/help': 'Get Help',
    '/documentation': 'Documentation',
  };

  if (pathTitleMap[pathname]) {
    return pathTitleMap[pathname];
  }

  // Fallback: capitalize the last segment of the path
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment) {
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Dashboard';
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname || '/');

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div className="flex items-center gap-2 w-full justify-between">
          <h1 className="text-base font-medium">{pageTitle}</h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
