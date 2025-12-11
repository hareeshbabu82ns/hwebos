import { spawn } from 'node-pty';
import { ensureUserContainer } from './container';

export const createPTYSession = async (userId: string, cols: number, rows: number) => {
  await ensureUserContainer(userId);
  const containerName = `hmac-shell-${userId}`;

  // Using docker exec to run the shell inside the container
  const ptyProcess = spawn('docker', ['exec', '-it', containerName, '/bin/bash'], {
    name: 'xterm-color',
    cols,
    rows,
    cwd: '/', // Root in container
    env: process.env as any
  });

  return ptyProcess;
};
