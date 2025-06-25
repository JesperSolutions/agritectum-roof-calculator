interface HeightMessage {
  iframeHeight: number;
  type?: 'height-update';
}

export class IframeHeightManager {
  private static instance: IframeHeightManager;
  private observers: ResizeObserver[] = [];
  private lastHeight = 0;
  private debounceTimer: number | null = null;

  static getInstance(): IframeHeightManager {
    if (!IframeHeightManager.instance) {
      IframeHeightManager.instance = new IframeHeightManager();
    }
    return IframeHeightManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Send initial height when page loads
    window.addEventListener('load', () => {
      this.sendHeight();
    });

    // Send height when DOM content is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.sendHeight();
      });
    } else {
      this.sendHeight();
    }

    // Monitor for dynamic content changes
    this.setupContentObserver();
    this.setupResizeObserver();
    this.setupMutationObserver();
  }

  private calculateHeight(): number {
    // Get the maximum height from different measurements
    const body = document.body;
    const html = document.documentElement;

    const heights = [
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    ];

    return Math.max(...heights);
  }

  private sendHeight(): void {
    const currentHeight = this.calculateHeight();
    
    // Only send if height has changed significantly (avoid spam)
    if (Math.abs(currentHeight - this.lastHeight) > 10) {
      this.lastHeight = currentHeight;
      
      const message: HeightMessage = {
        iframeHeight: currentHeight,
        type: 'height-update'
      };

      // Send to parent window
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
      }

      console.log(`📏 Iframe height updated: ${currentHeight}px`);
    }
  }

  private debouncedSendHeight(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.sendHeight();
    }, 100);
  }

  private setupContentObserver(): void {
    // Monitor for content changes that might affect height
    const targetElements = [
      document.body,
      document.querySelector('#root'),
      document.querySelector('.main-content')
    ].filter(Boolean) as Element[];

    targetElements.forEach(element => {
      if (element) {
        const observer = new ResizeObserver(() => {
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
            mutation.type === 'attributes' && 
            ['style', 'class', 'hidden'].includes(mutation.attributeName || '')) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        this.debouncedSendHeight();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  }

  // Manual trigger for specific events
  public triggerHeightUpdate(): void {
    this.sendHeight();
  }

  // Cleanup method
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Auto-initialize when imported
export const iframeHeightManager = IframeHeightManager.getInstance();