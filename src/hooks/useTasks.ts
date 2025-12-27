import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>(() =>
        getFromStorage<Task[]>(STORAGE_KEYS.TASKS, [])
    );

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.TASKS, tasks);
    }, [tasks]);

    const addTask = useCallback((
        title: string,
        projectId?: string,
        initialCheckpoints?: { id: string; title: string; completed: boolean }[],
        priority?: 'low' | 'medium' | 'high' | 'critical',
        dueDate?: number,
        notes?: string,
        estimatedTime?: number
    ) => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            status: 'todo',
            createdAt: Date.now(),
            totalTimeSpent: 0,
            projectId,
            checkpoints: initialCheckpoints || [],
            notes: notes || '',
            priority: priority || 'medium',
            dueDate,
            lastStatusChangeAt: Date.now(),
            estimatedTime
        };
        setTasks(prev => [newTask, ...prev]);
        return newTask;
    }, []);

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                const updatedTask = { ...task, ...updates };
                // If status changed, update lastStatusChangeAt
                if (updates.status !== undefined && updates.status !== task.status) {
                    updatedTask.lastStatusChangeAt = Date.now();
                }
                return updatedTask;
            }
            return task;
        }));
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    }, []);

    const getTask = useCallback((id: string) => tasks.find(t => t.id === id), [tasks]);

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTask
    };
};
