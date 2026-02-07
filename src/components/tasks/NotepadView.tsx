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

    const activeTasks = tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => b.createdAt - a.createdAt);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle.trim());
        setNewTaskTitle('');
    };

    return (
        <div className="w-full h-full flex flex-col">
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
            <div className="flex-1 space-y-1 mb-12 overflow-y-auto">
                {activeTasks.length === 0 && (
                    <div className="text-center py-20 opacity-20 select-none pointer-events-none">
                        <p className="text-2xl font-light tracking-widest italic">Empty Space</p>
                    </div>
                )}

                {activeTasks.map(task => (
                    <NotepadTaskItem
                        key={task.id}
                        task={task}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                    />
                ))}
            </div>

            {/* Quick Input at Bottom */}
            <div className="sticky bottom-0 px-2 py-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95">
                <form
                    onSubmit={handleAddTask}
                    className="group relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-2xl shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all"
                >
                    <Plus className="w-5 h-5 text-slate-400 mr-3 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Write a task and press Enter..."
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                    />
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400">ENTER</span>
                    </div>
                </form>
            </div>
        </div>
    );
};
