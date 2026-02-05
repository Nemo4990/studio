'use server';
/**
 * @fileOverview An AI flow for personalizing the order of tasks for a user.
 *
 * - personalizeTasks - A function that reorders tasks based on user data.
 * - PersonalizeTasksInput - The input type for the personalizeTasks function.
 * - PersonalizeTasksOutput - The return type for the personalizeTasks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// We can't import the full User Zod schema from backend.json easily.
// For the AI prompt, we only need a subset of the user and task data.
// Let's define simple schemas for what the prompt needs.
const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  reward: z.number(),
  requiredLevel: z.number(),
});

const UserSchema = z.object({
  level: z.number(),
  walletBalance: z.number(),
  taskAttempts: z.record(z.string(), z.number()).optional(),
  lastDailyCheckin: z.string().optional(),
});

const PersonalizeTasksInputSchema = z.object({
  user: UserSchema,
  tasks: z.array(TaskSchema),
});
export type PersonalizeTasksInput = z.infer<typeof PersonalizeTasksInputSchema>;

const PersonalizeTasksOutputSchema = z.object({
  taskIds: z.array(z.string()).describe('An ordered array of task IDs, from most to least recommended.'),
});
export type PersonalizeTasksOutput = z.infer<typeof PersonalizeTasksOutputSchema>;

// This defines the shape of the plain object passed from the client.
// It avoids passing non-serializable objects like Timestamps.
export type PersonalizeTasksClientInput = {
  user: {
    level: number;
    walletBalance: number;
    taskAttempts?: { [taskId: string]: number };
    lastDailyCheckin?: string;
  };
  tasks: {
    id: string;
    name: string;
    reward: number;
    requiredLevel: number;
  }[];
};


// This is the function the client-side code will call.
export async function personalizeTasks(input: PersonalizeTasksClientInput): Promise<PersonalizeTasksOutput> {
    // The input from the client is already in the shape the AI flow needs.
    return personalizeTasksFlow(input);
}

const personalizeTasksPrompt = ai.definePrompt({
  name: 'personalizeTasksPrompt',
  input: { schema: PersonalizeTasksInputSchema },
  output: { schema: PersonalizeTasksOutputSchema },
  prompt: `You are an expert game designer specializing in user engagement and personalization.
Your goal is to re-order a list of tasks for a user to maximize their engagement and satisfaction.

Consider the following user data:
- User Level: {{{user.level}}}
- User Wallet Balance: {{{user.walletBalance}}}
- User Task Attempts: {{{user.taskAttempts}}}

Here is the list of all available tasks:
{{{tasks}}}

Based on this information, return an ordered list of task IDs. Your ordering should prioritize:
1.  **Variety**: Don't show the same type of task at the top all the time. Mix it up.
2.  **Achievability**: Suggest tasks the user can actually perform (i.e., their level is high enough).
3.  **Engagement**: If a user has tried a game task (like Speedmath) but hasn't won, maybe it's a good one to suggest again. If they haven't tried it, it's a great candidate.
4.  **Special Tasks**: The "Daily Check-in" (id: '1') should always be one of the first things the user sees if it's available.
5.  **Progression**: Gently nudge the user towards tasks that are at or slightly above their current level to encourage them to level up.

Return only the array of task IDs in the optimal order. Do not include tasks the user cannot access.`,
});

const personalizeTasksFlow = ai.defineFlow(
  {
    name: 'personalizeTasksFlow',
    inputSchema: PersonalizeTasksInputSchema,
    outputSchema: PersonalizeTasksOutputSchema,
  },
  async (input) => {
    // Filter out tasks the user can't possibly do before sending to the model.
    const availableTasks = input.tasks.filter(task => task.requiredLevel <= input.user.level);
    
    const { output } = await personalizeTasksPrompt({
        user: input.user,
        tasks: availableTasks,
    });

    if (!output) {
      // Fallback: return the original order of available tasks if AI fails
      return { taskIds: availableTasks.map(t => t.id) };
    }
    
    // Ensure the AI didn't return any locked task IDs
    const availableTaskIds = new Set(availableTasks.map(t => t.id));
    const filteredIds = output.taskIds.filter(id => availableTaskIds.has(id));

    return { taskIds: filteredIds };
  }
);
