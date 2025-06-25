interface HeightMessage {
  iframeHeight: number;
  type?: 'height-update';
}

export class IframeHeightManager {
  private static instance: IframeHeightManager;
  private observers: ResizeObserver[] = [];
  private lastHeight = 0;
  private lastSentHeight = 0;
  private debounceTimer: number | null = null;
  private isDebugMode = false; // Disable debug by default
  private isUpdatingHeight = false; // Prevent feedback loops
  private stableHeightCount = 0;
  private readonly STABLE_HEIGHT_THRESHOLD = 3;
  private readonly HEIGHT_CHANGE_THRESHOLD = 20;

  static getInstance(): IframeHeightManager {
    if (!IframeHeightManager.instance) {
      IframeHeightManager.instance = new IframeHeightManager();
    }
    return IframeHeightManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private log(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.log(`[IframeHeight] ${message}`, data || '');
    }
  }

  private initialize(): void {
    this.log('Initializing iframe height manager');

    // Send initial height when page loads
    window.addEventListener('load', () => {
      this.log('Window loaded, sending height');
      setTimeout(() => this.sendHeight(), 1000);
    });

    // Send height when DOM content is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.log('DOM content loaded, sending height');
        setTimeout(() => this.sendHeight(), 1000);
      });
    } else {
      this.log('DOM already loaded, sending height immediately');
      setTimeout(() => this.sendHeight(), 500);
    }

    // Listen for height requests from parent
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'request-height-update') {
        this.log('Height update requested by parent');
        this.sendHeight();
      }
    });

    // Monitor for dynamic content changes
    this.setupContentObserver();
    this.setupResizeObserver();
    this.setupMutationObserver();

    // Less frequent periodic updates
    setInterval(() => {
      if (!this.isUpdatingHeight) {
        this.sendHeight();
      }
    }, 30000); // Every 30 seconds
  }

  private calculateContentHeight(): number {
    // Get the actual content height without iframe-induced changes
    const body = document.body;
    const html = document.documentElement;

    // Get all major content containers
    const containers = [
      document.querySelector('#root'),
      document.querySelector('.main-content'),
      document.querySelector('[data-reactroot]'),
      body
    ].filter(Boolean) as Element[];

    let maxContentHeight = 0;

    // Calculate height based on actual content, not iframe dimensions
    containers.forEach(container => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const scrollHeight = container.scrollHeight;
        const offsetHeight = (container as HTMLElement).offsetHeight;
        
        // Use the maximum of these measurements
        const containerHeight = Math.max(rect.height, scrollHeight, offsetHeight);
        maxContentHeight = Math.max(maxContentHeight, containerHeight);
      }
    });

    // Fallback to document measurements if containers don't give good results
    if (maxContentHeight < 100) {
      maxContentHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    }

    // Add minimal padding for safety (much less than before)
    const paddedHeight = maxContentHeight + 50;

    this.log(`Content height calculation: ${maxContentHeight}px (with padding: ${paddedHeight}px)`);
    
    return Math.round(paddedHeight);
  }

  private sendHeight(): void {
    if (this.isUpdatingHeight) {
      this.log('Height update in progress, skipping');
      return;
    }

    const currentHeight = this.calculateContentHeight();
    
    // Only send if height has changed significantly
    const heightDifference = Math.abs(currentHeight - this.lastSentHeight);
    
    if (heightDifference < this.HEIGHT_CHANGE_THRESHOLD) {
      this.stableHeightCount++;
      this.log(`Height stable (${this.stableHeightCount}/${this.STABLE_HEIGHT_THRESHOLD}): ${currentHeight}px`);
      
      // If height has been stable for several checks, stop sending updates
      if (this.stableHeightCount >= this.STABLE_HEIGHT_THRESHOLD) {
        return;
      }
    } else {
      this.stableHeightCount = 0;
    }

    // Prevent sending the same height repeatedly
    if (currentHeight === this.lastSentHeight) {
      this.log(`Same height as last sent (${currentHeight}px), skipping`);
      return;
    }

    this.isUpdatingHeight = true;
    this.lastSentHeight = currentHeight;
    
    const message: HeightMessage = {
      iframeHeight: currentHeight,
      type: 'height-update'
    };

    // Send to parent window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
      this.log(`Height sent to parent: ${currentHeight}px`);
    } else {
      this.log('No parent window found - running standalone');
    }

    // Reset the updating flag after a short delay
    setTimeout(() => {
      this.isUpdatingHeight = false;
    }, 1000);
  }

  private debouncedSendHeight(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.log('Debounced height update triggered');
      this.sendHeight();
    }, 500); // Longer debounce time
  }

  private setupContentObserver(): void {
    // Monitor for content changes that might affect height
    const targetElements = [
      document.querySelector('#root'),
      document.querySelector('.main-content')
    ].filter(Boolean) as Element[];

    this.log(`Setting up content observer for ${targetElements.length} elements`);

    targetElements.forEach((element, index) => {
      if (element) {
        const observer = new ResizeObserver((entries) => {
          // Only trigger if the size change is significant and not from iframe resizing
          const entry = entries[0];
          if (entry && !this.isUpdatingHeight) {
            const heightChange = Math.abs(entry.contentRect.height - this.lastHeight);
            if (heightChange > this.HEIGHT_CHANGE_THRESHOLD) {
              this.log(`Significant content resize detected for element ${index}: ${heightChange}px change`);
              this.lastHeight = entry.contentRect.height;
              this.debouncedSendHeight();
            }
          }
        });
        observer.observe(element);
        this.observers.push(observer);
      }
    });
  }

  private setupResizeObserver(): void {
    // Only monitor window resize if it's not caused by our own height updates
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      if (!this.isUpdatingHeight) {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          this.log('Window resize detected (not from height update)');
          this.debouncedSendHeight();
        }, 1000);
      }
    });
  }

  private setupMutationObserver(): void {
    // Monitor DOM changes that might affect height
    const observer = new MutationObserver((mutations) => {
      if (this.isUpdatingHeight) return;

      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        // Only care about significant DOM changes
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if added nodes are significant (not just text nodes)
          const significantNodes = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).getBoundingClientRect().height > 10
          );
          if (significantNodes.length > 0) {
            shouldUpdate = true;
          }
        } else if (mutation.type === 'attributes' && 
                   ['style', 'class'].includes(mutation.attributeName || '')) {
          // Only care about style/class changes that might affect layout
          const target = mutation.target as Element;
          if (target && target.getBoundingClientRect().height > 10) {
            shouldUpdate = true;
          }
        }
      });

      if (shouldUpdate) {
        this.log(`Significant DOM mutation detected`);
        this.debouncedSendHeight();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });

    this.log('MutationObserver set up');
  }

  // Manual trigger for specific events
  public triggerHeightUpdate(): void {
    this.log('Manual height update triggered');
    this.stableHeightCount = 0; // Reset stability counter
    this.sendHeight();
  }

  // Enable/disable debug mode
  public setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Reset the manager state
  public reset(): void {
    this.log('Resetting iframe height manager');
    this.lastHeight = 0;
    this.lastSentHeight = 0;
    this.stableHeightCount = 0;
    this.isUpdatingHeight = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // Cleanup method
  public destroy(): void {
    this.log('Destroying iframe height manager');
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Auto-initialize when imported
export const iframeHeightManager = IframeHeightManager.getInstance();

// Make it available globally for debugging
(window as any).iframeHeightManager = iframeHeightManager;