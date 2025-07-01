/**
 * Main Application Controller
 * Handles routing, state management, and component initialization
 */
class App {
  constructor() {
    this.currentPage = 'dashboard';
    this.isAuthenticated = false;
    this.user = null;
    this.cloudStorage = null;
    this.app_version: 'v3''';
    this.pages = {
      dashboard: 'pages/dashboard.html',
      orders: 'pages/orders.html',
      createOrder: 'pages/create-order.html',
      customers: 'pages/customers.html',
      files: 'pages/files-dashboard.html',
      settings: 'pages/settings.html'
    };
  }

  /**
   * Initialize the application
   */
  static init() {
    const app = new App();
    window.app = app; // Make app globally accessible
    app.start();
  }
  /**
   * Start the application
   */  async start() {
    try {
      console.log('🚀 Starting Varoinmarwah Admin Dashboard...');
      
      // Initialize performance monitoring
      this.initPerformanceMonitoring();
      
      // Initialize cloud storage
      await this.initCloudStorage();
      
      // Check authentication status
      this.checkAuthStatus();
      
      // Setup DOM structure
      this.setupDomStructure();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize components
      await this.initComponents();
      
      // Load initial page based on authentication status
      await this.loadInitialPage();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showError('Failed to load application. Please refresh the page.');
    }
  }

  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    const perfStart = performance.now();
    
