import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>(() =>
        getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, [])
    );

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    }, [projects]);

    const addProject = useCallback((name: string, color?: string) => {
        const newProject: Project = {
            id: uuidv4(),
            name,
            color
        };
        setProjects(prev => [...prev, newProject]);
        return newProject;
    }, []);

    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(project =>
            project.id === id ? { ...project, ...updates } : project
        ));
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(project => project.id !== id));
    }, []);

    return {
        projects,
        addProject,
        updateProject,
        deleteProject
    };
};
