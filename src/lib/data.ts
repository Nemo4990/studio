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
      id: '11',
      title: 'Speedmath Challenge',
      description: 'Solve as many math problems as you can in 60 seconds. Higher scores earn bigger rewards.',
      reward: 5,
      minLevel: 1,
      status: 'available',
    },
    {
      id: '12',
      title: 'Memory Pattern Recall',
      description: 'Memorize and replicate a sequence of patterns. A true test of your memory.',
      reward: 5,
      minLevel: 1,
      status: 'available',
    },
    {
      id: '13',
      title: 'Logic Puzzle Solving',
      description: 'Solve a logic puzzle to prove your wits and earn a reward.',
      reward: 8,
      minLevel: 1,
      status: 'available',
    },
    {
        id: '7',
        title: 'First Deposit Bonus',
        description: 'Make your first deposit of $10 or more and receive an instant $5 bonus reward!',
        reward: 5,
        minLevel: 1,
        status: 'available',
    },
    {
      id: '6',
      title: 'Spread the Word',
      description: 'Tweet about your earnings on TaskVerse with a screenshot and the #TaskVerse hashtag.',
      reward: 10,
      minLevel: 1,
      status: 'available',
    },
    {
        id: '8',
        title: 'Invite a Friend',
        description: 'Share your referral link. When your friend signs up and completes their first task, you both earn $10.',
        reward: 10,
        minLevel: 2,
        status: 'available',
    },
    {
      id: '3',
      title: 'Meme Magic Contest',
      description: 'Create and submit a viral meme about TaskVerse. The best one gets a huge bonus prize!',
      reward: 25,
      minLevel: 2,
      status: 'locked',
    },
    {
      id: '4',
      title: 'Feature Feedback',
      description: 'Provide constructive feedback on our new wallet feature. Help us build a better app for everyone.',
      reward: 15,
      minLevel: 3,
      status: 'completed',
    },
    {
        id: '9',
        title: 'Task Streak Challenge',
        description: 'Complete 7 tasks in 7 days to unlock a special streak bonus. Keep the momentum going!',
        reward: 50,
        minLevel: 3,
        status: 'locked',
    },
    {
      id: '5',
      title: 'Blockchain Detective',
      description: 'Find the secret message hidden in a transaction on the Ethereum testnet. A real challenge for a true crypto sleuth.',
      reward: 75,
      minLevel: 4,
      status: 'locked',
    },
    {
        id: '10',
        title: 'Content Creator Program',
        description: 'Create a YouTube video reviewing TaskVerse. Must be over 3 minutes long and have high-quality audio/video.',
        reward: 150,
        minLevel: 5,
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
      walletBalance: parseFloat((Math.random() * 1000).toFixed(2)),
      createdAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    });
  }
  return users;
};

export const mockUsers: User[] = generateUsers(25);

export const mockAgents: Agent[] = [
    { id: 'agent1', name: 'John Doe', country: 'Nigeria', bankName: 'GTBank', accountNumber: '0123456789' },
    { id: 'agent2', name: 'Jane Smith', country: 'Nigeria', bankName: 'First Bank', accountNumber: '9876543210' },
    { id: 'agent3', name: 'Mike Ross', country: 'USA', bankName: 'Bank of America', accountNumber: '1122334455' },
    { id: 'agent4', name: 'Rachel Zane', country: 'USA', bankName: 'Chase', accountNumber: '5544332211' },
];

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
        taskTitle: task.title,
        submittedAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
        status: (['pending', 'approved', 'rejected'] as const)[index % 3],
        proof: 'https://example.com/proof.pdf',
    }
});

export const allDeposits: Deposit[] = mockUsers.flatMap((user, index) => {
    const isNigeria = index % 2 === 0;
    const agent = isNigeria ? mockAgents[index % 2] : mockAgents[index % 2 + 2];
    return {
        id: `dep_all_${index}_1`, 
        userId: user.id, 
        agentId: agent.id,
        agentName: agent.name,
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
  amount: Math.random() * 20000,
  currency: 'NGN',
  userBankInfo: { bankName: 'FCMB', accountNumber: '1234567890', accountName: user.name },
  status: (['approved', 'pending', 'rejected'] as const)[index % 3],
  requestedAt: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7),
}));
