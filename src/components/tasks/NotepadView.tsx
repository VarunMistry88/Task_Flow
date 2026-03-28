import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NotepadTaskItem } from './NotepadTaskItem';
import type { Task, Priority, Checkpoint } from '../../types';
import { Plus, Terminal } from 'lucide-react';

interface NotepadViewProps {
    tasks: Task[];
    addTask: (title: string, projectId?: string, initialCheckpoints?: Checkpoint[], priority?: Priority, dueDate?: number, notes?: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
}

export const NotepadView = ({
    tasks,
    addTask,
    updateTask,
    deleteTask
}: NotepadViewProps) => {
    const { isLocalOnly } = useData();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const newTaskInputRef = React.useRef<HTMLInputElement>(null);

    const activeTasks = tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => a.createdAt - b.createdAt);

    const handleAddTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle.trim());
        setNewTaskTitle('');
    };

    const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddTask();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const taskInputs = containerRef.current?.querySelectorAll('.notepad-task-list .space-y-1 input');
            if (taskInputs && taskInputs.length > 1) {
                (taskInputs[taskInputs.length - 2] as HTMLInputElement)?.focus();
            }
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('empty-space-trigger')) {
            newTaskInputRef.current?.focus();
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col cursor-text"
            onClick={handleContainerClick}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
                    <Terminal className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-medium text-slate-500 tracking-tight">Simple Notepad</h2>
                </div>
                {isLocalOnly && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded text-amber-600 dark:text-amber-500/70">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Offline</span>
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 mb-12 overflow-y-auto notepad-task-list">
                {activeTasks.length === 0 && (
                    <div className="text-center py-20 opacity-20 select-none pointer-events-none empty-space-trigger">
                        <p className="text-2xl font-light tracking-widest italic">Empty Space</p>
                    </div>
                )}

                <div className="space-y-1">
                    {activeTasks.map(task => (
                        <NotepadTaskItem
                            key={task.id}
                            task={task}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                        />
                    ))}

                    {/* Inline New Task Entry */}
                    <div className="group relative py-1 px-2 flex items-center gap-2 opacity-50 focus-within:opacity-100 transition-opacity">
                        <div className="w-3 h-3" /> {/* Grip spacer */}
                        <div className="text-slate-400">
                            <Plus className="w-4 h-4" />
                        </div>
                        <input
                            ref={newTaskInputRef}
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleNewTaskKeyDown}
                            placeholder="Type to add a new task..."
                            className="text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200 flex-1 min-w-0"
                        />
                    </div>
                </div>

                {/* Extra space at bottom to trigger focus */}
                <div className="flex-1 min-h-[200px] empty-space-trigger" />
            </div>
        </div>
    );
};
