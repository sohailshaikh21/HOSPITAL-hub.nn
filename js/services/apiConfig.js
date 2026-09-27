/**
 * HospitalityHub B2B Resource Exchange
 * Central API Configuration & Network Layer
 * 
 * Provides unified HTTP request abstraction with automatic fallback,
 * timeout handling, and backend connectivity detection.
 */

(function(window) {
  'use strict';

  // A static preview server (for example VS Code Live Server on :5500) cannot
  // handle the Express API routes. Route local previews to the API server while
  // retaining same-origin `/api` requests when the app is served by Express or
  // a deployed host.
  function resolveApiBaseUrl() {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL.replace(/\/$/, '');
    }

    const { protocol, hostname, port } = window.location || {};
    const isLocalPreview =
      (hostname === 'localhost' || hostname === '127.0.0.1') &&
      port &&
      port !== '3001';

    return isLocalPreview ? `${protocol}//${hostname}:3001/api` : '/api';
  }

  const API_CONFIG = {
    // Backend API Base URL (can be customized via window.APP_CONFIG or environment)
    BASE_URL: resolveApiBaseUrl(),
    TIMEOUT_MS: 8000,
    USE_MOCK_FALLBACK: true,
    IS_BACKEND_CONNECTED: false,
    
    // Security & Header configuration
    getHeaders: function(customHeaders = {}) {
      const headers = {
        'Content-Type': 'application/json',
        ...customHeaders
      };
      
      const currentUser = window.authService ? window.authService.getCurrentUser() : null;
      if (currentUser && currentUser.email) {
        headers['x-user-email'] = currentUser.email;
      }
      if (currentUser && currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }
      return headers;
    },

    // Health check to verify if backend is reachable
    checkBackendHealth: async function() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${this.BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          this.IS_BACKEND_CONNECTED = true;
          return true;
        }
      } catch (e) {
        this.IS_BACKEND_CONNECTED = false;
      }
      this.IS_BACKEND_CONNECTED = false;
      return false;
    },

    // Generic HTTP Request Handler
    request: async function(endpoint, options = {}) {
      const url = endpoint.startsWith('http') ? endpoint : `${this.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.TIMEOUT_MS);

      const requestOptions = {
        ...options,
        headers: this.getHeaders(options.headers),
        signal: controller.signal
      };

      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(data.error || data.message || `HTTP ${response.status}: Request failed`);
        }
        
        return { success: true, data, fromBackend: true };
      } catch (error) {
        clearTimeout(timeoutId);
        return {
          success: false,
          error: error.message || 'Network error occurred',
          fromBackend: false
        };
      }
    }
  };

  // Run initial health check in background
  if (typeof window !== 'undefined') {
    API_CONFIG.checkBackendHealth();
    window.API_CONFIG = API_CONFIG;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
  }
})(typeof window !== 'undefined' ? window : global);
