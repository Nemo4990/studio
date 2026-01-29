import PageHeader from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userTasks } from "@/lib/data";
import { MoreHorizontal, PlusCircle } from "lucide-react";

export default function AdminTasksPage() {
    return (
        <>
            <PageHeader title="Manage Tasks" description="Create, edit, and manage tasks available to users.">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Task
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Tasks</CardTitle>
                    <CardDescription>A list of all tasks currently in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Reward</TableHead>
                                <TableHead>Min. Level</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                                    </TableCell>
                                    <TableCell>${task.reward}</TableCell>
                                    <TableCell>Level {task.minLevel}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                                <DropdownMenuItem>Duplicate Task</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
