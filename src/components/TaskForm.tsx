import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import type { FormEvent } from 'react';
import type { Project, Task, TaskInput } from '../types';

const blankTask = { title: '', description: '', dueDate: '', priority: 'medium', status: 'todo', projectId: '' };

interface TaskFormProps {
  projects: Project[];
  initialValue?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function TaskForm({ projects, initialValue, onSubmit, onCancel, submitLabel = 'Create task' }: TaskFormProps) {
  const value = { ...blankTask, ...initialValue, dueDate: initialValue?.dueDate || '' };
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSubmit({ title: String(data.get('title') || ''), description: String(data.get('description') || ''), dueDate: String(data.get('dueDate') || '') || null, priority: data.get('priority') as TaskInput['priority'], status: data.get('status') as TaskInput['status'], projectId: String(data.get('projectId') || '') || null });
  }
  return <form onSubmit={handleSubmit}><Stack spacing={2}><TextField name="title" label="Task title" defaultValue={value.title} placeholder="What needs doing?" inputProps={{ maxLength: 140 }} required autoFocus /><TextField name="description" label="Notes" defaultValue={value.description} placeholder="Add useful context (optional)" multiline minRows={2} maxRows={5} inputProps={{ maxLength: 1200 }} /><Grid container spacing={2}><Grid size={{ xs: 12, sm: 6 }}><TextField name="dueDate" label="Due date" type="date" defaultValue={value.dueDate} fullWidth InputLabelProps={{ shrink: true }} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField name="priority" label="Priority" select defaultValue={value.priority} fullWidth><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Normal</MenuItem><MenuItem value="high">High</MenuItem></TextField></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField name="status" label="Status" select defaultValue={value.status} fullWidth><MenuItem value="todo">To do</MenuItem><MenuItem value="in-progress">In progress</MenuItem><MenuItem value="done">Done</MenuItem></TextField></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField name="projectId" label="Project" select defaultValue={value.projectId || ''} fullWidth><MenuItem value="">No project</MenuItem>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField></Grid></Grid><Stack direction="row" justifyContent="flex-end" spacing={1}><Button color="inherit" onClick={onCancel}>Cancel</Button><Button type="submit" variant="contained">{submitLabel}</Button></Stack></Stack></form>;
}
