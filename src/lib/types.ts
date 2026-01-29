import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  level: number;
  walletBalance: number;
  createdAt: Date;
};

export type Testimonial = {
  name: string;
  role: string;
  avatarUrl: string;
  text: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  minLevel: number;
  status: 'available' | 'completed' | 'locked';
};

export type Deposit = {
  id: string;
  amount: number;
  currency: 'BTC' | 'ETH' | 'USDT';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash: string;
};

export type Withdrawal = {
  id:string;
  amount: number;
  currency: 'USDT';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  walletAddress: string;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  role: 'user' | 'admin';
  badge?: number;
  isChidren?: boolean;
};

export type TaskSubmission = {
  id: string;
  user: Pick<User, 'name' | 'avatarUrl' | 'email'>;
  taskTitle: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  proof: string;
};
