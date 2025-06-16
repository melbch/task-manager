import { TaskStatus } from "./task-status.enum";

export interface Task {
    id: string;
    title: string;
    projectId: string;
    status: TaskStatus;
    dueDate?: Date;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    completed: boolean;
    completion?: number;
}