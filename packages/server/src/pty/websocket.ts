import { WebSocketServer, WebSocket } from 'ws';
import { createPTYSession } from './session';
import { IncomingMessage } from 'http';

export const setupPTYWebSocket = (server: any) => {
  const wss = new WebSocketServer({ server, path: '/pty' });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      ws.close();
      return;
    }

    try {
      const ptyProcess = await createPTYSession(userId, 80, 24);

      ws.on('message', (message) => {
        ptyProcess.write(message.toString());
      });

      ptyProcess.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      ws.on('close', () => {
        ptyProcess.kill();
      });
    } catch (error) {
      console.error('PTY Error:', error);
      ws.close();
    }
  });
};
