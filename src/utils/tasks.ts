import dayjs from 'dayjs';
import type { Task, TaskFilters, TaskStatus } from '../types';
import { COLUMNS } from './constants';

export const EMPTY_FILTERS: TaskFilters = { search: '' };

export function hasActiveFilters(f: TaskFilters): boolean {
  return Boolean(f.search.trim() || f.priority || f.assignee || f.status || f.dueRange);
}

/** All filters are combined with AND. */
export function filterTasks(tasks: Task[], f: TaskFilters): Task[] {
  const q = f.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.assignee) {
      if (f.assignee === '__unassigned__') {
        if (t.assignee) return false;
      } else if (t.assignee !== f.assignee) return false;
    }
    if (f.dueRange) {
      const [from, to] = f.dueRange;
      if (t.dueDate < from || t.dueDate > to) return false;
    }
    return true;
  });
}

export interface TaskStats {
  total: number;
  backlog: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export function computeStats(tasks: Task[]): TaskStats {
  const today = dayjs().format('YYYY-MM-DD');
  return {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.status !== 'done' && t.dueDate < today).length,
  };
}

export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups = Object.fromEntries(COLUMNS.map((c) => [c.id, [] as Task[]])) as Record<TaskStatus, Task[]>;
  for (const t of tasks) groups[t.status].push(t);
  return groups;
}

export function isOverdue(task: Task): boolean {
  return task.status !== 'done' && task.dueDate < dayjs().format('YYYY-MM-DD');
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
