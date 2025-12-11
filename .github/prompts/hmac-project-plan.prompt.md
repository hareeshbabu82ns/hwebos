---
agent: Plan
description: This prompt is used to create a detailed project plan for building a web-based OS simulation application called "hmac" that combines macOS aesthetics with Linux philosophies, including a plugin system, window management, and system APIs.
model: Claude Opus 4.5 (Preview) (copilot)
---
## Plan: hmac Web OS Simulation Application

Build a fully functional web-based OS simulation called "hmac" that blends macOS Liquid Glass aesthetics with Linux philosophies, featuring a complete plugin system, window management, and system APIs.

### Tech Stack
- **Server**: Hono + Node.js with node-pty, Dockerode for per-user containers
- **Database**: MongoDB (containerized, pre-installed) + Mongoose ODM for type-safe schemas
- **Frontend**: React 18+ with TypeScript, Zustand, react-rnd, xterm.js
- **Build**: Vite + Turborepo (pnpm workspaces)
- **Styling**: Tailwind CSS with Liquid Glass theme
- **Containerization**: Docker with Ubuntu 24.04 LTS, MongoDB pre-installed, nested containers for user shells
- **Security**: Rate limiting (hono-rate-limiter), per-user shell containers, Tier 3 app warnings

### Steps
1. **Initialize monorepo** with pnpm workspaces, Turborepo, shared TypeScript/ESLint configs across `packages/core`, `packages/server`, `packages/client`, `packages/sdk`, and `apps/`
2. **Build window management kernel** in `packages/core/windows`: Zustand store, `react-rnd` wrapper, z-index/focus management, minimize/maximize/snap, state persistence to server
3. **Implement hybrid file system** in `packages/core/fs`: IndexedDB cache for browser, MongoDB GridFS for server-side file storage, WebSocket sync, last-write-wins conflict resolution
4. **Create Hono server** in `packages/server`: JWT auth with bcrypt, Mongoose schemas (`User`, `Session`, `Settings`, `File`, `App`, `Container`), REST APIs, rate limiting on auth (5 req/min) and PTY (3 req/min)
5. **Implement containerized PTY backend** in `packages/server/pty`: Dockerode to spawn per-user Ubuntu containers, WebSocket bridge to container PTY, container lifecycle (idle timeout 30min, cleanup on logout)
6. **Build desktop shell** in `packages/client`: `<Desktop>`, `<Dock>`, `<MenuBar>`, `<Window>`, `<Spotlight>`, `<NotificationCenter>` with Liquid Glass CSS (backdrop-filter blur, transparency)
7. **Implement three-tier plugin sandbox** in `packages/core/plugins`: Tier 1 direct imports, Tier 2 iframe + postMessage IPC, Tier 3 strict iframe with `<ExternalAppWarningModal>` (URL preview, risk acknowledgment checkbox)
8. **Build initial apps** in `apps/`: File Explorer, Terminal (xterm.js + containerized PTY), Settings, App Store (registry + external URL with warning modal)
9. **Create Docker configuration**: Single Dockerfile (Ubuntu 24.04 + Node.js 20 + MongoDB 7.0 pre-installed), expose ports 3000 (API), 5173 (Vite dev), 27017 (MongoDB), docker-compose with dev/prod profiles

### Final Architecture

