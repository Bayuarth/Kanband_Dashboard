import { useCallback, useState } from 'react';
import type { Task, TaskStatus } from '../types';

/** Controls the create / edit modal. */
export function useTaskModal() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const openCreate = useCallback((status: TaskStatus = 'todo') => {
    setEditing(null);
    setDefaultStatus(status);
    setOpen(true);
  }, []);
  const openEdit = useCallback((task: Task) => {
    setEditing(task);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return { open, editing, defaultStatus, openCreate, openEdit, close };
}
