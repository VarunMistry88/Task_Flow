import React from 'react';
import { CheckSquare, BarChart2, Folder, Moon, Sun, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface LayoutProps {
    children: React.ReactNode;
    currentView?: 'tasks' | 'stats' | 'projects';
    onNavigate?: (view: 'tasks' | 'stats' | 'projects') => void;
}

export const Layout = ({ children, currentView = 'tasks', onNavigate }: LayoutProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:!bg-slate-900 p-6 hidden md:flex flex-col transition-colors duration-300 z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
                        Task Flow
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem
                        icon={<CheckSquare />}
                        label="Tasks"
                        active={currentView === 'tasks'}
                        onClick={() => onNavigate?.('tasks')}
                    />
                    <NavItem
                        icon={<BarChart2 />}
                        label="Stats"
                        active={currentView === 'stats'}
                        onClick={() => onNavigate?.('stats')}
                    />
                    <NavItem
                        icon={<Folder />}
                        label="Projects"
                        active={currentView === 'projects'}
                        onClick={() => onNavigate?.('projects')}
                    />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400">v1.0.0</div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            active
                ? "bg-slate-100 text-slate-900 dark:!bg-slate-800 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-50 dark:hover:bg-slate-800"
        )}
    >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
        {label}
    </button>
);
