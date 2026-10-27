import { spawn } from 'node:child_process';

const commonEnv = { ...process.env, NODE_ENV: 'development' };
const api = spawn(process.execPath, ['server/index.js'], {
  env: { ...commonEnv, API_PORT: process.env.API_PORT || '4318' },
  stdio: 'inherit',
});
const web = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
  env: commonEnv,
  stdio: 'inherit',
});

function stop(signal = 'SIGTERM') {
  if (!api.killed) api.kill(signal);
  if (!web.killed) web.kill(signal);
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
api.on('exit', (code) => {
  if (code !== null && code !== 0) stop();
});
web.on('exit', (code) => {
  if (code !== null && code !== 0) stop();
});