```
hmac/
├── packages/
│   ├── core/                    # Kernel modules
│   │   ├── windows/             # Window manager, Zustand store
│   │   ├── fs/                  # Virtual FS, sync engine
│   │   ├── plugins/             # Three-tier sandbox system
│   │   ├── api/                 # System API (window.hmac)
│   │   └── types/               # Shared TypeScript types
│   ├── server/                  # Hono backend
│   │   ├── routes/
│   │   │   ├── auth.ts          # Login, register, logout (rate limited)
│   │   │   ├── files.ts         # FS CRUD APIs + GridFS
│   │   │   ├── apps.ts          # App registry APIs
│   │   │   └── settings.ts      # User settings APIs
│   │   ├── pty/
│   │   │   ├── container.ts     # Dockerode container management
│   │   │   ├── session.ts       # PTY session lifecycle
│   │   │   └── websocket.ts     # WS ↔ PTY bridge
│   │   ├── db/
│   │   │   ├── connection.ts    # MongoDB/Mongoose connection
│   │   │   ├── models/          # Mongoose models
│   │   │   │   ├── User.ts
│   │   │   │   ├── Session.ts
│   │   │   │   ├── Settings.ts
│   │   │   │   ├── File.ts
│   │   │   │   ├── App.ts
│   │   │   │   └── Container.ts
│   │   │   └── gridfs.ts        # GridFS file storage
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification
│   │   │   └── rateLimit.ts     # Rate limiting config
│   │   └── ws/                  # WebSocket handlers
│   ├── client/                  # React desktop shell
│   │   ├── components/
│   │   │   ├── desktop/         # Desktop, icons, wallpaper
│   │   │   ├── dock/            # Dock with app icons
│   │   │   ├── menubar/         # Global menu bar
│   │   │   ├── window/          # Window chrome, controls
│   │   │   ├── spotlight/       # Command palette search
│   │   │   ├── notifications/   # Notification center
│   │   │   └── modals/          # ExternalAppWarningModal, etc.
│   │   ├── hooks/               # useWindow, useFS, useAuth, useApps
│   │   ├── stores/              # Zustand stores
│   │   └── styles/              # Tailwind config, Liquid Glass theme
│   └── sdk/                     # @hmac/sdk for developers
│       ├── createApp.ts         # App factory function
│       ├── hooks.ts             # useKernel, useFileSystem
│       ├── types.ts             # AppManifest, Permission
│       └── ipc.ts               # postMessage helpers
├── apps/
│   ├── file-explorer/           # Tier 1: Virtual FS browser
│   ├── terminal/                # Tier 1: xterm.js + containerized PTY
│   ├── settings/                # Tier 1: Theme, dock, account prefs
│   └── app-store/               # Tier 1: Registry + external URL installer
├── docker/
│   ├── Dockerfile               # Main app (Ubuntu 24.04 + Node.js 20 + MongoDB 7.0)
│   ├── Dockerfile.shell         # Per-user shell container (minimal Ubuntu)
│   ├── mongod.conf              # MongoDB configuration
│   ├── entrypoint.sh            # Start MongoDB + Node.js app
│   └── shell-init.sh            # User container initialization script
├── docker-compose.yml           # Dev/prod profiles, port mappings
├── docker-compose.override.yml  # Local dev overrides
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Docker Configuration

**Dockerfile** (Ubuntu 24.04 + Node.js 20 + MongoDB 7.0):
```dockerfile
# Base stage with MongoDB pre-installed
FROM ubuntu:24.04 AS base

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl gnupg ca-certificates build-essential python3

# Install MongoDB 7.0
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update && apt-get install -y mongodb-org

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create data directories
RUN mkdir -p /data/db /data/logs

# ... (deps, build, production stages follow)

# Expose ports
EXPOSE 3000 5173 27017

# Entrypoint starts MongoDB then Node.js
ENTRYPOINT ["/app/docker/entrypoint.sh"]
```

**docker-compose.yml**:
```yaml
services:
  hmac:
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: ${TARGET:-production}
    ports:
      - "3000:3000"      # Hono API
      - "5173:5173"      # Vite dev server (dev only)
      - "27017:27017"    # MongoDB (external access)
    volumes:
      - mongodb_data:/data/db
      - user_shells:/var/lib/hmac/shells
      - /var/run/docker.sock:/var/run/docker.sock  # For Dockerode
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - MONGODB_URI=mongodb://localhost:27017/hmac
      - JWT_SECRET=${JWT_SECRET}
    profiles:
      - prod

  hmac-dev:
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: development
    ports:
      - "3000:3000"
      - "5173:5173"
      - "27017:27017"
    volumes:
      - ./packages:/app/packages
      - ./apps:/app/apps
      - mongodb_data:/data/db
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://localhost:27017/hmac
      - JWT_SECRET=dev-secret
    profiles:
      - dev

volumes:
  mongodb_data:
  user_shells:
```

### MongoDB Schema (Mongoose)

```typescript
// packages/server/db/models/User.ts
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// packages/server/db/models/Session.ts
const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// packages/server/db/models/Settings.ts
const settingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});
settingsSchema.index({ userId: 1, key: 1 }, { unique: true });

// packages/server/db/models/File.ts
const fileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  path: { type: String, required: true },
  name: { type: String, required: true },
  isDirectory: { type: Boolean, default: false },
  gridFsId: { type: Schema.Types.ObjectId }, // Reference to GridFS for file content
  mimeType: { type: String },
  size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
fileSchema.index({ userId: 1, path: 1 }, { unique: true });

// packages/server/db/models/App.ts
const appSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appId: { type: String, required: true }, // e.g., 'com.example.myapp'
  name: { type: String, required: true },
  version: { type: String, required: true },
  manifestUrl: { type: String },
  tier: { type: Number, enum: [1, 2, 3], required: true },
  permissions: [{
    permission: { type: String, required: true },
    granted: { type: Boolean, default: false },
  }],
  installedAt: { type: Date, default: Date.now },
});
appSchema.index({ userId: 1, appId: 1 }, { unique: true });

