/**
 * 📱 MOBILE NAVIGATION ENHANCEMENTS
 * Advanced mobile navigation for Fashion Admin Dashboard
 * Based on project history and mobile optimization requirements
 */

// Mobile Navigation Controller
class MobileNavigation {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.overlay = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMobileElements();
        this.attachEventListeners();
        this.setupSwipeGestures();
        console.log('📱 Mobile navigation initialized');
    }

    createMobileElements() {
        // Create mobile menu button if it doesn't exist
        if (!document.querySelector('.mobile-menu-button')) {
            const menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-button';
            menuButton.innerHTML = `
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            `;
            
            // Add to header if it exists, otherwise create a mobile header
            const header = document.querySelector('.header') || document.querySelector('header');
            if (header) {
                header.prepend(menuButton);
            } else {
                const mobileHeader = document.createElement('div');
                mobileHeader.className = 'mobile-header header';
                mobileHeader.appendChild(menuButton);
                document.body.prepend(mobileHeader);
            }
        }

        // Create overlay for mobile navigation
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-nav-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
        `;
        document.body.appendChild(this.overlay);
    }

    attachEventListeners() {
        // Mobile menu button click
        const menuButton = document.querySelector('.mobile-menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Overlay click to close
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // Navigation item clicks
        if (this.sidebar) {
            const navItems = this.sidebar.querySelectorAll('a, .sidebar-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    // Close mobile menu when navigation item is clicked
                    if (window.innerWidth <= 767) {
                        this.close();
                    }
                });
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth > 767 && this.isOpen) {
                this.close();
            }
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Touch start
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            
            // Allow swipe from left edge to open menu
            if (startX < 20 && !this.isOpen) {
                isDragging = true;
            }
            
            // Allow swipe on sidebar to close
            if (this.isOpen && this.sidebar && this.sidebar.contains(e.target)) {
                isDragging = true;
            }
        }, { passive: true });

        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Prevent page scroll during navigation gesture
            if (Math.abs(deltaX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end
        document.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            
            // Swipe right from left edge to open (deltaX > 50)
            if (deltaX > 50 && !this.isOpen && startX < 20) {
                this.open();
            }
            
            // Swipe left to close (deltaX < -50)
            if (deltaX < -50 && this.isOpen) {
                this.close();
            }
            
            isDragging = false;
            startX = 0;
            currentX = 0;
        }, { passive: true });
    }

    open() {
        if (!this.sidebar) return;
        
        this.isOpen = true;
        this.sidebar.classList.add('mobile-open');
        this.overlay.style.opacity = '1';
        this.overlay.style.visibility = 'visible';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Update menu button icon
        this.updateMenuIcon();
        
        console.log('📱 Mobile navigation opened');
    }

    close() {
        if (!this.sidebar) return;
        
        this.isOpen = false;
        this.sidebar.classList.remove('mobile-open');
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Update menu button icon
        this.updateMenuIcon();
        
        console.log('📱 Mobile navigation closed');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateMenuIcon() {
        const menuButton = document.querySelector('.mobile-menu-button');
        if (!menuButton) return;
        
        if (this.isOpen) {
            menuButton.innerHTML = `
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
        } else {
            menuButton.innerHTML = `
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            `;
        }
    }
}

// Touch Optimization Utilities
class TouchOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeScrolling();
        this.preventZoom();
        this.enhanceTouch();
        console.log('📱 Touch optimizations applied');
    }

    optimizeScrolling() {
        // Add smooth scrolling to scrollable elements
        const scrollables = document.querySelectorAll('.table-container, .modal-content, .sidebar');
        scrollables.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.scrollBehavior = 'smooth';
        });
    }

    preventZoom() {
        // Prevent zoom on double tap for better UX
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    enhanceTouch() {
        // Add visual feedback for touch interactions
        const touchElements = document.querySelectorAll('.btn, .nav-item, .card, .sidebar-item');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.transition = 'transform 0.1s ease';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = '';
                }, 100);
            }, { passive: true });
        });
    }
}

// Performance Monitor for Mobile
class MobilePerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.measureRenderTime();
        this.measureInteractionTime();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`📱 Page load time: ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    }

    measureRenderTime() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    this.metrics.renderTime = entry.duration;
                    console.log(`📱 Render time: ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        observer.observe({ entryTypes: ['measure'] });
    }

    measureInteractionTime() {
        const startTime = performance.now();
        document.addEventListener('click', () => {
            const interactionTime = performance.now() - startTime;
            console.log(`📱 First interaction: ${interactionTime.toFixed(2)}ms`);
        }, { once: true });
    }

    getMetrics() {
        return this.metrics;
    }
}

// Initialize mobile enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile navigation
    window.mobileNav = new MobileNavigation();
    
    // Initialize touch optimizations
    window.touchOptimizer = new TouchOptimizer();
    
    // Initialize performance monitoring
    window.perfMonitor = new MobilePerformanceMonitor();
    
    console.log('📱 Mobile enhancements fully loaded!');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileNavigation,
        TouchOptimizer,
        MobilePerformanceMonitor
    };
}
