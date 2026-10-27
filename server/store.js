import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateFile = process.env.DATA_FILE || path.join(root, 'data', 'state.json');
const now = new Date();
const dateIn = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

function seedState() {
  const projects = [
    { id: 'proj-product', name: 'Product launch', color: 'violet', description: 'Prepare the first release.' },
    { id: 'proj-home', name: 'Home', color: 'mint', description: 'Small things that make home feel good.' },
    { id: 'proj-learning', name: 'Learning', color: 'amber', description: 'Keep a little space for curiosity.' },
  ];
  const tasks = [
    { id: randomUUID(), title: 'Outline the launch checklist', description: 'Keep the first release focused and useful.', status: 'in-progress', priority: 'high', dueDate: dateIn(1), projectId: 'proj-product', createdAt: now.toISOString() },
    { id: randomUUID(), title: 'Book a dentist appointment', description: '', status: 'todo', priority: 'medium', dueDate: dateIn(3), projectId: 'proj-home', createdAt: now.toISOString() },
    { id: randomUUID(), title: 'Read 20 pages', description: 'Pick up where I left off.', status: 'todo', priority: 'low', dueDate: dateIn(4), projectId: 'proj-learning', createdAt: now.toISOString() },
    { id: randomUUID(), title: 'Collect early feedback', description: '', status: 'done', priority: 'medium', dueDate: dateIn(-1), projectId: 'proj-product', createdAt: now.toISOString() },
  ];
  return {
    tasks,
    projects,
    preferences: { displayName: 'Demo User', timezone: 'Europe/Prague', weekStartsMonday: true },
    users: [],
  };
}

let state;
let saveQueue = Promise.resolve();

async function load() {
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'));
    if (!Array.isArray(state.users)) state.users = [];
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = seedState();
    await save();
  }
}

const ready = load();

async function save() {
  await mkdir(path.dirname(stateFile), { recursive: true });
  const snapshot = JSON.stringify(state, null, 2);
  saveQueue = saveQueue.then(() => writeFile(stateFile, snapshot, 'utf8'));
  await saveQueue;
}

async function update(mutator) {
  await ready;
  const result = mutator(state);
  await save();
  return result;
}

function workspaceFor(db, userId) {
  if (userId === 'demo-user') return db;
  const user = db.users.find((item) => item.id === userId);
  if (!user) throw new Error('Workspace account not found.');
  return user.workspace;
}

function updateWorkspace(userId, mutator) {
  return update((db) => mutator(workspaceFor(db, userId), db));
}

export async function getUserByEmail(email) {
  await ready;
  return state.users.find((user) => user.email === email) || null;
}

export async function getUserById(id) {
  await ready;
  return state.users.find((user) => user.id === id) || null;
}

export async function createUser(values) {
  return update((db) => {
    if (db.users.some((user) => user.email === values.email)) return null;
    const user = {
      id: randomUUID(),
      email: values.email,
      name: values.name,
      passwordHash: values.passwordHash,
      passwordSalt: values.passwordSalt,
      workspace: {
        tasks: [],
        projects: [],
        preferences: { displayName: values.name, timezone: 'Europe/Prague', weekStartsMonday: true },
      },
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  });
}

export async function listTasks(userId = 'demo-user', filters = {}) {
  await ready;
  return workspaceFor(state, userId).tasks
    .filter((task) => !filters.status || filters.status === 'all' || task.status === filters.status)
    .filter((task) => !filters.projectId || task.projectId === filters.projectId)
    .filter((task) => !filters.q || `${task.title} ${task.description}`.toLowerCase().includes(filters.q.toLowerCase()))
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
}

export async function getTask(userId, id) {
  await ready;
  return workspaceFor(state, userId).tasks.find((task) => task.id === id) || null;
}

export async function createTask(userId, values) {
  return updateWorkspace(userId, (workspace) => {
    const task = { id: randomUUID(), ...values, createdAt: new Date().toISOString() };
    workspace.tasks.unshift(task);
    return task;
  });
}

export async function updateTask(userId, id, values) {
  return updateWorkspace(userId, (workspace) => {
    const task = workspace.tasks.find((item) => item.id === id);
    if (!task) return null;
    Object.assign(task, values, { updatedAt: new Date().toISOString() });
    return task;
  });
}

export async function removeTask(userId, id) {
  return updateWorkspace(userId, (workspace) => {
    const index = workspace.tasks.findIndex((task) => task.id === id);
    if (index < 0) return false;
    workspace.tasks.splice(index, 1);
    return true;
  });
}

export async function listProjects(userId = 'demo-user') {
  await ready;
  const workspace = workspaceFor(state, userId);
  return workspace.projects.map((project) => ({
    ...project,
    taskCount: workspace.tasks.filter((task) => task.projectId === project.id).length,
  }));
}

export async function createProject(userId, values) {
  return updateWorkspace(userId, (workspace) => {
    const project = { id: randomUUID(), ...values, createdAt: new Date().toISOString() };
    workspace.projects.unshift(project);
    return project;
  });
}

export async function updateProject(userId, id, values) {
  return updateWorkspace(userId, (workspace) => {
    const project = workspace.projects.find((item) => item.id === id);
    if (!project) return null;
    Object.assign(project, values, { updatedAt: new Date().toISOString() });
    return project;
  });
}

export async function removeProject(userId, id) {
  return updateWorkspace(userId, (workspace) => {
    const index = workspace.projects.findIndex((project) => project.id === id);
    if (index < 0) return false;
    workspace.projects.splice(index, 1);
    workspace.tasks.forEach((task) => {
      if (task.projectId === id) task.projectId = null;
    });
    return true;
  });
}

export async function getPreferences(userId = 'demo-user') {
  await ready;
  return workspaceFor(state, userId).preferences;
}

export async function updatePreferences(userId, values) {
  return updateWorkspace(userId, (workspace) => {
    Object.assign(workspace.preferences, values);
    return workspace.preferences;
  });
}

export async function dashboardSummary(userId = 'demo-user') {
  await ready;
  const today = new Date().toISOString().slice(0, 10);
  const workspace = workspaceFor(state, userId);
  const tasks = workspace.tasks;
  const open = tasks.filter((task) => task.status !== 'done');
  return {
    total: tasks.length,
    open: open.length,
    completed: tasks.filter((task) => task.status === 'done').length,
    overdue: open.filter((task) => task.dueDate && task.dueDate < today).length,
    dueSoon: open.filter((task) => task.dueDate && task.dueDate >= today).length,
    upcoming: open.slice().sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 5),
    projects: workspace.projects.length,
  };
}
