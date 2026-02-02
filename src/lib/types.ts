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
  lastDailyCheckin?: any;
  phoneNumber?: string;
  country?: string;
  state?: string;
};

export type Testimonial = {
  name: string;
  role: string;
  avatarUrl: string;
  text: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  reward: number;
  requiredLevel: number;
  status?: 'available' | 'completed' | 'locked';
};

export type Agent = {
  id: string;
  name: string;
  country: string;
  bankName: string;
  accountNumber: string;
};

export type Deposit = {
  id: string;
  userId: string;
  agentId: string;
  agentName: string; // denormalized
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  proofOfPayment: string;
  createdAt: Date;
};


export type UserBankInfo = {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export type Withdrawal = {
  id:string;
  userId: string;
  amount: number;
  currency: string;
  userBankInfo: UserBankInfo;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
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
  userId: string;
  user: Pick<User, 'name' | 'avatarUrl' | 'email'>;
  taskId: string;
  taskTitle: string;
  submittedAt: any;
  status: 'pending' | 'approved' | 'rejected';
  proof: string;
  reward: number;
};
