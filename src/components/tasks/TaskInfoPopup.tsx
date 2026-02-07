import { X, Folder, Flag, Calendar, Clock, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Task, Project, Priority } from '../../types';
import { cn } from '../../utils/cn';

interface TaskInfoPopupProps {
    task: Task;
    project?: Project;
    isOpen: boolean;
    onClose: () => void;
    position?: { x: number; y: number };
    isHoverMode?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const TaskInfoPopup = ({
    task,
    project,
    isOpen,
    onClose,
    position,
    isHoverMode = false,
    onMouseEnter,
    onMouseLeave
}: TaskInfoPopupProps) => {
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && position) {
            const popupWidth = 320;
            const popupHeight = 200;
            const padding = 10;

            let left = position.x - popupWidth / 2;
            let top = position.y + padding;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < padding) left = padding;
            if (left + popupWidth > viewportWidth - padding) {
                left = viewportWidth - popupWidth - padding;
            }

            if (top + popupHeight > viewportHeight - padding) {
                top = position.y - popupHeight - padding;
            }

            setPopupPosition({ top, left });
        }
    }, [isOpen, position]);

    if (!isOpen) return null;

    const priorityConfig: Record<Priority, { color: string; label: string; bg: string }> = {
        low: { color: 'text-blue-500', label: 'Low', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        medium: { color: 'text-slate-500', label: 'Medium', bg: 'bg-slate-100 dark:bg-slate-800' },
        high: { color: 'text-orange-500', label: 'High', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        critical: { color: 'text-red-500', label: 'Critical', bg: 'bg-red-50 dark:bg-red-900/20' }
    };

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    // Don't render until position is calculated
    if (!isOpen || (popupPosition.top === 0 && popupPosition.left === 0)) return null;

    return (
        <>
            {!isHoverMode && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={onClose}
                />
            )}

            <div
                className="fixed z-50 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-80 animate-in fade-in zoom-in-95 duration-200"
                style={{
                    top: `${popupPosition.top}px`,
                    left: `${popupPosition.left}px`
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className="flex items-start justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className={cn(
                        "font-semibold text-sm leading-tight pr-2",
                        task.status === 'done' && "text-slate-400 line-through dark:text-slate-500"
                    )}>
                        {task.title}
                    </h4>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3 space-y-2.5 text-xs max-h-96 overflow-y-auto">
                    {project && (
                        <div className="flex items-center gap-2">
                            <Folder className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: project.color }}
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {project.name}
                                </span>
                            </div>
                        </div>
                    )}

                    {task.priority && task.priority !== 'medium' && (
                        <div className="flex items-center gap-2">
                            <Flag className={cn("w-3.5 h-3.5 flex-shrink-0", priorityConfig[task.priority].color)} />
                            <span className={cn(
                                "text-xs font-medium px-1.5 py-0.5 rounded",
                                priorityConfig[task.priority].color,
                                priorityConfig[task.priority].bg
                            )}>
                                {priorityConfig[task.priority].label}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400">
                            {formatTime(task.totalTimeSpent || 0)}
                            {task.estimatedTime && ` / ${formatTime(task.estimatedTime)}`}
                        </span>
                    </div>

                    {task.dueDate && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}

                    {task.checkpoints && task.checkpoints.length > 0 && (
                        <div className="space-y-1 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-400">
                                <CheckSquare className="w-3 h-3" />
                                Checkpoints ({task.checkpoints.filter(cp => cp.completed).length}/{task.checkpoints.length})
                            </div>
                            <div className="space-y-0.5 pl-4">
                                {task.checkpoints.slice(0, 3).map(cp => (
                                    <div key={cp.id} className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "w-1 h-1 rounded-full flex-shrink-0",
                                            cp.completed ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                                        )} />
                                        <span className={cn(
                                            "text-slate-700 dark:text-slate-300 text-xs truncate",
                                            cp.completed && "line-through opacity-60"
                                        )}>
                                            {cp.title}
                                        </span>
                                    </div>
                                ))}
                                {task.checkpoints.length > 3 && (
                                    <div className="text-[10px] text-slate-400 pl-3">
                                        +{task.checkpoints.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {task.notes && (
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                {task.notes}
                            </p>
                        </div>
                    )}

                    <div className="pt-1">
                        <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-medium",
                            task.status === 'done'
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                            {task.status === 'done' ? 'Completed' : 'Active'}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};
