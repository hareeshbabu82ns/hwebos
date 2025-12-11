the "hmac" web OS simulation application with the following components:

1.  **Monorepo Structure**: Initialized using `pnpm` workspaces and `turbo` for build orchestration.
2.  **Core Kernel (core)**:
    - **Window Management**: Implemented using `zustand` for state and `react-rnd` types.
    - **File System**: Implemented a hybrid FS using `idb` (IndexedDB) for browser storage, ready for sync.
    - **Plugin System**: Defined types and loaders for the three-tier sandbox architecture.
3.  **Server (server)**:
    - **Hono Framework**: Fast, lightweight server setup.
    - **MongoDB**: Integrated via `mongoose` for data persistence.
    - **PTY Backend**: Implemented using `node-pty` and `dockerode` to spawn per-user containerized shells.
    - **WebSocket**: Set up for real-time terminal communication.
4.  **Client (client)**:
    - **React & Vite**: Modern frontend stack.
    - **Liquid Glass UI**: Styled with Tailwind CSS using backdrop filters and glassmorphism.
    - **Desktop Environment**: Includes Desktop icons, Dock, and Window Manager.
5.  **Apps (apps)**:
    - **Terminal**: Fully functional terminal emulator using `xterm.js` connected to the backend PTY.
    - **Finder**: File explorer using the virtual file system.
6.  **Docker Configuration**:
    - **Multi-stage Dockerfile**: Builds the app on Ubuntu 24.04.
    - **MongoDB Integration**: Provided by a separate `mongodb` service using the official `mongo:7.0` image.
    - **Docker Compose**: Profiles for `dev` (hot-reload) and `prod` (optimized).

### How to Run

**Development Mode:**

```bash
docker compose --profile dev up --build
```

- Access the app at `http://localhost:5173`
- API server at `http://localhost:3000`
- MongoDB at `mongodb://localhost:27017` (service `mongodb` on Docker Compose)

**Production Mode:**

```bash
docker compose --profile prod up --build
```

- Access the app at `http://localhost:3000` (Client is served statically by the server)

**Note:** The first time you run the terminal app, it will attempt to spawn a Docker container for the user. Ensure the Docker socket is correctly mounted and you have permissions.
