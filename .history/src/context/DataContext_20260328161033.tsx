import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Task, Project, TimeLog } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../utils/storage';

interface DataContextType {
    tasks: Task[];
    projects: Project[];
    logs: TimeLog[];
    loading: boolean;
    // Task actions
    addTask: (title: string, projectId?: string, initialCheckpoints?: any[], priority?: any, dueDate?: number, notes?: string, estimatedTime?: number) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    // Project actions
    addProject: (name: string, color?: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    // Time tracking actions
    toggleTask: (taskId: string) => Promise<void>;
    activeTaskId: string | null;
    updateLog: (logId: string, updates: Partial<TimeLog>) => Promise<void>;
    deleteLog: (logId: string) => Promise<void>;
    isLocalOnly: boolean;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

// Helper to calculate total time spent
const calculateTotalTime = (taskId: string, logs: TimeLog[]) => {
    return logs
        .filter(log => log.taskId === taskId)
        .reduce((acc, log) => {
            if (log.endTime) {
                return acc + (log.endTime - log.startTime);
            }
            return acc + (Date.now() - log.startTime);
        }, 0);
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [isLocalOnly, setIsLocalOnly] = useState(false);

    // Initial Data Fetch - Load from local storage only
    useEffect(() => {
        if (!user) {
            setTasks([]);
            setProjects([]);
            setLogs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Always use local storage in offline mode
        setIsLocalOnly(true);
        setTasks(getFromStorage(STORAGE_KEYS.TASKS, []));
        setProjects(getFromStorage(STORAGE_KEYS.PROJECTS, []));
        setLogs(getFromStorage(STORAGE_KEYS.LOGS, []));
        setLoading(false);

        // Supabase data fetching code commented out for offline-only mode
        // const fetchData = async () => {
        //     setLoading(true);
        //     try {
        //         const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        //         if (!isSupabaseConfigured) {
        //             throw new Error('Supabase not configured');
        //         }
        //
        //         const [tasksData, projectsData, logsData] = await Promise.all([
        //             supabase.from('tasks').select('*'),
        //             supabase.from('projects').select('*'),
        //             supabase.from('time_logs').select('*')
        //         ]);
        //
        //         if (tasksData.error) throw tasksData.error;
        //         if (projectsData.error) throw projectsData.error;
        //         if (logsData.error) throw logsData.error;
        //
        //         const loadedTasks: Task[] = tasksData.data.map((t: any) => ({
        //             id: t.id,
        //             title: t.title,
        //             status: t.status as any,
        //             priority: t.priority as any,
        //             projectId: t.project_id || undefined,
        //             dueDate: t.due_date ? new Date(t.due_date).getTime() : undefined,
        //             createdAt: new Date(t.created_at).getTime(),
        //             estimatedTime: t.estimated_time || undefined,
        //             notes: t.notes || undefined,
        //             checkpoints: t.checkpoints || [],
        //             totalTimeSpent: 0
        //         }));
        //
        //         const loadedProjects: Project[] = projectsData.data.map((p: any) => ({
        //             id: p.id,
        //             name: p.name,
        //             color: p.color
        //         }));
        //
        //         const loadedLogs: TimeLog[] = logsData.data.map((l: any) => ({
        //             id: l.id,
        //             taskId: l.task_id,
        //             startTime: new Date(l.start_time).getTime(),
        //             endTime: l.end_time ? new Date(l.end_time).getTime() : undefined,
        //             duration: l.duration || 0
        //         }));
        //
        //         setTasks(loadedTasks.map(t => ({ ...t, totalTimeSpent: calculateTotalTime(t.id, loadedLogs) })));
        //         setProjects(loadedProjects);
        //         setLogs(loadedLogs);
        //         setIsLocalOnly(false);
        //
        //     } catch (error) {
        //         console.warn("Falling back to local storage:", error);
        //         setIsLocalOnly(true);
        //         setTasks(getFromStorage(STORAGE_KEYS.TASKS, []));
        //         setProjects(getFromStorage(STORAGE_KEYS.PROJECTS, []));
        //         setLogs(getFromStorage(STORAGE_KEYS.LOGS, []));
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchData();
    }, [user]);

    // Persistence for local mode
    useEffect(() => {
        if (isLocalOnly) {
            saveToStorage(STORAGE_KEYS.TASKS, tasks);
            saveToStorage(STORAGE_KEYS.PROJECTS, projects);
            saveToStorage(STORAGE_KEYS.LOGS, logs);
        }
    }, [tasks, projects, logs, isLocalOnly]);

    useEffect(() => {
        const activeLog = logs.find(l => !l.endTime);
        setActiveTaskId(activeLog ? activeLog.taskId : null);
    }, [logs]);

    // --- Actions ---

    const addTask = async (title: string, projectId?: string, initialCheckpoints?: any[], priority?: any, dueDate?: number, notes?: string, estimatedTime?: number) => {
        // Offline-only mode - create task locally
        const localTask: Task = {
            id: crypto.randomUUID(),
            title,
            status: 'todo',
            priority: priority || 'medium',
            projectId,
            dueDate,
            createdAt: Date.now(),
            estimatedTime,
            notes,
            checkpoints: initialCheckpoints || [],
            totalTimeSpent: 0
        };

        setTasks(prev => [...prev, localTask]);

        // Supabase task creation code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     const { data, error } = await supabase.from('tasks').insert({
        //         title,
        //         project_id: projectId || null,
        //         status: 'todo',
        //         priority: priority || 'medium',
        //         due_date: dueDate ? new Date(dueDate).toISOString() : null,
        //         notes,
        //         estimated_time: estimatedTime,
        //         checkpoints: initialCheckpoints || [],
        //         user_id: user.id
        //     }).select().single();
        //
        //     if (!error && data) {
        //         const createdTask: Task = {
        //             id: data.id,
        //             title: data.title,
        //             status: data.status as any,
        //             priority: data.priority as any,
        //             projectId: data.project_id || undefined,
        //             dueDate: data.due_date ? new Date(data.due_date).getTime() : undefined,
        //             createdAt: new Date(data.created_at).getTime(),
        //             estimatedTime: data.estimated_time || undefined,
        //             notes: data.notes || undefined,
        //             checkpoints: data.checkpoints || [],
        //             totalTimeSpent: 0
        //         };
        //         setTasks(prev => [...prev, createdTask]);
        //         return;
        //     }
        // }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        // Offline-only mode - update task locally
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        // Supabase task update code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     const dbUpdates: any = {};
        //     if (updates.title !== undefined) dbUpdates.title = updates.title;
        //     if (updates.status !== undefined) dbUpdates.status = updates.status;
        //     if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        //     if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
        //     if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
        //     if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        //     if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
        //     if (updates.checkpoints !== undefined) dbUpdates.checkpoints = updates.checkpoints;
        //     await supabase.from('tasks').update(dbUpdates).eq('id', id);
        // }
    };

    const deleteTask = async (id: string) => {
        // Offline-only mode - delete task locally
        setTasks(prev => prev.filter(t => t.id !== id));

        // Supabase task deletion code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     await supabase.from('tasks').delete().eq('id', id);
        // }
    };

    const addProject = async (name: string, color: string = '#3b82f6') => {
        // Offline-only mode - create project locally
        setProjects(prev => [...prev, { id: crypto.randomUUID(), name, color }]);

        // Supabase project creation code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     const { data, error } = await supabase.from('projects').insert({
        //         user_id: user.id,
        //         name,
        //         color
        //     }).select().single();
        //
        //     if (!error && data) {
        //         setProjects(prev => [...prev, { id: data.id, name: data.name, color: data.color }]);
        //         return;
        //     }
        // }
    };

    const deleteProject = async (id: string) => {
        // Offline-only mode - delete project locally
        setProjects(prev => prev.filter(p => p.id !== id));
        setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: undefined } : t));

        // Supabase project deletion code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     await supabase.from('projects').delete().eq('id', id);
        // }
    };

