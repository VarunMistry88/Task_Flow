import { useRef, useEffect, useState } from 'react';
import { TaskInput } from './TaskInput';
import { TaskItem } from './TaskItem';
import { CompactTaskItem } from './CompactTaskItem';
import { KanbanBoard } from './KanbanBoard';
import { TaskInfoPopup } from './TaskInfoPopup';
import type { Task, TimeLog, Project, Checkpoint, Priority } from '../../types';
import { LayoutGrid, List, Plus, CheckCircle2, Clock, CalendarDays, Activity, Rows } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../ui/Modal';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../../utils/storage';
import { groupTasksByCompletionDate, sortDateLabels } from '../../utils/dateUtils';
import { DailyTimeline } from '../stats/DailyTimeline';

interface TasksViewProps {
    tasks: Task[];
    projects: Project[];
    logs: TimeLog[];
    activeTaskId: string | null;
    addTask: (title: string, projectId?: string, initialCheckpoints?: Checkpoint[], priority?: Priority, dueDate?: number, notes?: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;
    updateLog: (logId: string, updates: Partial<TimeLog>) => void;
    deleteLog: (logId: string) => void;
}

export const TasksView = ({
    tasks,
    projects,
    logs,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateLog,
    deleteLog
}: TasksViewProps) => {
    const [now, setNow] = useState(Date.now());
    const [viewMode, setViewMode] = useState<'list' | 'board' | 'compact'>(() =>
        getFromStorage(STORAGE_KEYS.VIEW_MODE, 'list')
    );

    const handleViewChange = (mode: 'list' | 'board' | 'compact') => {
        setViewMode(mode);
        saveToStorage(STORAGE_KEYS.VIEW_MODE, mode);
    };
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref to hold the close timeout

    useEffect(() => {
        if (activeTaskId) {
            const interval = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(interval);
        }
    }, [activeTaskId, tasks]);

    const calculateTotalTime = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return 0;

        // Sum of all logs for this task (past and current)
        const taskLogs = logs.filter(l => l.taskId === taskId);
        const logsTime = taskLogs.reduce((acc, log) => {
            const end = log.endTime || now;
            // Ensure we never add negative time if system clock lags relative to start time
            return acc + Math.max(0, end - log.startTime);
        }, 0);

        // Include any legacy time stored directly on the task
        return (task.totalTimeSpent || 0) + logsTime;
    };

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const tasksWithTime = tasks.map(task => ({
        ...task,
        totalTimeSpent: calculateTotalTime(task.id)
    }));

