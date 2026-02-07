import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { TasksView } from './components/tasks/TasksView';
import { NotepadView } from './components/tasks/NotepadView';
import { StatsView } from './components/stats/StatsView';
import { ProjectsView } from './components/projects/ProjectsView';


import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const {
    tasks,
    projects,
    logs,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    deleteProject,
    toggleTask,
    updateLog,
    deleteLog
  } = useData();
  const [currentView, setCurrentView] = useState<'tasks' | 'stats' | 'projects' | 'notepad'>('tasks');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>

      {currentView === 'notepad' && (
        <NotepadView
          tasks={tasks}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      )}

      {currentView === 'tasks' && (
        <TasksView
          tasks={tasks}
          projects={projects}
          logs={logs}
          activeTaskId={activeTaskId}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          updateLog={updateLog}
          deleteLog={deleteLog}
        />
      )}

      {currentView === 'stats' && (
        <StatsView
          tasks={tasks}
          projects={projects}
          logs={logs}
        />
      )}

      {currentView === 'projects' && (
        <ProjectsView
          projects={projects}
          tasks={tasks}
          onAddProject={addProject}
          onDeleteProject={deleteProject}
        />
      )}
    </Layout>
  );
}

function App() {
  return <AppContent />;
}

export default App;
