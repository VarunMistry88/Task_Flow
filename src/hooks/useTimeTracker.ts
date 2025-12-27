import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TimeLog } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export const useTimeTracker = (onTick?: (taskId: string, duration: number) => void) => {
    const [activeTaskId, setActiveTaskId] = useState<string | null>(() =>
        getFromStorage<string | null>(STORAGE_KEYS.ACTIVE_TASK, null)
    );

    const [logs, setLogs] = useState<TimeLog[]>(() =>
        getFromStorage<TimeLog[]>(STORAGE_KEYS.LOGS, [])
    );

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync logs and active task to storage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.LOGS, logs);
    }, [logs]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ACTIVE_TASK, activeTaskId);
    }, [activeTaskId]);

    const stopTask = useCallback(() => {
        if (!activeTaskId) return;

        const now = Date.now();
        // Find the open log for this task and close it
        setLogs(prev => prev.map(log => {
            if (log.taskId === activeTaskId && !log.endTime) {
                return { ...log, endTime: now };
            }
            return log;
        }));

        setActiveTaskId(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [activeTaskId]);

    const startTask = useCallback((taskId: string) => {
        if (activeTaskId === taskId) return; // Already running

        // Stop current if any
        if (activeTaskId) {
            stopTask();
        }

        // Start new
        const newLog: TimeLog = {
            id: uuidv4(),
            taskId,
            startTime: Date.now()
        };

        setLogs(prev => [...prev, newLog]);
        setActiveTaskId(taskId);
    }, [activeTaskId, stopTask]);

    const toggleTask = useCallback((taskId: string) => {
        if (activeTaskId === taskId) {
            stopTask();
        } else {
            startTask(taskId);
        }
    }, [activeTaskId, startTask, stopTask]);

    // Interval for UI updates/ticks (optional logic, mostly handled by consumer checking elapsed time)
    useEffect(() => {
        if (activeTaskId) {
            timerRef.current = setInterval(() => {
                // Just triggers re-renders or calls onTick if needed
                // Since we store timestamps, we don't strictly *need* an interval to update state unless we want to increment a counter
                if (onTick) {
                    // We would need to calculate elapsed here, but usually components handle the "active duration" display 
                    // by comparing Date.now() - startTime.
                    // So this might be redundant for data, but useful for UI refresh.
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeTaskId, onTick]);

    const updateLog = useCallback((logId: string, updates: Partial<TimeLog>) => {
        setLogs(prev => prev.map(log =>
            log.id === logId
                ? { ...log, ...updates, isManuallyEdited: true }
                : log
        ));
    }, []);

    const deleteLog = useCallback((logId: string) => {
        setLogs(prev => prev.filter(log => log.id !== logId));
    }, []);

    return {
        activeTaskId,
        startTask,
        stopTask,
        toggleTask,
        updateLog,
        deleteLog,
        logs
    };
};
