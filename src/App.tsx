import { useEffect, useState } from 'react';
import { Alert, AppBar, Avatar, Box, Button, Chip, CircularProgress, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, Stack, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Add, DashboardOutlined, FolderOpenOutlined, Logout, Menu as MenuIcon, Search, SettingsOutlined, TaskAltOutlined } from '@mui/icons-material';
import { api } from './api';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/TasksPage';
import type { DashboardSummary, Notice, Preferences, Project, ProjectInput, RegistrationInput, Task, TaskInput, User } from './types';

const drawerWidth = 256;
const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#4056c8', dark: '#2c3e9e', light: '#e9edff' }, secondary: { main: '#087e73' }, background: { default: '#f5f6fa', paper: '#fff' }, text: { primary: '#202438', secondary: '#6b7185' }, error: { main: '#bd3f4b' } },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', h1: { fontSize: '2rem', fontWeight: 750, letterSpacing: '-.04em' }, h2: { fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-.02em' }, h3: { fontSize: '1rem', fontWeight: 700 }, button: { textTransform: 'none', fontWeight: 650 }, overline: { fontWeight: 700, letterSpacing: '.09em' } },
  components: { MuiButton: { styleOverrides: { root: { borderRadius: 9, minHeight: 40, boxShadow: 'none' } } }, MuiPaper: { styleOverrides: { rounded: { backgroundImage: 'none' } } }, MuiCard: { styleOverrides: { root: { border: '1px solid #e8eaf1', boxShadow: '0 2px 8px rgba(32,36,56,.035)' } } }, MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff' } } } },
});

const sections = [
  { label: 'Overview', path: '/dashboard', icon: <DashboardOutlined /> },
  { label: 'Tasks', path: '/tasks', icon: <TaskAltOutlined /> },
  { label: 'Projects', path: '/projects', icon: <FolderOpenOutlined /> },
];
const settingsLink = { label: 'Settings', path: '/settings', icon: <SettingsOutlined /> };

