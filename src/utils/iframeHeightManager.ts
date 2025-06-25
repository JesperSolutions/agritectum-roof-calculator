interface HeightMessage {
  iframeHeight: number;
  type?: 'height-update';
}

export class IframeHeightManager {
  private static instance: IframeHeightManager;
  private observers: ResizeObserver[] = [];
  private lastHeight = 0;
  private debounceTimer: number | null = null;
  private isDebugMode = true; // Enable debug logging

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
      setTimeout(() => this.sendHeight(), 500);
    });

    // Send height when DOM content is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.log('DOM content loaded, sending height');
        setTimeout(() => this.sendHeight(), 500);
      });
    } else {
      this.log('DOM already loaded, sending height immediately');
      setTimeout(() => this.sendHeight(), 100);
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

    // Periodic height updates as fallback
    setInterval(() => {
      this.sendHeight();
    }, 5000); // Every 5 seconds
  }

  private calculateHeight(): number {
    // Get the maximum height from different measurements
    const body = document.body;
    const html = document.documentElement;

    const measurements = {
      bodyScrollHeight: body.scrollHeight,
      bodyOffsetHeight: body.offsetHeight,
      htmlClientHeight: html.clientHeight,
      htmlScrollHeight: html.scrollHeight,
      htmlOffsetHeight: html.offsetHeight,
      windowInnerHeight: window.innerHeight,
      documentHeight: Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      )
    };

    this.log('Height measurements:', measurements);

    // Use the maximum of all measurements, but add some padding
    const maxHeight = Math.max(...Object.values(measurements));
    const paddedHeight = maxHeight + 100; // Add 100px padding

    this.log(`Calculated height: ${maxHeight}px (with padding: ${paddedHeight}px)`);
    
    return paddedHeight;
  }

  private sendHeight(): void {
    const currentHeight = this.calculateHeight();
    
    // Always send height, even if it hasn't changed much (for debugging)
    if (Math.abs(currentHeight - this.lastHeight) > 5 || this.isDebugMode) {
      this.lastHeight = currentHeight;
      
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
    }
  }

  private debouncedSendHeight(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.log('Debounced height update triggered');
      this.sendHeight();
    }, 250); // Increased debounce time
  }

  private setupContentObserver(): void {
    // Monitor for content changes that might affect height
    const targetElements = [
      document.body,
      document.querySelector('#root'),
      document.querySelector('.main-content')
    ].filter(Boolean) as Element[];

    this.log(`Setting up content observer for ${targetElements.length} elements`);

    targetElements.forEach((element, index) => {
      if (element) {
        const observer = new ResizeObserver((entries) => {
          this.log(`ResizeObserver triggered for element ${index}`, entries[0]?.contentRect);
          this.debouncedSendHeight();
        });
        observer.observe(element);
        this.observers.push(observer);
      }
    });
  }

  private setupResizeObserver(): void {
    // Monitor window resize
    window.addEventListener('resize', () => {
      this.log('Window resize detected');
      this.debouncedSendHeight();
    });
  }

  private setupMutationObserver(): void {
    // Monitor DOM changes that might affect height
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        // Check if the mutation might affect layout
        if (mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
            ['style', 'class', 'hidden'].includes(mutation.attributeName || ''))) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        this.log(`MutationObserver triggered (${mutations.length} mutations)`);
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
    this.sendHeight();
  }

  // Enable/disable debug mode
  public setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
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