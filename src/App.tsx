import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { TasksView } from './components/tasks/TasksView';
import { StatsView } from './components/stats/StatsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { useTasks } from './hooks/useTasks';
import { useTimeTracker } from './hooks/useTimeTracker';
import { useProjects } from './hooks/useProjects';

function App() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { activeTaskId, toggleTask, logs, updateLog, deleteLog } = useTimeTracker();
  const { projects, addProject, deleteProject } = useProjects();
  const [currentView, setCurrentView] = useState<'tasks' | 'stats' | 'projects'>('tasks');

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
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

export default App;
