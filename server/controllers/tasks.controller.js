import { createTask, getTask, listProjects, listTasks, removeTask, updateTask } from '../store.js';

const statuses = new Set(['todo', 'in-progress', 'done']);
const priorities = new Set(['low', 'medium', 'high']);

function cleanTask(input, partial = false) {
  const values = {};
  if (!partial || Object.hasOwn(input, 'title')) {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title || title.length > 140) return { error: 'Add a title of 1 to 140 characters.' };
    values.title = title;
  }
  if (!partial || Object.hasOwn(input, 'description')) {
    const description = typeof input.description === 'string' ? input.description.trim() : '';
    if (description.length > 1200) return { error: 'Description must be 1,200 characters or fewer.' };
    values.description = description;
  }
  if (!partial || Object.hasOwn(input, 'status')) {
    const status = input.status || 'todo';
    if (!statuses.has(status)) return { error: 'Choose a valid task status.' };
    values.status = status;
  }
  if (!partial || Object.hasOwn(input, 'priority')) {
    const priority = input.priority || 'medium';
    if (!priorities.has(priority)) return { error: 'Choose a valid priority.' };
    values.priority = priority;
  }
  if (!partial || Object.hasOwn(input, 'dueDate')) {
    const dueDate = input.dueDate || null;
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: 'Choose a valid due date.' };
    values.dueDate = dueDate;
  }
  if (!partial || Object.hasOwn(input, 'projectId')) {
    values.projectId = typeof input.projectId === 'string' && input.projectId ? input.projectId : null;
  }
  return { values };
}

async function validProject(userId, projectId) {
  if (!projectId) return true;
  return (await listProjects(userId)).some((project) => project.id === projectId);
}

export async function list(req, res) {
  res.json({ tasks: await listTasks(req.user.id, { status: req.query.status, projectId: req.query.projectId, q: req.query.q }) });
}

export async function create(req, res) {
  const parsed = cleanTask(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  if (!await validProject(req.user.id, parsed.values.projectId)) return res.status(400).json({ message: 'That project no longer exists.' });
  res.status(201).json({ task: await createTask(req.user.id, parsed.values) });
}

export async function update(req, res) {
  const current = await getTask(req.user.id, req.params.id);
  if (!current) return res.status(404).json({ message: 'Task not found.' });
  const parsed = cleanTask(req.body || {}, true);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  if (Object.hasOwn(parsed.values, 'projectId') && !await validProject(req.user.id, parsed.values.projectId)) {
    return res.status(400).json({ message: 'That project no longer exists.' });
  }
  res.json({ task: await updateTask(req.user.id, current.id, parsed.values) });
}

export async function remove(req, res) {
  if (!await removeTask(req.user.id, req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  res.status(204).end();
}
