'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LogoWithText } from '../logo';
import { adminNavItems, bottomNavItems, userNavItems } from '@/lib/config';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

type AppSidebarProps = {
  user: User;
};

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();
  const navItems = user.role === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <LogoWithText />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="relative"
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="absolute right-2" variant="destructive">{item.badge}</Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {bottomNavItems.map((item) => (
             <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
           </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                    <LogOut className="size-4" />
                    <span>Logout</span>
                </SidebarMenuButton>
           </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
                </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
