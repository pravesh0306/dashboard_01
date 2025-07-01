/**
 * Browser Extension Conflict Prevention
 * 
 * This file helps prevent conflicts with browser extensions like MetaMask, 
 * that inject scripts into web pages causing errors like:
 * - "ObjectMultiplex - malformed chunk without name ACK"
 * - "StreamMiddleware - Unknown response id" 
 */

(function() {
  // Create a namespace for extension conflict management
  window.ExtensionConflictManager = {    // Keep track of recognized extension error patterns    knownErrorPatterns: [
      { pattern: /ObjectMultiplex.*malformed chunk.*ACK/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /StreamMiddleware.*Unknown response id/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /-ms-high-contrast.*(deprecated)/i, source: 'Browser-Vendor' },
      { pattern: /inpage\.js.*_write/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /contentscript\.js.*_write/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /postMessage.*_postMessage/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /ObjectMultiplex.*chunk without name/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /_onData.*_onMessage/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /a\.emit.*inpage\.js/i, source: 'MetaMask/Crypto-Wallet' },
      { pattern: /runtime\.lastError.*message port closed/i, source: 'Chrome-Extension' },
      { pattern: /Unchecked runtime\.lastError/i, source: 'Chrome-Extension' }
    ],
    
    // Track detected errors to avoid spam
    detectedErrors: {},
      /**
     * Initialize error detection and handling
     */
    initialize: function() {
      console.log('%c🛡️ Extension Conflict Manager Initialized', 'color: #10B981; font-weight: bold;');
      console.log('%cMetaMask/Crypto wallet extension errors will be automatically suppressed.', 'color: #6B7280;');
      this.setupErrorListeners();
      
      // Show a summary after a brief delay
      setTimeout(() => {
        const stats = this.getStatistics();
        if (stats.suppressedErrors > 0) {
          console.log(`%c✅ Suppressed ${stats.suppressedErrors} extension-related errors`, 'color: #10B981;');
        }
      }, 2000);
    },
      /**
     * Setup error handling mechanisms
     */
    setupErrorListeners: function() {
      // Store original console methods
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Replace console.error to intercept extension errors
      console.error = (...args) => {
        // Check if the error matches known patterns
        const errorString = args.join(' ');
        const matchedPattern = this.knownErrorPatterns.find(p => p.pattern.test(errorString));
        
        if (matchedPattern) {
          // Suppress MetaMask/crypto wallet errors completely
          if (matchedPattern.source.includes('MetaMask') || matchedPattern.source.includes('Crypto-Wallet')) {
            return; // Completely suppress these errors
          }
          
          // For other extension errors, log once
          const errorKey = matchedPattern.source + ':' + errorString.substring(0, 50);
          if (!this.detectedErrors[errorKey]) {
            this.detectedErrors[errorKey] = {
              count: 0,
              firstSeen: Date.now()
            };
            
            // Only log the first occurrence
            originalConsoleError.call(console, 
              `[Suppressed Extension Error] ${matchedPattern.source}: Browser extension conflict detected and suppressed.`);
          }
          
          this.detectedErrors[errorKey].count++;
          
          // Clear old entries periodically
          if (Date.now() - this.detectedErrors[errorKey].firstSeen > 60000) {
            delete this.detectedErrors[errorKey];
          }
          
          return;
        }
        
        // Pass through other errors
        originalConsoleError.apply(console, args);
      };

      // Also suppress console.warn for extension-related warnings
      console.warn = (...args) => {
        const warnString = args.join(' ');
        const matchedPattern = this.knownErrorPatterns.find(p => p.pattern.test(warnString));
        
        if (matchedPattern && matchedPattern.source.includes('MetaMask')) {
          return; // Suppress MetaMask warnings
        }
        
        originalConsoleWarn.apply(console, args);
      };
      
      // Monitor unhandled promise rejections that might be caused by extensions
      window.addEventListener('unhandledrejection', event => {
        const errorString = String(event.reason);
        const matchedPattern = this.knownErrorPatterns.find(p => p.pattern.test(errorString));
        
        if (matchedPattern) {
          console.info(`[Suppressed Extension Promise Error] ${matchedPattern.source}: Extension-related promise rejection suppressed.`);
          event.preventDefault();
          event.stopPropagation();
        }
      });

      // Add global error handler for script errors
      window.addEventListener('error', event => {
        if (event.filename && (event.filename.includes('inpage.js') || event.filename.includes('contentscript.js'))) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });
    },
    
    /**
     * Utility to check if script error is from an extension
     */
    isExtensionError: function(errorMsg) {
      if (!errorMsg) return false;
      return this.knownErrorPatterns.some(p => p.pattern.test(errorMsg));
    },
    
    /**
     * Get statistics on suppressed errors
     */
    getStatistics: function() {
      return {
        patterns: this.knownErrorPatterns.length,
        suppressedErrors: Object.keys(this.detectedErrors).reduce((total, key) => {
          return total + this.detectedErrors[key].count;
        }, 0),
        detailsBySource: Object.keys(this.detectedErrors).reduce((result, key) => {
          const [source] = key.split(':');
          if (!result[source]) result[source] = 0;
          result[source] += this.detectedErrors[key].count;
          return result;
        }, {})
      };
    }
  };
  
  // Auto-initialize on script load
  window.ExtensionConflictManager.initialize();
})();
