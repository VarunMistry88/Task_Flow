import React, { useMemo } from 'react';
import { startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import type { TimeLog, Task, Project } from '../../types';

interface DailyTimelineProps {
    logs: TimeLog[];
    tasks: Task[];
    projects: Project[];
    onTaskClick?: (taskId: string, position: { x: number; y: number }) => void;
    onTaskLeave?: () => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ logs, tasks, projects, onTaskClick, onTaskLeave }) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const totalMinutesInDay = 24 * 60;

    // Cool Analogous Blue-Purple Palette
    const colorPalette = [
        '#4A90E2', // Bright Blue
        '#5B7FDB', // Medium Blue
        '#6B6ED4', // Blue-Violet
        '#7B5DCD', // Violet
        '#8B4CC6', // Purple-Violet
        '#9B3BBF', // Medium Purple
        '#AB2AB8', // Bright Purple
        '#7C3AED', // Deep Purple
    ];

    // Generate consistent color for task based on ID
    const getTaskColor = (task?: Task) => {
        if (!task) return '#94a3b8';

        // Generate hash from task ID
        let hash = 0;
        for (let i = 0; i < task.id.length; i++) {
            hash = task.id.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Select color from palette using hash
        const colorIndex = Math.abs(hash) % colorPalette.length;
        return colorPalette[colorIndex];
    };

    const todaysBlocks = useMemo(() => {
        return logs
            .map(log => {
                const start = new Date(log.startTime);
                const end = log.endTime ? new Date(log.endTime) : new Date();

                // Check if the log intersects with today
                if (end < todayStart || start > todayEnd) return null;

                // Clamp start/end to today's bounds
                const clampedStart = start < todayStart ? todayStart : start;
                const clampedEnd = end > todayEnd ? todayEnd : end;

                // Calculate position and width
                const startMinutes = differenceInMinutes(clampedStart, todayStart);
                const durationMinutes = differenceInMinutes(clampedEnd, clampedStart);

                if (durationMinutes <= 0) return null;

                const leftPercent = (startMinutes / totalMinutesInDay) * 100;
                const widthPercent = (durationMinutes / totalMinutesInDay) * 100;

                const task = tasks.find(t => t.id === log.taskId);
                const project = task?.projectId ? projects.find(p => p.id === task.projectId) : undefined;

                return {
                    id: log.id,
                    taskId: log.taskId,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    color: getTaskColor(task),
                    taskTitle: task?.title || 'Unknown Task',
                    projectName: project?.name,
                    duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
                    isOngoing: !log.endTime
                };
            })
            .filter((block): block is NonNullable<typeof block> => block !== null);
    }, [logs, tasks, projects, todayStart, todayEnd]);

    // Generate hour markers
    const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

    return (
        <div className="w-full glass rounded-2xl p-6 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Today's Timeline
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <div className="relative h-16 w-full select-none">
                {/* Timeline Bar Background */}
                <div className="absolute top-8 left-0 right-0 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Time Blocks */}
                    {todaysBlocks.map(block => (
                        <div
                            key={block.id}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                onTaskClick?.(block.taskId, {
                                    x: rect.left + rect.width / 2,
                                    y: rect.bottom
                                });
                            }}
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                onTaskClick?.(block.taskId, {
                                    x: rect.left + rect.width / 2,
                                    y: rect.bottom
                                });
                            }}
                            onMouseLeave={() => {
                                onTaskLeave?.();
                            }}
                            className="absolute top-0 h-full rounded-sm hover:brightness-110 hover:z-10 transition-all cursor-pointer group"
                            style={{
                                left: block.left,
                                width: block.width,
                                backgroundColor: block.color,
                                minWidth: '4px'
                            }}
                        >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                                <span className="font-semibold">{block.taskTitle}</span>
                                {block.projectName && (
                                    <>
                                        <span className="mx-1 opacity-50">·</span>
                                        <span className="opacity-75">{block.projectName}</span>
                                    </>
                                )}
                                <span className="mx-1 opacity-50">|</span>
                                <span>{block.duration}</span>
                                {block.isOngoing && <span className="ml-1 text-green-400 animate-pulse">●</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hour Markers */}
                <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                    {hourMarkers.map(hour => (
                        <div
                            key={hour}
                            className="absolute top-2 bottom-0 flex flex-col items-center gap-1"
                            style={{ left: `${(hour / 24) * 100}%` }}
                        >
                            {/* Tick mark */}
                            <div className={`w-px h-2 ${hour % 6 === 0 ? 'bg-slate-400 dark:bg-slate-500 h-3' : 'bg-slate-200 dark:bg-slate-700'}`} />

                            {/* Label (only every 6 hours and potentially first/last if space permits) */}
                            {hour % 6 === 0 && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -translate-x-1/2 pt-10 whitespace-nowrap">
                                    {hour === 0 || hour === 24 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
