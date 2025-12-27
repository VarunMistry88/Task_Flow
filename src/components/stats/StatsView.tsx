import { useMemo } from 'react';
import type { Task, TimeLog, Project } from '../../types';
import { DailyActivityLog } from './DailyActivityLog';
import { CheckCircle2, Clock, TrendingUp, Calendar, Target, Zap, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsViewProps {
    tasks: Task[];
    projects: Project[];
    logs: TimeLog[];
}

export const StatsView = ({ tasks, projects, logs }: StatsViewProps) => {
    const stats = useMemo(() => {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneWeekMs = 7 * oneDayMs;

        // Basic counts
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done');
        const activeTasks = tasks.filter(t => t.status !== 'done');
        const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

        // Time calculations
        const totalTimeSpent = logs.reduce((acc, log) => {
            const duration = (log.endTime || now) - log.startTime;
            return acc + duration;
        }, 0);

        const avgTaskDuration = completedTasks.length > 0
            ? totalTimeSpent / completedTasks.length
            : 0;

        // Last 7 days time breakdown
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now - i * oneDayMs);
            date.setHours(0, 0, 0, 0);
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                time: 0
            };
        }).reverse();

        logs.forEach(log => {
            const logDate = new Date(log.startTime);
            logDate.setHours(0, 0, 0, 0);
            const dayIndex = last7Days.findIndex(d => {
                const compareDate = new Date(now - (6 - last7Days.indexOf(d)) * oneDayMs);
                compareDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === compareDate.getTime();
            });
            if (dayIndex !== -1) {
                const duration = (log.endTime || now) - log.startTime;
                last7Days[dayIndex].time += duration;
            }
        });

        // This week vs last week
        const thisWeekStart = now - (new Date(now).getDay() * oneDayMs);
        const lastWeekStart = thisWeekStart - oneWeekMs;

        const thisWeekTime = logs
            .filter(log => log.startTime >= thisWeekStart)
            .reduce((acc, log) => acc + ((log.endTime || now) - log.startTime), 0);

        const lastWeekTime = logs
            .filter(log => log.startTime >= lastWeekStart && log.startTime < thisWeekStart)
            .reduce((acc, log) => acc + ((log.endTime || now) - log.startTime), 0);

        const weeklyChange = lastWeekTime > 0
            ? Math.round(((thisWeekTime - lastWeekTime) / lastWeekTime) * 100)
            : 0;

        // Task distribution by status
        const todoCount = tasks.filter(t => t.status === 'todo').length;
        const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
        const doneCount = tasks.filter(t => t.status === 'done').length;

        // Task distribution by priority
        const priorityDist = {
            low: tasks.filter(t => t.priority === 'low').length,
            medium: tasks.filter(t => t.priority === 'medium' || !t.priority).length,
            high: tasks.filter(t => t.priority === 'high').length,
            critical: tasks.filter(t => t.priority === 'critical').length,
        };

        // Tasks by project
        const tasksByProject = projects.map(p => ({
            name: p.name,
            color: p.color,
            count: tasks.filter(t => t.projectId === p.id).length,
            completed: tasks.filter(t => t.projectId === p.id && t.status === 'done').length
        })).filter(p => p.count > 0);

        // Recent completions (last 10)
        const recentCompletions = tasks
            .filter(t => t.completedAt)
            .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
            .slice(0, 10);

        // Most productive day (by completions)
        const dayCompletions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            day,
            count: 0
        }));

        completedTasks.forEach(task => {
            if (task.completedAt) {
                const dayIndex = new Date(task.completedAt).getDay();
                dayCompletions[dayIndex].count++;
            }
        });

        const mostProductiveDay = dayCompletions.reduce((max, curr) =>
            curr.count > max.count ? curr : max
        );

        // Task with most time
        const taskTimeSums = new Map<string, number>();
        logs.forEach(log => {
            const current = taskTimeSums.get(log.taskId) || 0;
            taskTimeSums.set(log.taskId, current + ((log.endTime || now) - log.startTime));
        });

        let longestTask: Task | undefined = undefined;
        let maxTime = 0;
        taskTimeSums.forEach((time, taskId) => {
            if (time > maxTime) {
                maxTime = time;
                const foundTask = tasks.find(t => t.id === taskId);
                if (foundTask) {
                    longestTask = foundTask;
                }
            }
        });

        return {
            totalTasks,
            completedTasks: completedTasks.length,
            activeTasks: activeTasks.length,
            completionRate,
            totalTimeSpent,
            avgTaskDuration,
            last7Days,
            thisWeekTime,
            lastWeekTime,
            weeklyChange,
            todoCount,
            inProgressCount,
            doneCount,
            priorityDist,
            tasksByProject,
            recentCompletions,
            mostProductiveDay,
            longestTask: longestTask as Task | undefined,
            maxTime
        };
    }, [tasks, projects, logs]);

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const maxDayTime = Math.max(...stats.last7Days.map(d => d.time), 1);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full mx-auto px-4 md:px-6 py-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Statistics & Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track your productivity and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTasks}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Target className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Time</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatDuration(stats.totalTimeSpent)}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="glass p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Task Time</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatDuration(stats.avgTaskDuration)}</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Time Analytics & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last 7 Days */}
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Last 7 Days</h3>
                    </div>
                    <div className="space-y-3">
                        {stats.last7Days.map((day, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-10">{day.date}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-8 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-2"
                                        style={{ width: `${(day.time / maxDayTime) * 100}%` }}
                                    >
                                        {day.time > 0 && (
                                            <span className="text-xs font-medium text-white">{formatDuration(day.time)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">This Week vs Last Week</span>
                            <span className={cn(
                                "font-bold",
                                stats.weeklyChange > 0 ? "text-green-600" : stats.weeklyChange < 0 ? "text-red-600" : "text-slate-600"
                            )}>
                                {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Task Distribution by Status */}
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Task Distribution</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">To Do</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.todoCount}</span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-slate-500 h-full rounded-full"
                                    style={{ width: `${stats.totalTasks > 0 ? (stats.todoCount / stats.totalTasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">In Progress</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.inProgressCount}</span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressCount / stats.totalTasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Done</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.doneCount}</span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-green-500 h-full rounded-full"
                                    style={{ width: `${stats.totalTasks > 0 ? (stats.doneCount / stats.totalTasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">By Priority</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(stats.priorityDist).map(([priority, count]) => (
                                <div key={priority} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{priority}</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks by Project */}
                <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Tasks by Project</h3>
                    <div className="space-y-3">
                        {stats.tasksByProject.length > 0 ? (
                            stats.tasksByProject.map((project, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{project.name}</span>
                                            <span className="text-xs text-slate-500">{project.completed}/{project.count}</span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor: project.color,
                                                    width: `${project.count > 0 ? (project.completed / project.count) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No projects yet</p>
                        )}
                    </div>
                </div>

                {/* Productivity Insights */}
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Insights</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Most Productive Day</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.mostProductiveDay.day}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{stats.mostProductiveDay.count} tasks completed</p>
                        </div>

                        {stats.longestTask && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Longest Task</p>
                                <p className="text-sm font-bold text-purple-900 dark:text-purple-100 line-clamp-1">{stats.longestTask?.title || 'N/A'}</p>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{formatTime(stats.maxTime)} tracked</p>
                            </div>
                        )}

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Active Tasks</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeTasks}</p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Currently in progress</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Recent Completions</h3>
                    <div className="space-y-2">
                        {stats.recentCompletions.length > 0 ? (
                            stats.recentCompletions.map((task, i) => {
                                const project = projects.find(p => p.id === task.projectId);
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                                                {project && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{project.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 ml-4">
                                            {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No completed tasks yet</p>
                        )}
                    </div>
                </div>

                {/* Daily Activity Log */}
                <DailyActivityLog tasks={tasks} projects={projects} logs={logs} />
            </div>
        </div>
    );
};
