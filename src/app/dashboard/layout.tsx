import AppSidebar from '@/components/dashboard/app-sidebar';
import AppHeader from '@/components/dashboard/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { mockAdmin, mockUser } from '@/lib/data';
import { headers } from 'next/headers';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';
  
  // Simple logic to switch between user and admin for demo purposes
  const isViewingAdmin = pathname.includes('/admin');
  const user = isViewingAdmin ? mockAdmin : mockUser;
  
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-col">
          <AppHeader user={user} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
