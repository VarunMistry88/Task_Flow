import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, X, GripVertical } from 'lucide-react';
import type { Task, Checkpoint } from '../../types';
import { cn } from '../../utils/cn';

interface NotepadTaskItemProps {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
}

export const NotepadTaskItem = ({ task, onUpdate, onDelete }: NotepadTaskItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Move focus to subtask input or next task
            setIsAddingSubtask(true);
        } else if (e.key === 'Backspace' && !task.title) {
            e.preventDefault();
            onDelete(task.id);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextElement = e.currentTarget.parentElement?.parentElement?.nextElementSibling?.querySelector('input');
            (nextElement as HTMLInputElement)?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevElement = e.currentTarget.parentElement?.parentElement?.previousElementSibling?.querySelector('input');
            (prevElement as HTMLInputElement)?.focus();
        }
    };

    const handleAddSubtask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newSubtaskTitle.trim()) return;

        const newCheckpoint: Checkpoint = {
            id: crypto.randomUUID(),
            title: newSubtaskTitle.trim(),
            completed: false
        };

        onUpdate(task.id, {
            checkpoints: [...(task.checkpoints || []), newCheckpoint]
        });
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
    };

    const toggleSubtask = (checkpointId: string) => {
        const updatedCheckpoints = (task.checkpoints || []).map(cp =>
            cp.id === checkpointId ? { ...cp, completed: !cp.completed, completedAt: !cp.completed ? Date.now() : undefined } : cp
        );
        onUpdate(task.id, { checkpoints: updatedCheckpoints });
    };

    const deleteSubtask = (checkpointId: string) => {
        const updatedCheckpoints = (task.checkpoints || []).filter(cp => cp.id !== checkpointId);
        onUpdate(task.id, { checkpoints: updatedCheckpoints });
    };

    return (
        <div
            className="group relative py-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsAddingSubtask(false);
            }}
        >
            <div className="flex items-center gap-2 px-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded transition-colors group/row">
                <GripVertical className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover/row:opacity-100 cursor-grab active:cursor-grabbing" />

                <button
                    onClick={() => onUpdate(task.id, { status: 'done', completedAt: Date.now() })}
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                >
                    <Circle className="w-4 h-4" />
                </button>

                <input
                    type="text"
                    value={task.title}
                    onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200 flex-1 min-w-0"
                    placeholder="Task title..."
                />

                <div className="flex items-center gap-1">
                    {isHovered && !isAddingSubtask && (
                        <button
                            onClick={() => setIsAddingSubtask(true)}
                            className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all animate-in fade-in zoom-in duration-200"
                            title="Add subtask"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(task.id)}
                        className={cn(
                            "p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all opacity-0 group-hover/row:opacity-100",
                            isAddingSubtask && "hidden"
                        )}
                        title="Delete task"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Subtasks */}
            <div className="ml-8 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800">
                {task.checkpoints?.map((checkpoint) => (
                    <div key={checkpoint.id} className="group/sub relative flex items-center gap-2 pl-4 py-0.5 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 rounded transition-colors">
                        <button
                            onClick={() => toggleSubtask(checkpoint.id)}
                            className={cn(
                                "transition-colors",
                                checkpoint.completed ? "text-green-500" : "text-slate-300 dark:text-slate-600 hover:text-blue-500"
                            )}
                        >
                            {checkpoint.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        </button>
                        <span className={cn(
                            "text-xs flex-1 truncate",
                            checkpoint.completed ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-400"
                        )}>
                            {checkpoint.title}
                        </span>
                        <button
                            onClick={() => deleteSubtask(checkpoint.id)}
                            className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {isAddingSubtask && (
                    <form onSubmit={handleAddSubtask} className="pl-4 py-1 animate-in slide-in-from-left-2 duration-200">
                        <input
                            autoFocus
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onBlur={() => !newSubtaskTitle && setIsAddingSubtask(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsAddingSubtask(false);
                            }}
                            placeholder="Add subtask..."
                            className="w-full bg-transparent border-none focus:ring-0 text-xs text-slate-600 dark:text-slate-400 placeholder:text-slate-400 py-0 px-0"
                        />
                    </form>
                )}
            </div>
        </div>
    );
};
