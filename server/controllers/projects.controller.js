import { createProject, listProjects, removeProject, updateProject } from '../store.js';

const colors = new Set(['violet', 'mint', 'amber', 'blue', 'rose']);

function cleanProject(input, partial = false) {
  const values = {};
  if (!partial || Object.hasOwn(input, 'name')) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name || name.length > 60) return { error: 'Add a project name of 1 to 60 characters.' };
    values.name = name;
  }
  if (!partial || Object.hasOwn(input, 'description')) {
    const description = typeof input.description === 'string' ? input.description.trim() : '';
    if (description.length > 240) return { error: 'Description must be 240 characters or fewer.' };
    values.description = description;
  }
  if (!partial || Object.hasOwn(input, 'color')) {
    const color = input.color || 'violet';
    if (!colors.has(color)) return { error: 'Choose a valid project color.' };
    values.color = color;
  }
  return { values };
}

export async function list(req, res) {
  res.json({ projects: await listProjects(req.user.id) });
}

export async function create(req, res) {
  const parsed = cleanProject(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  res.status(201).json({ project: await createProject(req.user.id, parsed.values) });
}

export async function update(req, res) {
  const parsed = cleanProject(req.body || {}, true);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const project = await updateProject(req.user.id, req.params.id, parsed.values);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  res.json({ project });
}

export async function remove(req, res) {
  if (!await removeProject(req.user.id, req.params.id)) return res.status(404).json({ message: 'Project not found.' });
  res.status(204).end();
}
