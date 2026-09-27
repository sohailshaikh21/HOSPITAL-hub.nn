/**
 * HospitalityHub — Smart B2B Marketplace for Shared Hospitality Resources
 * Production-Ready Application Controller (MMR Scope)
 * 
 * Features:
 * - Strict MMR Location Enforcement & Radius Calculations
 * - Dual Seeker & Provider Roles with Verified Status Management
 * - Modern Luxury Visual Design System with Responsive Grid
 * - Explore, Spaces, Resources, Providers, How It Works, and Dual Dashboards
 * - 3–4 Photo Galleries with Interactive Thumbnail Dot Navigation
 * - Real-Time Calendar Lock & Date Collision Prevention System
 * - Instant Booking Cancellation & Automatic Date Reappearance
 * - Authenticated Reviews System (Gated to Completed Bookings)
 * - Provider Business Verification Dossier & 3–4 Photo Validation
 * - Complete Auth System (Sign In, Sign Up, Profile, Password Meter)
 * - Frontend-Only UPI QR Payment Reporting
 * - Resilient Offline / Mock Fallback + Backend REST API Sync
 */

(function() {
  'use strict';

  class HospitalityHubApp {
    constructor() {
      // 1. Theme, Localization & Active Navigation
      this.theme = localStorage.getItem('hospitalityhub_theme') || 'light';
      this.lang = localStorage.getItem('hospitalityhub_lang') || 'en';
      this.currentView = 'explore'; // 'explore' | 'spaces' | 'resources' | 'providers' | 'how-it-works' | 'seeker-dashboard' | 'provider-dashboard'
      this.activeTab = 'all';

      // 2. Filter & Search State
      this.selectedCategory = 'all';
      this.searchQuery = '';
      this.searchLocation = 'All Locations (MMR)';
      this.searchStartDate = '';
      this.searchEndDate = '';
      this.searchQuantity = 1;
      this.searchBookingType = 'All'; // 'All' | 'Planned' | 'Emergency'
      this.searchSortBy = 'smartMatch';
      this.minRatingFilter = 0;
      this.providerFilterStatus = 'All';

      // 3. Active Modals State
      this.authModalOpen = false;
      this.authModalMode = 'login'; // 'login' | 'register' | 'forgot' | 'reset'
      this.detailModalItem = null;
      this.detailActivePhotoIdx = 0;
      this.bookingModalItem = null;
      this.bookingStartDate = '';
      this.bookingEndDate = '';
      this.bookingDays = 1;
      this.bookingLogistics = 'delivery';
      this.bookingPaymentMethod = 'upi';
      this.bookingUpiId = window.paymentService ? window.paymentService.getUpiId() : '';
      this.bookingQrReady = false;
      this.bookingProcessing = false;
      this.bookingProcessingStep = 0;
      this.bookingPaymentResult = null;
      this.bookingSuccessData = null;

      this.verificationModalOpen = false;
      this.verificationForm = {
        fullName: '',
        businessName: '',
        businessType: 'Hotel & Banquet Venue',
        location: 'Lower Parel, Mumbai',
        phone: '',
        email: '',
        description: '',
        gstin: '',
        fssaiLicense: '',
        tradeLicense: '',
        photos: []
      };

      this.addResourceModalOpen = false;
      this.newResourceForm = {
        title: '',
        category: 'Spaces',
        shopName: '',
        location: 'Lower Parel, Mumbai',
        pricePerDay: '',
        securityDeposit: '',
        quantityAvailable: 1,
        description: '',
        specifications: '',
        instantDispatch: false,
        photos: []
      };

      this.reviewModalItem = null;
      this.reviewRating = 5;
      this.reviewTitle = '';
      this.reviewComment = '';

      this.profileSettingsModalOpen = false;
      this.notificationsOpen = false;
      this.userMenuOpen = false;

      this.init();
    }

    t(key) {
      const dict = (window.TRANSLATIONS && window.TRANSLATIONS[this.lang]) || {};
      return dict[key] || key;
    }

    showToast(message, type = 'info') {
      const container = document.getElementById('hub-toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'hub-toast';
      const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : '✨';
      toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 200ms ease';
        setTimeout(() => toast.remove(), 200);
      }, 3500);
    }

    setTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('hospitalityhub_theme', newTheme);
      this.render();
    }

    setLang(newLang) {
      this.lang = newLang;
      localStorage.setItem('hospitalityhub_lang', newLang);
      this.render();
    }

    switchView(viewName, category = null) {
      this.currentView = viewName;
      if (category) {
        this.selectedCategory = category;
      }
      this.userMenuOpen = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.render();
    }

    resetFilters() {
      this.searchQuery = '';
      this.searchLocation = 'All Locations (MMR)';
      this.searchStartDate = '';
      this.searchEndDate = '';
      this.searchQuantity = 1;
      this.searchBookingType = 'All';
      this.searchSortBy = 'smartMatch';
      this.minRatingFilter = 0;
      this.selectedCategory = 'all';
      this.showToast('All filters and search criteria reset.', 'info');
      this.render();
    }

    init() {
      document.documentElement.setAttribute('data-theme', this.theme);
      
      // Listen to auth changes
      if (window.authService) {
        window.authService.onAuthChange(() => {
          this.render();
        });
      }

      this.render();
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // --- Core Render Routine ---
    render() {
      const root = document.getElementById('root');
      if (!root) return;

      root.innerHTML = `
        <div class="hub-app-wrapper" data-theme="${this.theme}">
          ${this.renderHeader()}
          <main class="hub-main">
            ${this.renderMainView()}
          </main>
          ${this.renderFooter()}
          ${this.renderModals()}
          <div id="hub-toast-container" class="hub-toast-container"></div>
        </div>
      `;

      this.bindEvents();
      this.renderBookingQr();
    }

    renderBookingQr() {
      const canvas = document.getElementById('booking-upi-qr');
      if (!canvas || !this.bookingModalItem || !window.paymentService) return;
      this.bookingQrReady = false;
      const submitButton = document.getElementById('btn-confirm-booking-submit');
      if (submitButton) submitButton.disabled = true;

      const amount = Math.round((this.bookingModalItem.pricePerDay || 0) * Math.max(1, this.bookingDays || 1) * 0.20);
      const payment = window.paymentService.createUpiPaymentUri({
        upiId: this.bookingUpiId,
        amount,
        payeeName: this.bookingModalItem.shopName || 'HospitalityHub',
        note: `Booking advance ${this.bookingModalItem.title || ''}`
      });
      if (!payment.success) return;

      window.paymentService.renderQrCode(canvas, payment.uri).then((result) => {
        if (!canvas.isConnected) return;
        if (!result.success) {
          this.showToast(result.error, 'error');
          return;
        }
        this.bookingQrReady = true;
        const currentSubmitButton = document.getElementById('btn-confirm-booking-submit');
        if (currentSubmitButton && !this.bookingProcessing) currentSubmitButton.disabled = false;
      });
    }

    // --- Header Component ---
    renderHeader() {
      const user = window.authService ? window.authService.getCurrentUser() : null;
      const isAuth = window.authService && window.authService.isAuthenticated();
      const isProvider = window.authService && window.authService.isProvider();
      const bookings = user ? (window.bookingService ? window.bookingService.getUserBookings(user.email, isProvider ? 'provider' : 'seeker') : []) : [];

      return `
        <header class="hub-header">
          <div class="hub-container">
            <div class="hub-header-inner">
              <!-- Logo -->
              <div class="hub-logo" id="nav-logo">
                <div class="hub-logo-icon">🏨</div>
                <div class="hub-logo-text">
                  <span class="hub-logo-title">${this.t('brandName')}</span>
                  <span class="hub-logo-tagline">${this.t('brandTagline')}</span>
                </div>
              </div>

              <!-- Main Navigation Links -->
              <nav class="hub-nav">
                <a class="hub-nav-link ${this.currentView === 'explore' ? 'active' : ''}" data-nav="explore">
                  ${this.t('explore')}
                </a>
                <a class="hub-nav-link ${this.currentView === 'spaces' ? 'active' : ''}" data-nav="spaces">
                  ${this.t('spaces')}
                </a>
                <a class="hub-nav-link ${this.currentView === 'resources' ? 'active' : ''}" data-nav="resources">
                  ${this.t('resources')}
                </a>
                <a class="hub-nav-link ${this.currentView === 'providers' ? 'active' : ''}" data-nav="providers">
                  ${this.t('providers')}
                </a>
                <a class="hub-nav-link ${this.currentView === 'how-it-works' ? 'active' : ''}" data-nav="how-it-works">
                  ${this.t('howItWorks')}
                </a>
              </nav>

              <!-- Header Right Controls -->
              <div class="hub-header-actions">
                <!-- Location Selector Pill -->
                <div class="hub-header-loc-badge" id="btn-quick-loc-toggle" title="MMR Geographic Scope">
                  📍 <span>${this.searchLocation === 'All Locations (MMR)' ? 'MMR Regional Hub' : this.searchLocation.split(',')[0]}</span> ▼
                </div>

                <!-- Language Toggle -->
                <button class="hub-lang-toggle" id="btn-lang-toggle" title="Switch Language">
                  🌐 ${this.lang === 'en' ? 'हिन्दी' : 'English'}
                </button>

                <!-- Theme Toggle -->
                <button class="hub-icon-btn" id="btn-theme-toggle" title="Toggle Light/Dark Theme">
                  ${this.theme === 'light' ? '🌙' : '☀️'}
                </button>

                <!-- Notifications Dropdown -->
                <div style="position: relative;">
                  <button class="hub-icon-btn" id="btn-notifications-toggle" title="${this.t('notifications')}">
                    🔔
                    ${bookings.length > 0 ? `<span class="hub-badge-count">${bookings.length}</span>` : ''}
                  </button>

                  ${this.notificationsOpen ? `
                    <div class="hub-user-menu-dropdown" style="width: 320px; top: 48px; right: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle);">
                        <strong style="font-size: 0.9rem;">${this.t('notifications')}</strong>
                        <span style="font-size: 0.75rem; color: var(--primary); cursor: pointer;" id="btn-close-notifs">✕</span>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 260px; overflow-y: auto;">
                        ${bookings.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">${this.t('noNotifications')}</div>` : 
                          bookings.slice(0, 4).map(b => `
                            <div style="padding: 0.65rem; border-radius: var(--radius-sm); background: var(--bg-muted); font-size: 0.78rem;">
                              <div style="font-weight: 700; color: var(--text-primary);">${this.escapeHtml(b.resourceTitle)}</div>
                              <div style="color: var(--text-secondary); margin-top: 2px;">${b.startDate} to ${b.endDate} (${b.days} days)</div>
                              <div style="font-size: 0.7rem; color: var(--primary); margin-top: 4px; font-weight: 600;">Status: ${b.status} • ${b.paymentStatus}</div>
                            </div>
                          `).join('')
                        }
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Primary CTA: List a Resource -->
                <button class="hub-btn-primary" id="btn-header-list-resource">
                  ${this.t('listResource')}
                </button>

                <!-- Authentication / User Menu -->
                ${isAuth ? `
                  <div class="hub-user-menu">
                    <button class="hub-user-avatar-btn" id="btn-user-menu-toggle">
                      <div class="hub-avatar-circle">${(user.contactPerson || user.businessName || 'U').charAt(0).toUpperCase()}</div>
                      <span style="font-size: 0.82rem; font-weight: 700; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${this.escapeHtml(user.businessName.split(' ')[0])}
                      </span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">▼</span>
                    </button>

                    ${this.userMenuOpen ? `
                      <div class="hub-user-menu-dropdown">
                        <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.35rem;">
                          <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-primary);">${this.escapeHtml(user.businessName)}</div>
                          <div style="font-size: 0.72rem; color: var(--text-muted);">${this.escapeHtml(user.email)}</div>
                          <div style="font-size: 0.72rem; color: var(--primary); font-weight: 700; margin-top: 2px;">Role: ${user.role || 'Enterprise Partner'}</div>
                        </div>

                        <button class="hub-user-menu-item" data-action="go-dashboard">
                          📊 <span>${isProvider ? this.t('providerDashboard') : this.t('seekerDashboard')}</span>
                        </button>
                        
                        <button class="hub-user-menu-item" data-action="switch-role">
                          🔄 <span>Switch to ${isProvider ? 'Seeker Mode' : 'Provider Mode'}</span>
                        </button>

                        <button class="hub-user-menu-item" data-action="go-profile-settings">
                          ⚙️ <span>${this.t('profileSettings')}</span>
                        </button>

                        <div style="height: 1px; background: var(--border-subtle); margin: 0.25rem 0;"></div>

                        <button class="hub-user-menu-item" data-action="logout" style="color: #ef4444;">
                          🚪 <span>${this.t('logout')}</span>
                        </button>
                      </div>
                    ` : ''}
                  </div>
                ` : `
                  <button class="hub-btn-secondary" id="btn-header-login">
                    ${this.t('signIn')}
                  </button>
                  <button class="hub-btn-primary" id="btn-header-signup">
                    ${this.t('signUp')}
                  </button>
                `}
              </div>
            </div>
          </div>
        </header>
      `;
    }

    // --- Main View Dispatcher ---
    renderMainView() {
      if (this.currentView === 'spaces') {
        return this.renderSpacesView();
      }
      if (this.currentView === 'resources') {
        return this.renderResourcesView();
      }
      if (this.currentView === 'providers') {
        return this.renderProvidersDirectory();
      }
      if (this.currentView === 'how-it-works') {
        return this.renderHowItWorks();
      }
      if (this.currentView === 'seeker-dashboard') {
        return this.renderSeekerDashboard();
      }
      if (this.currentView === 'provider-dashboard') {
        return this.renderProviderDashboard();
      }
      return this.renderExploreMarketplace();
    }

    // --- Explore Marketplace View ---
    renderExploreMarketplace() {
      const filtered = window.resourceService ? window.resourceService.queryResources({
        searchQuery: this.searchQuery,
        category: this.selectedCategory,
        location: this.searchLocation,
        startDate: this.searchStartDate,
        endDate: this.searchEndDate,
        bookingType: this.searchBookingType,
        minRating: this.minRatingFilter,
        sortBy: this.searchSortBy
      }) : [];

      const mmrRegions = window.locationService ? window.locationService.getLocationsList() : [];

      return `
        <!-- 1. Cinematic Hero Section -->
        <section class="hub-hero">
          <div class="hub-container">
            <div class="hub-hero-content">
              <div class="hub-hero-eyebrow">
                <span>✨</span> ${this.t('heroEyebrow')}
              </div>
              <h1 class="hub-hero-heading">${this.t('heroHeading')}</h1>
              <p class="hub-hero-subtext">${this.t('heroSubtext')}</p>

              <div class="hub-hero-badges">
                <div class="hub-hero-badge-item">
                  <span>⚡</span> ${this.t('instantDispatchBadge')}
                </div>
                <div class="hub-hero-badge-item">
                  <span>🔒</span> ${this.t('calendarLockBadge')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Floating Search Panel -->
        <div class="hub-container" id="search-section">
          <div class="hub-search-wrapper">
            <div class="hub-search-panel">
              <div class="hub-search-grid">
                <!-- What do you need? -->
                <div class="hub-search-field">
                  <label class="hub-search-label">🔍 ${this.t('whatDoYouNeed')}</label>
                  <input
                    type="text"
                    id="search-query-input"
                    class="hub-search-input"
                    placeholder="${this.t('searchPlaceholder')}"
                    value="${this.escapeHtml(this.searchQuery)}"
                  />
                </div>

                <!-- MMR Location Selector -->
                <div class="hub-search-field">
                  <label class="hub-search-label">📍 ${this.t('location')}</label>
                  <select id="search-location-select" class="hub-search-select">
                    ${mmrRegions.map(loc => `
                      <option value="${this.escapeHtml(loc)}" ${this.searchLocation === loc ? 'selected' : ''}>${this.escapeHtml(loc)}</option>
                    `).join('')}
                  </select>
                </div>

                <!-- Required From Date -->
                <div class="hub-search-field">
                  <label class="hub-search-label">📅 ${this.t('requiredFrom')}</label>
                  <input type="date" id="search-start-date" class="hub-search-input" value="${this.searchStartDate}" />
                </div>

                <!-- Required Until Date -->
                <div class="hub-search-field">
                  <label class="hub-search-label">📅 ${this.t('requiredUntil')}</label>
                  <input type="date" id="search-end-date" class="hub-search-input" value="${this.searchEndDate}" />
                </div>

                <!-- Quantity -->
                <div class="hub-search-field">
                  <label class="hub-search-label">🔢 ${this.t('quantity')}</label>
                  <input type="number" min="1" max="50" id="search-quantity-input" class="hub-search-input" value="${this.searchQuantity}" />
                </div>

                <!-- Booking Type Toggle -->
                <div class="hub-booking-toggle">
                  <label class="hub-search-label">⚡ ${this.t('bookingType')}</label>
                  <div class="hub-booking-switch-box">
                    <button type="button" class="hub-booking-switch-btn ${this.searchBookingType === 'Planned' ? 'active planned' : ''}" id="btn-toggle-planned">
                      📅 Planned
                    </button>
                    <button type="button" class="hub-booking-switch-btn ${this.searchBookingType === 'Emergency' ? 'active emergency' : ''}" id="btn-toggle-emergency">
                      ⚡ Emergency
                    </button>
                  </div>
                </div>

                <!-- Search Submit Button -->
                <button class="hub-search-submit-btn" id="btn-submit-search">
                  ${this.t('searchBtn')}
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Clean Category Navigation (Removed Audio, Whole Chain, Free Booking) -->
          <div class="hub-category-nav-wrapper">
            <div class="hub-category-nav">
              ${(window.CATEGORIES || []).map(cat => `
                <button class="hub-category-pill ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                  <span class="hub-category-emoji">${cat.emoji}</span>
                  <span>${this.t(cat.key)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 4. Results Header, Active Filters & Sorting -->
          <div class="hub-results-meta">
            <div class="hub-results-count">
              ${this.t('showingResults')} <strong>${filtered.length}</strong> ${this.t('verifiedResourcesFound')}
            </div>

            <div class="hub-filter-sort-controls">
              <!-- Sort Selector -->
              <select id="sort-by-select" class="hub-search-select" style="width: auto; padding: 0.45rem 0.85rem; font-size: 0.82rem;">
                <option value="smartMatch" ${this.searchSortBy === 'smartMatch' ? 'selected' : ''}>🎯 Sort: Smart Match Score</option>
                <option value="priceAsc" ${this.searchSortBy === 'priceAsc' ? 'selected' : ''}>💵 Price: Low to High</option>
                <option value="priceDesc" ${this.searchSortBy === 'priceDesc' ? 'selected' : ''}>💎 Price: High to Low</option>
                <option value="rating" ${this.searchSortBy === 'rating' ? 'selected' : ''}>⭐ Rating: Highest First</option>
                <option value="distance" ${this.searchSortBy === 'distance' ? 'selected' : ''}>📍 Distance from BKC</option>
              </select>

              <!-- Reset / Clear Filters Button -->
              <button class="hub-btn-outline" id="btn-reset-filters">
                ✕ ${this.t('clearFilters')}
              </button>
            </div>
          </div>

          <!-- 5. Resource Cards Grid -->
          <div class="hub-resource-grid">
            ${filtered.length === 0 ? `
              <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-surface); border: 1px dashed var(--border-strong); border-radius: var(--radius-xl);">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🏨</div>
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">No matching MMR resources found</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 480px; margin: 0 auto 1.5rem;">
                  Try clearing specific date constraints or broadening your MMR location filter.
                </p>
                <button class="hub-btn-primary" id="btn-empty-reset">Reset All Filters</button>
              </div>
            ` : filtered.map(item => this.renderResourceCard(item)).join('')}
          </div>
        </div>
      `;
    }

    // --- Spaces Dedicated View ---
    renderSpacesView() {
      const spaces = window.resourceService ? window.resourceService.queryResources({
        searchQuery: this.searchQuery,
        category: 'Spaces',
        location: this.searchLocation,
        startDate: this.searchStartDate,
        endDate: this.searchEndDate
      }) : [];

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">
              <span>🏨</span> Banquet Halls & Luxury Event Venues in MMR
            </div>
            <h1 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; margin-top: 0.25rem;">
              B2B Spaces & Venues
            </h1>
            <p style="color: var(--text-secondary); font-size: 1rem; max-width: 720px; margin-top: 0.5rem;">
              Verified pillarless ballrooms, private manicured lawns, and commercial cloud kitchens available for advance corporate booking and high-volume wedding production.
            </p>
          </div>

          <div class="hub-results-meta">
            <div class="hub-results-count">
              Showing <strong>${spaces.length}</strong> verified MMR spaces
            </div>
            <button class="hub-btn-outline" id="btn-reset-filters">
              ✕ Reset Filters
            </button>
          </div>

          <div class="hub-resource-grid">
            ${spaces.map(item => this.renderResourceCard(item)).join('')}
          </div>
        </div>
      `;
    }

    // --- Physical Resources Dedicated View ---
    renderResourcesView() {
      const physical = window.resourceService ? window.resourceService.queryResources({
        searchQuery: this.searchQuery,
        category: this.selectedCategory === 'Spaces' ? 'all' : this.selectedCategory,
        location: this.searchLocation,
        startDate: this.searchStartDate,
        endDate: this.searchEndDate
      }).filter(i => i.category !== 'Spaces') : [];

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">
              <span>🎪</span> Commercial Hospitality Equipment & Fleet
            </div>
            <h1 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; margin-top: 0.25rem;">
              Commercial Equipment & Logistics
            </h1>
            <p style="color: var(--text-secondary); font-size: 1rem; max-width: 720px; margin-top: 0.5rem;">
              Rational combi ovens, thermo-king refrigerated trucks, 125 kVA silent acoustic diesel generators, Chiavari banquet furniture, and German pagoda tents.
            </p>
          </div>

          <div class="hub-results-meta">
            <div class="hub-results-count">
              Showing <strong>${physical.length}</strong> verified equipment assets across MMR
            </div>
            <button class="hub-btn-outline" id="btn-reset-filters">
              ✕ Reset Filters
            </button>
          </div>

          <div class="hub-resource-grid">
            ${physical.map(item => this.renderResourceCard(item)).join('')}
          </div>
        </div>
      `;
    }

    // --- Providers Directory View ---
    renderProvidersDirectory() {
      const providers = window.providerService ? window.providerService.getProviders(this.searchLocation) : [];

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">
              <span>🏢</span> MMR Verified Enterprise Directory
            </div>
            <h1 style="font-family: var(--font-heading); font-size: 2.25rem; font-weight: 800; margin-top: 0.25rem;">
              Verified Hospitality Providers
            </h1>
            <p style="color: var(--text-secondary); font-size: 1rem; max-width: 720px; margin-top: 0.5rem;">
              Explore trusted B2B hospitality businesses, hotels, catering depots, and logistics operators across Mumbai, Thane, and Navi Mumbai.
            </p>
          </div>

          <div class="hub-results-meta">
            <div class="hub-results-count">
              Showing <strong>${providers.length}</strong> registered enterprise suppliers in MMR
            </div>
            <button class="hub-btn-primary" id="btn-join-as-provider">
              💼 Apply for Provider Verification
            </button>
          </div>

          <div class="hub-providers-grid">
            ${providers.map(prov => `
              <div class="hub-provider-card">
                <div class="hub-provider-header">
                  <div class="hub-provider-avatar">${prov.businessName.charAt(0)}</div>
                  <div class="hub-provider-info">
                    <div class="hub-provider-name">
                      ${this.escapeHtml(prov.businessName)}
                      ${prov.verificationStatus === 'Verified' && prov.verified ? `
                        <span class="hub-badge hub-badge-verified" title="100% KYC & GSTIN Verified">✓ Verified</span>
                      ` : `
                        <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: var(--radius-xs); background: var(--bg-muted); color: var(--text-muted); font-weight: 600;">
                          ${prov.verificationStatus || 'Pending Verification'}
                        </span>
                      `}
                    </div>
                    <div class="hub-provider-type">${this.escapeHtml(prov.businessType)}</div>
                    <div class="hub-provider-location">📍 ${this.escapeHtml(prov.location)}</div>
                  </div>
                </div>

                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${this.escapeHtml(prov.description)}
                </p>

                <!-- Provider Image Gallery -->
                ${prov.photos && prov.photos.length > 0 ? `
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                    ${prov.photos.slice(0, 3).map(p => `
                      <img src="${p}" alt="${this.escapeHtml(prov.businessName)}" style="width: 100%; height: 75px; object-fit: cover; border-radius: var(--radius-sm);" />
                    `).join('')}
                  </div>
                ` : ''}

                <div class="hub-provider-stats">
                  <div>
                    <div class="hub-provider-stat-value">⭐ ${prov.rating}</div>
                    <div class="hub-provider-stat-label">${prov.reviewsCount} Reviews</div>
                  </div>
                  <div>
                    <div class="hub-provider-stat-value">📦 ${prov.activeFleetCount || 3}</div>
                    <div class="hub-provider-stat-label">Active Fleet</div>
                  </div>
                  <div>
                    <div class="hub-provider-stat-value">✅ ${prov.completedRentals || 45}</div>
                    <div class="hub-provider-stat-label">Rentals</div>
                  </div>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                  <button class="hub-btn-primary" style="flex: 1;" data-view-provider-fleet="${this.escapeHtml(prov.businessName)}">
                    View Listed Fleet
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // --- How It Works View ---
    renderHowItWorks() {
      const steps = [
        { num: 1, icon: "👤", title: "Create Enterprise Account", desc: "Register your hospitality company with work email, KYC verification, and select Seeker or Provider mode." },
        { num: 2, icon: "📍", title: "Explore MMR Marketplace", desc: "Filter shared resources strictly within Mumbai, Thane, and Navi Mumbai planning clusters." },
        { num: 3, icon: "🔍", title: "Inspect 3–4 Photo Gallery", desc: "Review authentic multi-angle photos, technical specs, FSSAI compliance, and verified licenses." },
        { num: 4, icon: "📅", title: "Live Calendar Availability", desc: "Select required dates on our visual collision-free calendar showing available vs locked slots." },
        { num: 5, icon: "📱", title: "UPI QR Advance", desc: "Scan the merchant QR and report your 20% advance. The pending booking is stored only in this browser; it does not lock the provider's shared calendar." },
        { num: 6, icon: "✓", title: "Manual Payment Confirmation", desc: "The app cannot verify UPI transfers or hold funds. Confirm payment directly with the recipient before proceeding." },
        { num: 7, icon: "🚚", title: "Dispatch & Site Delivery", desc: "Dedicated logistics transport with live temperature logging or depot self-pickup across MMR." },
        { num: 8, icon: "🔄", title: "Release & Automatic Availability", desc: "Upon booking completion or cancellation, calendar dates automatically release back to the marketplace." },
        { num: 9, icon: "⭐", title: "Verified Enterprise Review", desc: "Leave authentic feedback and ratings accessible exclusively to verified completed bookings." }
      ];

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div class="hub-how-it-works-hero">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.85rem; background: var(--primary-subtle); color: var(--primary); border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;">
              ⚡ End-to-End Operational Workflow
            </div>
            <h1 style="font-family: var(--font-heading); font-size: 2.4rem; font-weight: 800;">
              How HospitalityHub Operates
            </h1>
            <p style="color: var(--text-secondary); font-size: 1.05rem; margin-top: 0.5rem;">
              Built specifically for hotels, caterers, banquet venues, and event production enterprises across Mumbai Metropolitan Region.
            </p>
          </div>

          <div class="hub-timeline-grid">
            ${steps.map(s => `
              <div class="hub-step-card">
                <div class="hub-step-number">${s.num}</div>
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${s.icon}</div>
                <h3 class="hub-step-title">${s.title}</h3>
                <p class="hub-step-desc">${s.desc}</p>
              </div>
            `).join('')}
          </div>

          <div style="background: linear-gradient(135deg, var(--primary) 0%, #115e59 100%); color: #ffffff; border-radius: var(--radius-xl); padding: 3rem 2rem; text-align: center; margin-bottom: 4rem;">
            <h2 style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 800; margin-bottom: 0.75rem;">
              Ready to Share or Procure Commercial Assets?
            </h2>
            <p style="font-size: 1rem; opacity: 0.9; max-width: 600px; margin: 0 auto 1.75rem;">
              Join Mumbai's premier verified B2B hospitality resource network today.
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <button class="hub-btn-primary" style="background: #ffffff; color: var(--primary);" id="btn-hero-explore-from-hiw">
                Explore MMR Resources
              </button>
              <button class="hub-btn-secondary" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.4);" id="btn-hero-list-from-hiw">
                List Your Equipment
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // --- Seeker Dashboard View ---
    renderSeekerDashboard() {
      const user = window.authService ? window.authService.getCurrentUser() : null;
      if (!user) {
        return `<div class="hub-container" style="padding: 4rem 1rem; text-align: center;"><h3>Please sign in to access your seeker dashboard.</h3><button class="hub-btn-primary" id="btn-header-login" style="margin-top: 1rem;">Sign In</button></div>`;
      }

      const bookings = window.bookingService ? window.bookingService.getUserBookings(user.email, 'seeker') : [];
      const confirmed = bookings.filter(b => b.status === 'Confirmed');
      const completed = bookings.filter(b => b.status === 'Completed');
      const cancelled = bookings.filter(b => b.status === 'Cancelled');

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div class="hub-dashboard-header">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">
                Seeker Procurement Hub
              </div>
              <h1 class="hub-dashboard-title">${this.escapeHtml(user.businessName)}</h1>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                Logged in as ${this.escapeHtml(user.contactPerson || user.email)} • 📍 ${this.escapeHtml(user.location || 'Mumbai, MMR')}
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="hub-btn-outline" data-action="go-profile-settings">⚙️ Settings</button>
              <button class="hub-btn-primary" data-nav="explore">🔍 Explore Assets</button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="hub-stats-overview">
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Active / Upcoming Bookings</div>
              <div class="hub-stat-box-number" style="color: var(--primary);">${confirmed.length}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Completed Rentals</div>
              <div class="hub-stat-box-number">${completed.length}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Cancelled Bookings</div>
              <div class="hub-stat-box-number" style="color: #ef4444;">${cancelled.length}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Total Bookings</div>
              <div class="hub-stat-box-number">${bookings.length}</div>
            </div>
          </div>

          <!-- Bookings Table -->
          <div style="margin-bottom: 3.5rem;">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem;">
              My Resource Reservations & Calendar Locks
            </h3>

            ${bookings.length === 0 ? `
              <div style="padding: 3rem; text-align: center; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: var(--radius-lg);">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">You have not made any bookings yet.</p>
                <button class="hub-btn-primary" data-nav="explore">Explore Available MMR Resources</button>
              </div>
            ` : `
              <div style="overflow-x: auto;">
                <table class="hub-dashboard-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Resource</th>
                      <th>Provider</th>
                      <th>Dates & Duration</th>
                      <th>Total Value</th>
                      <th>Payment Status</th>
                      <th>Booking Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookings.map(b => `
                      <tr>
                        <td style="font-weight: 700;">#${b.id}</td>
                        <td style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(b.resourceTitle)}</td>
                        <td>${this.escapeHtml(b.providerBusiness)}</td>
                        <td>
                          <div style="font-weight: 600;">${b.startDate} → ${b.endDate}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.days} days</div>
                        </td>
                        <td style="font-weight: 700;">₹${Number(b.totalAmount).toLocaleString()}</td>
                        <td>
                          <span style="font-size: 0.78rem; font-weight: 600; color: var(--primary);">
                            ${b.paymentStatus || 'Payment confirmation pending'}
                          </span>
                        </td>
                        <td>
                          <span class="hub-badge ${b.status === 'Confirmed' ? 'hub-badge-verified' : b.status === 'Completed' ? 'hub-badge-smartmatch' : ''}" style="${b.status === 'Cancelled' ? 'background: #ef4444; color: #fff;' : ''}">
                            ${b.status}
                          </span>
                        </td>
                        <td>
                          <div style="display: flex; gap: 0.35rem;">
                            ${b.status === 'Confirmed' ? `
                              <button class="hub-btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; color: #ef4444; border-color: #ef4444;" data-action="cancel-booking" data-id="${b.id}">
                                Cancel & Release
                              </button>
                            ` : ''}

                            ${(b.status === 'Completed' || b.status === 'Confirmed') ? `
                              <button class="hub-btn-primary" style="font-size: 0.72rem; padding: 0.25rem 0.5rem;" data-action="write-review" data-resource-id="${b.resourceId}" data-booking-id="${b.id}">
                                ⭐ Review
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // --- Provider Dashboard View ---
    renderProviderDashboard() {
      const user = window.authService ? window.authService.getCurrentUser() : null;
      if (!user) {
        return `<div class="hub-container" style="padding: 4rem 1rem; text-align: center;"><h3>Please sign in to access your provider hub.</h3><button class="hub-btn-primary" id="btn-header-login" style="margin-top: 1rem;">Sign In</button></div>`;
      }

      const myResources = window.resourceService ? window.resourceService.getProviderResources(user.businessName || user.email) : [];
      const bookings = window.bookingService ? window.bookingService.getUserBookings(user.email, 'provider') : [];
      const status = user.verificationStatus || 'Not Submitted';
      const isVerified = status === 'Verified' && user.verified;

      return `
        <div class="hub-container" style="padding-top: 2rem;">
          <div class="hub-dashboard-header">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">
                Provider Fleet & Revenue Center
              </div>
              <h1 class="hub-dashboard-title" style="display: flex; align-items: center; gap: 0.5rem;">
                ${this.escapeHtml(user.businessName)}
                ${isVerified ? `<span class="hub-badge hub-badge-verified">✓ Verified Supplier</span>` : `
                  <span style="font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); background: var(--bg-muted); color: var(--text-muted); font-weight: 700;">
                    Status: ${status}
                  </span>
                `}
              </h1>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                KYC / GSTIN: ${user.gstin || 'Pending Verification'} • 📍 ${this.escapeHtml(user.location || 'Mumbai, MMR')}
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="hub-btn-secondary" id="btn-open-verification-modal">
                🛡️ Verification Dossier
              </button>
              <button class="hub-btn-primary" id="btn-open-add-resource">
                + Add New Resource
              </button>
            </div>
          </div>

          <!-- Verification Alert Banner if Not Verified -->
          ${!isVerified ? `
            <div style="background: var(--accent-gold-subtle); border: 1px solid var(--accent-gold-border); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
              <div>
                <strong style="color: var(--accent-gold); font-size: 0.95rem;">⚠️ Verification Status: ${status}</strong>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                  Complete your business verification with GSTIN, trade license, and 3–4 authentic facility photos to unlock the public Verified Supplier badge.
                </p>
              </div>
              <button class="hub-btn-primary" id="btn-banner-verify">
                Complete Verification Now
              </button>
            </div>
          ` : ''}

          <!-- Quick Stats -->
          <div class="hub-stats-overview">
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Active Listed Fleet</div>
              <div class="hub-stat-box-number" style="color: var(--primary);">${myResources.length}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Incoming / Active Bookings</div>
              <div class="hub-stat-box-number">${bookings.filter(b => b.status === 'Confirmed').length}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Completed Rentals</div>
              <div class="hub-stat-box-number">${bookings.filter(b => b.status === 'Completed').length + 12}</div>
            </div>
            <div class="hub-stat-box">
              <div class="hub-stat-box-title">Provider Rating</div>
              <div class="hub-stat-box-number">⭐ ${user.rating || 4.9}</div>
            </div>
          </div>

          <!-- My Listed Fleet Table -->
          <div style="margin-bottom: 3.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800;">
                My Listed Commercial Assets
              </h3>
              <button class="hub-btn-primary" id="btn-open-add-resource-inline" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
                + Add Resource
              </button>
            </div>

            ${myResources.length === 0 ? `
              <div style="padding: 3rem; text-align: center; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: var(--radius-lg);">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">You have not listed any resources yet.</p>
                <button class="hub-btn-primary" id="btn-empty-add-resource">+ List First Commercial Asset</button>
              </div>
            ` : `
              <div style="overflow-x: auto;">
                <table class="hub-dashboard-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Price / Day</th>
                      <th>Deposit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${myResources.map(item => `
                      <tr>
                        <td style="width: 60px;">
                          <img src="${item.image || (item.photos && item.photos[0])}" alt="${this.escapeHtml(item.title)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);" />
                        </td>
                        <td style="font-weight: 700; color: var(--text-primary); max-width: 240px;">
                          ${this.escapeHtml(item.title)}
                        </td>
                        <td>${item.category}</td>
                        <td>${item.location}</td>
                        <td style="font-weight: 700;">₹${Number(item.pricePerDay).toLocaleString()}</td>
                        <td>₹${Number(item.securityDeposit || 0).toLocaleString()}</td>
                        <td>
                          <span class="hub-badge ${item.availabilityStatus === 'Available' ? 'hub-badge-verified' : 'hub-badge-smartmatch'}">
                            ${item.availabilityStatus}
                          </span>
                        </td>
                        <td>
                          <button class="hub-btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; color: #ef4444; border-color: #ef4444;" data-action="delete-resource" data-id="${item.id}">
                            Remove
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // --- Resource Card Component (3–4 Photos Carousel) ---
    renderResourceCard(item) {
      const photos = (item.photos && item.photos.length > 0) ? item.photos : [item.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"];
      const coverPhoto = photos[0];
      const matchScore = item.smartMatchScore || 94;
      const isLocked = item.isCurrentlyLocked || item.availabilityStatus === 'Pre-booked';

      return `
        <div class="hub-card" data-resource-id="${item.id}">
          <!-- Card Media Gallery -->
          <div class="hub-card-media">
            <img src="${coverPhoto}" alt="${this.escapeHtml(item.title)}" class="hub-card-image" id="card-img-${item.id}" />

            <!-- Badges Top Left -->
            <div class="hub-card-badge-top-left">
              ${item.verified ? `
                <span class="hub-badge hub-badge-verified">✓ Verified Provider</span>
              ` : ''}
              ${item.instantDispatchAvailable ? `
                <span class="hub-badge hub-badge-emergency">⚡ 45-Min Dispatch</span>
              ` : ''}
            </div>

            <!-- Badges Top Right -->
            <div class="hub-card-badge-top-right">
              <span class="hub-badge hub-badge-smartmatch">${matchScore}% Match</span>
            </div>

            <!-- Multi-Photo Thumbnail Dots (3–4 Photos) -->
            ${photos.length > 1 ? `
              <div class="hub-card-photo-dots">
                ${photos.map((p, idx) => `
                  <div
                    class="hub-photo-dot ${idx === 0 ? 'active' : ''}"
                    data-card-dot="${item.id}"
                    data-img-src="${p}"
                    data-idx="${idx}"
                    title="Photo ${idx + 1} of ${photos.length}"
                  ></div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Card Body -->
          <div class="hub-card-body">
            <div class="hub-card-category-loc">
              <span class="hub-card-category">${item.category}</span>
              <span class="hub-card-location">📍 ${this.escapeHtml(item.location)}</span>
            </div>

            <h3 class="hub-card-title" title="${this.escapeHtml(item.title)}">
              ${this.escapeHtml(item.title)}
            </h3>

            <div class="hub-card-provider">
              🏢 <span>${this.escapeHtml(item.shopName)}</span>
              <span style="color: var(--text-muted); font-size: 0.72rem;">• ⭐ ${item.rating || 4.9} (${item.reviewsCount || 0})</span>
            </div>

            <!-- Key Specs Tags -->
            <div class="hub-card-specs-list">
              ${(item.specifications || []).slice(0, 2).map(spec => `
                <span class="hub-card-spec-tag">✓ ${this.escapeHtml(spec)}</span>
              `).join('')}
            </div>

            <div class="hub-card-divider"></div>

            <!-- Pricing & Booking Actions -->
            <div class="hub-card-footer">
              <div class="hub-card-pricing">
                <div class="hub-card-price-amount">₹${Number(item.pricePerDay).toLocaleString()}</div>
                <div class="hub-card-price-unit">${this.t('perDay')} • Dep: ₹${Number(item.securityDeposit || 0).toLocaleString()}</div>
              </div>

              <div class="hub-card-actions">
                <button class="hub-btn-outline" data-action="view-details" data-id="${item.id}">
                  ${this.t('viewDetails')}
                </button>
                <button class="hub-btn-primary" data-action="book-now" data-id="${item.id}">
                  ${this.t('bookNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // --- Footer Component ---
    renderFooter() {
      return `
        <footer class="hub-footer">
          <div class="hub-container">
            <div class="hub-footer-grid">
              <div class="hub-footer-col">
                <div class="hub-logo" style="margin-bottom: 1rem;">
                  <div class="hub-logo-icon">🏨</div>
                  <div class="hub-logo-text">
                    <span class="hub-logo-title">${this.t('brandName')}</span>
                    <span class="hub-logo-tagline">${this.t('brandTagline')}</span>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; max-width: 380px;">
                  ${this.t('footerAbout')}
                </p>
              </div>

              <div class="hub-footer-col">
                <h4>Marketplace</h4>
                <ul>
                  <li><a data-nav="explore">Explore All Assets</a></li>
                  <li><a data-nav="spaces">Banquet Spaces & Venues</a></li>
                  <li><a data-nav="resources">Commercial Kitchen Equipment</a></li>
                  <li><a data-nav="resources">Refrigerated Transport Fleet</a></li>
                  <li><a data-nav="providers">Verified Provider Directory</a></li>
                </ul>
              </div>

              <div class="hub-footer-col">
                <h4>MMR Coverage</h4>
                <ul>
                  <li><a>South & Central Mumbai</a></li>
                  <li><a>Western & Eastern Suburbs</a></li>
                  <li><a>Thane & Ghodbunder Corridor</a></li>
                  <li><a>Navi Mumbai (Vashi & Panvel)</a></li>
                  <li><a>Bhiwandi & Extended MMR</a></li>
                </ul>
              </div>

              <div class="hub-footer-col">
                <h4>Trust & Security</h4>
                <ul>
                  <li><a>100% KYC & GSTIN Verification</a></li>
                  <li><a>Real-Time Calendar Lock Engine</a></li>
                  <li><a>UPI QR Payment Reporting</a></li>
                  <li><a>2-Step Condition Photo Audits</a></li>
                  <li><a>24/7 MMR Logistics Support</a></li>
                </ul>
              </div>
            </div>

            <div class="hub-footer-bottom">
              <div>${this.t('copyright')}</div>
              <div style="display: flex; gap: 1.5rem;">
                <a>Privacy Policy</a>
                <a>Commercial Terms & NOC</a>
                <a>Manual Payment Confirmation</a>
              </div>
            </div>
          </div>
        </footer>
      `;
    }

    // --- Modals Container ---
    renderModals() {
      return `
        ${this.renderAuthModal()}
        ${this.renderResourceDetailModal()}
        ${this.renderBookingModal()}
        ${this.renderVerificationModal()}
        ${this.renderAddResourceModal()}
        ${this.renderReviewModal()}
        ${this.renderProfileSettingsModal()}
      `;
    }

    // 1. Auth Modal (Sign In & Sign Up)
    renderAuthModal() {
      if (!this.authModalOpen) return '';

      return `
        <div class="hub-modal-overlay" id="modal-auth-overlay">
          <div class="hub-modal" style="max-width: 480px;">
            <div class="hub-modal-header">
              <h3 class="hub-modal-title">
                ${this.authModalMode === 'login' ? this.t('signInTitle') : this.t('signUpTitle')}
              </h3>
              <button class="hub-modal-close-btn" id="btn-close-auth-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                ${this.authModalMode === 'login' ? this.t('loginSubtitle') : this.t('signupSubtitle')}
              </p>

              ${this.authModalMode === 'login' ? `
                <!-- Login Form -->
                <form id="form-login" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('workEmail')}</label>
                    <input type="email" id="login-email" class="hub-search-input" placeholder="procurement@imperialbanquets.in" required />
                  </div>

                  <div class="hub-search-field">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <label class="hub-search-label">${this.t('password')}</label>
                      <span style="font-size: 0.75rem; color: var(--primary); cursor: pointer;" id="btn-switch-forgot">Forgot?</span>
                    </div>
                    <input type="password" id="login-password" class="hub-search-input" placeholder="••••••••" required />
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-secondary);">
                    <input type="checkbox" id="login-remember" checked />
                    <label for="login-remember">${this.t('rememberMe')}</label>
                  </div>

                  <button type="submit" class="hub-btn-primary" style="padding: 0.75rem; font-size: 0.95rem; width: 100%;">
                    ${this.t('loginBtn')}
                  </button>

                  <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                    ${this.t('noAccount')}
                    <span style="color: var(--primary); font-weight: 700; cursor: pointer;" id="btn-switch-signup">${this.t('signUp')}</span>
                  </div>
                </form>
              ` : `
                <!-- Registration Form -->
                <form id="form-register" style="display: flex; flex-direction: column; gap: 0.9rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('accountTypeLabel')}</label>
                    <div class="hub-booking-switch-box">
                      <button type="button" class="hub-booking-switch-btn active planned" id="btn-reg-seeker">
                        🔍 ${this.t('seekerType')}
                      </button>
                      <button type="button" class="hub-booking-switch-btn" id="btn-reg-provider">
                        💼 ${this.t('providerType')}
                      </button>
                    </div>
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('businessName')}</label>
                    <input type="text" id="reg-business-name" class="hub-search-input" placeholder="e.g. Royal Palace Banquets Ltd" required />
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('workEmail')}</label>
                    <input type="email" id="reg-email" class="hub-search-input" placeholder="contact@royalpalace.in" required />
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('phone')}</label>
                    <input type="tel" id="reg-phone" class="hub-search-input" placeholder="+91 98200 12345" required />
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('location')}</label>
                    <select id="reg-location" class="hub-search-select">
                      ${(window.locationService ? window.locationService.getLocationsList().filter(l => l !== 'All Locations (MMR)') : []).map(loc => `
                        <option value="${this.escapeHtml(loc)}">${this.escapeHtml(loc)}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('password')}</label>
                    <input type="password" id="reg-password" class="hub-search-input" placeholder="Min 8 chars with mixed case & numbers" required />
                    <div id="password-strength-meter" style="font-size: 0.72rem; margin-top: 2px; font-weight: 600;"></div>
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('confirmPassword')}</label>
                    <input type="password" id="reg-confirm-password" class="hub-search-input" placeholder="Repeat password" required />
                  </div>

                  <button type="submit" class="hub-btn-primary" style="padding: 0.75rem; font-size: 0.95rem; width: 100%; margin-top: 0.5rem;">
                    ${this.t('registerBtn')}
                  </button>

                  <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                    ${this.t('alreadyHaveAccount')}
                    <span style="color: var(--primary); font-weight: 700; cursor: pointer;" id="btn-switch-login">${this.t('signIn')}</span>
                  </div>
                </form>
              `}
            </div>
          </div>
        </div>
      `;
    }

    // 2. Resource Details Modal (Full Specifications, 3–4 Photo Gallery, Live Calendar)
    renderResourceDetailModal() {
      if (!this.detailModalItem) return '';
      const item = this.detailModalItem;
      const photos = (item.photos && item.photos.length > 0) ? item.photos : [item.image];
      const activePhoto = photos[this.detailActivePhotoIdx] || photos[0];
      const lockedDates = window.bookingService ? window.bookingService.getLockedDatesForResource(item.id) : [];
      const reviews = window.reviewService ? window.reviewService.getReviewsForResource(item.id) : [];
      const ratingSummary = window.reviewService ? window.reviewService.getRatingSummary(item.id) : { averageRating: 4.9, totalReviews: 0 };

      return `
        <div class="hub-modal-overlay" id="modal-detail-overlay">
          <div class="hub-modal" style="max-width: 860px;">
            <div class="hub-modal-header">
              <div>
                <span class="hub-card-category">${item.category}</span>
                <h3 class="hub-modal-title" style="margin-top: 2px;">${this.escapeHtml(item.title)}</h3>
              </div>
              <button class="hub-modal-close-btn" id="btn-close-detail-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <!-- 3–4 Photo Interactive Gallery -->
              <div style="position: relative; width: 100%; height: 340px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 1rem; background: var(--bg-muted);">
                <img src="${activePhoto}" alt="${this.escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
                <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: #fff; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">
                  Photo ${this.detailActivePhotoIdx + 1} of ${photos.length}
                </div>
              </div>

              <!-- Thumbnail Strip -->
              <div style="display: flex; gap: 8px; margin-bottom: 1.5rem; overflow-x: auto;">
                ${photos.map((p, idx) => `
                  <img
                    src="${p}"
                    alt="Thumbnail ${idx + 1}"
                    class="hub-detail-thumb"
                    data-idx="${idx}"
                    style="width: 80px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 2px solid ${idx === this.detailActivePhotoIdx ? 'var(--primary)' : 'transparent'};"
                  />
                `).join('')}
              </div>

              <!-- Two Column Specs & Booking Sidebar -->
              <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.75rem;">
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${this.t('description')}
                  </h4>
                  <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
                    ${this.escapeHtml(item.description)}
                  </p>

                  <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${this.t('specifications')}
                  </h4>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1.5rem;">
                    ${(item.specifications || []).map(spec => `
                      <li style="font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.45rem;">
                        <span style="color: var(--primary); font-weight: 700;">✓</span> ${this.escapeHtml(spec)}
                      </li>
                    `).join('')}
                  </ul>

                  <!-- Verified Provider Card -->
                  <div style="background: var(--bg-muted); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                      ${this.t('providerProfile')}
                    </div>
                    <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">
                      ${this.escapeHtml(item.shopName)}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                      📍 ${this.escapeHtml(item.location)} • Avg Response: < 15 mins
                    </div>
                  </div>

                  <!-- Verified Reviews Section -->
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700;">
                        ⭐ ${ratingSummary.averageRating} (${reviews.length} Verified Reviews)
                      </h4>
                      <button class="hub-btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" data-action="write-review" data-resource-id="${item.id}">
                        + Write Review
                      </button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                      ${reviews.length === 0 ? `
                        <div style="font-size: 0.82rem; color: var(--text-muted);">${this.t('noReviewsYet')}</div>
                      ` : reviews.map(r => `
                        <div style="background: var(--bg-muted); border-radius: var(--radius-sm); padding: 0.75rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 0.85rem;">${this.escapeHtml(r.reviewerName)} (${this.escapeHtml(r.reviewerCompany)})</strong>
                            <span style="color: var(--accent-gold); font-size: 0.85rem;">${'★'.repeat(r.rating)}</span>
                          </div>
                          <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-top: 2px;">${this.escapeHtml(r.title)}</div>
                          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${this.escapeHtml(r.comment)}</div>
                          <div style="font-size: 0.7rem; color: var(--primary); font-weight: 700; margin-top: 4px;">✓ Verified Completed Booking</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <!-- Right Action Panel -->
                <div>
                  <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--shadow-sm); position: sticky; top: 80px;">
                    <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">
                      ₹${Number(item.pricePerDay).toLocaleString()} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">/ day</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                      Refundable Deposit: ₹${Number(item.securityDeposit || 0).toLocaleString()}
                    </div>

                    <!-- Locked Dates Summary -->
                    <div style="margin-bottom: 1.25rem; font-size: 0.82rem;">
                      <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
                        📅 Live Calendar Status:
                      </div>
                      ${lockedDates.length === 0 ? `
                        <span style="color: var(--status-available); font-weight: 600;">✓ All dates currently open for booking</span>
                      ` : `
                        <div style="color: #ef4444; font-weight: 600; margin-bottom: 2px;">
                          🔒 Locked Dates:
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); max-height: 60px; overflow-y: auto;">
                          ${lockedDates.join(', ')}
                        </div>
                      `}
                    </div>

                    <button class="hub-btn-primary" style="width: 100%; padding: 0.8rem; font-size: 0.95rem;" data-action="book-now" data-id="${item.id}">
                      📅 ${this.t('proceedCheckout')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Interactive Booking & Calendar Lock Modal
    renderBookingModal() {
      if (!this.bookingModalItem) return '';
      const item = this.bookingModalItem;
      if (this.bookingPaymentResult) return this.renderPaymentResultModal(item);
      if (this.bookingProcessing) return this.renderPaymentProcessingModal(item);
      const lockedDates = window.bookingService ? window.bookingService.getLockedDatesForResource(item.id) : [];

      // Calculate cost breakdown
      const dailyRate = item.pricePerDay || 0;
      const days = Math.max(1, this.bookingDays || 1);
      const subtotal = dailyRate * days;
      const deposit = item.securityDeposit || 0;
      const deliveryFee = this.bookingLogistics === 'delivery' ? (item.category === 'Spaces' ? 0 : 850) : 0;
      const tokenAdvance = Math.round(subtotal * 0.20);
      const totalEstimated = subtotal + deposit + deliveryFee;
      const upiId = this.bookingUpiId || (window.paymentService ? window.paymentService.getUpiId() : '');
      const hasValidUpiId = window.paymentService && window.paymentService.isValidUpiId(upiId);
      const paymentUri = hasValidUpiId ? window.paymentService.createUpiPaymentUri({
        upiId,
        amount: tokenAdvance,
        payeeName: item.shopName || 'HospitalityHub',
        note: `Booking advance ${item.title || ''}`
      }) : null;

      return `
        <div class="hub-modal-overlay" id="modal-booking-overlay">
          <div class="hub-modal" style="max-width: 680px;">
            <div class="hub-modal-header">
              <div>
                <span class="hub-card-category">${item.category}</span>
                <h3 class="hub-modal-title">Reserve & Lock Calendar Dates</h3>
              </div>
              <button class="hub-modal-close-btn" id="btn-close-booking-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <!-- Selected Resource Overview -->
              <div style="display: flex; gap: 1rem; align-items: center; background: var(--bg-muted); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
                <img src="${item.image || (item.photos && item.photos[0])}" alt="${this.escapeHtml(item.title)}" style="width: 65px; height: 65px; object-fit: cover; border-radius: var(--radius-sm);" />
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${this.escapeHtml(item.title)}</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">🏢 ${this.escapeHtml(item.shopName)} • 📍 ${this.escapeHtml(item.location)}</div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">₹${dailyRate.toLocaleString()} / day</div>
                </div>
              </div>

              <!-- Date Selection & Calendar Guidance -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="hub-search-field">
                  <label class="hub-search-label">📅 Start Date (Check-in / Dispatch)</label>
                  <input type="date" id="booking-start-date" class="hub-search-input" value="${this.bookingStartDate}" />
                </div>
                <div class="hub-search-field">
                  <label class="hub-search-label">📅 End Date (Return / Handover)</label>
                  <input type="date" id="booking-end-date" class="hub-search-input" value="${this.bookingEndDate}" />
                </div>
              </div>

              <!-- Collision / Locked Dates Notice -->
              ${lockedDates.length > 0 ? `
                <div style="background: var(--status-unavailable-bg); border: 1px solid var(--status-unavailable-border); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8rem; color: var(--status-unavailable);">
                  <strong>🔒 Note on Locked Dates:</strong> The dates (${lockedDates.slice(0, 5).join(', ')}${lockedDates.length > 5 ? '...' : ''}) are currently locked by active confirmed bookings and cannot be selected.
                </div>
              ` : ''}

              <!-- Fulfillment Mode -->
              <div class="hub-search-field" style="margin-bottom: 1.25rem;">
                <label class="hub-search-label">🚚 Fulfillment & Logistics Mode</label>
                <div class="hub-booking-switch-box">
                  <button type="button" class="hub-booking-switch-btn ${this.bookingLogistics === 'delivery' ? 'active planned' : ''}" id="btn-booking-delivery">
                    Dedicated Site Delivery (+₹${deliveryFee})
                  </button>
                  <button type="button" class="hub-booking-switch-btn ${this.bookingLogistics === 'pickup' ? 'active planned' : ''}" id="btn-booking-pickup">
                    Depot Self Pickup (Free)
                  </button>
                </div>
              </div>

              <!-- Booking cost and advance breakdown -->
              <div style="background: var(--bg-muted); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.65rem;">
                  ${this.t('calculateTotal')} (${days} ${this.t('days')})
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-secondary);">${this.t('baseSubtotal')} (₹${dailyRate.toLocaleString()} × ${days} d)</span>
                  <span style="font-weight: 600;">₹${subtotal.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-secondary);">${this.t('securityDeposit')} (100% Refundable)</span>
                  <span style="font-weight: 600;">₹${deposit.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">Logistics & Fulfillment</span>
                  <span style="font-weight: 600;">₹${deliveryFee.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">
                  <span>${this.t('totalEstimate')}</span>
                  <span>₹${totalEstimated.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--primary);">
                  <span>Pay Token Advance Now (20%)</span>
                  <span>₹${tokenAdvance.toLocaleString()}</span>
                </div>
              </div>

              <!-- Direct UPI QR payment; payment is not verified by the app. -->
              <div class="hub-search-field" style="margin-bottom: 1.5rem;">
                <label class="hub-search-label" for="booking-upi-id">Receive payment at UPI ID</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="booking-upi-id" class="hub-search-input" style="min-width: 0; flex: 1;" value="${this.escapeHtml(upiId)}" placeholder="business@bank" autocomplete="off" />
                  <button type="button" class="hub-btn-outline" id="btn-generate-upi-qr">Show QR</button>
                </div>
                ${paymentUri && paymentUri.success ? `
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-top: 1rem;">
                    <div id="booking-upi-qr" role="img" aria-label="UPI payment QR code" style="width: 220px; height: 220px;"></div>
                    <a class="hub-btn-outline" href="${this.escapeHtml(paymentUri.uri)}" style="text-decoration: none;">Open UPI app</a>
                  </div>
                ` : `
                  <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0 0;">Enter the receiving merchant UPI ID to create a scan-to-pay QR.</p>
                `}
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.75rem 0 0;">Payment is not verified or shared with the recipient. A pending booking is saved only in this browser.</p>
              </div>

              <!-- Submit Button with Loading State -->
              <button
                class="hub-btn-primary"
                id="btn-confirm-booking-submit"
                style="width: 100%; padding: 0.85rem; font-size: 1rem;"
                ${this.bookingProcessing || !hasValidUpiId || !this.bookingQrReady ? 'disabled' : ''}
              >
                ${this.bookingProcessing ? 'Saving pending booking...' : `I’ve paid ₹${tokenAdvance.toLocaleString()} — Send for confirmation`}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderPaymentProcessingModal(item) {
      const steps = [
        'Submitting payment report',
        'Saving pending booking locally',
        'Manual confirmation required'
      ];
      return `
        <div class="hub-modal-overlay" id="modal-booking-overlay">
          <section class="hub-modal hub-payment-state-modal" role="status" aria-live="polite" aria-busy="true">
            <div class="hub-payment-state-icon"><span class="hub-payment-spinner"></span></div>
            <h3 class="hub-modal-title">${this.bookingProcessingStep === 0 ? 'Submitting payment report' : 'Saving your booking'}</h3>
            <p class="hub-payment-state-copy">${this.bookingProcessingStep === 0 ? 'Please keep this window open.' : this.escapeHtml(item.title)}</p>
            <ol class="hub-payment-progress-list">
              ${steps.map((step, index) => `
                <li class="${index < this.bookingProcessingStep ? 'is-complete' : index === this.bookingProcessingStep ? 'is-active' : ''}">
                  <span class="hub-payment-progress-marker">${index < this.bookingProcessingStep ? '✓' : index + 1}</span>
                  <span>${step}</span>
                </li>
              `).join('')}
            </ol>
            <p class="hub-payment-state-note">UPI transfer status is not available here. This screen only submits your payment report.</p>
          </section>
        </div>
      `;
    }

    renderPaymentResultModal(item) {
      const booking = this.bookingPaymentResult;
      return `
        <div class="hub-modal-overlay" id="modal-booking-overlay">
          <section class="hub-modal hub-payment-state-modal" role="status" aria-live="polite">
            <div class="hub-payment-pending-icon" aria-hidden="true">…</div>
            <h3 class="hub-modal-title">Payment pending</h3>
            <p class="hub-payment-state-copy">${this.escapeHtml(item.title)}</p>
            <div class="hub-payment-result-summary">
              <div><span>Advance amount</span><strong>₹${Number(booking.tokenPaid || 0).toLocaleString()}</strong></div>
              <div><span>Booking reference</span><strong>#${this.escapeHtml(booking.id)}</strong></div>
              <div><span>Payment status</span><strong>Pending · not verified</strong></div>
            </div>
            <p class="hub-payment-state-note">Payment has not been verified or confirmed by the app. The booking remains pending and is saved only in this browser; the recipient was not notified.</p>
            <button type="button" class="hub-btn-primary" id="btn-finish-payment" style="width: 100%; margin-top: 1rem;">Continue to bookings</button>
          </section>
        </div>
      `;
    }

    // 4. Provider Verification Dossier Modal
    renderVerificationModal() {
      if (!this.verificationModalOpen) return '';
      const user = window.authService ? window.authService.getCurrentUser() : null;

      return `
        <div class="hub-modal-overlay" id="modal-verification-overlay">
          <div class="hub-modal" style="max-width: 640px;">
            <div class="hub-modal-header">
              <div>
                <span class="hub-card-category">MMR Compliance</span>
                <h3 class="hub-modal-title">${this.t('verificationHeading')}</h3>
              </div>
              <button class="hub-modal-close-btn" id="btn-close-verification-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                ${this.t('verificationSubheading')}
              </p>

              <form id="form-provider-verification" style="display: flex; flex-direction: column; gap: 0.9rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('fullName')}</label>
                    <input type="text" id="verif-name" class="hub-search-input" value="${this.escapeHtml(user ? user.contactPerson || '' : '')}" required />
                  </div>
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('businessName')}</label>
                    <input type="text" id="verif-business-name" class="hub-search-input" value="${this.escapeHtml(user ? user.businessName || '' : '')}" required />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('businessType')}</label>
                    <select id="verif-business-type" class="hub-search-select">
                      ${(window.BUSINESS_TYPES || []).map(b => `<option value="${b}">${b}</option>`).join('')}
                    </select>
                  </div>
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('location')}</label>
                    <select id="verif-location" class="hub-search-select">
                      ${(window.locationService ? window.locationService.getLocationsList().filter(l => l !== 'All Locations (MMR)') : []).map(loc => `
                        <option value="${this.escapeHtml(loc)}">${this.escapeHtml(loc)}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('gstinLabel')}</label>
                    <input type="text" id="verif-gstin" class="hub-search-input" placeholder="27AAACI1234A1Z5" required />
                  </div>
                  <div class="hub-search-field">
                    <label class="hub-search-label">${this.t('fssaiLabel')}</label>
                    <input type="text" id="verif-fssai" class="hub-search-input" placeholder="11521001000452 or Trade License" />
                  </div>
                </div>

                <!-- 3–4 Photo Upload Validation Zone -->
                <div class="hub-search-field">
                  <label class="hub-search-label">📸 Upload Facility / Asset Photos (3 to 4 Photos Required)</label>
                  <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.4rem;">
                    ${this.t('uploadPhotosGuidance')}
                  </p>
                  
                  <div class="hub-upload-dropzone" id="verif-upload-dropzone">
                    <div style="font-size: 2rem; margin-bottom: 0.35rem;">📷</div>
                    <div style="font-weight: 700; font-size: 0.9rem;">Click or Drag Photos Here</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">PNG, JPG, WEBP (Max 5MB each)</div>
                    <input type="file" id="verif-file-input" multiple accept="image/*" style="display: none;" />
                  </div>

                  <!-- Previews Grid -->
                  <div class="hub-upload-previews-grid" id="verif-previews-grid">
                    ${this.verificationForm.photos.map((p, idx) => `
                      <div class="hub-upload-preview-card">
                        <img src="${p.previewUrl || p}" class="hub-upload-preview-img" />
                        <button type="button" class="hub-upload-remove-btn" data-remove-verif-photo="${idx}">✕</button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <button type="submit" class="hub-btn-primary" style="padding: 0.8rem; font-size: 0.95rem; width: 100%; margin-top: 0.5rem;">
                  🛡️ ${this.t('submitVerificationBtn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    // 5. Add Resource Modal (for Providers)
    renderAddResourceModal() {
      if (!this.addResourceModalOpen) return '';

      return `
        <div class="hub-modal-overlay" id="modal-add-resource-overlay">
          <div class="hub-modal" style="max-width: 680px;">
            <div class="hub-modal-header">
              <div>
                <span class="hub-card-category">Fleet Monetization</span>
                <h3 class="hub-modal-title">List New Hospitality Resource</h3>
              </div>
              <button class="hub-modal-close-btn" id="btn-close-add-resource-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <form id="form-add-resource" style="display: flex; flex-direction: column; gap: 0.9rem;">
                <div class="hub-search-field">
                  <label class="hub-search-label">Resource Title</label>
                  <input type="text" id="new-res-title" class="hub-search-input" placeholder="e.g. 10-Tray Commercial Rational Combi Oven" required />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">Category</label>
                    <select id="new-res-cat" class="hub-search-select">
                      <option value="Spaces">Spaces & Venues</option>
                      <option value="Kitchen">Kitchen & Catering</option>
                      <option value="Vehicle">Hospitality Fleet</option>
                      <option value="Furniture">Banquet Furniture</option>
                      <option value="Equipment">Staging & Event Rigging</option>
                      <option value="ColdChain">Cold Chain & Freezers</option>
                      <option value="Logistics">Heavy Logistics</option>
                      <option value="Utilities">Power & Generators</option>
                      <option value="Other">Fine Dining & Cutlery</option>
                    </select>
                  </div>

                  <div class="hub-search-field">
                    <label class="hub-search-label">MMR Location</label>
                    <select id="new-res-location" class="hub-search-select">
                      ${(window.locationService ? window.locationService.getLocationsList().filter(l => l !== 'All Locations (MMR)') : []).map(loc => `
                        <option value="${this.escapeHtml(loc)}">${this.escapeHtml(loc)}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                  <div class="hub-search-field">
                    <label class="hub-search-label">Daily Price (₹)</label>
                    <input type="number" id="new-res-price" class="hub-search-input" placeholder="8500" required />
                  </div>
                  <div class="hub-search-field">
                    <label class="hub-search-label">Refundable Deposit (₹)</label>
                    <input type="number" id="new-res-deposit" class="hub-search-input" placeholder="4000" />
                  </div>
                  <div class="hub-search-field">
                    <label class="hub-search-label">Units Available</label>
                    <input type="number" id="new-res-qty" class="hub-search-input" value="1" min="1" max="50" />
                  </div>
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">Technical Specifications (One per line)</label>
                  <textarea id="new-res-specs" class="hub-search-input" rows="3" placeholder="3-Phase 415V Power&#10;HACCP Compliance Certified&#10;Delivered with transit trolley"></textarea>
                </div>

                <!-- 3–4 Photos Required -->
                <div class="hub-search-field">
                  <label class="hub-search-label">📸 High-Resolution Photos (3 to 4 Photos Required)</label>
                  <div class="hub-upload-dropzone" id="new-res-dropzone">
                    <div style="font-size: 1.75rem;">📷</div>
                    <div style="font-weight: 700; font-size: 0.85rem;">Upload 3–4 Asset Photos</div>
                    <input type="file" id="new-res-file-input" multiple accept="image/*" style="display: none;" />
                  </div>

                  <div class="hub-upload-previews-grid" id="new-res-previews">
                    ${this.newResourceForm.photos.map((p, idx) => `
                      <div class="hub-upload-preview-card">
                        <img src="${p.previewUrl || p}" class="hub-upload-preview-img" />
                        <button type="button" class="hub-upload-remove-btn" data-remove-new-photo="${idx}">✕</button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <button type="submit" class="hub-btn-primary" style="padding: 0.85rem; font-size: 0.95rem; width: 100%; margin-top: 0.5rem;">
                  + Publish to MMR Marketplace
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    // 6. Write Review Modal (Gated to Completed Bookings)
    renderReviewModal() {
      if (!this.reviewModalItem) return '';
      const item = this.reviewModalItem;

      return `
        <div class="hub-modal-overlay" id="modal-review-overlay">
          <div class="hub-modal" style="max-width: 500px;">
            <div class="hub-modal-header">
              <h3 class="hub-modal-title">Review Verified Experience</h3>
              <button class="hub-modal-close-btn" id="btn-close-review-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                ${this.escapeHtml(item.title)}
              </div>
              <div style="font-size: 0.78rem; color: var(--primary); font-weight: 600; margin-bottom: 1rem;">
                ✓ Verified Completed Booking Eligibility Active
              </div>

              <form id="form-submit-review" style="display: flex; flex-direction: column; gap: 0.9rem;">
                <div class="hub-search-field">
                  <label class="hub-search-label">Star Rating (1 to 5)</label>
                  <select id="review-star-select" class="hub-search-select">
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                    <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                    <option value="2">⭐⭐ 2 Stars (Needs Improvement)</option>
                    <option value="1">⭐ 1 Star (Unsatisfactory)</option>
                  </select>
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">Review Headline</label>
                  <input type="text" id="review-title-input" class="hub-search-input" placeholder="e.g. Delivered on time and sanitized" required />
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">Detailed Feedback</label>
                  <textarea id="review-comment-input" class="hub-search-input" rows="4" placeholder="Describe the equipment condition, delivery punctuality, and operational support..." required></textarea>
                </div>

                <button type="submit" class="hub-btn-primary" style="padding: 0.75rem; width: 100%;">
                  Publish Verified Review
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    // 7. Profile & Settings Modal
    renderProfileSettingsModal() {
      if (!this.profileSettingsModalOpen) return '';
      const user = window.authService ? window.authService.getCurrentUser() : null;
      if (!user) return '';

      return `
        <div class="hub-modal-overlay" id="modal-settings-overlay">
          <div class="hub-modal" style="max-width: 580px;">
            <div class="hub-modal-header">
              <h3 class="hub-modal-title">${this.t('profileSettings')}</h3>
              <button class="hub-modal-close-btn" id="btn-close-settings-modal">✕</button>
            </div>

            <div class="hub-modal-body">
              <form id="form-profile-settings" style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="hub-search-field">
                  <label class="hub-search-label">${this.t('businessName')}</label>
                  <input type="text" id="prof-biz-name" class="hub-search-input" value="${this.escapeHtml(user.businessName)}" required />
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">${this.t('fullName')}</label>
                  <input type="text" id="prof-contact" class="hub-search-input" value="${this.escapeHtml(user.contactPerson || '')}" required />
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">${this.t('phone')}</label>
                  <input type="tel" id="prof-phone" class="hub-search-input" value="${this.escapeHtml(user.phone || '')}" required />
                </div>

                <div class="hub-search-field">
                  <label class="hub-search-label">${this.t('location')}</label>
                  <select id="prof-location" class="hub-search-select">
                    ${(window.locationService ? window.locationService.getLocationsList().filter(l => l !== 'All Locations (MMR)') : []).map(loc => `
                      <option value="${this.escapeHtml(loc)}" ${user.location === loc ? 'selected' : ''}>${this.escapeHtml(loc)}</option>
                    `).join('')}
                  </select>
                </div>

                <button type="submit" class="hub-btn-primary" style="padding: 0.75rem; width: 100%; margin-top: 0.5rem;">
                  Save Profile Settings
                </button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    // --- DOM Event Bindings ---
    bindEvents() {
      // 1. Navigation clicks
      document.querySelectorAll('[data-nav]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const target = el.getAttribute('data-nav');
          this.switchView(target);
        });
      });

      // Logo click
      const logo = document.getElementById('nav-logo');
      if (logo) {
        logo.addEventListener('click', () => this.switchView('explore'));
      }

      // Theme toggle
      const themeBtn = document.getElementById('btn-theme-toggle');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          this.setTheme(this.theme === 'light' ? 'dark' : 'light');
        });
      }

      // Lang toggle
      const langBtn = document.getElementById('btn-lang-toggle');
      if (langBtn) {
        langBtn.addEventListener('click', () => {
          this.setLang(this.lang === 'en' ? 'hi' : 'en');
        });
      }

      // Quick location toggle
      const quickLoc = document.getElementById('btn-quick-loc-toggle');
      if (quickLoc) {
        quickLoc.addEventListener('click', () => {
          const select = document.getElementById('search-location-select');
          if (select) {
            select.scrollIntoView({ behavior: 'smooth', block: 'center' });
            select.focus();
          } else {
            this.switchView('explore');
          }
        });
      }

      // Notifications toggle
      const notifsBtn = document.getElementById('btn-notifications-toggle');
      if (notifsBtn) {
        notifsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.notificationsOpen = !this.notificationsOpen;
          this.userMenuOpen = false;
          this.render();
        });
      }

      const closeNotifs = document.getElementById('btn-close-notifs');
      if (closeNotifs) {
        closeNotifs.addEventListener('click', () => {
          this.notificationsOpen = false;
          this.render();
        });
      }

      // User Menu dropdown toggle
      const userMenuBtn = document.getElementById('btn-user-menu-toggle');
      if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.userMenuOpen = !this.userMenuOpen;
          this.notificationsOpen = false;
          this.render();
        });
      }

      // Auth Trigger buttons
      const loginBtn = document.getElementById('btn-header-login');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          this.authModalMode = 'login';
          this.authModalOpen = true;
          this.render();
        });
      }

      const signupBtn = document.getElementById('btn-header-signup');
      if (signupBtn) {
        signupBtn.addEventListener('click', () => {
          this.authModalMode = 'register';
          this.authModalOpen = true;
          this.render();
        });
      }

      const closeAuth = document.getElementById('btn-close-auth-modal');
      if (closeAuth) {
        closeAuth.addEventListener('click', () => {
          this.authModalOpen = false;
          this.render();
        });
      }

      const switchSignup = document.getElementById('btn-switch-signup');
      if (switchSignup) {
        switchSignup.addEventListener('click', () => {
          this.authModalMode = 'register';
          this.render();
        });
      }

      const switchLogin = document.getElementById('btn-switch-login');
      if (switchLogin) {
        switchLogin.addEventListener('click', () => {
          this.authModalMode = 'login';
          this.render();
        });
      }

      // Password Strength live meter
      const regPass = document.getElementById('reg-password');
      if (regPass) {
        regPass.addEventListener('input', (e) => {
          const val = e.target.value;
          const meter = document.getElementById('password-strength-meter');
          if (meter && window.authService) {
            const evalResult = window.authService.evaluatePasswordStrength(val);
            meter.style.color = evalResult.color;
            meter.textContent = `Strength: ${evalResult.label}`;
          }
        });
      }

      // Header List Resource CTA
      const headerListBtn = document.getElementById('btn-header-list-resource');
      if (headerListBtn) {
        headerListBtn.addEventListener('click', () => {
          if (!window.authService || !window.authService.isAuthenticated()) {
            this.showToast('Please sign in to list commercial assets.', 'info');
            this.authModalMode = 'login';
            this.authModalOpen = true;
            this.render();
            return;
          }
          this.addResourceModalOpen = true;
          this.render();
        });
      }

      // User Menu Actions
      document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const action = btn.getAttribute('data-action');

          if (action === 'go-dashboard') {
            const isProv = window.authService && window.authService.isProvider();
            this.switchView(isProv ? 'provider-dashboard' : 'seeker-dashboard');
          } else if (action === 'switch-role') {
            const current = window.authService.getCurrentUser();
            const newRole = window.authService.isProvider() ? 'Seeker' : 'Provider';
            await window.authService.updateProfile({ role: newRole, accountType: newRole.toLowerCase() });
            this.showToast(`Switched role to ${newRole}`, 'success');
            this.switchView(newRole === 'Provider' ? 'provider-dashboard' : 'seeker-dashboard');
          } else if (action === 'go-profile-settings') {
            this.userMenuOpen = false;
            this.profileSettingsModalOpen = true;
            this.render();
          } else if (action === 'logout') {
            window.authService.logout();
            this.showToast('Logged out successfully.', 'info');
            this.switchView('explore');
          } else if (action === 'view-details') {
            const id = btn.getAttribute('data-id');
            const item = window.resourceService ? window.resourceService.getResourceById(id) : null;
            if (item) {
              this.detailModalItem = item;
              this.detailActivePhotoIdx = 0;
              this.render();
            }
          } else if (action === 'book-now') {
            const id = btn.getAttribute('data-id');
            const item = window.resourceService ? window.resourceService.getResourceById(id) : null;
            if (item) {
              this.bookingModalItem = item;
              this.bookingStartDate = this.searchStartDate || new Date().toISOString().split('T')[0];
              const nextDay = new Date();
              nextDay.setDate(nextDay.getDate() + 2);
              this.bookingEndDate = this.searchEndDate || nextDay.toISOString().split('T')[0];
              this.bookingDays = 2;
              this.render();
            }
          } else if (action === 'cancel-booking') {
            const bookingId = btn.getAttribute('data-id');
            if (confirm(`Are you sure you want to cancel booking #${bookingId}? This will release the calendar dates back to the marketplace.`)) {
              const res = await window.bookingService.cancelBooking(bookingId, 'Cancelled by user from dashboard');
              if (res.success) {
                this.showToast(res.message, 'success');
                this.render();
              } else {
                this.showToast(res.error, 'error');
              }
            }
          } else if (action === 'write-review') {
            const resId = btn.getAttribute('data-resource-id');
            const item = window.resourceService ? window.resourceService.getResourceById(resId) : null;
            if (item) {
              this.reviewModalItem = item;
              this.render();
            }
          } else if (action === 'delete-resource') {
            const resId = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to remove this resource listing from the marketplace?')) {
              await window.resourceService.deleteResource(resId);
              this.showToast('Resource listing removed.', 'info');
              this.render();
            }
          }
        });
      });

      // Search Inputs & Filters
      const queryInput = document.getElementById('search-query-input');
      if (queryInput) {
        queryInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
        });
      }

      const locSelect = document.getElementById('search-location-select');
      if (locSelect) {
        locSelect.addEventListener('change', (e) => {
          this.searchLocation = e.target.value;
          this.render();
        });
      }

      const startInput = document.getElementById('search-start-date');
      if (startInput) {
        startInput.addEventListener('change', (e) => {
          this.searchStartDate = e.target.value;
        });
      }

      const endInput = document.getElementById('search-end-date');
      if (endInput) {
        endInput.addEventListener('change', (e) => {
          this.searchEndDate = e.target.value;
        });
      }

      const sortSelect = document.getElementById('sort-by-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.searchSortBy = e.target.value;
          this.render();
        });
      }

      const submitSearch = document.getElementById('btn-submit-search');
      if (submitSearch) {
        submitSearch.addEventListener('click', () => {
          this.render();
        });
      }

      // Reset / Clear Filters buttons
      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetFilters());
      }
      const emptyReset = document.getElementById('btn-empty-reset');
      if (emptyReset) {
        emptyReset.addEventListener('click', () => this.resetFilters());
      }

      // Category Navigation Pills
      document.querySelectorAll('.hub-category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const cat = pill.getAttribute('data-cat');
          this.selectedCategory = cat;
          this.render();
        });
      });

      // Planned vs Emergency switches
      const btnPlanned = document.getElementById('btn-toggle-planned');
      if (btnPlanned) {
        btnPlanned.addEventListener('click', () => {
          this.searchBookingType = this.searchBookingType === 'Planned' ? 'All' : 'Planned';
          this.render();
        });
      }
      const btnEmerg = document.getElementById('btn-toggle-emergency');
      if (btnEmerg) {
        btnEmerg.addEventListener('click', () => {
          this.searchBookingType = this.searchBookingType === 'Emergency' ? 'All' : 'Emergency';
          this.render();
        });
      }

      // Card Multi-Photo Dot Previews
      document.querySelectorAll('[data-card-dot]').forEach(dot => {
        dot.addEventListener('mouseenter', () => {
          const cardId = dot.getAttribute('data-card-dot');
          const imgSrc = dot.getAttribute('data-img-src');
          const imgEl = document.getElementById(`card-img-${cardId}`);
          if (imgEl) {
            imgEl.src = imgSrc;
          }
          document.querySelectorAll(`[data-card-dot="${cardId}"]`).forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
        });
      });

      // Detail Modal Thumbnail Click
      document.querySelectorAll('.hub-detail-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = parseInt(thumb.getAttribute('data-idx'), 10);
          this.detailActivePhotoIdx = idx;
          this.render();
        });
      });

      const closeDetail = document.getElementById('btn-close-detail-modal');
      if (closeDetail) {
        closeDetail.addEventListener('click', () => {
          this.detailModalItem = null;
          this.render();
        });
      }

      // Booking Modal Controls
      const closeBooking = document.getElementById('btn-close-booking-modal');
      if (closeBooking) {
        closeBooking.addEventListener('click', () => {
          this.bookingModalItem = null;
          this.render();
        });
      }

      const finishPayment = document.getElementById('btn-finish-payment');
      if (finishPayment) {
        finishPayment.addEventListener('click', () => {
          this.bookingPaymentResult = null;
          this.bookingModalItem = null;
          this.detailModalItem = null;
          this.switchView('seeker-dashboard');
        });
      }

      const bkgStart = document.getElementById('booking-start-date');
      if (bkgStart) {
        bkgStart.addEventListener('change', (e) => {
          this.bookingStartDate = e.target.value;
          this.calculateBookingDays();
          this.render();
        });
      }

      const bkgEnd = document.getElementById('booking-end-date');
      if (bkgEnd) {
        bkgEnd.addEventListener('change', (e) => {
          this.bookingEndDate = e.target.value;
          this.calculateBookingDays();
          this.render();
        });
      }

      const bkgDeliv = document.getElementById('btn-booking-delivery');
      if (bkgDeliv) {
        bkgDeliv.addEventListener('click', () => {
          this.bookingLogistics = 'delivery';
          this.render();
        });
      }

      const bkgPickup = document.getElementById('btn-booking-pickup');
      if (bkgPickup) {
        bkgPickup.addEventListener('click', () => {
          this.bookingLogistics = 'pickup';
          this.render();
        });
      }

      const generateUpiQr = document.getElementById('btn-generate-upi-qr');
      if (generateUpiQr) {
        generateUpiQr.addEventListener('click', () => {
          const upiInput = document.getElementById('booking-upi-id');
          const savedUpi = window.paymentService.saveUpiId(upiInput ? upiInput.value : '');
          if (!savedUpi.success) {
            this.showToast(savedUpi.error, 'error');
            return;
          }
          this.bookingUpiId = savedUpi.upiId;
          this.render();
        });
      }

      // Confirm Booking Submit Handler
      const confirmBooking = document.getElementById('btn-confirm-booking-submit');
      if (confirmBooking) {
        confirmBooking.addEventListener('click', async () => {
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (!user) {
            this.showToast('Please sign in to confirm booking reservation.', 'info');
            this.authModalMode = 'login';
            this.authModalOpen = true;
            this.render();
            return;
          }

          if (!this.bookingStartDate || !this.bookingEndDate) {
            this.showToast('Please select both start and end dates.', 'error');
            return;
          }

          if (!window.paymentService.isValidUpiId(this.bookingUpiId)) {
            this.showToast('Enter a valid merchant UPI ID and generate the payment QR first.', 'error');
            return;
          }

          this.bookingProcessing = true;
          this.bookingProcessingStep = 0;
          this.render();

          let bookingRes;
          try {
            await new Promise(resolve => setTimeout(resolve, 650));
            this.bookingProcessingStep = 1;
            this.render();
            await new Promise(resolve => setTimeout(resolve, 650));
            bookingRes = await window.bookingService.createBooking({
              resourceId: this.bookingModalItem.id,
              resourceTitle: this.bookingModalItem.title,
              category: this.bookingModalItem.category,
              providerEmail: this.bookingModalItem.ownerEmail || '',
              providerBusiness: this.bookingModalItem.shopName,
              seekerEmail: user.email,
              seekerBusiness: user.businessName,
              seekerPhone: user.phone,
              startDate: this.bookingStartDate,
              endDate: this.bookingEndDate,
              dailyRate: this.bookingModalItem.pricePerDay,
              securityDeposit: this.bookingModalItem.securityDeposit,
              logisticsFee: this.bookingLogistics === 'delivery' ? (this.bookingModalItem.category === 'Spaces' ? 0 : 850) : 0,
              paymentMethod: 'UPI QR (manual confirmation)',
              paymentStatus: 'Pending payment verification',
              status: 'Pending',
              localOnly: true,
              notes: 'Payment was self-reported after scanning a UPI QR. It has not been verified by the app.'
            });
          } catch (error) {
            bookingRes = { success: false, error: error.message || 'Could not save the pending booking.' };
          } finally {
            this.bookingProcessing = false;
          }

          if (bookingRes.success) {
            this.bookingPaymentResult = bookingRes.booking;
            this.render();
          } else {
            this.showToast(bookingRes.error, 'error');
            this.render();
          }
        });
      }

      // Verification Modal & 3–4 Photo Upload Validation
      const openVerif = document.getElementById('btn-open-verification-modal');
      if (openVerif) {
        openVerif.addEventListener('click', () => {
          this.verificationModalOpen = true;
          this.render();
        });
      }
      const bannerVerif = document.getElementById('btn-banner-verify');
      if (bannerVerif) {
        bannerVerif.addEventListener('click', () => {
          this.verificationModalOpen = true;
          this.render();
        });
      }
      const joinProv = document.getElementById('btn-join-as-provider');
      if (joinProv) {
        joinProv.addEventListener('click', () => {
          this.verificationModalOpen = true;
          this.render();
        });
      }
      const closeVerif = document.getElementById('btn-close-verification-modal');
      if (closeVerif) {
        closeVerif.addEventListener('click', () => {
          this.verificationModalOpen = false;
          this.render();
        });
      }

      // Dropzone for Verification Photos
      const verifDrop = document.getElementById('verif-upload-dropzone');
      const verifInput = document.getElementById('verif-file-input');
      if (verifDrop && verifInput) {
        verifDrop.addEventListener('click', () => verifInput.click());
        verifInput.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          const valCheck = window.uploadService.validateBatch(this.verificationForm.photos.length, files);
          if (!valCheck.valid) {
            this.showToast(valCheck.error, 'error');
            return;
          }

          for (const file of files) {
            const processed = await window.uploadService.processFileForPreview(file);
            this.verificationForm.photos.push(processed);
          }
          this.render();
        });
      }

      // Remove photo from verification dossier
      document.querySelectorAll('[data-remove-verif-photo]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-remove-verif-photo'), 10);
          this.verificationForm.photos.splice(idx, 1);
          this.render();
        });
      });

      // Submit Verification Dossier
      const formVerif = document.getElementById('form-provider-verification');
      if (formVerif) {
        formVerif.addEventListener('submit', async (e) => {
          e.preventDefault();
          const user = window.authService ? window.authService.getCurrentUser() : null;
          const payload = {
            fullName: document.getElementById('verif-name').value,
            businessName: document.getElementById('verif-business-name').value,
            businessType: document.getElementById('verif-business-type').value,
            location: document.getElementById('verif-location').value,
            contactPhone: user ? user.phone : '+91 98200 12345',
            email: user ? user.email : 'provider@mmrhub.in',
            gstin: document.getElementById('verif-gstin').value,
            fssaiLicense: document.getElementById('verif-fssai').value,
            photos: this.verificationForm.photos
          };

          const res = await window.providerService.submitVerification(payload);
          if (res.success) {
            this.verificationModalOpen = false;
            this.showToast(res.message, 'success');
            this.switchView('provider-dashboard');
          } else {
            this.showToast(res.error, 'error');
          }
        });
      }

      // Add Resource Modal Controls
      const openAddRes = document.getElementById('btn-open-add-resource');
      if (openAddRes) openAddRes.addEventListener('click', () => { this.addResourceModalOpen = true; this.render(); });
      const openAddResInline = document.getElementById('btn-open-add-resource-inline');
      if (openAddResInline) openAddResInline.addEventListener('click', () => { this.addResourceModalOpen = true; this.render(); });
      const openAddResEmpty = document.getElementById('btn-empty-add-resource');
      if (openAddResEmpty) openAddResEmpty.addEventListener('click', () => { this.addResourceModalOpen = true; this.render(); });

      const closeAddRes = document.getElementById('btn-close-add-resource-modal');
      if (closeAddRes) closeAddRes.addEventListener('click', () => { this.addResourceModalOpen = false; this.render(); });

      // Dropzone for New Resource 3–4 Photos
      const newResDrop = document.getElementById('new-res-dropzone');
      const newResInput = document.getElementById('new-res-file-input');
      if (newResDrop && newResInput) {
        newResDrop.addEventListener('click', () => newResInput.click());
        newResInput.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          const valCheck = window.uploadService.validateBatch(this.newResourceForm.photos.length, files);
          if (!valCheck.valid) {
            this.showToast(valCheck.error, 'error');
            return;
          }

          for (const file of files) {
            const processed = await window.uploadService.processFileForPreview(file);
            this.newResourceForm.photos.push(processed);
          }
          this.render();
        });
      }

      // Remove photo from new resource form
      document.querySelectorAll('[data-remove-new-photo]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-remove-new-photo'), 10);
          this.newResourceForm.photos.splice(idx, 1);
          this.render();
        });
      });

      // Submit Add Resource Form
      const formAddRes = document.getElementById('form-add-resource');
      if (formAddRes) {
        formAddRes.addEventListener('submit', async (e) => {
          e.preventDefault();
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (this.newResourceForm.photos.length < 3) {
            this.showToast('Please upload between 3 and 4 authentic high-resolution photos.', 'error');
            return;
          }

          const payload = {
            title: document.getElementById('new-res-title').value,
            category: document.getElementById('new-res-cat').value,
            shopName: user ? user.businessName : 'Enterprise Supplier',
            ownerEmail: user ? user.email : 'provider@mmrhub.in',
            location: document.getElementById('new-res-location').value,
            pricePerDay: Number(document.getElementById('new-res-price').value),
            securityDeposit: Number(document.getElementById('new-res-deposit').value || 3000),
            quantityAvailable: Number(document.getElementById('new-res-qty').value || 1),
            specifications: document.getElementById('new-res-specs').value,
            photos: this.newResourceForm.photos,
            instantDispatchAvailable: false
          };

          const res = await window.resourceService.addResource(payload);
          if (res.success) {
            this.addResourceModalOpen = false;
            this.newResourceForm.photos = [];
            this.showToast(res.message, 'success');
            this.render();
          } else {
            this.showToast(res.error, 'error');
          }
        });
      }

      // Review Modal Submit
      const formReview = document.getElementById('form-submit-review');
      if (formReview) {
        formReview.addEventListener('submit', async (e) => {
          e.preventDefault();
          const user = window.authService ? window.authService.getCurrentUser() : null;
          if (!user) {
            this.showToast('Please sign in to submit a verified review.', 'info');
            return;
          }

          const payload = {
            resourceId: this.reviewModalItem.id,
            rating: Number(document.getElementById('review-star-select').value),
            title: document.getElementById('review-title-input').value,
            comment: document.getElementById('review-comment-input').value,
            reviewerName: user.contactPerson || user.businessName,
            reviewerCompany: user.businessName,
            reviewerEmail: user.email
          };

          const res = await window.reviewService.submitReview(payload);
          if (res.success) {
            this.reviewModalItem = null;
            this.showToast(res.message, 'success');
            this.render();
          } else {
            this.showToast(res.error, 'error');
          }
        });
      }

      const closeReview = document.getElementById('btn-close-review-modal');
      if (closeReview) {
        closeReview.addEventListener('click', () => {
          this.reviewModalItem = null;
          this.render();
        });
      }

      // Login Form Submit
      const formLogin = document.getElementById('form-login');
      if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const remember = document.getElementById('login-remember').checked;

          const res = await window.authService.login(email, password, remember);
          if (res.success) {
            this.authModalOpen = false;
            this.showToast(res.message, 'success');
            this.render();
          } else {
            this.showToast(res.error, 'error');
          }
        });
      }

      // Registration Form Submit
      const formReg = document.getElementById('form-register');
      if (formReg) {
        formReg.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            businessName: document.getElementById('reg-business-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            location: document.getElementById('reg-location').value,
            password: document.getElementById('reg-password').value,
            confirmPassword: document.getElementById('reg-confirm-password').value,
            accountType: document.getElementById('btn-reg-provider').classList.contains('active') ? 'provider' : 'seeker'
          };

          const res = await window.authService.register(payload);
          if (res.success) {
            this.authModalOpen = false;
            this.showToast(res.message, 'success');
            this.render();
          } else {
            this.showToast(res.error, 'error');
          }
        });
      }

      // Settings Modal Submit
      const formSettings = document.getElementById('form-profile-settings');
      if (formSettings) {
        formSettings.addEventListener('submit', async (e) => {
          e.preventDefault();
          const updates = {
            businessName: document.getElementById('prof-biz-name').value,
            contactPerson: document.getElementById('prof-contact').value,
            phone: document.getElementById('prof-phone').value,
            location: document.getElementById('prof-location').value
          };
          await window.authService.updateProfile(updates);
          this.profileSettingsModalOpen = false;
          this.showToast('Profile settings saved successfully.', 'success');
          this.render();
        });
      }

      const closeSettings = document.getElementById('btn-close-settings-modal');
      if (closeSettings) {
        closeSettings.addEventListener('click', () => {
          this.profileSettingsModalOpen = false;
          this.render();
        });
      }

      // Hero Buttons Navigation
      const heroExplore = document.getElementById('btn-hero-explore-from-hiw');
      if (heroExplore) heroExplore.addEventListener('click', () => this.switchView('explore'));
      const heroList = document.getElementById('btn-hero-list-from-hiw');
      if (heroList) heroList.addEventListener('click', () => this.switchView('provider-dashboard'));

      // Close dropdowns on outside click
      window.addEventListener('click', (e) => {
        if (!e.target.closest('.hub-user-menu') && !e.target.closest('#btn-notifications-toggle')) {
          if (this.userMenuOpen || this.notificationsOpen) {
            this.userMenuOpen = false;
            this.notificationsOpen = false;
            this.render();
          }
        }
      }, { once: true });
    }

    calculateBookingDays() {
      if (!this.bookingStartDate || !this.bookingEndDate) {
        this.bookingDays = 1;
        return;
      }
      const start = new Date(this.bookingStartDate);
      const end = new Date(this.bookingEndDate);
      const diffTime = Math.abs(end - start);
      this.bookingDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  // Mount Application on DOM Ready
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      window.app = new HospitalityHubApp();
    });
  }
})();
