import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { port } from './config.js';
import { requireAuth } from './middleware/require-auth.js';
import * as authController from './controllers/auth.controller.js';
import * as tasksController from './controllers/tasks.controller.js';
import * as projectsController from './controllers/projects.controller.js';
import * as dashboardController from './controllers/dashboard.controller.js';
import * as preferencesController from './controllers/preferences.controller.js';

const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Controller 1: authentication and session lifecycle.
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', authController.me);

// Controller 2: task CRUD.
app.get('/api/tasks', requireAuth, tasksController.list);
app.post('/api/tasks', requireAuth, tasksController.create);
app.patch('/api/tasks/:id', requireAuth, tasksController.update);
app.delete('/api/tasks/:id', requireAuth, tasksController.remove);

// Controller 3: project CRUD.
app.get('/api/projects', requireAuth, projectsController.list);
app.post('/api/projects', requireAuth, projectsController.create);
app.patch('/api/projects/:id', requireAuth, projectsController.update);
app.delete('/api/projects/:id', requireAuth, projectsController.remove);

// Controller 4: dashboard summary.
app.get('/api/dashboard', requireAuth, dashboardController.summary);

// Controller 5: profile and workspace preferences.
app.get('/api/preferences', requireAuth, preferencesController.get);
app.patch('/api/preferences', requireAuth, preferencesController.update);

app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Daymark BFF listening on http://127.0.0.1:${port}`);
});
