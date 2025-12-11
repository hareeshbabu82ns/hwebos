export type Permission = 
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:fetch'
  | 'notifications:send';

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  tier: 1 | 2 | 3;
  permissions: Permission[];
  main?: string; // For Tier 1
  url?: string; // For Tier 2/3
}

export interface PluginContext {
  windowId: string;
  // ... exposed APIs
}
