import { Play, Pause, Edit, Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import type { Task, Project, TimeLog } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { TaskEditDialog } from './TaskEditDialog';
import { TimeLogHistory } from './TimeLogHistory';

interface CompactTaskItemProps {
    task: Task;
    project?: Project;
    isActive: boolean;
    onToggleStatus: (id: string) => void;
    onToggleTimer: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    logs: TimeLog[];
    onUpdateLog: (logId: string, updates: Partial<TimeLog>) => void;
    onDeleteLog: (logId: string) => void;
    projects: Project[];
}

export const CompactTaskItem = ({
    task,
    project,
    isActive,
    onToggleStatus,
    onToggleTimer,
    onDelete,
    onUpdate,
    logs,
    onUpdateLog,
    onDeleteLog,
    projects
}: CompactTaskItemProps) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const isToday = todayStart.getTime() === dateStart.getTime();
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        const isTomorrow = tomorrowStart.getTime() === dateStart.getTime();
        const isOverdue = dateStart.getTime() < todayStart.getTime();

        return {
            text: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString(),
            isToday,
            isOverdue
        };
    };

    const dateInfo = formatDate(task.dueDate);

    return (
        <>
            <div
                className={cn(
                    "group flex items-center gap-3 py-3 px-2 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer",
                    isActive ? "bg-slate-50 dark:bg-slate-800/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/30",
                    task.status === 'done' && "opacity-60"
                )}
                onClick={() => setIsEditOpen(true)}
            >
                {/* Status Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(task.id);
                    }}
                    className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                        task.status === 'done'
                            ? "bg-slate-400 border-slate-400 text-white dark:bg-slate-600 dark:border-slate-600"
                            : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500",
                        isActive && task.status !== 'done' && "border-slate-600 dark:border-slate-300"
                    )}
                >
                    {task.status === 'done' && <Check className="w-2.5 h-2.5" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-semibold text-sm truncate",
                            task.status === 'done' && "text-slate-500 line-through dark:text-slate-500",
                            isActive && "text-blue-600 dark:text-blue-400"
                        )}>
                            {task.title}
                        </span>

                        {task.priority && task.priority !== 'medium' && (
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                task.priority === 'high' ? "bg-orange-400" :
                                    task.priority === 'critical' ? "bg-red-500" : "bg-blue-400"
                            )} />
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                            {project && (
                                <span className="font-medium">{project.name}</span>
                            )}

                            {project && (dateInfo || task.notes) && (
                                <span className="opacity-50">·</span>
                            )}

                            {dateInfo && (
                                <span className={cn(
                                    dateInfo.isOverdue ? "text-red-500 font-medium" :
                                        dateInfo.isToday ? "text-orange-500 font-medium" : ""
                                )}>
                                    {dateInfo.text}
                                </span>
                            )}

                            {(dateInfo && task.notes) && (
                                <span className="opacity-50">·</span>
                            )}

                            {task.notes && (
                                <span className="truncate opacity-75 max-w-[200px]">
                                    {task.notes.split('\n')[0]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Time Display */}
                    {(task.totalTimeSpent > 0 || isActive) && (
                        <div className={cn(
                            "font-mono text-xs text-right",
                            isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400",
                            task.estimatedTime && task.totalTimeSpent > task.estimatedTime && "text-red-500"
                        )}>
                            {formatTime(task.totalTimeSpent)}
                        </div>
                    )}

                    {/* Hover Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== 'done' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTimer(task.id);
                                }}
                                className={cn(
                                    "h-7 w-7 p-0",
                                    isActive ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                )}
                            >
                                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            <TaskEditDialog
                task={task}
                projects={projects}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdate={onUpdate}
            />

            <TimeLogHistory
                taskId={task.id}
                logs={logs}
                checkpoints={task.checkpoints}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onUpdateLog={onUpdateLog}
                onDeleteLog={onDeleteLog}
            />
        </>
    );
};
