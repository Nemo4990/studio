import type {
  Testimonial,
  Task,
  User,
  Deposit,
  Withdrawal,
  TaskSubmission,
} from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const testimonials: Testimonial[] = [
  {
    name: 'Alex Johnson',
    role: 'Crypto Enthusiast',
    avatarUrl: findImage('testimonial1'),
    text: 'TaskVerse has revolutionized how I earn crypto. The tasks are engaging and the rewards are instant. A must-have app!',
  },
  {
    name: 'Samantha Bee',
    role: 'Freelancer',
    avatarUrl: findImage('testimonial2'),
    text: 'I love the level-based system. It keeps me motivated to complete more tasks and unlock higher rewards. The UI is super intuitive too.',
  },
  {
    name: 'Ken Adams',
    role: 'Day Trader',
    avatarUrl: findImage('testimonial3'),
    text: 'The withdrawal process is seamless and secure. I received my earnings in my wallet faster than any other platform I’ve used.',
  },
  {
    name: 'Maria Garcia',
    role: 'Gig Worker',
    avatarUrl: findImage('testimonial4'),
    text: 'As someone new to crypto, TaskVerse made it incredibly easy to get started. The deposit tracking is transparent and trustworthy.',
  },
];

export const userTasks: Task[] = [
    {
      id: '1',
      title: 'Daily Check-in',
      description: 'Claim your daily bonus just for logging in. Consistency is key!',
      reward: 2,
      minLevel: 1,
      status: 'available',
    },
    {
      id: '2',
      title: 'Crypto Beginner\'s Quiz',
      description: 'Test your knowledge on basic crypto concepts. Pass the quiz to earn a reward and learn something new!',
      reward: 10,
      minLevel: 1,
      status: 'available',
    },
    {
      id: '3',
      title: 'Meme Magic Contest',
      description: 'Create and submit a viral meme about TaskVerse. The best one gets a huge bonus prize!',
      reward: 25,
      minLevel: 2,
      status: 'available',
    },
    {
      id: '4',
      title: 'Feature Feedback',
      description: 'Provide constructive feedback on our new wallet feature. Help us build a better app for everyone.',
      reward: 15,
      minLevel: 1,
      status: 'completed',
    },
    {
      id: '5',
      title: 'Blockchain Detective',
      description: 'Find the secret message hidden in a transaction on the Ethereum testnet. A real challenge for a true crypto sleuth.',
      reward: 75,
      minLevel: 3,
      status: 'locked',
    },
    {
      id: '6',
      title: 'Spread the Word',
      description: 'Tweet about your earnings on TaskVerse with a screenshot and the #TaskVerse hashtag.',
      reward: 10,
      minLevel: 1,
      status: 'available',
    },
  ];


const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      avatarUrl: `https://picsum.photos/seed/tableuser${i}/40/40`,
      role: 'user',
      level: (i % 5) + 1,
      walletBalance: parseFloat((Math.random() * 1000).toFixed(2)),
      createdAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(25);

export const deposits: Deposit[] = [
  { id: 'dep1', amount: 0.05, currency: 'ETH', status: 'confirmed', timestamp: new Date('2023-10-01'), txHash: '0xabc...' },
  { id: 'dep2', amount: 100, currency: 'USDT', status: 'pending', timestamp: new Date('2023-10-05'), txHash: '0xdef...' },
  { id: 'dep3', amount: 0.01, currency: 'BTC', status: 'failed', timestamp: new Date('2023-09-20'), txHash: '0xghi...' },
];

export const withdrawals: Withdrawal[] = [
  { id: 'wd1', amount: 50, currency: 'USDT', status: 'approved', timestamp: new Date('2023-09-28'), walletAddress: '0x123...' },
  { id: 'wd2', amount: 75, currency: 'USDT', status: 'pending', timestamp: new Date('2023-10-02'), walletAddress: '0x456...' },
  { id: 'wd3', amount: 20, currency: 'USDT', status: 'rejected', timestamp: new Date('2023-09-15'), walletAddress: '0x789...' },
];

export const taskSubmissions: TaskSubmission[] = mockUsers.slice(0, 5).map((user, index) => ({
  id: `sub${index + 1}`,
  user: {
    name: user.name,
    avatarUrl: user.avatarUrl,
    email: user.email,
  },
  taskTitle: userTasks[index % userTasks.length].title,
  submittedAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
  status: (['pending', 'approved', 'rejected'] as const)[index % 3],
  proof: 'https://example.com/proof.pdf',
}));

export const allDeposits: Deposit[] = mockUsers.flatMap((user, index) => ([
  { id: `dep_all_${index}_1`, userId: user.id, amount: Math.random() * 1, currency: 'ETH', status: (['confirmed', 'pending', 'failed'] as const)[index % 3], timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 14), txHash: `0x...${index}a` },
  { id: `dep_all_${index}_2`, userId: user.id, amount: Math.random() * 500, currency: 'USDT', status: (['confirmed', 'pending', 'failed'] as const)[(index + 1) % 3], timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 14), txHash: `0x...${index}b` },
]));

export const allWithdrawals: Withdrawal[] = mockUsers.slice(0,10).map((user, index) => ({
  id: `wd_all_${index}`,
  userId: user.id,
  amount: Math.random() * 200,
  currency: 'USDT',
  status: (['approved', 'pending', 'rejected'] as const)[index % 3],
  timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
  walletAddress: `0x...${user.id.slice(0,4)}`,
}));
