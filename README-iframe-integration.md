# 📐 Dynamic Iframe Height Integration Guide

This guide explains how to implement automatic iframe height adjustment using postMessage communication between the roof calculator and parent websites.

## 🚀 Quick Setup

### 1. Iframe Implementation (Parent Website)

```html
<iframe 
    id="roof-calculator"
    src="https://zingy-cassata-05c5bf.netlify.app"
    width="100%"
    style="border: none; min-height: 600px;"
    title="Roof Impact Calculator">
</iframe>

<script>
// Listen for height updates from iframe
window.addEventListener('message', function(event) {
    // Security: Verify origin if needed
    // if (event.origin !== 'https://zingy-cassata-05c5bf.netlify.app') return;
    
    const data = event.data;
    if (data && data.iframeHeight) {
        const iframe = document.getElementById('roof-calculator');
        iframe.style.height = data.iframeHeight + 'px';
        console.log('📏 Iframe height updated:', data.iframeHeight + 'px');
    }
});
</script>
```

### 2. Advanced Implementation with Error Handling

```javascript
class IframeHeightManager {
    constructor(iframeId, expectedOrigin = null) {
        this.iframe = document.getElementById(iframeId);
        this.expectedOrigin = expectedOrigin;
        this.currentHeight = 0;
        this.updateCount = 0;
        
        this.init();
    }
    
    init() {
        // Listen for messages
        window.addEventListener('message', this.handleMessage.bind(this));
        
        // Handle iframe load
        this.iframe.addEventListener('load', () => {
            console.log('✅ Iframe loaded successfully');
            this.requestHeightUpdate();
        });
        
        // Periodic height check (fallback)
        setInterval(() => {
            this.requestHeightUpdate();
        }, 30000);
    }
    
    handleMessage(event) {
        // Security check
        if (this.expectedOrigin && event.origin !== this.expectedOrigin) {
            return;
        }
        
        const data = event.data;
        if (data && data.iframeHeight && data.iframeHeight !== this.currentHeight) {
            this.updateHeight(data.iframeHeight);
        }
    }
    
    updateHeight(newHeight) {
        this.currentHeight = newHeight;
        this.updateCount++;
        
        // Smooth height transition
        this.iframe.style.transition = 'height 0.3s ease';
        this.iframe.style.height = newHeight + 'px';
        
        console.log(`📏 Height updated to ${newHeight}px (Update #${this.updateCount})`);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('iframeHeightUpdated', {
            detail: { height: newHeight, updateCount: this.updateCount }
        }));
    }
    
    requestHeightUpdate() {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage({
                type: 'request-height-update'
            }, '*');
        }
    }
}

// Initialize
const heightManager = new IframeHeightManager('roof-calculator', 'https://zingy-cassata-05c5bf.netlify.app');
```

## 🔧 How It Works

### Calculator Side (Automatic)
The roof calculator automatically:

1. **Monitors Content Changes**: Uses ResizeObserver, MutationObserver, and window resize events
2. **Calculates Height**: Gets maximum height from body.scrollHeight, offsetHeight, etc.
3. **Sends Updates**: Posts height messages to parent window via postMessage
4. **Debounces Updates**: Prevents spam by only sending when height changes significantly

### Parent Side (Your Implementation)
Your website needs to:

1. **Listen for Messages**: Add event listener for 'message' events
2. **Validate Origin**: Optional security check for message origin
3. **Update Iframe Height**: Apply received height to iframe element
4. **Handle Errors**: Graceful fallback if communication fails

## 📱 Mobile Considerations

```css
/* Responsive iframe container */
.iframe-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.iframe-container iframe {
    width: 100%;
    border: none;
    display: block;
    min-height: 400px; /* Minimum height for mobile */
    transition: height 0.3s ease;
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .iframe-container {
        margin: 10px;
        border-radius: 4px;
    }
    
    .iframe-container iframe {
        min-height: 500px;
    }
}
```

## 🛡️ Security Best Practices

### 1. Origin Validation
```javascript
window.addEventListener('message', function(event) {
    // Validate origin for security
    const allowedOrigins = [
        'https://zingy-cassata-05c5bf.netlify.app',
        'https://your-calculator-domain.com'
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
        console.warn('Rejected message from unauthorized origin:', event.origin);
        return;
    }
    
    // Process message...
});
```

### 2. Message Validation
```javascript
function isValidHeightMessage(data) {
    return data && 
           typeof data === 'object' && 
           typeof data.iframeHeight === 'number' && 
           data.iframeHeight > 0 && 
           data.iframeHeight < 10000; // Reasonable max height
}
```

## 🎯 Testing & Debugging

### Debug Mode
```javascript
// Enable debug logging
const DEBUG_IFRAME = true;

