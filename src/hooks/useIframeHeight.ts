// Simplified hook - no longer manages iframe height
export function useIframeHeight() {
  // Return empty function since we're not managing height anymore
  return {
    updateHeight: () => {}
  };
}