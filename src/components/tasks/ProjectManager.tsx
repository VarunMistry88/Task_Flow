import React, { useState } from 'react';
import { Plus, FolderPlus, X, Trash2 } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectManagerProps {
    projects: Project[];
    onAddProject: (name: string, color?: string) => void;
    onDeleteProject: (id: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    projects,
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

    return (
        <div className="glass p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FolderPlus className="w-5 h-5 text-blue-500" />
                    Projects
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
            </div>

            {isAdding && (
                <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Project name..."
                        className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-10 h-10 p-1 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        Add
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {projects.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No projects yet. Add one to categorize your tasks!</p>
                ) : (
                    projects.map(project => (
                        <div
                            key={project.id}
                            className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors dark:text-slate-200"
                        >
                            <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: project.color || '#3b82f6' }}
                            />
                            <span className="text-sm font-medium">{project.name}</span>
                            <button
                                onClick={() => onDeleteProject(project.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all text-slate-400 dark:text-slate-500"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
