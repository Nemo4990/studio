'use client';

import AppSidebar from '@/components/dashboard/app-sidebar';
import AppHeader from '@/components/dashboard/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/dashboard/page-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (error) {
    // For now, a simple redirect is fine
    router.push('/login');
    return null; // or a loading spinner while redirecting
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-col">
          <AppHeader user={user} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">
            {loading || !user ? (
              // This is the key change: render skeleton *inside* the layout
              <div>
                 <PageHeader title="Loading Dashboard..." description="Please wait while we fetch your data." />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
