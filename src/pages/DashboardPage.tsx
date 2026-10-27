import { Box, Button, Card, CardContent, Checkbox, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Add, ArrowForward, CheckCircleOutline, FolderOpenOutlined, TaskAltOutlined, WarningAmberOutlined } from '@mui/icons-material';
import type { DashboardSummary, Project, Task, User } from '../types';

const metrics = [
  { label: 'Open tasks', key: 'open', icon: <TaskAltOutlined />, color: '#4056c8' },
  { label: 'Completed', key: 'completed', icon: <CheckCircleOutline />, color: '#087e73' },
  { label: 'Due soon', key: 'dueSoon', icon: <FolderOpenOutlined />, color: '#b27619' },
  { label: 'Overdue', key: 'overdue', icon: <WarningAmberOutlined />, color: '#bd3f4b' },
] as const;

interface DashboardPageProps {
  user: User;
  summary: DashboardSummary | null;
  tasks: Task[];
  projects: Project[];
  onNavigate: (destination: string) => void;
  onToggleTask: (task: Task) => void;
}

export default function DashboardPage({ user, summary, tasks, projects, onNavigate, onToggleTask }: DashboardPageProps) {
  const upcoming = (summary?.upcoming || []).slice(0, 5);
  return <Stack spacing={3}>
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
      <Box><Typography variant="overline" color="primary.main">YOUR WORKSPACE</Typography><Typography variant="h1">Good to see you, {user?.name?.split(' ')[0] || 'there'}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Here’s a clear view of what’s next.</Typography></Box>
      <Button variant="contained" startIcon={<Add />} onClick={() => onNavigate('/tasks?new=1')}>New task</Button>
    </Stack>
    <Grid container spacing={2}>{metrics.map((metric) => <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={metric.key}><Card><CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="body2" color="text.secondary">{metric.label}</Typography><Box sx={{ color: metric.color, display: 'flex' }}>{metric.icon}</Box></Stack><Typography variant="h1" sx={{ mt: 1.5, fontSize: 32 }}>{summary?.[metric.key] ?? '—'}</Typography><Typography variant="caption" color="text.secondary">{metric.key === 'overdue' ? 'Needs your attention' : 'Keep your momentum going'}</Typography></CardContent></Card></Grid>)}</Grid>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 8 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 0 }}><Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 1.5 }}><Box><Typography variant="overline" color="primary.main">UP NEXT</Typography><Typography variant="h2">Your tasks</Typography></Box><Button endIcon={<ArrowForward />} onClick={() => onNavigate('/tasks')}>View all</Button></Stack>
        {upcoming.length ? <Stack divider={<Box sx={{ borderBottom: '1px solid #eff0f4' }} />}>{upcoming.map((task) => <Stack key={task.id} direction="row" alignItems="center" spacing={1.5} sx={{ px: 2.5, py: 1.5 }}><Checkbox checked={task.status === 'done'} onChange={() => onToggleTask(task)} size="small" inputProps={{ 'aria-label': `Complete ${task.title}` }} /><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={650} noWrap sx={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</Typography><Typography variant="caption" color="text.secondary" noWrap>{projects.find((project) => project.id === task.projectId)?.name || 'No project'}</Typography></Box><Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</Typography></Stack>)}</Stack> : <Box sx={{ p: 4, textAlign: 'center' }}><Typography fontWeight={650}>Your slate is clear</Typography><Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>Add a task to get your week moving.</Typography><Button onClick={() => onNavigate('/tasks?new=1')}>Create a task</Button></Box>}
      </CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 4 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography variant="overline" color="primary.main">STAY ORGANIZED</Typography><Typography variant="h2">Projects</Typography></Box><Button onClick={() => onNavigate('/projects')}>All</Button></Stack>
        <Stack spacing={1.5} sx={{ mt: 2 }}>{projects.slice(0, 4).map((project) => { const related = tasks.filter((task) => task.projectId === project.id); const done = related.filter((task) => task.status === 'done').length; const progress = related.length ? Math.round(done / related.length * 100) : 0; return <Box key={project.id} role="button" tabIndex={0} onClick={() => onNavigate(`/tasks?project=${project.id}`)} onKeyDown={(event) => event.key === 'Enter' && onNavigate(`/tasks?project=${project.id}`)} sx={{ cursor: 'pointer', p: 1.5, border: '1px solid #eceef3', borderRadius: 2, '&:hover': { borderColor: 'primary.main', bgcolor: '#fafaff' } }}><Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="body2" fontWeight={650}>{project.name}</Typography><Typography variant="caption" color="text.secondary">{done}/{related.length}</Typography></Stack><LinearProgress variant="determinate" value={progress} sx={{ height: 5, borderRadius: 4 }} /></Box>; })}
          {!projects.length && <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Create a project to group related tasks.</Typography>}
          <Button fullWidth startIcon={<Add />} onClick={() => onNavigate('/projects?new=1')}>New project</Button>
        </Stack></CardContent></Card></Grid>
    </Grid>
  </Stack>;
}
