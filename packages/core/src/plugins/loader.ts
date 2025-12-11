import { AppManifest } from './types';

export const loadApp = async (manifest: AppManifest) => {
  if (manifest.tier === 1) {
    // Dynamic import for built-ins (simplified)
    // In reality, we might have a registry map
    // This path is relative to the build output or handled by bundler
    return import(`../../../../apps/${manifest.id}/index.tsx`);
  } else {
    // Handle Tier 2/3
    throw new Error('Not implemented');
  }
};
