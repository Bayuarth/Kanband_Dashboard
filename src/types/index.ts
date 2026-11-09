export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  /** ISO date string (YYYY-MM-DD) */
  dueDate: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface TaskFilters {
  search: string;
  priority?: Priority;
  assignee?: string;
  status?: TaskStatus;
  /** [from, to] as YYYY-MM-DD, inclusive */
  dueRange?: [string, string];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
