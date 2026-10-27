export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type ProjectColor = 'violet' | 'mint' | 'amber' | 'blue' | 'rose';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  taskCount?: number;
}

export interface Preferences {
  displayName: string;
  timezone: string;
  weekStartsMonday: boolean;
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
}

export interface ProjectInput {
  name: string;
  description: string;
  color: ProjectColor;
}

export interface DashboardSummary {
  open: number;
  completed: number;
  dueSoon: number;
  overdue: number;
  upcoming: Task[];
}

export interface Notice {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface ApiError extends Error {
  status?: number;
}
