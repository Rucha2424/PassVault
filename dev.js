import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[35m%s\x1b[0m', '=========================================================');
console.log('\x1b[1m\x1b[35m%s\x1b[0m', '  PassVault — Secure Cloud-Based Password Manager');
console.log('\x1b[36m%s\x1b[0m', '  Zero-Knowledge Architecture • Local Development Mode');
console.log('\x1b[35m%s\x1b[0m', '=========================================================');
console.log('  \x1b[32m✔\x1b[0m Frontend UI:  \x1b[4m\x1b[36mhttp://localhost:3000\x1b[0m');
console.log('  \x1b[32m✔\x1b[0m Backend API:  \x1b[4m\x1b[35mhttp://localhost:5000/api\x1b[0m');
console.log('  \x1b[33m⚡\x1b[0m Auto-DB:      Automatic Embedded MongoDB Enabled');
console.log('\x1b[35m%s\x1b[0m', '=========================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = isWindows ? 'node.exe' : 'node';

// Spawn Backend
const backend = spawn(nodeCmd, ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: isWindows,
  env: { ...process.env, PORT: '5000' },
});

// Spawn Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: isWindows,
});

// Helper for colored prefix streaming
const pipeWithPrefix = (stream, prefix, colorCode) => {
  if (!stream) return;
  stream.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim().length > 0) {
        console.log(`${colorCode}${prefix}\x1b[0m ${line}`);
      }
    });
  });
};

pipeWithPrefix(backend.stdout, '[Backend]', '\x1b[35m');
pipeWithPrefix(backend.stderr, '[Backend]', '\x1b[35m');

pipeWithPrefix(frontend.stdout, '[Frontend]', '\x1b[36m');
pipeWithPrefix(frontend.stderr, '[Frontend]', '\x1b[36m');

const cleanup = () => {
  console.log('\n\x1b[33m[PassVault] Shutting down development servers...\x1b[0m');
  try {
    if (backend.pid) process.kill(backend.pid);
  } catch {}
  try {
    if (frontend.pid) process.kill(frontend.pid);
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