function debugLog(message, data = null) {
    if (DEBUG_IFRAME) {
        console.log(`[IframeHeight] ${message}`, data || '');
    }
}

// Usage
debugLog('Height update received', { height: newHeight, timestamp: Date.now() });
```

### Test Different Scenarios
1. **Initial Load**: Calculator loads and sends initial height
2. **Content Changes**: User interactions change content height
3. **Window Resize**: Browser window resize triggers updates
4. **Tab Switching**: Page visibility changes
5. **Network Issues**: Handle communication failures gracefully

## 📊 Performance Monitoring

```javascript
class IframePerformanceMonitor {
    constructor() {
        this.metrics = {
            totalUpdates: 0,
            averageHeight: 0,
            lastUpdateTime: 0,
            updateFrequency: 0
        };
    }
    
    recordUpdate(height) {
        const now = Date.now();
        this.metrics.totalUpdates++;
        this.metrics.averageHeight = (this.metrics.averageHeight + height) / 2;
        
        if (this.metrics.lastUpdateTime) {
            const timeDiff = now - this.metrics.lastUpdateTime;
            this.metrics.updateFrequency = timeDiff;
        }
        
        this.metrics.lastUpdateTime = now;
    }
    
    getReport() {
        return {
            ...this.metrics,
            efficiency: this.metrics.totalUpdates > 0 ? 'Good' : 'No updates received'
        };
    }
}
```

## 🔄 Fallback Strategies

### 1. Fixed Height Fallback
```javascript
// If dynamic height fails, use reasonable fixed height
const FALLBACK_HEIGHT = 800;

setTimeout(() => {
    if (iframe.style.height === '' || iframe.style.height === 'auto') {
        iframe.style.height = FALLBACK_HEIGHT + 'px';
        console.warn('Using fallback height:', FALLBACK_HEIGHT);
    }
}, 5000);
```

### 2. Content Detection
```javascript
// Detect if iframe content is loaded
function checkIframeContent() {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        return iframeDoc.readyState === 'complete';
    } catch (e) {
        // Cross-origin, assume loaded after delay
        return true;
    }
}
```

## 📋 Implementation Checklist

- [ ] Add message event listener to parent page
- [ ] Implement height update logic
- [ ] Add origin validation for security
- [ ] Test on different devices and browsers
- [ ] Implement fallback height strategy
- [ ] Add error handling and logging
- [ ] Test with slow network conditions
- [ ] Verify mobile responsiveness
- [ ] Monitor performance metrics
- [ ] Document integration for your team

## 🆘 Troubleshooting

### Common Issues

1. **Height Not Updating**
   - Check browser console for errors
   - Verify message event listener is attached
   - Confirm iframe src URL is correct

2. **Security Errors**
   - Add proper origin validation
   - Check CORS settings if applicable

3. **Performance Issues**
   - Implement debouncing
   - Monitor update frequency
   - Use performance monitoring

4. **Mobile Problems**
   - Test on actual devices
   - Check viewport meta tag
   - Verify touch interactions work

### Debug Commands
```javascript
// Test height communication
iframe.contentWindow.postMessage({ type: 'request-height-update' }, '*');

// Check current iframe height
console.log('Current iframe height:', iframe.style.height);

// Monitor all messages
window.addEventListener('message', (e) => console.log('Message received:', e.data));
```

This implementation ensures your iframe always fits its content perfectly, providing a seamless user experience across all devices and scenarios.