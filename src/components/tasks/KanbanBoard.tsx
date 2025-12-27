import { useState, type DragEvent } from 'react';
import type { Task, Project, TaskStatus, TimeLog } from '../../types';
import { TaskItem } from './TaskItem';
import { cn } from '../../utils/cn';
import { Toast } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../../utils/storage';
import { Settings } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    projects: Project[];
    activeTaskId: string | null;
    onUpdateTask: (id: string, updates: Partial<Task>) => void;
    onToggleTimer: (id: string) => void;
    onDeleteTask: (id: string) => void;
    logs: TimeLog[];
    onUpdateLog: (logId: string, updates: Partial<TimeLog>) => void;
    onDeleteLog: (logId: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
];

export const KanbanBoard = ({
    tasks,
    projects,
    activeTaskId,
    onUpdateTask,
    onToggleTimer,
    onDeleteTask,
    logs,
    onUpdateLog,
    onDeleteLog
}: KanbanBoardProps) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [wipLimit, setWipLimit] = useState<number>(() => getFromStorage(STORAGE_KEYS.WIP_LIMIT, 3));
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [tempLimit, setTempLimit] = useState(wipLimit.toString());
    const { toast, showToast, hideToast } = useToast();

    const handleDragStart = (e: DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        if (taskId) {
            // Check WIP limit for in-progress column
            if (status === 'in-progress') {
                const currentInProgressCount = tasks.filter(t => t.status === 'in-progress').length;
                const draggedTask = tasks.find(t => t.id === taskId);
                const isMovingToProgress = draggedTask?.status !== 'in-progress';

                if (isMovingToProgress && currentInProgressCount >= wipLimit) {
                    showToast(
                        `⚠️ You have ${currentInProgressCount + 1} tasks in progress (limit: ${wipLimit}). Consider finishing some before starting new ones.`,
                        'warning'
                    );
                }
            }

            const updates: Partial<Task> = { status };
            if (status === 'done') {
                updates.completedAt = Date.now();
            } else {
                updates.completedAt = undefined;
            }
            onUpdateTask(taskId, updates);
        }
        setDraggedTaskId(null);
    };

    const handleLimitSave = () => {
        const newLimit = parseInt(tempLimit, 10);
        if (!isNaN(newLimit) && newLimit >= 1 && newLimit <= 20) {
            setWipLimit(newLimit);
            saveToStorage(STORAGE_KEYS.WIP_LIMIT, newLimit);
            setIsEditingLimit(false);
        } else {
            setTempLimit(wipLimit.toString());
            setIsEditingLimit(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {COLUMNS.map(column => {
                    const columnTasks = tasks.filter(t => t.status === column.id);
                    const isOverLimit = column.id === 'in-progress' && columnTasks.length > wipLimit;

                    return (
                        <div
                            key={column.id}
                            className={cn(
                                "flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border transition-colors",
                                isOverLimit
                                    ? "border-orange-300 dark:border-orange-800"
                                    : "border-slate-200/50 dark:border-slate-800/50"
                            )}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2">
                                <span>{column.label}</span>
                                <div className="flex items-center gap-2">
                                    {column.id === 'in-progress' && (
                                        <>
                                            {isEditingLimit ? (
                                                <input
                                                    type="number"
                                                    value={tempLimit}
                                                    onChange={(e) => setTempLimit(e.target.value)}
                                                    onBlur={handleLimitSave}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleLimitSave();
                                                        if (e.key === 'Escape') {
                                                            setTempLimit(wipLimit.toString());
                                                            setIsEditingLimit(false);
                                                        }
                                                    }}
                                                    className="w-12 px-1 py-0.5 text-xs bg-white dark:bg-slate-800 border border-blue-500 rounded text-center focus:outline-none"
                                                    autoFocus
                                                    min="1"
                                                    max="20"
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingLimit(true);
                                                        setTempLimit(wipLimit.toString());
                                                    }}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                                    title="Configure WIP limit"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <span
                                                className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                                    isOverLimit
                                                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                )}
                                                title={isOverLimit ? "Too many active tasks reduce focus" : undefined}
                                            >
                                                {columnTasks.length}/{wipLimit}
                                            </span>
                                        </>
                                    )}
                                    {column.id !== 'in-progress' && (
                                        <span className="bg-slate-200 dark:bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                                            {columnTasks.length}
                                        </span>
                                    )}
                                </div>
                            </h3>

                            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
                                {columnTasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        className={cn(
                                            "cursor-grab active:cursor-grabbing",
                                            draggedTaskId === task.id && "opacity-50"
                                        )}
                                    >
                                        <TaskItem
                                            task={task}
                                            project={projects.find(p => p.id === task.projectId)}
                                            isActive={activeTaskId === task.id}
                                            onToggleStatus={(id) => {
                                                const newStatus = task.status === 'done' ? 'todo' : 'done';
                                                const updates: Partial<Task> = { status: newStatus };
                                                if (newStatus === 'done') updates.completedAt = Date.now();
                                                else updates.completedAt = undefined;
                                                onUpdateTask(id, updates);
                                            }}
                                            onToggleTimer={onToggleTimer}
                                            onDelete={onDeleteTask}
                                            onUpdate={onUpdateTask}
                                            logs={logs}
                                            onUpdateLog={onUpdateLog}
                                            onDeleteLog={onDeleteLog}
                                            layout="board"
                                            projects={projects}
                                        />
                                    </div>
                                ))}
                                {columnTasks.length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-sm italic">
                                        Drop tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
};
