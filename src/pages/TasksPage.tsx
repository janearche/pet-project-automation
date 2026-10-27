import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, IconButton, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, DeleteOutline, EditOutlined, Search, TaskAltOutlined } from '@mui/icons-material';
import TaskForm from '../components/TaskForm';
import type { Project, Task, TaskInput, TaskStatus } from '../types';

const statusMap = { todo: { label: 'To do', color: 'default' }, 'in-progress': { label: 'In progress', color: 'info' }, done: { label: 'Done', color: 'success' } } as const;
const priorityMap = { low: 'success', medium: 'warning', high: 'error' } as const;

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  onCreate: (input: TaskInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<TaskInput>) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
  initialProject?: string;
  initialNew?: boolean;
  initialQuery?: string;
}

function messageFor(error: unknown): string { return error instanceof Error ? error.message : 'Could not save this task.'; }

export default function TasksPage({ tasks, projects, onCreate, onUpdate, onDelete, initialProject = '', initialNew = false, initialQuery = '' }: TasksPageProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState(initialProject);
  const [showForm, setShowForm] = useState(initialNew);
  const [editing, setEditing] = useState<Task | null>(null);
  const [search, setSearch] = useState(initialQuery);
  const [formError, setFormError] = useState('');
  const filtered = useMemo(() => tasks.filter((task) => {
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchProject = !projectFilter || task.projectId === projectFilter;
    const matchText = !search || `${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchProject && matchText;
  }), [tasks, statusFilter, projectFilter, search]);

  async function create(values: TaskInput) { setFormError(''); try { await onCreate(values); setShowForm(false); } catch (error) { setFormError(messageFor(error)); } }
  async function update(values: TaskInput) { if (!editing) return; setFormError(''); try { await onUpdate(editing.id, values); setEditing(null); } catch (error) { setFormError(messageFor(error)); } }

  return <Stack spacing={2.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}><Box><Typography variant="overline" color="primary.main">PLAN AND TRACK</Typography><Typography variant="h1">Tasks</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>A focused list of the things you want to get done.</Typography></Box><Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setShowForm((value) => !value); }}>New task</Button></Stack>
    {(showForm || editing) && <Card><CardContent sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2}><Box><Typography variant="overline" color="primary.main">{editing ? 'EDIT TASK' : 'NEW TASK'}</Typography><Typography variant="h2">{editing ? 'Update task details' : 'Add a task'}</Typography></Box>{formError && <Alert severity="error">{formError}</Alert>}<TaskForm projects={projects} initialValue={editing || undefined} submitLabel={editing ? 'Save changes' : 'Create task'} onCancel={() => { setEditing(null); setShowForm(false); setFormError(''); }} onSubmit={editing ? update : create} /></Stack></CardContent></Card>}
    <Card><CardContent sx={{ p: 0 }}><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}><TextField size="small" fullWidth placeholder="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /><TextField select size="small" label="Project" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All projects</MenuItem>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField><TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')} sx={{ minWidth: 160 }}><MenuItem value="all">Any status</MenuItem><MenuItem value="todo">To do</MenuItem><MenuItem value="in-progress">In progress</MenuItem><MenuItem value="done">Done</MenuItem></TextField></Stack>
      <TableContainer><Table><TableHead><TableRow><TableCell>Task</TableCell><TableCell>Project</TableCell><TableCell>Due date</TableCell><TableCell>Status</TableCell><TableCell>Priority</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{filtered.map((task) => <TableRow key={task.id} hover><TableCell sx={{ minWidth: 220 }}><Stack direction="row" spacing={1.5} alignItems="center"><IconButton size="small" color={task.status === 'done' ? 'success' : 'default'} aria-label={task.status === 'done' ? 'Reopen task' : 'Complete task'} onClick={() => onUpdate(task.id, { ...task, status: task.status === 'done' ? 'todo' : 'done' })}><TaskAltOutlined fontSize="small" /></IconButton><Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={650} sx={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</Typography>{task.description && <Typography variant="caption" color="text.secondary" display="block" noWrap>{task.description}</Typography>}</Box></Stack></TableCell><TableCell>{projects.find((project) => project.id === task.projectId)?.name || '—'}</TableCell><TableCell>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</TableCell><TableCell><Chip size="small" label={statusMap[task.status]?.label || task.status} color={statusMap[task.status]?.color || 'default'} /></TableCell><TableCell><Chip size="small" variant="outlined" label={task.priority} color={priorityMap[task.priority] || 'default'} /></TableCell><TableCell align="right"><IconButton size="small" aria-label={`Edit ${task.title}`} onClick={() => { setShowForm(false); setEditing(task); }}><EditOutlined fontSize="small" /></IconButton><IconButton size="small" color="error" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}><DeleteOutline fontSize="small" /></IconButton></TableCell></TableRow>)}{!filtered.length && <TableRow><TableCell colSpan={6}><Box sx={{ py: 6, textAlign: 'center' }}><Typography fontWeight={650}>No tasks found</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Try another search or create a task.</Typography></Box></TableCell></TableRow>}</TableBody></Table></TableContainer>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderTop: '1px solid #eceef3' }}><Typography variant="caption" color="text.secondary">Showing {filtered.length} of {tasks.length} tasks</Typography><Typography variant="caption" color="text.secondary">{filtered.filter((task) => task.status === 'done').length} completed</Typography></Stack>
    </CardContent></Card>
  </Stack>;
}
