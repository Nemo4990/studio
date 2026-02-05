'use client';

import AppSidebar from '@/components/dashboard/app-sidebar';
import AppHeader from '@/components/dashboard/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if auth check is complete and there's no user.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (error) {
    // If there's an auth error, redirect.
    router.push('/login');
    return null;
  }
  
  // Always render the layout structure.
  // The children (pages) are responsible for their own loading states.
  // The AppSidebar and AppHeader internally handle the case where `user` is null during the loading phase.
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-col">
          <AppHeader user={user} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">
            {/* 
              Always render children. The child page will show its own skeleton.
              This prevents the page from unmounting and remounting, which was
              causing the AI personalization to run multiple times.
            */}
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