// packages/server/db/models/Container.ts
const containerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  containerId: { type: String, required: true },
  status: { type: String, enum: ['creating', 'running', 'stopped'], required: true },
  lastActiveAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
containerSchema.index({ userId: 1 }, { unique: true });
```

### Port Exposure Summary
| Port | Service | Access | Purpose |
|------|---------|--------|---------|
| **3000** | Hono API + WebSocket | Internal + External | REST APIs, PTY WebSocket, file sync |
| **5173** | Vite Dev Server | Dev only | Hot module replacement |
| **27017** | MongoDB | External | Database access for admin tools, backups, external clients |

### Containerized PTY Architecture
```
┌──────────────────────────────────────────────────────────────────┐
│  hmac Container (Ubuntu 24.04 + Node.js + MongoDB)               │
│  ┌─────────────┐    WebSocket    ┌─────────────────────────────┐ │
│  │  Browser    │ ◄─────────────► │  Hono Server                │ │
│  │  xterm.js   │                 │  ├── JWT Auth               │ │
│  └─────────────┘                 │  ├── Rate Limiter           │ │
│                                  │  └── PTY Manager            │ │
│  ┌─────────────┐                 │      │ Dockerode            │ │
│  │  MongoDB    │ ◄───────────────┤      │                      │ │
│  │  :27017     │   Mongoose      └──────┼──────────────────────┘ │
│  └─────────────┘                        │                        │
│        ▲                                │                        │
│        │ External access                │                        │
│  ──────┼────────────────────────────────┼──────────────────────  │
│        │                                │                        │
│  ┌─────┴───────────────────────────────┴──────────────────────┐ │
│  │  Per-User Containers (via Docker socket)                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │ user-abc123 │  │ user-def456 │  │ user-ghi789 │          │ │
│  │  │ Ubuntu mini │  │ Ubuntu mini │  │ Ubuntu mini │          │ │
│  │  │ bash/zsh    │  │ bash/zsh    │  │ bash/zsh    │          │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Rate Limiting Configuration
| Endpoint | Limit | Window | Action on Exceed |
|----------|-------|--------|------------------|
| `POST /auth/register` | 3 req | 15 min | 429 + retry-after header |
| `POST /auth/login` | 5 req | 1 min | 429 + temporary lockout |
| `POST /auth/logout` | 10 req | 1 min | 429 |
| `POST /pty/spawn` | 3 req | 1 min | 429 + "too many terminals" |
| `WS /pty/:sessionId` | 5 connections | per user | Reject new connections |
| `* /api/*` | 100 req | 1 min | 429 |

### System API Surface (`window.hmac`)
```typescript
interface HmacKernel {
  window: {
    create(options: WindowOptions): Promise<WindowHandle>;
    close(id: string): void;
    minimize(id: string): void;
    maximize(id: string): void;
    restore(id: string): void;
    focus(id: string): void;
    setTitle(id: string, title: string): void;
    setBounds(id: string, bounds: Partial<WindowBounds>): void;
    getAll(): WindowInfo[];
    onFocus(callback: (id: string) => void): Unsubscribe;
  };

  fs: {
    read(path: string): Promise<Uint8Array>;
    readText(path: string): Promise<string>;
    write(path: string, data: Uint8Array | string): Promise<void>;
    list(path: string): Promise<FileInfo[]>;
    mkdir(path: string): Promise<void>;
    remove(path: string, recursive?: boolean): Promise<void>;
    exists(path: string): Promise<boolean>;
    stat(path: string): Promise<FileStat>;
    watch(path: string, callback: WatchCallback): Unsubscribe;
  };

  terminal: {
    spawn(options?: TerminalOptions): Promise<TerminalSession>;
    list(): TerminalSession[];
  };

  notifications: {
    send(notification: NotificationOptions): string;
    clear(id: string): void;
    clearAll(): void;
  };

  clipboard: {
    read(): Promise<string>;
    write(text: string): Promise<void>;
  };

  system: {
    getInfo(): SystemInfo;
    getTheme(): ThemeConfig;
    setTheme(theme: Partial<ThemeConfig>): void;
    onThemeChange(callback: (theme: ThemeConfig) => void): Unsubscribe;
  };

  storage: {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
  };

  app: {
    getManifest(): AppManifest;
    getPermissions(): Permission[];
    requestPermission(permission: Permission): Promise<boolean>;
    exit(): void;
  };

  ipc: {
    send(channel: string, data: unknown): void;
    on(channel: string, callback: (data: unknown) => void): Unsubscribe;
    invoke(channel: string, data: unknown): Promise<unknown>;
  };
}
```

This plan is ready for implementation with MongoDB as the database, pre-installed in Docker, with port 27017 exposed for external access.