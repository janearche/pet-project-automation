import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Add, ArrowForward, DeleteOutline, FolderOpenOutlined } from '@mui/icons-material';
import type { FormEvent } from 'react';
import type { Project, ProjectColor, ProjectInput, Task } from '../types';

const colors: ProjectColor[] = ['violet', 'mint', 'amber', 'blue', 'rose'];
const colorValues: Record<ProjectColor, string> = { violet: '#6558d9', mint: '#2b9a80', amber: '#d69328', blue: '#4384cd', rose: '#d4657b' };

interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
  onCreate: (input: ProjectInput) => Promise<Project>;
  onDelete: (id: string) => Promise<void>;
  onOpenProject: (id: string) => void;
  initialNew?: boolean;
}

function messageFor(error: unknown): string { return error instanceof Error ? error.message : 'Could not create project.'; }

export default function ProjectsPage({ projects, tasks, onCreate, onDelete, onOpenProject, initialNew = false }: ProjectsPageProps) {
  const [showForm, setShowForm] = useState(initialNew);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;
    setError('');
    try { await onCreate({ name: String(data.get('name') || ''), description: String(data.get('description') || ''), color: data.get('color') as ProjectInput['color'] }); form.reset(); setShowForm(false); }
    catch (problem) { setError(messageFor(problem)); }
  }
  return <Stack spacing={2.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}><Box><Typography variant="overline" color="primary.main">ORGANIZE YOUR WORK</Typography><Typography variant="h1">Projects</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Bring related tasks together and track progress.</Typography></Box><Button variant="contained" startIcon={<Add />} onClick={() => setShowForm((current) => !current)}>New project</Button></Stack>
    {showForm && <Card><CardContent sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2}><Box><Typography variant="overline" color="primary.main">NEW PROJECT</Typography><Typography variant="h2">Create a project</Typography></Box>{error && <Alert severity="error">{error}</Alert>}<form onSubmit={submit}><Stack spacing={2}><TextField name="name" label="Project name" placeholder="e.g. Home refresh" required inputProps={{ maxLength: 60 }} autoFocus /><TextField name="description" label="Description" placeholder="What is this project about?" multiline minRows={2} inputProps={{ maxLength: 240 }} /><TextField name="color" label="Color" select defaultValue="violet">{colors.map((color) => <MenuItem key={color} value={color}><Stack direction="row" alignItems="center" spacing={1}><Box sx={{ width: 12, height: 12, bgcolor: colorValues[color], borderRadius: '50%' }} /><span>{color[0].toUpperCase() + color.slice(1)}</span></Stack></MenuItem>)}</TextField><Stack direction="row" justifyContent="flex-end" spacing={1}><Button color="inherit" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" variant="contained">Create project</Button></Stack></Stack></form></Stack></CardContent></Card>}
    <Grid container spacing={2}>{projects.map((project) => { const related = tasks.filter((task) => task.projectId === project.id); const completed = related.filter((task) => task.status === 'done').length; const progress = related.length ? Math.round(completed / related.length * 100) : 0; return <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={project.id}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" alignItems="center" spacing={1.5}><Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', color: colorValues[project.color] || 'primary.main', bgcolor: `${colorValues[project.color] || '#4056c8'}18`, borderRadius: 2 }}><FolderOpenOutlined /></Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="h3" noWrap>{project.name}</Typography><Typography variant="caption" color="text.secondary">{related.length} {related.length === 1 ? 'task' : 'tasks'}</Typography></Box><IconButton color="error" size="small" aria-label={`Delete ${project.name}`} onClick={() => onDelete(project.id)}><DeleteOutline fontSize="small" /></IconButton></Stack><Typography variant="body2" color="text.secondary" sx={{ minHeight: 42, mt: 2 }}>{project.description || 'A place to keep this work organized.'}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, mb: .75 }}><Typography variant="caption" color="text.secondary">{completed} of {related.length} completed</Typography><Chip size="small" label={`${progress}%`} variant="outlined" /></Stack><Box sx={{ height: 6, bgcolor: '#eef0f5', borderRadius: 4, overflow: 'hidden' }}><Box sx={{ width: `${progress}%`, height: '100%', bgcolor: colorValues[project.color] || 'primary.main', borderRadius: 4 }} /></Box><Button fullWidth endIcon={<ArrowForward />} sx={{ mt: 1.5, justifyContent: 'space-between' }} onClick={() => onOpenProject(project.id)}>View tasks</Button></CardContent></Card></Grid>; })}
      {!projects.length && <Grid size={{ xs: 12 }}><Card><CardContent sx={{ py: 7, textAlign: 'center' }}><FolderOpenOutlined color="disabled" sx={{ fontSize: 42 }} /><Typography variant="h2" sx={{ mt: 1 }}>No projects yet</Typography><Typography color="text.secondary" sx={{ mt: .75, mb: 2 }}>Create a project to organize a set of related tasks.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)}>Create project</Button></CardContent></Card></Grid>}
    </Grid>
  </Stack>;
}
