export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Checkpoint {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: number;
}

export interface Project {
    id: string;
    name: string;
    color?: string;
}

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    createdAt: number;
    completedAt?: number;
    tags?: string[];
    totalTimeSpent: number; // in milliseconds
    projectId?: string;
    checkpoints?: Checkpoint[];
    notes?: string;
    priority?: Priority;
    dueDate?: number;
    lastStatusChangeAt?: number; // timestamp when status last changed
    estimatedTime?: number; // estimated time in milliseconds
}

export interface TimeLog {
    id: string;
    taskId: string;
    startTime: number;
    endTime?: number;
    isManuallyEdited?: boolean;
    note?: string;
    duration?: number;
}

export interface AppState {
    tasks: Task[];
    projects: Project[];
    logs: TimeLog[];
    activeTaskId: string | null;
}
