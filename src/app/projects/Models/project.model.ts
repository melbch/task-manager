import { ProjectStatus } from "./project-status.enum";

export interface Project {
    id: string;
    title: string;
    dueDate: Date;
    tags: string[];
    status: ProjectStatus;
    priority?: string;
    completion?: number;
    canDelete?: boolean;
    summary?: string;
}