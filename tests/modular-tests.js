// Modular Components Test Suite
// Tests for the modular dashboard components, navigation, and page loading

// Mock the fetch API for testing page loading
function setupFetchMock() {
  window.originalFetch = window.fetch;
  window.fetch = function(url) {
    // Return mock HTML for page requests
    if (url.includes('/pages/')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`<div id="mockPage">${url}</div>`)
      });
    }
    
    // Fall back to original fetch for other requests
    return window.originalFetch(url);
  };
}

// Restore original fetch when done
function restoreFetch() {
  if (window.originalFetch) {
    window.fetch = window.originalFetch;
    window.originalFetch = undefined;
  }
}

// Create container for mounting components
function setupTestContainer() {
  const container = document.createElement('div');
  container.id = 'testContainer';
  document.body.appendChild(container);
  return container;
}

// Clean up test container
function cleanupTestContainer() {
  const container = document.getElementById('testContainer');
  if (container) {
    container.remove();
  }
}

// Module for App class tests
QUnit.module('App Module Tests', {
  beforeEach: function() {
    setupFetchMock();
    this.container = setupTestContainer();
    
    // Create required DOM elements
    const mainContent = document.createElement('div');
    mainContent.id = 'mainContent';
    this.container.appendChild(mainContent);
    
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.style.opacity = '1';
    loadingScreen.style.display = 'block';
    this.container.appendChild(loadingScreen);
    
    const navigation = document.createElement('div');
    navigation.id = 'navigation';
    this.container.appendChild(navigation);
    
    // Initialize app
    this.app = new App();
    window.app = this.app;
  },
  afterEach: function() {
    restoreFetch();
    cleanupTestContainer();
    window.app = undefined;
  }
});

QUnit.test('App initialization', function(assert) {
  assert.ok(this.app instanceof App, 'App should be instantiated');
  assert.equal(this.app.currentPage, 'dashboard', 'Default page should be dashboard');
  assert.notOk(this.app.isAuthenticated, 'User should not be authenticated by default');
});

QUnit.test('Navigation between pages', async function(assert) {
  const done = assert.async();
  
  // Mock the cloud storage and authentication
  this.app.cloudStorage = {};
  this.app.isAuthenticated = true;
  this.app.user = { name: 'Test User' };
  
  // Navigate to orders page
  await this.app.navigateTo('orders', true);
  
  // Check that navigation happened
  assert.equal(this.app.currentPage, 'orders', 'Current page should be updated');
  assert.ok(
    document.getElementById('mainContent').innerHTML.includes('/pages/orders.html'),
    'Orders page content should be loaded'
  );
  
  // Test navigation to another page
  await this.app.navigateTo('customers', true);
  assert.equal(this.app.currentPage, 'customers', 'Should navigate to customers page');
  
  done();
});

QUnit.test('Login handling', function(assert) {
  // Test user login
  const testUser = { id: 'test-id', name: 'Test User', email: 'test@example.com' };
  this.app.handleLogin(testUser);
  
  assert.ok(this.app.isAuthenticated, 'User should be authenticated after login');
  assert.equal(this.app.user.name, 'Test User', 'User name should be set correctly');
  
  // Test logout
  this.app.handleLogout();
  assert.notOk(this.app.isAuthenticated, 'User should not be authenticated after logout');
  assert.equal(this.app.user, null, 'User should be null after logout');
});

// Module for Component tests
QUnit.module('Component Tests', {
  beforeEach: function() {
    this.container = setupTestContainer();
  },
  afterEach: function() {
    cleanupTestContainer();
  }
});

QUnit.test('Navigation component initialization', function(assert) {
  // Skip if Navigation class not available in this context
  if (typeof Navigation === 'undefined') {
    assert.ok(true, 'Navigation class not available, skipping test');
    return;
  }
  
  // Setup navigation element
  const navElement = document.createElement('nav');
  navElement.id = 'navigation';
  this.container.appendChild(navElement);
  
  // Create navigation component
  const navigation = new Navigation();
  
  assert.ok(navigation, 'Navigation component should be created');
});

QUnit.test('Mobile menu component', function(assert) {
  // Skip if MobileMenu class not available in this context
  if (typeof MobileMenu === 'undefined') {
    assert.ok(true, 'MobileMenu class not available, skipping test');
    return;
  }
  
  // Setup mobile menu elements
  const menuButton = document.createElement('button');
  menuButton.id = 'mobileMenuButton';
  this.container.appendChild(menuButton);
  
  const menuPanel = document.createElement('div');
  menuPanel.id = 'mobileMenuPanel';
  menuPanel.style.display = 'none';
  this.container.appendChild(menuPanel);
  
  // Create mobile menu component
  const mobileMenu = new MobileMenu();
  mobileMenu.init();
  
  assert.ok(mobileMenu, 'Mobile menu component should be created');
  
  // Test open/close functionality if possible
  if (typeof mobileMenu.open === 'function') {
    mobileMenu.open();
    assert.equal(menuPanel.style.display, 'block', 'Menu should be displayed when opened');
    
    mobileMenu.close();
    assert.equal(menuPanel.style.display, 'none', 'Menu should be hidden when closed');
  }
});

// Module for Page Controller tests
QUnit.module('Page Controller Tests', {
  beforeEach: function() {
    setupFetchMock();
    this.container = setupTestContainer();
    
    // Create main content element
    const mainContent = document.createElement('div');
    mainContent.id = 'mainContent';
    this.container.appendChild(mainContent);
    
    // Initialize app
    this.app = new App();
    window.app = this.app;
  },
  afterEach: function() {
    restoreFetch();
    cleanupTestContainer();
    window.app = undefined;
    
    // Clean up any controllers that might have been loaded
    ['dashboardController', 'ordersController', 'createOrderController', 
     'customersController', 'settingsController'].forEach(controller => {
      window[controller] = undefined;
    });
  }
});

QUnit.test('Page controller initialization', async function(assert) {
  const done = assert.async();
  
  // Create a mock dashboard controller
  window.dashboardController = {
    refresh: function() {
      assert.step('controller.refresh called');
    },
    destroy: function() {
      assert.step('controller.destroy called');
    }
  };
  
  // Init the dashboard page
  await this.app.initPageFunctionality('dashboard');
  
  // Check if controller was used
  assert.equal(this.app.currentController, window.dashboardController, 'Current controller should be set');
  assert.verifySteps(['controller.refresh called'], 'Refresh should be called on initialization');
  
  // Create a mock orders controller for switching test
  window.ordersController = {
    refresh: function() {
      assert.step('ordersController.refresh called');
    },
    destroy: function() {
      assert.step('ordersController.destroy called');
    }
  };
  
  // Switch to orders page
  await this.app.initPageFunctionality('orders');
  
  // Check controller cleanup and initialization
  assert.equal(this.app.currentController, window.ordersController, 'Controller should be switched');
  assert.verifySteps(
    ['controller.refresh called', 'controller.destroy called', 'ordersController.refresh called'],
    'Controllers should be cleaned up when switching pages'
  );
  
  done();
});

// Export test utilities for use in other test files
window.testUtils = {
  setupFetchMock,
  restoreFetch,
  setupTestContainer,
  cleanupTestContainer
};