    const toggleTask = async (taskId: string) => {
        const newLogId = crypto.randomUUID();

        // Stop current active task if any
        if (activeTaskId) {
            const activeLog = logs.find(l => l.taskId === activeTaskId && !l.endTime);
            if (activeLog) {
                setLogs(prev => prev.map(l => l.id === activeLog.id ? { ...l, endTime: Date.now(), duration: Date.now() - l.startTime } : l));
            }
        }

        // If clicking a different task, start it
        if (activeTaskId !== taskId) {
            const newLog: TimeLog = {
                id: newLogId,
                taskId: taskId,
                startTime: Date.now(),
                endTime: undefined,
                duration: 0
            };
            setLogs(prev => [...prev, newLog]);
        }

        // Supabase time tracking code commented out for offline-only mode
        // if (!isLocalOnly && user) {
        //     if (activeTaskId) {
        //         const activeLog = logs.find(l => l.taskId === activeTaskId && !l.endTime);
        //         if (activeLog) {
        //             await supabase.from('time_logs')
        //                 .update({ end_time: new Date().toISOString(), duration: Date.now() - activeLog.startTime })
        //                 .eq('id', activeLog.id);
        //         }
        //     }
        //     if (activeTaskId !== taskId) {
        //         const { data, error } = await supabase.from('time_logs').insert({
        //             user_id: user.id,
        //             task_id: taskId,
        //             start_time: new Date().toISOString()
        //         }).select().single();
        //         if (!error && data) newLogId = data.id;
        //     }
        // }
    };

    const updateLog = async (_logId: string, _updates: Partial<TimeLog>) => {
        // Implementation for editing manual logs if needed
        console.log("Update log not fully implemented yet");
    };

    const deleteLog = async (logId: string) => {
        if (!isLocalOnly && user) {
            await supabase.from('time_logs').delete().eq('id', logId);
        }
        setLogs(prev => prev.filter(l => l.id !== logId));
    };

    // Live Timer Effect
    useEffect(() => {
        if (!activeTaskId) return;
        const interval = setInterval(() => {
            setTasks(prev => prev.map(t => {
                if (t.id === activeTaskId) {
                    return {
                        ...t,
                        totalTimeSpent: calculateTotalTime(t.id, logs)
                    };
                }
                return t;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTaskId, logs]);


    return (
        <DataContext.Provider value={{
            tasks,
            projects,
            logs,
            loading,
            addTask,
            updateTask,
            deleteTask,
            addProject,
            deleteProject,
            toggleTask,
            activeTaskId,
            updateLog,
            deleteLog,
            isLocalOnly
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