function currentRoute(): string { return `${window.location.pathname}${window.location.search}`; }
function pageFor(route: string): { url: URL; page: string } { const url = new URL(route, window.location.origin); return { url, page: url.pathname.replace(/\/$/, '') || '/dashboard' }; }
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Something went wrong.'; }

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({ displayName: 'Demo User', timezone: 'Europe/Prague', weekStartsMonday: true });
  const [email, setEmail] = useState('demo@daymark.local');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const compact = useMediaQuery(theme.breakpoints.down('md'));

  function navigate(destination: string): void {
    window.history.pushState({}, '', destination);
    setRoute(currentRoute());
    setDrawerOpen(false);
  }

  async function loadWorkspace() {
    const [taskData, projectData, dashboardData, preferenceData] = await Promise.all([api.tasks(), api.projects(), api.dashboard(), api.preferences()]);
    setTasks(taskData.tasks);
    setProjects(projectData.projects);
    setSummary(dashboardData);
    setPreferences(preferenceData.preferences);
    setEmail(preferenceData.email);
  }

  useEffect(() => {
    const onPopState = () => setRoute(currentRoute());
    window.addEventListener('popstate', onPopState);
    api.me().then(async ({ user: signedIn }) => { setUser(signedIn); await loadWorkspace(); }).catch(() => setUser(null)).finally(() => setLoading(false));
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!loading && user && ['/login', '/register'].includes(pageFor(route).page)) navigate('/dashboard');
    else if (!loading && !user && !['/login', '/register'].includes(pageFor(route).page)) navigate('/login');
  }, [loading, user]);

  async function handleLogin(credentials: { email: string; password: string }): Promise<void> {
    setLoginError('');
    try { const result = await api.login(credentials); setUser(result.user); await loadWorkspace(); navigate('/dashboard'); }
    catch (error) { setLoginError(errorMessage(error)); throw error; }
  }
  async function handleRegister(input: RegistrationInput): Promise<void> {
    const result = await api.register(input);
    setUser(result.user);
    await loadWorkspace();
    navigate('/dashboard');
  }
  async function handleLogout() {
    try { await api.logout(); } finally { setUser(null); setTasks([]); setProjects([]); setSummary(null); setNotice(null); setAccountAnchor(null); navigate('/login'); }
  }
  async function handleCreateTask(values: TaskInput): Promise<void> {
    try { const { task } = await api.createTask(values); setTasks((current) => [task, ...current]); setSummary(await api.dashboard()); setNotice({ type: 'success', message: 'Task created.' }); }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); throw error; }
  }
  async function handleUpdateTask(id: string, values: Partial<TaskInput>): Promise<Task> {
    try { const { task } = await api.updateTask(id, values); setTasks((current) => current.map((item) => item.id === id ? task : item)); setSummary(await api.dashboard()); setNotice({ type: 'success', message: 'Task updated.' }); return task; }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); throw error; }
  }
  async function handleDeleteTask(id: string): Promise<void> {
    try { await api.deleteTask(id); setTasks((current) => current.filter((item) => item.id !== id)); setSummary(await api.dashboard()); setNotice({ type: 'success', message: 'Task deleted.' }); }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); }
  }
  async function handleCreateProject(values: ProjectInput): Promise<Project> {
    try { const { project } = await api.createProject(values); setProjects((current) => [project, ...current]); setNotice({ type: 'success', message: 'Project created.' }); return project; }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); throw error; }
  }
  async function handleDeleteProject(id: string): Promise<void> {
    try { await api.deleteProject(id); setProjects((current) => current.filter((item) => item.id !== id)); setTasks((current) => current.map((task) => task.projectId === id ? { ...task, projectId: null } : task)); setSummary(await api.dashboard()); setNotice({ type: 'success', message: 'Project deleted. Its tasks remain.' }); }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); }
  }
  async function handleSavePreferences(values: Preferences): Promise<void> {
    try { const result = await api.updatePreferences(values); setPreferences(result.preferences); setUser((current) => current ? { ...current, name: result.preferences.displayName } : current); setNotice({ type: 'success', message: 'Settings saved.' }); }
    catch (error) { setNotice({ type: 'error', message: errorMessage(error) }); throw error; }
  }

  if (loading) return <ThemeProvider theme={theme}><CssBaseline /><Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}><Stack alignItems="center" spacing={2}><CircularProgress /><Typography color="text.secondary">Loading your workspace…</Typography></Stack></Box></ThemeProvider>;
  if (!user) {
    const authPage = pageFor(route).page;
    return <ThemeProvider theme={theme}><CssBaseline />{authPage === '/register'
      ? <RegisterPage onRegister={handleRegister} onLoginClick={() => navigate('/login')} />
      : <LoginPage onLogin={handleLogin} onRegisterClick={() => navigate('/register')} error={loginError} />}</ThemeProvider>;
  }

  const { page, url } = pageFor(route);
  const pageTitle = [...sections, settingsLink].find((entry) => entry.path === page)?.label || 'Overview';
  const navContents = <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 1, py: 1.5, mb: 2 }}><Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 800 }}>D</Avatar><Box><Typography fontWeight={750} lineHeight={1.2}>Daymark</Typography><Typography variant="caption" color="text.secondary">Personal workspace</Typography></Box></Stack>
    <Typography variant="overline" color="text.secondary" sx={{ px: 1, mb: 1 }}>Workspace</Typography>
    <List disablePadding>{sections.map((item) => <ListItemButton key={item.path} selected={page === item.path} onClick={() => navigate(item.path)} sx={{ mb: .5, borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark', '& .MuiListItemIcon-root': { color: 'primary.dark' } } }}><ListItemIcon sx={{ minWidth: 38, color: page === item.path ? 'primary.dark' : 'text.secondary' }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: page === item.path ? 700 : 550 }} />{item.path === '/tasks' && <Chip size="small" label={summary?.open ?? 0} sx={{ height: 22, fontSize: 11, bgcolor: page === item.path ? '#fff' : '#f1f2f6' }} />}</ListItemButton>)}</List>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3, px: 1, mb: 1 }}><Typography variant="overline" color="text.secondary">Projects</Typography><Tooltip title="Create project"><IconButton size="small" onClick={() => navigate('/projects?new=1')}><Add fontSize="small" /></IconButton></Tooltip></Stack>
    <List disablePadding>{projects.slice(0, 5).map((project) => <ListItemButton key={project.id} onClick={() => navigate(`/tasks?project=${project.id}`)} sx={{ borderRadius: 2, py: .75 }}><ListItemIcon sx={{ minWidth: 30 }}><Box sx={{ width: 9, height: 9, borderRadius: 3, bgcolor: ({ violet: '#6558d9', mint: '#2b9a80', amber: '#d69328', blue: '#4384cd', rose: '#d4657b' })[project.color] || '#6558d9' }} /></ListItemIcon><ListItemText primary={project.name} primaryTypographyProps={{ noWrap: true, fontSize: 13 }} /></ListItemButton>)}</List>
    <Box sx={{ flex: 1 }} /><Divider sx={{ my: 1.5 }} />
    <ListItemButton selected={page === '/settings'} onClick={() => navigate('/settings')} sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' } }}><ListItemIcon sx={{ minWidth: 38 }}><SettingsOutlined /></ListItemIcon><ListItemText primary="Settings" /></ListItemButton>
    <ListItemButton onClick={(event) => setAccountAnchor(event.currentTarget)} sx={{ borderRadius: 2, mt: .5 }}><ListItemIcon sx={{ minWidth: 38 }}><Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main', fontSize: 13 }}>{user.name?.[0]?.toUpperCase() || 'D'}</Avatar></ListItemIcon><ListItemText primary={user.name} secondary={user.email} primaryTypographyProps={{ fontSize: 13, fontWeight: 650 }} secondaryTypographyProps={{ fontSize: 11 }} /><Logout fontSize="small" /></ListItemButton>
  </Box>;

  return <ThemeProvider theme={theme}>
    <><CssBaseline /><Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {compact ? <Drawer variant="temporary" open={drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>{navContents}</Drawer> : <Drawer variant="permanent" open sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e8eaf1' } }}>{navContents}</Drawer>}
      </Box>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e8eaf1', bgcolor: 'rgba(255,255,255,.92)', backdropFilter: 'blur(10px)' }}><Toolbar sx={{ gap: 1.5, minHeight: '68px !important' }}>{compact && <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><MenuIcon /></IconButton>}<Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>Workspace <Box component="span" sx={{ mx: 1, color: '#c2c5d0' }}>/</Box><Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>{pageTitle}</Box></Typography><Tooltip title="Search tasks"><IconButton onClick={() => navigate('/tasks')} aria-label="Search tasks"><Search /></IconButton></Tooltip><Button id="account-button" onClick={(event) => setAccountAnchor(event.currentTarget)} startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 12 }}>{user.name?.[0]?.toUpperCase() || 'D'}</Avatar>} sx={{ color: 'text.primary', minWidth: 0 }}>{compact ? '' : user.name}</Button><Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}><MenuItem onClick={() => { setAccountAnchor(null); navigate('/settings'); }}><SettingsOutlined fontSize="small" sx={{ mr: 1.5 }} />Settings</MenuItem><MenuItem onClick={handleLogout}><Logout fontSize="small" sx={{ mr: 1.5 }} />Sign out</MenuItem></Menu></Toolbar></AppBar>
        <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
          {page === '/dashboard' && <DashboardPage user={user} summary={summary} tasks={tasks} projects={projects} onNavigate={navigate} onToggleTask={(task) => handleUpdateTask(task.id, { ...task, status: task.status === 'done' ? 'todo' : 'done' })} />}
          {page === '/tasks' && <TasksPage tasks={tasks} projects={projects} onCreate={handleCreateTask} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} initialProject={url.searchParams.get('project') || ''} initialNew={url.searchParams.get('new') === '1'} initialQuery={url.searchParams.get('q') || ''} />}
          {page === '/projects' && <ProjectsPage projects={projects} tasks={tasks} onCreate={handleCreateProject} onDelete={handleDeleteProject} onOpenProject={(id) => navigate(`/tasks?project=${id}`)} initialNew={url.searchParams.get('new') === '1'} />}
          {page === '/settings' && <SettingsPage preferences={preferences} email={email} onSave={handleSavePreferences} />}
          {!['/dashboard', '/tasks', '/projects', '/settings', '/login'].includes(page) && <DashboardPage user={user} summary={summary} tasks={tasks} projects={projects} onNavigate={navigate} onToggleTask={(task) => handleUpdateTask(task.id, { ...task, status: task.status === 'done' ? 'todo' : 'done' })} />}
        </Box>
      </Box>
      <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setNotice(null)} severity={notice?.type || 'success'} variant="filled" sx={{ width: '100%' }}>{notice?.message}</Alert></Snackbar>
    </Box></>
  </ThemeProvider>;
}
