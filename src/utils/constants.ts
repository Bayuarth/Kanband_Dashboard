import type { Priority, TaskStatus } from '../types';

export interface ColumnMeta {
  id: TaskStatus;
  title: string;
  description: string;
  color: string;
}

export const COLUMNS: ColumnMeta[] = [
  { id: 'backlog', title: 'Backlog', description: 'Not started yet', color: '#8c8fa3' },
  { id: 'todo', title: 'To Do', description: 'Ready to be picked up', color: '#3b82f6' },
  { id: 'in_progress', title: 'In Progress', description: 'Currently being worked on', color: '#f59e0b' },
  { id: 'done', title: 'Done', description: 'Completed tasks', color: '#10b981' },
];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const STATUS_COLOR: Record<TaskStatus, string> = Object.fromEntries(
  COLUMNS.map((c) => [c.id, c.color]),
) as Record<TaskStatus, string>;

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'green',
  medium: 'gold',
  high: 'red',
};

export const TEAM_MEMBERS = [
  'Emily Johnson',
  'Michael Williams',
  'Sophia Brown',
  'James Davis',
  'Olivia Martin',
];

export const STORAGE_KEYS = {
  tasks: 'taskflow.tasks.v1',
  auth: 'taskflow.auth.v1',
  theme: 'taskflow.theme.v1',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com';
export const TOKEN_EXPIRES_MINS = Number(import.meta.env.VITE_TOKEN_EXPIRES_MINS ?? 30);
