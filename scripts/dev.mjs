import { spawn } from 'node:child_process';

const commonEnv = { ...process.env, NODE_ENV: 'development' };
const apiPort = Number(process.env.API_PORT || 4318);
const api = spawn(process.execPath, ['server/index.js'], {
  env: { ...commonEnv, API_PORT: String(apiPort) },
  stdio: 'inherit',
});
let web;
let apiExitCode;
let stopping = false;

function stop(signal = 'SIGTERM') {
  stopping = true;
  if (!api.killed) api.kill(signal);
  if (web && !web.killed) web.kill(signal);
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
api.on('exit', (code) => {
  apiExitCode = code ?? 1;
  if (!stopping && code !== 0) stop();
});

async function waitForApi() {
  const healthUrl = `http://127.0.0.1:${apiPort}/api/health`;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (apiExitCode !== undefined) throw new Error(`Express API exited before becoming ready (code ${apiExitCode}).`);
    try {
      const response = await fetch(healthUrl);
      if (response.ok && (await response.json()).status === 'ok') return;
    } catch {
      // The API may need a moment to bind its port; retry briefly before starting Vite.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Express API did not become ready at ${healthUrl}.`);
}

try {
  await waitForApi();
  web = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], {
    env: { ...commonEnv, API_PORT: String(apiPort) },
    stdio: 'inherit',
  });
  web.on('exit', (code) => {
    if (!stopping && code !== 0) stop();
  });
} catch (error) {
  console.error(error.message);
  stop();
  process.exitCode = 1;
}
