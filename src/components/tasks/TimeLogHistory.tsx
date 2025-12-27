import { X, History, Save, Trash2, Edit2, ListTodo, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import type { TimeLog, Checkpoint } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface TimeLogHistoryProps {
    taskId: string;
    logs: TimeLog[];
    checkpoints?: Checkpoint[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateLog: (logId: string, updates: Partial<TimeLog>) => void;
    onDeleteLog: (logId: string) => void;
}

export const TimeLogHistory = ({
    taskId,
    logs,
    checkpoints,
    isOpen,
    onClose,
    onUpdateLog,
    onDeleteLog
}: TimeLogHistoryProps) => {
    const taskLogs = logs
        .filter(log => log.taskId === taskId)
        .filter(log => log.taskId === taskId)
        .sort((a, b) => b.startTime - a.startTime);

    const completedCheckpoints = checkpoints
        ?.filter(cp => cp.completed && cp.completedAt)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ start: string; end: string }>({ start: '', end: '' });

    if (!isOpen) return null;

    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const formatTimeInput = (timestamp: number) => {
        const date = new Date(timestamp);
        // Format for datetime-local input: YYYY-MM-DDThh:mm
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };

    const handleEditClick = (log: TimeLog) => {
        setEditingLogId(log.id);
        setEditForm({
            start: formatTimeInput(log.startTime),
            end: log.endTime ? formatTimeInput(log.endTime) : ''
        });
    };

    const handleSave = () => {
        if (!editingLogId) return;

        const startTime = new Date(editForm.start).getTime();
        const endTime = editForm.end ? new Date(editForm.end).getTime() : undefined;

        if (endTime && endTime < startTime) {
            alert('End time cannot be before start time');
            return;
        }

        onUpdateLog(editingLogId, {
            startTime,
            endTime
        });
        setEditingLogId(null);
    };

    const handleDelete = (logId: string) => {
        if (confirm('Are you sure you want to delete this time entry?')) {
            onDeleteLog(logId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-500" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Time History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Time Logs Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <History className="w-3 h-3" />
                            Time Logs
                        </h3>
                        {taskLogs.length > 0 ? (
                            taskLogs.map(log => (
                                <div
                                    key={log.id}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all",
                                        editingLogId === log.id
                                            ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                                            : "bg-slate-50/50 border-slate-200/50 dark:bg-slate-800/20 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                                    )}
                                >
                                    {editingLogId === log.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={editForm.start}
                                                        onChange={e => setEditForm(prev => ({ ...prev, start: e.target.value }))}
                                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={editForm.end}
                                                        onChange={e => setEditForm(prev => ({ ...prev, end: e.target.value }))}
                                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingLogId(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSave}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                >
                                                    <Save className="w-4 h-4 mr-1.5" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {formatDateTime(log.startTime)}
                                                    </span>
                                                    <span className="text-slate-400 mx-1">→</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {log.endTime ? formatDateTime(log.endTime) : <span className="text-green-500 italic">Running...</span>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {log.endTime && (
                                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                            {formatDuration(log.endTime - log.startTime)}
                                                        </span>
                                                    )}
                                                    {log.isManuallyEdited && (
                                                        <span className="text-[10px] font-medium text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-900/30 flex items-center gap-1">
                                                            <Edit2 className="w-2.5 h-2.5" />
                                                            Edited
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditClick(log)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(log.id)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <History className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">No time logs yet</p>
                            </div>
                        )}
                    </div>

                    {/* Completed Checkpoints Section */}
                    {completedCheckpoints && completedCheckpoints.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <ListTodo className="w-3 h-3" />
                                Completed Items
                            </h3>
                            <div className="space-y-2">
                                {completedCheckpoints.map(cp => (
                                    <div key={cp.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <CheckSquare className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-through decoration-slate-400">
                                                {cp.title}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {cp.completedAt ? formatDateTime(cp.completedAt) : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