    // Enhanced cache clearing
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('gdrive-dashboard') && !name.includes('v10')) {
            caches.delete(name);
            console.log('🗑️ Deleted old cache:', name);
          }
        });
      });
    }
      // Clear old localStorage entries
    if (localStorage.getItem('app_version') !== 'v11') {
      console.log('🔄 Upgrading localStorage to v11');
      localStorage.setItem('app_version', 'v11');
    }
    
    // Log performance when page loads
    window.addEventListener('load', () => {
      const loadTime = performance.now() - perfStart;
      console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
    });
  }

  /**
   * Initialize cloud storage
   */
  async initCloudStorage() {
    try {
      if (typeof GoogleDriveStorageManager !== 'undefined') {
        this.cloudStorage = new GoogleDriveStorageManager();
        console.log('☁️ Google Drive Storage initialized');
        return true;
      }
      console.warn('⚠️ Google Drive Storage not available');
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Storage:', error);
      return false;
    }
  }

  /**
   * Check authentication status
   */
  checkAuthStatus() {
    // Check if user is already authenticated
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
        console.log('👤 User authenticated:', this.user.name);
      } catch (error) {
        console.error('❌ Invalid stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }
  /**
   * Initialize components
   */
  async initComponents() {
    // Only initialize navigation and mobile menu if user is authenticated
    if (this.isAuthenticated) {
      // Initialize navigation
      if (typeof Navigation !== 'undefined') {
        this.navigation = new Navigation();
        await this.navigation.init();
      }
      
      // Initialize mobile menu
      if (typeof MobileMenu !== 'undefined') {
        this.mobileMenu = new MobileMenu();
        this.mobileMenu.init();
      }
    }
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      const page = event.state?.page || 'dashboard';
      this.navigateTo(page, false);
    });
    
    // Handle authentication events
    window.addEventListener('auth:login', (event) => {
      this.handleLogin(event.detail);
    });
    
    window.addEventListener('auth:logout', () => {
      this.handleLogout();
    });
    
    // Handle page navigation events
    window.addEventListener('page:navigate', (event) => {
      this.navigateTo(event.detail.page);
    });
  }

  /**
   * Load initial page
   */
  async loadInitialPage() {
    if (!this.isAuthenticated) {
      await this.showLoginPage();
    } else {
      // Get page from URL hash or default to dashboard
      const hash = window.location.hash.slice(1);
      const page = this.pages[hash] ? hash : 'dashboard';
      await this.navigateTo(page, false);
    }
  }  /**
   * Show login page
   */
  async showLoginPage() {
    try {
      const response = await fetch('auth/login.html');
      const html = await response.text();
      document.getElementById('mainContent').innerHTML = html;
      
      // Initialize login functionality
      this.initLoginForm();
      
      // Hide navigation
      const navElement = document.getElementById('navigation');
      if (navElement) {
        navElement.style.display = 'none';
      }
    } catch (error) {
      console.error('❌ Failed to load login page:', error);
      this.showError('Failed to load login page');
    }
  }

  /**
   * Initialize login form
   */
  initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLoginSubmit(e);
      });
    }
    
    // Initialize Google Sign-In if available
    if (typeof google !== 'undefined' && google.accounts) {
      this.initGoogleSignIn();
    }
  }

  /**
   * Initialize Google Sign-In
   */
  initGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: 'your-google-client-id', // Replace with actual client ID
      callback: this.handleGoogleSignIn.bind(this)
    });
    
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large' }
    );
  }

  /**
   * Handle Google Sign-In
   */
  handleGoogleSignIn(response) {
    try {
      const userData = JSON.parse(atob(response.credential.split('.')[1]));
      const user = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      };
      this.handleLogin(user);
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      this.showError('Google Sign-In failed');
    }
  }

  /**
   * Handle login form submission
   */
  async handleLoginSubmit(event) {
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simple demo authentication - replace with real authentication
    if (email && password) {
      const user = {
        id: 'demo-user',
        name: 'Demo User',
        email: email
      };
      this.handleLogin(user);
    } else {
      this.showError('Please enter email and password');
    }
  }  /**
   * Handle successful login
   */
  async handleLogin(user) {
    this.user = user;
    this.isAuthenticated = true;
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Show navigation
    const navElement = document.getElementById('navigation');
    if (navElement) {
      navElement.style.display = 'block';
    }
    
    // Navigate to dashboard
    await this.navigateTo('dashboard', false);
    
    console.log('✅ User logged in:', user.name);
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.user = null;
    this.isAuthenticated = false;
    
    // Clear stored data
    localStorage.removeItem('user');
    
    // Show login page
    this.showLoginPage();
    
    console.log('👋 User logged out');
  }

  /**
   * Navigate to a page
   */
  async navigateTo(page, updateHistory = true) {
    if (!this.pages[page]) {
      console.error('❌ Unknown page:', page);
      return;
    }
    
    try {
      // Update current page
      this.currentPage = page;
      
      // Update browser history
      if (updateHistory) {
        history.pushState({ page }, '', `#${page}`);
      }
      
      // Load page content
      await this.loadPage(page);
      
      // Update navigation
      if (this.navigation) {
        this.navigation.setActivePage(page);
      }
      
      // Close mobile menu if open
      if (this.mobileMenu) {
        this.mobileMenu.close();
      }
      
      console.log('📄 Navigated to:', page);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      this.showError('Failed to load page');
    }
  }  /**
   * Load page content
   */
  async loadPage(page) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    try {
      const response = await fetch(this.pages[page]);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      mainContent.innerHTML = html;
      
      // Initialize page-specific functionality
      await this.initPageFunctionality(page);
    } catch (error) {
      console.error(`❌ Failed to load page ${page}:`, error);
      mainContent.innerHTML = `
        <div class="text-center p-8">
          <h2 class="text-2xl font-bold mb-4">Page Not Found</h2>
          <p class="text-gray-600 mb-4">The requested page could not be loaded.</p>
          <button onclick="app.navigateTo('dashboard')" class="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      `;
    }
  }
  /**
   * Initialize page-specific functionality
   */
  async initPageFunctionality(page) {
    // Clean up previous controller if it exists
    this.cleanupCurrentController();
    
    // Load the controller script for the current page
    try {
      // First try to see if the controller is already loaded
      const controllerExists = window[`${page}Controller`] || 
                            (page === 'createOrder' && window.createOrderController);
      
      if (!controllerExists) {
        // If not loaded, dynamically load the controller script
        const controllerScript = document.createElement('script');
        const controllerName = page === 'createOrder' ? 'create-order' : page.toLowerCase();
        controllerScript.src = `js/pages/${controllerName}.js`;
        
        // Wait for the script to load before continuing
        await new Promise((resolve, reject) => {
          controllerScript.onload = resolve;
          controllerScript.onerror = () => reject(new Error(`Failed to load ${page} controller`));
          document.body.appendChild(controllerScript);
        });
      }
      
      // Initialize the controller once loaded
      switch (page) {
        case 'dashboard':
          if (window.dashboardController) {
            this.currentController = window.dashboardController;
            // If the controller has a refresh method, call it
            if (typeof this.currentController.refresh === 'function') {
              this.currentController.refresh();
            }
          }
          break;
        case 'orders':
          if (window.ordersController) {
            this.currentController = window.ordersController;
            if (typeof this.currentController.refresh === 'function') {
              this.currentController.refresh();
            }
          }
          break;
        case 'createOrder':
          if (window.createOrderController) {
            this.currentController = window.createOrderController;
            if (typeof this.currentController.refresh === 'function') {
              this.currentController.refresh();
            }
          }
          break;
        case 'customers':
          if (window.customersController) {
            this.currentController = window.customersController;
            if (typeof this.currentController.refresh === 'function') {
              this.currentController.refresh();
            }
          }
          break;
        case 'settings':
          if (window.settingsController) {
            this.currentController = window.settingsController;
            if (typeof this.currentController.refresh === 'function') {
              this.currentController.refresh();
            }
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to initialize ${page} controller:`, error);
    }
  }
  
  /**
   * Clean up the current controller before switching pages
   */
  cleanupCurrentController() {
    if (this.currentController && typeof this.currentController.destroy === 'function') {
      try {
        this.currentController.destroy();
      } catch (error) {
        console.error('Error cleaning up controller:', error);
      }
    }
    this.currentController = null;
  }

  /**
   * Show error message
   */
  showError(message) {
    // Simple error display - could be enhanced with a toast system
    alert(message);
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }
  /**
   * Get cloud storage instance
   */
  getCloudStorage() {
    return this.cloudStorage;
  }
  
  /**
   * Convenience method for navigation
   */
  navigate(page) {
    this.navigateTo(page);
  }

  /**
   * Setup DOM structure for content
   */
  setupDomStructure() {
    // Check if main content container exists
    let mainContent = document.getElementById('mainContent');
    if (!mainContent) {
      // Create main content container if it doesn't exist
      mainContent = document.createElement('div');
      mainContent.id = 'mainContent';
      mainContent.className = 'flex-1';
      
      // Find the app container and append main content
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.appendChild(mainContent);
      }
      console.log('📑 Created main content container');
    }
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
      console.log('➡️ Removed loading screen');
    }
  }
}

// Export for use in other modules
window.App = App;

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
