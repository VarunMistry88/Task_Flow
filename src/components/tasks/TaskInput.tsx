
import React, { useState } from 'react';
import { Plus, StickyNote, Folder, ListTodo, X, Calendar, Flag } from 'lucide-react';
import type { Project, Checkpoint, Priority } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../utils/cn';
import { Select } from '../../components/ui/Select';


interface TaskInputProps {
    onAdd: (title: string, projectId?: string, initialCheckpoints?: Checkpoint[], priority?: Priority, dueDate?: number, notes?: string, estimatedTime?: number) => void;
    projects: Project[];
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd, projects }) => {
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [newCheckpoint, setNewCheckpoint] = useState('');

    // New fields
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState<string>(''); // YYYY-MM-DD string for input
    const [estimatedHours, setEstimatedHours] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');

    // Helper to format priority options
    const priorityOptions = [
        { value: 'low', label: 'Low', className: 'text-blue-500' },
        { value: 'medium', label: 'Medium', className: 'text-slate-500' },
        { value: 'high', label: 'High', className: 'text-orange-500' },
        { value: 'critical', label: 'Critical', className: 'text-red-500' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            const dateTimestamp = dueDate ? new Date(dueDate).getTime() : undefined;

            onAdd(
                title.trim(),
                projectId || undefined,
                checkpoints.length > 0 ? checkpoints : undefined,
                priority,
                dateTimestamp,
                notes,
                (parseInt(estimatedHours || '0') * 60 * 60 * 1000) + (parseInt(estimatedMinutes || '0') * 60 * 1000) || undefined
            );

            // Reset state
            setTitle('');
            setProjectId('');
            setNotes('');
            setCheckpoints([]);
            setNewCheckpoint('');
            setPriority('medium');
            setDueDate('');
            setPriority('medium');
            setDueDate('');
            setEstimatedHours('');
            setEstimatedMinutes('');
        }
    };

    const addCheckpoint = (e: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key === 'Enter') {
            e.preventDefault();
        } else if ('key' in e && e.key !== 'Enter') {
            return;
        } else {
            e.preventDefault();
        }


        if (newCheckpoint.trim()) {
            const cp: Checkpoint = {
                id: uuidv4(),
                title: newCheckpoint.trim(),
                completed: false
            };
            setCheckpoints([...checkpoints, cp]);
            setNewCheckpoint('');
        }
    };

    const removeCheckpoint = (id: string) => {
        setCheckpoints(checkpoints.filter(cp => cp.id !== id));
    };

    const priorityConfig: Record<Priority, { color: string; label: string }> = {
        low: { color: 'text-blue-500', label: 'Low' },
        medium: { color: 'text-slate-500', label: 'Medium' },
        high: { color: 'text-orange-500', label: 'High' },
        critical: { color: 'text-red-500', label: 'Critical' }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-0">
            <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg dark:text-slate-100 dark:placeholder-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add Task
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Select
                        value={projectId}
                        onChange={setProjectId}
                        options={[
                            { value: '', label: 'No Project' },
                            ...projects.map(p => ({
                                value: p.id,
                                label: p.name,
                                className: 'font-medium'
                            }))
                        ]}
                        placeholder="Project"
                        icon={<Folder className="w-4 h-4" />}
                        className="min-w-[150px]"
                    />

                    <Select
                        value={priority}
                        onChange={(val) => setPriority(val as Priority)}
                        options={priorityOptions}
                        icon={<Flag className={cn("w-4 h-4", priorityConfig[priority].color)} />}
                        className="min-w-[140px]"
                    />

                    <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-transparent text-sm focus:outline-none cursor-pointer dark:text-slate-200"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5">
                        <div className="relative w-16">
                            <input
                                type="number"
                                min="0"
                                value={estimatedHours}
                                onChange={(e) => setEstimatedHours(e.target.value)}
                                placeholder="0"
                                className="w-full bg-transparent text-sm focus:outline-none dark:text-slate-200 pr-5 no-spinner"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">h</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                        <div className="relative w-16">
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={estimatedMinutes}
                                onChange={(e) => setEstimatedMinutes(e.target.value)}
                                placeholder="0"
                                className="w-full bg-transparent text-sm focus:outline-none dark:text-slate-200 pr-6 no-spinner"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">m</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Checkpoints Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <ListTodo className="w-4 h-4" />
                            Checklist
                        </div>
                        <div className="bg-white/30 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-2">
                            {checkpoints.map(cp => (
                                <div key={cp.id} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 text-sm dark:text-slate-200">
                                    <span>{cp.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCheckpoint(cp.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 px-2">
                                <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={newCheckpoint}
                                    onChange={(e) => setNewCheckpoint(e.target.value)}
                                    placeholder="Add item..."
                                    className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 dark:text-slate-200 dark:placeholder-slate-400 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => addCheckpoint(e)}
                                    disabled={!newCheckpoint.trim()}
                                    className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <StickyNote className="w-4 h-4" />
                            Notes
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add details..."
                            className="flex-1 w-full bg-white/30 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-h-[120px] dark:text-slate-200 dark:placeholder-slate-400 resize-none"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};
