import type {
  Testimonial,
  Task,
  User,
  Deposit,
  Withdrawal,
  TaskSubmission,
  Agent,
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
      name: 'Daily Check-in',
      description: 'Claim your daily bonus just for logging in. Consistency is key!',
      reward: 200,
      requiredLevel: 1,
      status: 'available',
    },
    {
      id: '2',
      name: 'Crypto Beginner\'s Quiz',
      description: 'Test your knowledge on basic crypto concepts. Pass the quiz to earn a reward and learn something new!',
      reward: 1000,
      requiredLevel: 1,
      status: 'available',
    },
    {
      id: '11',
      name: 'Speedmath Challenge',
      description: 'Solve as many math problems as you can in 60 seconds. Higher scores earn bigger rewards.',
      reward: 500,
      requiredLevel: 1,
      status: 'available',
    },
    {
      id: '12',
      name: 'Memory Pattern Recall',
      description: 'Memorize and replicate a sequence of patterns. A true test of your memory.',
      reward: 500,
      requiredLevel: 1,
      status: 'available',
    },
    {
      id: '13',
      name: 'Logic Puzzle Solving',
      description: 'Solve a logic puzzle to prove your wits and earn a reward.',
      reward: 800,
      requiredLevel: 1,
      status: 'available',
    },
    {
        id: '7',
        name: 'First Deposit Bonus',
        description: 'Make your first deposit of $10 or more and receive an instant 500 Coin bonus reward!',
        reward: 500,
        requiredLevel: 1,
        status: 'available',
    },
    {
      id: '6',
      name: 'Spread the Word',
      description: 'Tweet about your earnings on TaskVerse with a screenshot and the #TaskVerse hashtag.',
      reward: 1000,
      requiredLevel: 1,
      status: 'available',
    },
    {
        id: '8',
        name: 'Invite a Friend',
        description: 'Share your referral link. When your friend signs up and completes their first task, you both earn 1000 Coins.',
        reward: 1000,
        requiredLevel: 2,
        status: 'available',
    },
    {
      id: '3',
      name: 'Meme Magic Contest',
      description: 'Create and submit a viral meme about TaskVerse. The best one gets a huge bonus prize!',
      reward: 2500,
      requiredLevel: 2,
      status: 'locked',
    },
    {
      id: '4',
      name: 'Feature Feedback',
      description: 'Provide constructive feedback on our new wallet feature. Help us build a better app for everyone.',
      reward: 1500,
      requiredLevel: 3,
      status: 'completed',
    },
    {
        id: '9',
        name: 'Task Streak Challenge',
        description: 'Complete 7 tasks in 7 days to unlock a special streak bonus. Keep the momentum going!',
        reward: 5000,
        requiredLevel: 3,
        status: 'locked',
    },
    {
      id: '5',
      name: 'Blockchain Detective',
      description: 'Find the secret message hidden in a transaction on the Ethereum testnet. A real challenge for a true crypto sleuth.',
      reward: 7500,
      requiredLevel: 4,
      status: 'locked',
    },
    {
        id: '10',
        name: 'Content Creator Program',
        description: 'Create a YouTube video reviewing TaskVerse. Must be over 3 minutes long and have high-quality audio/video.',
        reward: 15000,
        requiredLevel: 5,
        status: 'locked',
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
      walletBalance: Math.floor(Math.random() * 100000),
      createdAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(25);

export const taskSubmissions: TaskSubmission[] = mockUsers.slice(0, 5).map((user, index) => {
    const task = userTasks[index % userTasks.length];
    return {
        id: `sub${index + 1}`,
        userId: user.id,
        taskId: task.id,
        reward: task.reward,
        user: {
            name: user.name,
            avatarUrl: user.avatarUrl,
            email: user.email,
        },
        taskTitle: task.name,
        submittedAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
        status: (['pending', 'approved', 'rejected'] as const)[index % 3],
        proof: 'https://example.com/proof.pdf',
    }
});

export const allDeposits: Deposit[] = mockUsers.flatMap((user, index) => {
    const isNigeria = index % 2 === 0;
    return {
        id: `dep_all_${index}_1`, 
        userId: user.id, 
        agentId: `agent${index%4+1}`,
        agentName: `Agent ${index%4+1}`,
        amount: isNigeria ? Math.random() * 100000 : Math.random() * 500, 
        currency: isNigeria ? 'NGN' : 'USD', 
        status: (['confirmed', 'pending', 'failed'] as const)[index % 3], 
        proofOfPayment: '#', 
        createdAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 14)
    }
});

export const allWithdrawals: Withdrawal[] = mockUsers.slice(0,10).map((user, index) => ({
  id: `wd_all_${index}`,
  userId: user.id,
  amount: Math.random() * 200, // Amount in USD
  currency: 'USD',
  userBankInfo: { bankName: 'FCMB', accountNumber: '1234567890', accountName: user.name },
  status: (['approved', 'pending', 'rejected'] as const)[index % 3],
  requestedAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
}));
