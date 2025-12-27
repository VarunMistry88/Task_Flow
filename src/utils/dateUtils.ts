import type { Task } from '../types';

/**
 * Groups tasks by their completion date
 * Returns a map where the key is a date label (e.g., "Today", "Yesterday", "Dec 22, 2025")
 * and the value is an array of tasks completed on that date
 */
export const groupTasksByCompletionDate = (tasks: Task[]): Map<string, Task[]> => {
    const grouped = new Map<string, Task[]>();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    tasks.forEach(task => {
        const completionDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
        const taskDate = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());

        let label: string;

        if (taskDate.getTime() === today.getTime()) {
            label = 'Today';
        } else if (taskDate.getTime() === yesterday.getTime()) {
            label = 'Yesterday';
        } else {
            // Format as "Mon, Dec 23, 2024"
            label = completionDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        if (!grouped.has(label)) {
            grouped.set(label, []);
        }
        grouped.get(label)!.push(task);
    });

    return grouped;
};

/**
 * Sorts date labels in chronological order (most recent first)
 * Ensures "Today" and "Yesterday" appear before dated labels
 */
export const sortDateLabels = (labels: string[]): string[] => {
    return labels.sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        if (a === 'Yesterday') return -1;
        if (b === 'Yesterday') return 1;

        // Parse dates and sort in reverse chronological order
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime();
    });
};
