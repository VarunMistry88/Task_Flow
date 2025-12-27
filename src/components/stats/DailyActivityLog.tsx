import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Task, Project, TimeLog } from '../../types';

interface DailyActivityLogProps {
    tasks: Task[];
    projects: Project[];
    logs: TimeLog[];
}

export const DailyActivityLog = ({ tasks, projects, logs }: DailyActivityLogProps) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatTime = (ms: number) => {
        const date = new Date(ms);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const dailyData = useMemo(() => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dayLogs = logs.filter(log =>
            log.startTime >= startOfDay.getTime() &&
            log.startTime <= endOfDay.getTime()
        ).sort((a, b) => b.startTime - a.startTime); // Newest first

        const totalTime = dayLogs.reduce((acc, log) => {
            const end = log.endTime || Date.now();
            return acc + (end - log.startTime);
        }, 0);

        const uniqueTasks = new Set(dayLogs.map(l => l.taskId)).size;

        return {
            logs: dayLogs,
            totalTime,
            uniqueTasks
        };
    }, [logs, selectedDate]);

    return (
        <div className="glass p-6 rounded-2xl w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Daily Activity
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Detailed breakdown of time spent
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 min-w-[100px] text-center">
                        {isToday(selectedDate) ? 'Today' : selectedDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                    <button
                        onClick={() => navigateDate(1)}
                        disabled={isToday(selectedDate)}
                        className={cn(
                            "p-1.5 rounded-md transition-colors",
                            isToday(selectedDate)
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        )}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total Time Tracked</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatDuration(dailyData.totalTime)}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Tasks Worked On</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{dailyData.uniqueTasks}</p>
                </div>
            </div>

            <div className="space-y-3">
                {dailyData.logs.length > 0 ? (
                    dailyData.logs.map(log => {
                        const task = tasks.find(t => t.id === log.taskId);
                        const project = task?.projectId ? projects.find(p => p.id === task.projectId) : undefined;
                        const duration = (log.endTime || Date.now()) - log.startTime;

                        return (
                            <div key={log.id} className="relative pl-6 pb-6 last:pb-0 border-l border-slate-200 dark:border-slate-800 last:border-l-0">
                                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                            <span>{formatTime(log.startTime)}</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span>{log.endTime ? formatTime(log.endTime) : 'Now'}</span>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                            {task?.title || 'Unknown Task'}
                                        </p>
                                        {project && (
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                <span className="text-xs text-slate-500">{project.name}</span>
                                            </div>
                                        )}
                                        {log.note && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic bg-white dark:bg-slate-900/50 p-2 rounded">
                                                "{log.note}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {formatDuration(duration)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">No activity recorded</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            You didn't track any time on this day.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
