import React, { useState } from 'react';
import { CheckSquare, BarChart2, Folder, Moon, Sun, Zap, FileText, Database, Menu, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface LayoutProps {
    children: React.ReactNode;
    currentView?: 'tasks' | 'stats' | 'projects' | 'notepad';
    onNavigate?: (view: 'tasks' | 'stats' | 'projects' | 'notepad') => void;
}

export const Layout = ({ children, currentView = 'tasks', onNavigate }: LayoutProps) => {
    const { theme, toggleTheme } = useTheme();
    const { isLocalOnly } = useData();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className={cn(
                "border-r border-slate-200 dark:border-slate-800 bg-white dark:!bg-slate-900 hidden md:flex flex-col transition-all duration-300 relative overflow-hidden",
                isCollapsed ? "w-20 p-3" : "w-64 p-6"
            )}>
                <div className={cn(
                    "flex items-center mb-8",
                    isCollapsed ? "flex-col gap-2" : "gap-3"
                )}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 whitespace-nowrap">
                            Task Flow
                        </h1>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors flex-shrink-0",
                            !isCollapsed && "ml-auto"
                        )}
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                </div>

                {isLocalOnly && !isCollapsed && (
                    <div className="mb-6 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                        <Database className="w-3 h-3 text-amber-600" />
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Local Mode</span>
                    </div>
                )}

                {isLocalOnly && isCollapsed && (
                    <div className="mb-6 flex justify-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" title="Local Mode"></div>
                    </div>
                )}

                <nav className="space-y-2 flex-1">
                    <NavItem
                        icon={<CheckSquare />}
                        label="Tasks"
                        active={currentView === 'tasks'}
                        onClick={() => onNavigate?.('tasks')}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<BarChart2 />}
                        label="Stats"
                        active={currentView === 'stats'}
                        onClick={() => onNavigate?.('stats')}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<Folder />}
                        label="Projects"
                        active={currentView === 'projects'}
                        onClick={() => onNavigate?.('projects')}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Notepad"
                        active={currentView === 'notepad'}
                        onClick={() => onNavigate?.('notepad')}
                        collapsed={isCollapsed}
                    />
                </nav>

                <div className={cn(
                    "mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {!isCollapsed && <div className="text-xs text-slate-400">v1.0.0</div>}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <div className="h-full max-w-5xl mx-auto p-6 md:p-12">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, collapsed }: { 
    icon: React.ReactNode, 
    label: string, 
    active?: boolean, 
    onClick?: () => void,
    collapsed?: boolean 
}) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
            active
                ? "bg-slate-100 text-slate-900 dark:!bg-slate-800 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-50 dark:hover:bg-slate-800",
            collapsed && "justify-center"
        )}
        title={collapsed ? label : undefined}
    >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 flex-shrink-0" })}
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
);
