import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Task, TaskInput, TaskStatus } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { createSeedTasks } from '../utils/seed';
import { readJSON, writeJSON } from '../utils/storage';
import { tasksReducer } from '../utils/tasksReducer';

interface TasksContextValue {
  tasks: Task[];
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, changes: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, toStatus: TaskStatus, overId?: string | null) => void;
  resetToSample: () => void;
  clearAll: () => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

function loadInitial(): Task[] {
  const stored = readJSON<Task[] | null>(STORAGE_KEYS.tasks, null);
  return Array.isArray(stored) ? stored : createSeedTasks();
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadInitial);

  // Persist every change (CRUD + drag & drop) to localStorage.
  useEffect(() => {
    writeJSON(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  const addTask = useCallback((input: TaskInput) => dispatch({ type: 'add', input }), []);
  const updateTask = useCallback((id: string, changes: Partial<TaskInput>) => dispatch({ type: 'update', id, changes }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: 'delete', id }), []);
  const moveTask = useCallback(
    (id: string, toStatus: TaskStatus, overId?: string | null) => dispatch({ type: 'move', id, toStatus, overId }),
    [],
  );
  const resetToSample = useCallback(() => dispatch({ type: 'replace', tasks: createSeedTasks() }), []);
  const clearAll = useCallback(() => dispatch({ type: 'replace', tasks: [] }), []);

  const value = useMemo(
    () => ({ tasks, addTask, updateTask, deleteTask, moveTask, resetToSample, clearAll }),
    [tasks, addTask, updateTask, deleteTask, moveTask, resetToSample, clearAll],
  );
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within <TasksProvider>');
  return ctx;
}
