import { useEffect, useRef } from 'react';
import { iframeHeightManager } from '../utils/iframeHeightManager';

export function useIframeHeight() {
  const heightUpdateRef = useRef<() => void>();

  useEffect(() => {
    // Create a function to manually trigger height updates
    heightUpdateRef.current = () => {
      iframeHeightManager.triggerHeightUpdate();
    };

    // Trigger height update when component mounts
    const timer = setTimeout(() => {
      iframeHeightManager.triggerHeightUpdate();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Return function to manually trigger height updates
  return {
    updateHeight: () => heightUpdateRef.current?.()
  };
}