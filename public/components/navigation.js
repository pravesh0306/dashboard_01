/**
 * Navigation Component
 * Handles main navigation functionality and             <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="customers">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
              </svg>
              Customers
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="files">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,44l36,36H152ZM200,216H56V40h80V88a8,8,0,0,0,8,8h56V216Z"></path>
              </svg>
              Files
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="settings">"erface
 */
class Navigation {
  constructor() {
    this.currentPage = 'dashboard';
    this.navigationElement = null;
    this.userMenuOpen = false;
  }

  /**
   * Initialize navigation component
   */
  async init() {
    try {
      Performance.mark('navigation-init');
      await this.render();
      this.setupEventListeners();
      this.updateActiveNavItem();
      Performance.measure('navigation-init');
      console.log('✅ Navigation component initialized');
    } catch (error) {
      console.error('❌ Failed to initialize navigation:', error);
    }
  }

  /**
   * Render navigation HTML
   */
  async render() {
    const navigationContainer = document.getElementById('navigation');
    if (!navigationContainer) {
      throw new Error('Navigation container not found');
    }

    const user = Storage.get('user');
    const userDisplay = user ? user.name || user.email : 'User';

    navigationContainer.innerHTML = `      <!-- Desktop Navigation -->
      <div class="hidden md:flex flex-col w-64 bg-white shadow-sm border-r border-[#f1f2f4] fixed left-0 top-0 bottom-0 z-30">
        <!-- Logo Section -->
        <div class="p-4 border-b border-[#f1f2f4]">
          <div class="flex items-center gap-4">
            <div class="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 class="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">Orderly</h2>
          </div>
        </div>        <!-- Navigation Menu -->
        <nav class="flex-1 py-4">
          <div class="space-y-1 px-3">
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM80,84A12,12,0,0,1,92,72h72a12,12,0,0,1,0,24H92A12,12,0,0,1,80,84Zm0,44a12,12,0,0,1,12-12h72a12,12,0,0,1,0,24H92A12,12,0,0,1,80,128Zm0,44a12,12,0,0,1,12-12h72a12,12,0,0,1,0,24H92A12,12,0,0,1,80,172Z"></path>
              </svg>
              Dashboard
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="orders">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
              </svg>
              Orders
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="createOrder">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
              Create Order
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="customers">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
              </svg>
              Customers
            </a>
            
            <a href="#" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]" data-page="settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-3.39a103.15,103.15,0,0,0-9.48-9.48L179,33.35a8,8,0,0,0-3.93-6,107.21,107.21,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L123.16,33h-6.32L98.2,17.94a8,8,0,0,0-7.06-1.49A107.21,107.21,0,0,0,64.89,27.32a8,8,0,0,0-3.93,6L57.57,57.08a103.15,103.15,0,0,0-9.48,9.48L24.37,69.94a8,8,0,0,0-6,3.93,107.21,107.21,0,0,0-10.88,26.25,8,8,0,0,0,1.48,7.06L24,125.84c0,.72,0,1.44,0,2.16s0,1.44,0,2.16L9,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,3.38a103.15,103.15,0,0,0,9.48,9.48L61,222.65a8,8,0,0,0,3.93,6,107.21,107.21,0,0,0,26.25,10.88,8,8,0,0,0,7.06-1.49L116.84,223h6.32l18.64,14.92a8,8,0,0,0,7.06,1.49,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l3.39-23.72a103.15,103.15,0,0,0,9.48-9.48l23.72-3.38a8,8,0,0,0,6-3.93,107.21,107.21,0,0,0,10.88-26.25,8,8,0,0,0-1.48-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,174.58a8,8,0,0,0-5.1,2.64,86.95,86.95,0,0,1-17,17,8,8,0,0,0-2.64,5.1l-3.19,22.24a91.62,91.62,0,0,1-15,6.23L126.16,213.6a8,8,0,0,0-5.48-1.74,73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L88.79,227.8a91.62,91.62,0,0,1-15-6.23l-3.19-22.24a8,8,0,0,0-2.64-5.1,86.95,86.95,0,0,1-17-17,8,8,0,0,0-5.1-2.64l-22.24-3.19a91.57,91.57,0,0,1-6.23-15l14.19-17.73a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L32.2,83.88a91.57,91.57,0,0,1,6.23-15L60.67,65.7a8,8,0,0,0,5.1-2.64,86.95,86.95,0,0,1,17-17,8,8,0,0,0,2.64-5.1l3.19-22.24a91.62,91.62,0,0,1,15-6.23l17.73,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L158.21,12.2a91.62,91.62,0,0,1,15,6.23l3.19,22.24a8,8,0,0,0,2.64,5.1,86.95,86.95,0,0,1,17,17,8,8,0,0,0,5.1,2.64l22.24,3.19a91.57,91.57,0,0,1,6.23,15L215.44,101a8,8,0,0,0-1.74,5.48Z"></path>
              </svg>
              Settings
            </a>
          </div>
        </nav>        <!-- User Profile Section -->
        <div class="border-t border-[#f1f2f4] p-4">
          <div class="relative">
            <button class="user-menu-toggle flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#f1f2f4]">
              <div class="w-8 h-8 bg-[#0066cc] rounded-full flex items-center justify-center text-white text-sm font-bold">
                ${userDisplay.charAt(0).toUpperCase()}
              </div>
              <div class="flex-1 text-left">
                <div class="text-[#121416] font-medium">${userDisplay}</div>
                <div class="text-[#6a7681] text-xs">Admin</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="text-[#6a7681] user-menu-arrow transition-transform">
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
            
            <!-- User Menu Dropdown -->
            <div class="user-menu absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#dbe0e6] rounded-lg shadow-lg hidden">
              <div class="py-2">
                <button class="profile-btn flex items-center gap-3 w-full px-4 py-2 text-sm text-[#111518] hover:bg-[#f0f2f5]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Profile
                </button>
                <hr class="my-1 border-[#f0f2f5]">
                <button class="logout-btn flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      <!-- Mobile Navigation Header -->
      <div class="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-[#f1f2f4] z-40">
        <div class="flex items-center justify-between px-4 py-3">
          <button class="mobile-menu-toggle p-2 rounded-lg hover:bg-[#f1f2f4]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          
          <div class="flex items-center gap-4">
            <div class="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 class="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">Orderly</h2>
          </div>
            <button class="mobile-user-menu-toggle p-2 rounded-lg hover:bg-[#f1f2f4]">
            <div class="w-6 h-6 bg-[#0066cc] rounded-full flex items-center justify-center text-white text-xs font-bold">
              ${userDisplay.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </div>

      <!-- Content Spacer for Mobile -->
      <div class="md:hidden h-16"></div>
    `;

    this.navigationElement = navigationContainer;
  }

