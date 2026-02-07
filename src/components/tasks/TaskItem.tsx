import { Play, Pause, Check, Trash2, StickyNote, Square, CheckSquare, Calendar, AlertTriangle, History, Edit } from 'lucide-react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Project, Checkpoint, Priority, TimeLog } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { STALE_TASK_THRESHOLD_DAYS } from '../../utils/constants';
import { TimeLogHistory } from './TimeLogHistory';
import { TaskEditDialog } from './TaskEditDialog';


interface TaskItemProps {
    task: Task;
    project?: Project;
    isActive: boolean;
    layout?: 'list' | 'board';
    onToggleStatus: (id: string) => void;
    onToggleTimer: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    logs: TimeLog[];
    onUpdateLog: (logId: string, updates: Partial<TimeLog>) => void;
    onDeleteLog: (logId: string) => void;
    projects: Project[];
}

export const TaskItem = ({
    task,
    project,
    isActive,
    layout = 'list',
    onToggleStatus,
    onToggleTimer,
    onDelete,
    onUpdate,
    logs,
    onUpdateLog,
    onDeleteLog,
    projects
}: TaskItemProps) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newCheckpointTitle, setNewCheckpointTitle] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine if we should show the compact version
    // Compact if: status is done AND NOT explicitly expanded
    const isCompact = task.status === 'done' && !isExpanded;

    // Calculate staleness
    const staleDays = task.lastStatusChangeAt
        ? Math.floor((Date.now() - task.lastStatusChangeAt) / (1000 * 60 * 60 * 24))
        : 0;
    const isStale = staleDays > STALE_TASK_THRESHOLD_DAYS;

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

    const toggleCheckpoint = (checkpointId: string) => {
        // Prevent changes if task is done
        if (task.status === 'done') return;

        const updatedCheckpoints = task.checkpoints?.map(cp => {
            if (cp.id === checkpointId) {
                const isCompleted = !cp.completed;
                return {
                    ...cp,
                    completed: isCompleted,
                    completedAt: isCompleted ? Date.now() : undefined
                };
            }
            return cp;
        }) || [];
        onUpdate(task.id, { checkpoints: updatedCheckpoints });
    };



    const addCheckpoint = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCheckpointTitle.trim()) {
            const newCp: Checkpoint = {
                id: uuidv4(),
                title: newCheckpointTitle.trim(),
                completed: false
            };
            onUpdate(task.id, {
                checkpoints: [...(task.checkpoints || []), newCp]
            });
            setNewCheckpointTitle('');
        }
    };



    const priorityConfig: Record<Priority, { color: string; label: string; bg: string }> = {
        low: { color: 'text-blue-500', label: 'Low', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        medium: { color: 'text-slate-500', label: 'Medium', bg: 'bg-slate-100 dark:bg-slate-800' },
        high: { color: 'text-orange-500', label: 'High', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        critical: { color: 'text-red-500', label: 'Critical', bg: 'bg-red-50 dark:bg-red-900/20' }
    };

    const dateInfo = formatDate(task.dueDate);

    // Render Helpers for Layout Parts
    const renderCheckbox = () => (
        <button
            onClick={() => onToggleStatus(task.id)}
            className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                task.status === 'done'
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500",
                isActive && task.status !== 'done' && "border-slate-600 dark:border-slate-300"
            )}
        >
            {task.status === 'done' && <Check className="w-3.5 h-3.5" />}
        </button>
    );

    const renderTitle = () => (
        <div className="flex items-center gap-2 mb-1">
            <span className={cn(
                "font-semibold break-words leading-tight",
                isCompact ? "text-base" : "text-lg",
                task.status === 'done' && "text-slate-400 line-through dark:text-slate-600"
            )}>
                {task.title}
            </span>

            {task.priority && task.priority !== 'medium' && (
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1",
                    priorityConfig[task.priority].color,
                    priorityConfig[task.priority].bg
                )}>
                    {task.priority}
                </span>
            )}
        </div>
    );

    const renderMetadata = () => (
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            {project && (
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                    />
                    <span className={cn(
                        "font-medium uppercase tracking-wider",
                        isActive && "text-slate-400"
                    )}>
                        {project.name}
                    </span>
                </div>
            )}

            {isStale && layout !== 'board' && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">{staleDays}d stale</span>
                </div>
            )}
            {dateInfo && (
                <div className={cn(
                    "flex items-center gap-1",
                    dateInfo.isOverdue ? "text-red-500 font-medium" : dateInfo.isToday ? "text-orange-500 font-medium" : ""
                )}>
                    <Calendar className="w-3 h-3" />
                    <span>{dateInfo.text}</span>
                    {dateInfo.isOverdue && task.status !== 'done' && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded uppercase">
                            Overdue
                        </span>
                    )}
                    {dateInfo.isToday && !dateInfo.isOverdue && task.status !== 'done' && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded uppercase">
                            Due Today
                        </span>
                    )}
                </div>
            )}


        </div>
    );

    const renderActions = () => (
        <div className={cn(
            "flex items-center gap-4",
            layout === 'board' ? "w-full justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800" : ""
        )}>
            <div className="flex flex-col items-end gap-0.5">
                <div className={cn(
                    "font-mono text-lg leading-none",
                    isActive ? "text-slate-200 dark:text-blue-200" : "text-slate-500 dark:text-slate-400",
                    task.estimatedTime && task.totalTimeSpent > task.estimatedTime && "text-red-500 dark:text-red-400"
                )}>
                    {formatTime(task.totalTimeSpent)}
                    {task.estimatedTime && layout === 'list' && (
                        <span className="text-sm opacity-50 ml-1">
                            / {formatTime(task.estimatedTime)}
                        </span>
                    )}
                </div>
                {task.estimatedTime && layout === 'list' && (
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                task.totalTimeSpent > task.estimatedTime
                                    ? "bg-red-500"
                                    : task.totalTimeSpent >= task.estimatedTime * 0.8
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                            )}
                            style={{
                                width: `${Math.min((task.totalTimeSpent / task.estimatedTime) * 100, 100)}%`
                            }}
                        />
                    </div>
                )}
            </div>

            <div className={cn(
                "flex items-center gap-1 transition-opacity",
                layout === 'list' && "opacity-100 md:opacity-0 group-hover:opacity-100"
            )}>
                {task.status !== 'done' && (
                    <Button
                        size="sm"
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={() => onToggleTimer(task.id)}
                        className={cn(isActive ? "text-slate-900 dark:text-blue-100 dark:bg-blue-800/50" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200")}
                    >
                        {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsHistoryOpen(true)}
                    className={cn(
                        "hover:text-blue-500",
                        isActive && "text-slate-400 hover:text-blue-400 dark:text-slate-500"
                    )}
                    title="View Time History"
                >
                    <History className="w-5 h-5" />
                </Button>

                {layout !== 'board' && (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditOpen(true)}
                            className={cn(
                                "hover:text-blue-500",
                                isActive && "text-slate-400 hover:text-blue-400 dark:text-slate-500"
                            )}
                            title="Edit Task"
                        >
                            <Edit className="w-5 h-5" />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(task.id)}
                            className={cn("hover:text-red-500", isActive && "text-slate-400 hover:text-red-400 dark:text-slate-500")}
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    // Determine due date urgency for styling
    const isDueToday = dateInfo?.isToday && task.status !== 'done';
    const isOverdue = dateInfo?.isOverdue && task.status !== 'done';

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "group flex flex-col rounded-xl border-2 transition-all cursor-pointer",
                isCompact ? "py-2 px-4 gap-2" : "p-4 gap-4",
                isActive
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-100"
                    : isOverdue
                        ? "bg-white border-red-400 hover:border-red-500 shadow-sm animate-pulse dark:bg-slate-900 dark:border-red-600 dark:text-slate-50"
                        : isDueToday
                            ? "bg-white border-orange-400 hover:border-orange-500 shadow-sm dark:bg-slate-900 dark:border-orange-500 dark:text-slate-50"
                            : isStale
                                ? "bg-white border-yellow-400 hover:border-yellow-500 hover:shadow-sm dark:bg-slate-900 dark:border-yellow-600 dark:text-slate-50 dark:hover:border-yellow-500"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-50 dark:hover:border-slate-700"
            )}>
            {layout === 'list' ? (
                // LIST VIEW LAYOUT
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        {renderCheckbox()}
                        <div className="flex flex-col min-w-0 flex-1 mr-4">
                            {renderTitle()}
                            {renderMetadata()}
                        </div>
                    </div>
                    {renderActions()}
                </div>
            ) : (
                // BOARD VIEW LAYOUT
                <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                        <div className="pt-1">{renderCheckbox()}</div>
                        <div className="flex flex-col min-w-0 flex-1">
                            {renderTitle()}
                        </div>
                    </div>
                    <div className="pl-8">
                        {renderMetadata()}
                    </div>
                    {renderActions()}
                </div>
            )}

            {/* Checkpoints & Notes Section - Show if NOT compact */}
            {(!isCompact) && (task.notes || (task.checkpoints && task.checkpoints.length > 0) || isActive) && (
                <div className={cn(
                    "mt-2 pt-4 border-t flex flex-col gap-4",
                    isActive ? "border-slate-800 dark:border-white/20" : "border-slate-100 dark:border-slate-800"
                )}>
                    {/* Checkpoints */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                            Checkpoints
                        </h4>
                        <div className="flex flex-col gap-1.5 ml-1">
                            {task.checkpoints?.map(cp => (
                                <div key={cp.id} className="flex items-center justify-between group/cp">
                                    <button
                                        onClick={() => toggleCheckpoint(cp.id)}
                                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity flex-1 text-left"
                                    >
                                        {cp.completed ? (
                                            <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        )}
                                        <span className={cn(
                                            "flex-1 truncate",
                                            cp.completed ? "line-through opacity-50" : ""
                                        )}>
                                            {cp.title}
                                        </span>
                                    </button>
                                </div>
                            ))}
                            {isActive && layout !== 'board' && (
                                <form onSubmit={addCheckpoint} className="flex items-center gap-2 mt-2 pl-6">
                                    <input
                                        type="text"
                                        value={newCheckpointTitle}
                                        onChange={(e) => setNewCheckpointTitle(e.target.value)}
                                        placeholder="Add checkpoint..."
                                        className={cn(
                                            "flex-1 bg-transparent border-b text-sm py-1 focus:outline-none",
                                            isActive
                                                ? "border-slate-700 focus:border-white dark:border-slate-300 dark:focus:border-slate-900"
                                                : "border-slate-200 focus:border-blue-500 dark:border-slate-700"
                                        )}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newCheckpointTitle.trim()}
                                        className="px-2 py-1 bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <StickyNote className="w-3 h-3" />
                                Notes
                            </h4>
                        </div>
                        <p className={cn(
                            "text-sm whitespace-pre-wrap ml-1",
                            !task.notes && "italic opacity-30",
                            task.status === 'done' && "text-slate-500 dark:text-slate-500"
                        )}>
                            {task.notes || "No notes added."}
                        </p>
                    </div>
                </div>
            )}
            {/* Modals */}
            <TimeLogHistory
                taskId={task.id}
                logs={logs}
                checkpoints={task.checkpoints}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onUpdateLog={onUpdateLog}
                onDeleteLog={onDeleteLog}
            />
            {/* We always render the dialog, but control visibility with isOpen. 
                We need to ensure it has access to projects even if the task currently has no project assigned. 
            */}
            <TaskEditDialog
                task={task}
                projects={projects}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdate={onUpdate}
            />
        </div>
    );
};
