/**
 * Mobile Menu Component
 * Handles mobile navigation menu functionality
 */
class MobileMenu {
  constructor() {
    this.isOpen = false;
    this.menuElement = null;
    this.overlayElement = null;
  }

  /**
   * Initialize mobile menu component
   */
  init() {
    try {
      Performance.mark('mobile-menu-init');
      this.render();
      this.setupEventListeners();
      Performance.measure('mobile-menu-init');
      console.log('✅ Mobile menu component initialized');
    } catch (error) {
      console.error('❌ Failed to initialize mobile menu:', error);
    }
  }

  /**
   * Render mobile menu HTML
   */
  render() {
    // Check if mobile menu already exists
    let existingMenu = document.getElementById('mobileMenu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const user = Storage.get('user');
    const userDisplay = user ? user.name || user.email : 'User';

    const mobileMenuHTML = `
      <!-- Mobile Menu Overlay -->
      <div id="mobileMenuOverlay" class="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:hidden"></div>

      <!-- Mobile Menu -->
      <div id="mobileMenu" class="mobile-menu fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 transform -translate-x-full transition-transform duration-300 ease-in-out md:hidden">
        <!-- Menu Header -->
        <div class="p-4 border-b border-[#f0f2f5] bg-[#0066cc] text-white">            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="size-6">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" aria-hidden="true">
                    <path d="M24 4L6 16V32L24 44L42 32V16L24 4Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Varoinmarwah</h2>
              </div>
              <button class="mobile-menu-close p-1 rounded-lg hover:bg-white/20" aria-label="Close mobile menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
        </div>

        <!-- User Info Section -->
        <div class="p-4 border-b border-[#f0f2f5] bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#0066cc] rounded-full flex items-center justify-center text-white text-sm font-bold">
              ${userDisplay.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="text-[#111518] font-medium">${userDisplay}</div>
              <div class="text-[#6a7681] text-sm">Admin User</div>
            </div>
          </div>
        </div>        <!-- Navigation Menu -->
        <nav class="flex-1 py-4 overflow-y-auto" aria-label="Mobile navigation">
          <div class="space-y-1 px-3" role="menu"><a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="dashboard" role="menuitem" aria-label="Go to Dashboard">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              </svg>
              <span class="text-[#121416]">Dashboard</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            
            <a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="orders">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-[#111518]">Orders</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            
            <a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="createOrder">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span class="text-[#111518]">Create Order</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
              <a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="customers">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span class="text-[#111518]">Customers</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            
            <a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="files">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-[#111518]">Files</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            
            <a href="#" class="mobile-nav-item flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#f0f2f5] border-b border-gray-100" data-page="settings">
              <svg class="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-[#111518]">Settings</span>
              <svg class="w-4 h-4 ml-auto text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </nav>

        <!-- Menu Footer -->
        <div class="border-t border-[#f0f2f5] p-4 bg-gray-50">
          <div class="space-y-2">            <button class="mobile-profile-btn flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200" aria-label="View profile">
              <svg class="w-5 h-5 text-[#6a7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-[#121416]">Profile</span>
            </button>
            
            <button class="mobile-logout-btn flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 text-red-600" aria-label="Log out of application">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);

    // Get references
    this.menuElement = document.getElementById('mobileMenu');
    this.overlayElement = document.getElementById('mobileMenuOverlay');
  }

  /**
   * Setup event listeners for mobile menu
   */
  setupEventListeners() {
    if (!this.menuElement || !this.overlayElement) return;

    // Close button
    const closeBtn = this.menuElement.querySelector('.mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Overlay click to close
    this.overlayElement.addEventListener('click', () => {
      this.close();
    });

    // Navigation items
    this.menuElement.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        this.navigateToPage(page);
      });
    });

    // Profile button
    const profileBtn = this.menuElement.querySelector('.mobile-profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.navigateToPage('profile');
      });
    }

    // Logout button
    const logoutBtn = this.menuElement.querySelector('.mobile-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Listen for toggle events
    document.addEventListener('toggleMobileMenu', () => {
      this.toggle();
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      // Close mobile menu if window becomes desktop size
      if (window.innerWidth >= 768 && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Open mobile menu
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    
    // Show overlay
    this.overlayElement.classList.remove('hidden');
    
    // Slide in menu
    setTimeout(() => {
      this.menuElement.classList.remove('-translate-x-full');
      this.menuElement.classList.add('translate-x-0');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Update active item
    this.updateActiveItem();
    
    console.log('📱 Mobile menu opened');
  }

  /**
   * Close mobile menu
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    
    // Slide out menu
    this.menuElement.classList.remove('translate-x-0');
    this.menuElement.classList.add('-translate-x-full');
    
    // Hide overlay after animation
    setTimeout(() => {
      this.overlayElement.classList.add('hidden');
    }, 300);

    // Restore body scroll
    document.body.style.overflow = '';
    
    console.log('📱 Mobile menu closed');
  }

  /**
   * Toggle mobile menu
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Navigate to a page and close menu
   * @param {string} page - Page to navigate to
   */
  navigateToPage(page) {
    this.close();
    
    // Emit navigation event
    const navigationEvent = new CustomEvent('navigation', {
      detail: { page }
    });
    document.dispatchEvent(navigationEvent);
  }

  /**
   * Update active menu item
   */
  updateActiveItem() {
    if (!this.menuElement) return;

    const currentPage = window.currentPage || 'dashboard';
    
    // Remove active styling from all items
    this.menuElement.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.remove('bg-[#0066cc]', 'text-white');
      item.classList.add('text-[#111518]');
      
      const icon = item.querySelector('svg');
      const arrow = item.querySelector('.ml-auto');
      if (icon) icon.classList.remove('text-white');
      if (arrow) arrow.classList.remove('text-white');
    });

    // Add active styling to current page item
    const activeItem = this.menuElement.querySelector(`[data-page="${currentPage}"]`);
    if (activeItem) {
      activeItem.classList.add('bg-[#0066cc]', 'text-white');
      activeItem.classList.remove('text-[#111518]');
      
      const icon = activeItem.querySelector('svg');
      const arrow = activeItem.querySelector('.ml-auto');
      if (icon) {
        icon.classList.remove('text-[#0066cc]');
        icon.classList.add('text-white');
      }
      if (arrow) arrow.classList.add('text-white');
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.close();
    
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
    if (!this.menuElement || !user) return;

    const userDisplay = user.name || user.email || 'User';
    const userInitial = userDisplay.charAt(0).toUpperCase();

    // Update user name
    const userNameElement = this.menuElement.querySelector('.text-\\[\\#111518\\].font-medium');
    if (userNameElement) {
      userNameElement.textContent = userDisplay;
    }

    // Update user avatar
    const userAvatarElement = this.menuElement.querySelector('.w-10.h-10.bg-\\[\\#0066cc\\]');
    if (userAvatarElement) {
      userAvatarElement.textContent = userInitial;
    }
  }

  /**
   * Set current page for active state
   * @param {string} page - Current page
   */
  setCurrentPage(page) {
    window.currentPage = page;
    this.updateActiveItem();
  }

  /**
   * Destroy mobile menu component
   */
  destroy() {
    if (this.menuElement) {
      this.menuElement.remove();
    }
    if (this.overlayElement) {
      this.overlayElement.remove();
    }
    
    // Restore body scroll if needed
    if (this.isOpen) {
      document.body.style.overflow = '';
    }
    
    this.isOpen = false;
    this.menuElement = null;
    this.overlayElement = null;
  }
}
