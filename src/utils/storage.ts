export const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks',
    PROJECTS: 'taskflow_projects',
    LOGS: 'taskflow_logs',
    ACTIVE_TASK: 'taskflow_active_task',
    VIEW_MODE: 'taskflow_view_mode',
    WIP_LIMIT: 'taskflow_wip_limit'
};

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from storage:`, error);
        return defaultValue;
    }
};

export const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};
