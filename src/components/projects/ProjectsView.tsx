import React, { useState } from 'react';
import { Plus, Trash2, Folder } from 'lucide-react';
import type { Project, Task } from '../../types';
import { cn } from '../../utils/cn';
import { Modal } from '../ui/Modal';

interface ProjectsViewProps {
    projects: Project[];
    tasks: Task[];
    onAddProject: (name: string, color?: string) => void;
    onDeleteProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
    projects,
    tasks,
    onAddProject,
    onDeleteProject
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#3b82f6');

    const handleAdd = () => {
        if (newName.trim()) {
            onAddProject(newName.trim(), newColor);
            setNewName('');
            setIsAdding(false);
        }
    };

    const getProjectStats = (projectId: string) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        return {
            total: projectTasks.length,
            active: projectTasks.filter(t => t.status !== 'done').length,
            completed: projectTasks.filter(t => t.status === 'done').length
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Projects</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your projects and view statistics</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => {
                    const stats = getProjectStats(project.id);
                    return (
                        <div
                            key={project.id}
                            className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: project.color }} />

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                                    >
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{project.name}</h3>
                                </div>
                                <button
                                    onClick={() => onDeleteProject(project.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total</p>
                                    <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.total}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Active</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Done</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {projects.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/5 dark:bg-slate-900/50">
                        <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No projects yet</p>
                        <p className="text-sm">Create a project to organize your tasks</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title="Create New Project"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., Website Redesign"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color Tag</label>
                        <div className="flex gap-2 flex-wrap">
                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewColor(color)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all",
                                        newColor === color ? "border-slate-900 dark:border-white scale-110" : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!newName.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Create Project
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
