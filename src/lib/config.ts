import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Users,
  ListTodo,
  ArrowDownToDot,
  SendToBack,
  Settings,
  ArrowUpFromDot,
} from 'lucide-react';
import type { NavItem } from './types';
import { taskSubmissions, allDeposits, allWithdrawals } from './data';

const pendingSubmissions = taskSubmissions.filter(s => s.status === 'pending').length;
const pendingDeposits = allDeposits.filter(d => d.status === 'pending').length;
const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending').length;


export const userNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    role: 'user',
  },
  {
    href: '/dashboard/tasks',
    label: 'Tasks',
    icon: CheckSquare,
    role: 'user',
  },
  {
    href: '/dashboard/wallet',
    label: 'Wallet',
    icon: Wallet,
    role: 'user',
  },
];

export const adminNavItems: NavItem[] = [
  {
    href: '/dashboard/admin',
    label: 'Admin Dashboard',
    icon: LayoutDashboard,
    role: 'admin',
  },
  {
    href: '/dashboard/admin/users',
    label: 'Manage Users',
    icon: Users,
    role: 'admin',
  },
  {
    href: '/dashboard/admin/tasks',
    label: 'Manage Tasks',
    icon: ListTodo,
    role: 'admin',
  },
  {
    href: '/dashboard/admin/submissions',
    label: 'Submissions',
    icon: SendToBack,
    role: 'admin',
    badge: pendingSubmissions > 0 ? pendingSubmissions : undefined,
  },
  {
    href: '/dashboard/admin/deposits',
    label: 'Deposits',
    icon: ArrowDownToDot,
    role: 'admin',
    badge: pendingDeposits > 0 ? pendingDeposits : undefined,
  },
  {
    href: '/dashboard/admin/withdrawals',
    label: 'Withdrawals',
    icon: ArrowUpFromDot,
    role: 'admin',
    badge: pendingWithdrawals > 0 ? pendingWithdrawals : undefined,
  },
];

export const bottomNavItems: NavItem[] = [
  {
    href: '#',
    label: 'Settings',
    icon: Settings,
    role: 'user',
  },
];