  /**
   * Setup event listeners for navigation
   */
  setupEventListeners() {
    if (!this.navigationElement) return;

    // Desktop navigation items
    this.navigationElement.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        this.navigateToPage(page);
      });
    });

    // User menu toggle (desktop)
    const userMenuToggle = this.navigationElement.querySelector('.user-menu-toggle');
    const userMenu = this.navigationElement.querySelector('.user-menu');
    const userMenuArrow = this.navigationElement.querySelector('.user-menu-arrow');

    if (userMenuToggle && userMenu) {
      userMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleUserMenu();
      });

      // Close user menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userMenu.contains(e.target)) {
          this.closeUserMenu();
        }
      });
    }

    // Profile button
    const profileBtn = this.navigationElement.querySelector('.profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.navigateToPage('profile');
        this.closeUserMenu();
      });
    }

    // Logout button
    const logoutBtn = this.navigationElement.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Mobile menu toggle
    const mobileMenuToggle = this.navigationElement.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Mobile user menu toggle
    const mobileUserMenuToggle = this.navigationElement.querySelector('.mobile-user-menu-toggle');
    if (mobileUserMenuToggle) {
      mobileUserMenuToggle.addEventListener('click', () => {
        this.toggleMobileUserMenu();
      });
    }
  }

  /**
   * Navigate to a specific page
   * @param {string} page - Page to navigate to
   */
  navigateToPage(page) {
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updateActiveNavItem();
    
    // Emit custom event for app to handle navigation
    const navigationEvent = new CustomEvent('navigation', {
      detail: { page }
    });
    document.dispatchEvent(navigationEvent);
  }

  /**
   * Update active navigation item styling
   */
  updateActiveNavItem() {
    if (!this.navigationElement) return;

    // Remove active class from all nav items
    this.navigationElement.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('bg-[#0066cc]', 'text-white');
      item.classList.add('text-[#121416]');
    });

    // Add active class to current page nav item
    const activeNavItem = this.navigationElement.querySelector(`[data-page="${this.currentPage}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('bg-[#0066cc]', 'text-white');
      activeNavItem.classList.remove('text-[#121416]');
    }
  }

  /**
   * Toggle user menu dropdown
   */
  toggleUserMenu() {
    const userMenu = this.navigationElement.querySelector('.user-menu');
    const userMenuArrow = this.navigationElement.querySelector('.user-menu-arrow');
    
    if (userMenu && userMenuArrow) {
      this.userMenuOpen = !this.userMenuOpen;
      
      if (this.userMenuOpen) {
        userMenu.classList.remove('hidden');
        userMenuArrow.style.transform = 'rotate(180deg)';
      } else {
        userMenu.classList.add('hidden');
        userMenuArrow.style.transform = 'rotate(0deg)';
      }
    }
  }

  /**
   * Close user menu
   */
  closeUserMenu() {
    const userMenu = this.navigationElement.querySelector('.user-menu');
    const userMenuArrow = this.navigationElement.querySelector('.user-menu-arrow');
    
    if (userMenu && userMenuArrow) {
      this.userMenuOpen = false;
      userMenu.classList.add('hidden');
      userMenuArrow.style.transform = 'rotate(0deg)';
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const mobileMenuEvent = new CustomEvent('toggleMobileMenu');
    document.dispatchEvent(mobileMenuEvent);
  }

  /**
   * Toggle mobile user menu
   */
  toggleMobileUserMenu() {
    // Create a simple mobile user menu
    showToast('Mobile user menu - tap profile to access settings or logout', 'info');
  }

  /**
   * Handle user logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      // Clear user data
      Storage.remove('user');
      Storage.remove('google_drive_auth');
      Storage.remove('google_drive_auth_profile');
      
      // Emit logout event
      const logoutEvent = new CustomEvent('logout');
      document.dispatchEvent(logoutEvent);
      
      showToast('Logged out successfully', 'success');
    }
  }

  /**
   * Update user display information
   * @param {Object} user - User object
   */
  updateUser(user) {
    if (!this.navigationElement || !user) return;

    const userDisplay = user.name || user.email || 'User';
    const userInitial = userDisplay.charAt(0).toUpperCase();

    // Update desktop user display
    const desktopUserName = this.navigationElement.querySelector('.text-\\[\\#111518\\].font-medium');
    if (desktopUserName) {
      desktopUserName.textContent = userDisplay;
    }

    const desktopUserAvatar = this.navigationElement.querySelector('.w-8.h-8.bg-\\[\\#0066cc\\]');
    if (desktopUserAvatar) {
      desktopUserAvatar.textContent = userInitial;
    }

    // Update mobile user display
    const mobileUserAvatar = this.navigationElement.querySelector('.w-6.h-6.bg-\\[\\#0066cc\\]');
    if (mobileUserAvatar) {
      mobileUserAvatar.textContent = userInitial;
    }
  }

  /**
   * Set current page
   * @param {string} page - Current page
   */
  setCurrentPage(page) {
    this.currentPage = page;
    this.updateActiveNavItem();
  }

  /**
   * Show/hide navigation based on authentication
   * @param {boolean} isAuthenticated - Authentication status
   */
  setVisibility(isAuthenticated) {
    if (this.navigationElement) {
      this.navigationElement.style.display = isAuthenticated ? 'block' : 'none';
    }
  }
}
