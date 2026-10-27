import type { DashboardSummary, Preferences, Project, ProjectInput, RegistrationInput, Task, TaskInput, User } from './types';

interface SessionResponse { user: User }
interface TaskListResponse { tasks: Task[] }
interface TaskResponse { task: Task }
interface ProjectListResponse { projects: Project[] }
interface ProjectResponse { project: Project }
interface PreferencesResponse { preferences: Preferences; email: string }

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (response.status === 204) return null as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data as T;
}

export const api = {
  me: () => request<SessionResponse>('/auth/me'),
  login: (body: { email: string; password: string }) => request<SessionResponse>('/auth/login', { method: 'POST', body }),
  register: (body: RegistrationInput) => request<SessionResponse>('/auth/register', { method: 'POST', body }),
  logout: () => request<null>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<DashboardSummary>('/dashboard'),
  tasks: (params: { status?: string; projectId?: string; search?: string } = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'all') as [string, string][]);
    return request<TaskListResponse>(`/tasks${query.size ? `?${query}` : ''}`);
  },
  createTask: (body: TaskInput) => request<TaskResponse>('/tasks', { method: 'POST', body }),
  updateTask: (id: string, body: Partial<TaskInput>) => request<TaskResponse>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  deleteTask: (id: string) => request<null>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  projects: () => request<ProjectListResponse>('/projects'),
  createProject: (body: ProjectInput) => request<ProjectResponse>('/projects', { method: 'POST', body }),
  updateProject: (id: string, body: Partial<ProjectInput>) => request<ProjectResponse>(`/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  deleteProject: (id: string) => request<null>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  preferences: () => request<PreferencesResponse>('/preferences'),
  updatePreferences: (body: Preferences) => request<PreferencesResponse>('/preferences', { method: 'PATCH', body }),
};