    const sortedTasks = [...tasksWithTime].sort((a, b) => b.createdAt - a.createdAt);
    const activeTasks = sortedTasks.filter(t => t.status !== 'done');
    const completedTasks = sortedTasks
        .filter(t => t.status === 'done')
        .sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));

    // Stats Calculations
    const totalTimeToday = tasksWithTime.reduce((acc, task) => acc + task.totalTimeSpent, 0); // Simplified total, ideally filter by today's logs
    const dueTodayCount = activeTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const handleTaskAdd = (...args: Parameters<TasksViewProps['addTask']>) => {
        addTask(...args);
        setIsTaskModalOpen(false);
    };

    const [editingTaskPosition, setEditingTaskPosition] = useState<{ x: number; y: number } | undefined>();

    const handleTimelineTaskClick = (taskId: string, position: { x: number; y: number }) => {
        setEditingTaskId(taskId);
        setEditingTaskPosition(position);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full mx-auto px-4 md:px-6 py-8">

            {/* Dashboard Header / Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="glass p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{tasks.length}</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Activity className="w-4 h-4" />
                    </div>
                </div>

                <div className="glass p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Due Today</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{dueTodayCount}</p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                </div>

                <div className="glass p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{completedTasks.length} <span className="text-[10px] font-normal text-slate-400">({completionRate}%)</span></p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>

                <div className="glass p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Time Focus</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatDuration(totalTimeToday)}</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <DailyTimeline
                logs={logs}
                tasks={tasks}
                projects={projects}
                onTaskClick={(taskId, position) => {
                    if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                    }
                    handleTimelineTaskClick(taskId, position);
                }}
                onTaskLeave={() => {
                    closeTimeoutRef.current = setTimeout(() => {
                        setEditingTaskId(null);
                        setEditingTaskPosition(undefined);
                    }, 200); // 200ms grace period
                }}
            />


            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tasks</h2>
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => handleViewChange('list')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list'
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleViewChange('compact')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'compact'
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                                title="Compact View"
                            >
                                <Rows className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleViewChange('board')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'board'
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                                title="Board View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>

                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        {activeTasks.length === 0 && (
                            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/5 dark:bg-slate-900/50">
                                <div className="mb-2">✨</div>
                                <p>All caught up! No active tasks.</p>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="text-blue-500 hover:underline text-sm mt-2"
                                >
                                    Create a new task
                                </button>
                            </div>
                        )}
                        {activeTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                project={projects.find(p => p.id === task.projectId)}
                                isActive={activeTaskId === task.id}
                                onToggleStatus={(id) => {
                                    if (activeTaskId === id) toggleTask(id);
                                    updateTask(id, { status: 'done', completedAt: Date.now() });
                                }}
                                onToggleTimer={toggleTask}
                                onDelete={deleteTask}
                                onUpdate={updateTask}
                                logs={logs}
                                onUpdateLog={updateLog}
                                onDeleteLog={deleteLog}
                                projects={projects}
                            />
                        ))}

                        {completedTasks.length > 0 && (
                            <div className="pt-8 opacity-75">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Completed</h3>
                                <div className="space-y-6">
                                    {(() => {
                                        const groupedTasks = groupTasksByCompletionDate(completedTasks);
                                        const sortedLabels = sortDateLabels(Array.from(groupedTasks.keys()));

                                        return sortedLabels.map(dateLabel => (
                                            <div key={dateLabel} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2">
                                                        {dateLabel}
                                                    </span>
                                                    <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent dark:from-slate-700"></div>
                                                </div>
                                                {groupedTasks.get(dateLabel)!.map(task => (
                                                    <TaskItem
                                                        key={task.id}
                                                        task={task}
                                                        project={projects.find(p => p.id === task.projectId)}
                                                        isActive={false}
                                                        onToggleStatus={(id) => updateTask(id, { status: 'todo', completedAt: undefined })}
                                                        onToggleTimer={() => { }}
                                                        onDelete={deleteTask}
                                                        onUpdate={updateTask}
                                                        logs={logs}
                                                        onUpdateLog={updateLog}
                                                        onDeleteLog={deleteLog}
                                                        projects={projects}
                                                    />
                                                ))}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                ) : viewMode === 'compact' ? (
                    <div className="space-y-0.5 bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        {activeTasks.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <div className="mb-2">✨</div>
                                <p>All caught up! No active tasks.</p>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="text-blue-500 hover:underline text-sm mt-2"
                                >
                                    Create a new task
                                </button>
                            </div>
                        ) : (
                            activeTasks.map(task => (
                                <CompactTaskItem
                                    key={task.id}
                                    task={task}
                                    project={projects.find(p => p.id === task.projectId)}
                                    isActive={activeTaskId === task.id}
                                    onToggleStatus={(id) => {
                                        if (activeTaskId === id) toggleTask(id);
                                        updateTask(id, { status: 'done', completedAt: Date.now() });
                                    }}
                                    onToggleTimer={toggleTask}
                                    onDelete={deleteTask}
                                    onUpdate={updateTask}
                                    logs={logs}
                                    onUpdateLog={updateLog}
                                    onDeleteLog={deleteLog}
                                    projects={projects}
                                />
                            ))
                        )}

                        {completedTasks.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm z-10">
                                    Completed
                                </div>
                                <div>
                                    {completedTasks.map(task => (
                                        <CompactTaskItem
                                            key={task.id}
                                            task={task}
                                            project={projects.find(p => p.id === task.projectId)}
                                            isActive={false}
                                            onToggleStatus={(id) => updateTask(id, { status: 'todo', completedAt: undefined })}
                                            onToggleTimer={() => { }}
                                            onDelete={deleteTask}
                                            onUpdate={updateTask}
                                            logs={logs}
                                            onUpdateLog={updateLog}
                                            onDeleteLog={deleteLog}
                                            projects={projects}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasksWithTime}
                        projects={projects}
                        activeTaskId={activeTaskId}
                        onUpdateTask={updateTask}
                        onToggleTimer={toggleTask}
                        onDeleteTask={deleteTask}
                        logs={logs}
                        onUpdateLog={updateLog}
                        onDeleteLog={deleteLog}
                    />
                )}
            </div>

            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title="Create New Task"
            >
                <TaskInput onAdd={handleTaskAdd} projects={projects} />
            </Modal>

            {/* Task Info Popup (from Timeline clicks) */}
            {editingTaskId && (() => {
                const task = tasksWithTime.find(t => t.id === editingTaskId);
                if (!task) return null;
                const project = task.projectId ? projects.find(p => p.id === task.projectId) : undefined;
                return (
                    <TaskInfoPopup
                        task={task}
                        project={project}
                        position={editingTaskPosition}
                        isOpen={true}
                        isHoverMode={true}
                        onClose={() => {
                            setEditingTaskId(null);
                            setEditingTaskPosition(undefined);
                        }}
                        onMouseEnter={() => {
                            if (closeTimeoutRef.current) {
                                clearTimeout(closeTimeoutRef.current);
                                closeTimeoutRef.current = null;
                            }
                        }}
                        onMouseLeave={() => {
                            closeTimeoutRef.current = setTimeout(() => {
                                setEditingTaskId(null);
                                setEditingTaskPosition(undefined);
                            }, 200);
                        }}
                    />
                );
            })()}
        </div>
    );
};
