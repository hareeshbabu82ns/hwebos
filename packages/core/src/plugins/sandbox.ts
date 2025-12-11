// Helper to generate iframe sandbox attributes
export const getSandboxAttributes = (tier: 2 | 3) => {
  if (tier === 2) {
    return 'allow-scripts allow-same-origin allow-forms';
  }
  return 'allow-scripts'; // Tier 3: Strict
};
