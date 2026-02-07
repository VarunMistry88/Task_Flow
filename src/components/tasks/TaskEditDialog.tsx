import { useState, useEffect } from 'react';
import { X, Calendar, Flag, Folder, ListTodo, Plus, StickyNote, Save } from 'lucide-react';
import type { Task, Project, Priority, Checkpoint } from '../../types';
import { cn } from '../../utils/cn';
import { Select } from '../ui/Select';


import { v4 as uuidv4 } from 'uuid';

interface TaskEditDialogProps {
    task: Task;
    projects: Project[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
}

export const TaskEditDialog = ({ task, projects, isOpen, onClose, onUpdate }: TaskEditDialogProps) => {
    const [title, setTitle] = useState(task.title);
    const [projectId, setProjectId] = useState(task.projectId || '');
    const [status, setStatus] = useState(task.status);
    const [priority, setPriority] = useState<Priority>(task.priority || 'medium');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(task.checkpoints || []);
    const [newCheckpoint, setNewCheckpoint] = useState('');
    const [notes, setNotes] = useState(task.notes || '');

    // Time Estimate
    const [estimatedHours, setEstimatedHours] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');

    // Reset state ONLY when dialog OPENS, not when task updates during edit (prevents reset on timer tick)
    useEffect(() => {
        if (isOpen) {
            setTitle(task.title);
            setProjectId(task.projectId || '');
            setStatus(task.status);
            setPriority(task.priority || 'medium');
            setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
            setCheckpoints(task.checkpoints || []);
            setNotes(task.notes || '');

            if (task.estimatedTime) {
                const totalMinutes = Math.floor(task.estimatedTime / (1000 * 60));
                setEstimatedHours(Math.floor(totalMinutes / 60).toString());
                setEstimatedMinutes((totalMinutes % 60).toString());
            } else {
                setEstimatedHours('');
                setEstimatedMinutes('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dateTimestamp = dueDate ? new Date(dueDate).getTime() : undefined;

        onUpdate(task.id, {
            title,
            projectId: projectId || undefined,
            status,
            priority,
            dueDate: dateTimestamp,
            checkpoints,
            notes,
            estimatedTime: (parseInt(estimatedHours || '0') * 60 * 60 * 1000) + (parseInt(estimatedMinutes || '0') * 60 * 1000) || undefined
        });
        onClose();
    };

    const addCheckpoint = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
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

    const toggleCheckpoint = (id: string) => {
        setCheckpoints(checkpoints.map(cp =>
            cp.id === id ? { ...cp, completed: !cp.completed, completedAt: !cp.completed ? Date.now() : undefined } : cp
        ));
    };

    const updateCheckpointTitle = (id: string, newTitle: string) => {
        setCheckpoints(checkpoints.map(cp =>
            cp.id === id ? { ...cp, title: newTitle } : cp
        ));
    };

    const priorityOptions = [
        { value: 'low', label: 'Low', className: 'text-blue-500' },
        { value: 'medium', label: 'Medium', className: 'text-slate-500' },
        { value: 'high', label: 'High', className: 'text-orange-500' },
        { value: 'critical', label: 'Critical', className: 'text-red-500' }
    ];

    const priorityConfig: Record<Priority, { color: string }> = {
        low: { color: 'text-blue-500' },
        medium: { color: 'text-slate-500' },
        high: { color: 'text-orange-500' },
        critical: { color: 'text-red-500' }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Task</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-task-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg dark:text-slate-100"
                                placeholder="Task title"
                            />
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Project</label>
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
                                    placeholder="Select Project"
                                    icon={<Folder className="w-4 h-4" />}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Priority</label>
                                <Select
                                    value={priority}
                                    onChange={(val) => setPriority(val as Priority)}
                                    options={priorityOptions}
                                    icon={<Flag className={cn("w-4 h-4", priorityConfig[priority].color)} />}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Due Date</label>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-transparent text-sm focus:outline-none cursor-pointer w-full dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Estimated Time</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="0"
                                            value={estimatedHours}
                                            onChange={(e) => setEstimatedHours(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 pr-8 no-spinner"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">hr</span>
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={estimatedMinutes}
                                            onChange={(e) => setEstimatedMinutes(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 pr-9 no-spinner"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkpoints */}
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 mb-1.5">
                                <ListTodo className="w-4 h-4" />
                                Checklist
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                                {checkpoints.map(cp => (
                                    <div key={cp.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <input
                                            type="checkbox"
                                            checked={cp.completed}
                                            onChange={() => toggleCheckpoint(cp.id)}
                                            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={cp.title}
                                            onChange={(e) => updateCheckpointTitle(cp.id, e.target.value)}
                                            className={cn(
                                                "flex-1 text-sm bg-transparent focus:outline-none dark:text-slate-200",
                                                cp.completed && "text-slate-400 line-through"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCheckpoint(cp.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 px-1 pt-1">
                                    <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={newCheckpoint}
                                        onChange={(e) => setNewCheckpoint(e.target.value)}
                                        placeholder="Add item..."
                                        className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 dark:text-slate-200 dark:placeholder-slate-400 py-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addCheckpoint(e)}
                                    />
                                    <button
                                        type="button"
                                        onClick={addCheckpoint}
                                        disabled={!newCheckpoint.trim()}
                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 mb-1.5">
                                <StickyNote className="w-4 h-4" />
                                Notes
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add detailed notes..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-h-[120px] dark:text-slate-200 dark:placeholder-slate-400 resize-none"
                            />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-task-form"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
