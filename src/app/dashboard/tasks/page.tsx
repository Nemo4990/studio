import PageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { userTasks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, Lock, Sparkles } from 'lucide-react';

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userTasks.map((task) => (
          <Card key={task.id} className={cn(
            "flex flex-col",
            task.status === 'locked' && 'bg-muted/50 border-dashed',
            task.status === 'completed' && 'bg-primary/5'
          )}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-headline">{task.title}</span>
                {task.status === 'available' && <Sparkles className="size-5 text-accent" />}
                {task.status === 'locked' && <Lock className="size-5 text-muted-foreground" />}
                {task.status === 'completed' && <Check className="size-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                {task.status === 'locked' ? `Requires Level ${task.minLevel}` : `$${task.reward} Reward`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </CardContent>
            <CardFooter>
                {task.status === 'available' && <Button className="w-full">Submit Task</Button>}
                {task.status === 'locked' && <Button className="w-full" disabled>Locked</Button>}
                {task.status === 'completed' && <Button className="w-full" variant="outline" disabled>Completed</Button>}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
