/**
 * HospitalityHub B2B Resource Exchange
 * Resource Inventory & Search Service (MMR Scope)
 * 
 * Provides high-performance querying, multi-factor Smart Match calculations,
 * date-based calendar availability filtering, and CRUD operations for providers.
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'hub_inventory_v3';

  class ResourceService {
    constructor() {
      this.inventory = this.loadInventory();
    }

    loadInventory() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cachedTable = parsed.find(item => item.id === 'hub-08');
            const seedTable = (window.inventoryData || []).find(item => item.id === 'hub-08');
            const oldTablePhoto = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80';
            if (cachedTable && seedTable && (cachedTable.image === oldTablePhoto || cachedTable.photos?.[0] === oldTablePhoto)) {
              cachedTable.image = seedTable.image;
              cachedTable.photos = [...seedTable.photos];
            }
            return parsed;
          }
        }
      } catch (e) {}
      return window.inventoryData || [];
    }

    saveInventory() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inventory));
      } catch (e) {}
    }

    // Refresh inventory from global seed if needed
    resetToDefaultFleet() {
      this.inventory = JSON.parse(JSON.stringify(window.inventoryData || []));
      this.saveInventory();
      return this.inventory;
    }

    // Get all resources
    getAllResources() {
      return this.inventory;
    }

    // Get resource by ID
    getResourceById(id) {
      if (!id) return null;
      return this.inventory.find(item => item.id === id) || null;
    }

    // Get all Spaces specifically
    getSpaces() {
      return this.inventory.filter(item => item.category === 'Spaces');
    }

    // Get all non-space physical equipment & logistics resources
    getPhysicalResources() {
      return this.inventory.filter(item => item.category !== 'Spaces');
    }

    // Get resources belonging to a specific provider
    getProviderResources(providerEmailOrShopName) {
      if (!providerEmailOrShopName) return [];
      const query = providerEmailOrShopName.toLowerCase();
      return this.inventory.filter(item =>
        (item.ownerEmail && item.ownerEmail.toLowerCase() === query) ||
        (item.shopName && item.shopName.toLowerCase() === query)
      );
    }

    // Smart Match Score (78% to 99%)
    calculateMatchScore(item, distanceKm, isEmergency = false) {
      let score = 94;
      if (distanceKm < 5) score += 3;
      else if (distanceKm > 15) score -= 5;
      
      if (item.rating >= 4.9) score += 2;
      if (item.instantDispatchAvailable) score += 2;
      if (isEmergency && !item.instantDispatchAvailable) score -= 12;
      
      // If booked/locked today
      if (window.bookingService) {
        const isAvail = window.bookingService.isResourceAvailableForDates(item);
        if (!isAvail) score -= 18;
      }

      return Math.min(99, Math.max(76, score));
    }

    // Primary Query Engine with Date-Based Collision & Availability Checks
    queryResources(filters = {}) {
      const {
        searchQuery = '',
        category = 'all',
        location = 'All Locations (MMR)',
        startDate = '',
        endDate = '',
        minPrice = 0,
        maxPrice = Infinity,
        minRating = 0,
        bookingType = 'All', // 'All' | 'Planned' | 'Emergency'
        instantOnly = false,
        sortBy = 'smartMatch' // 'smartMatch' | 'priceAsc' | 'priceDesc' | 'rating' | 'distance'
      } = filters;

      const results = this.inventory.filter(item => {
        // 1. Category Filter (Ensuring "Audio", "Whole Chain", "Free Booking" are excluded if in Explore)
        if (category && category !== 'all') {
          if (item.category !== category) return false;
        }

        // 2. Location Filter (Strict MMR)
        if (location && location !== 'All Locations (MMR)') {
          if (item.location !== location) return false;
        }

        // 3. Search Text (Title, shop name, specs, description, category)
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchShop = item.shopName.toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchCat = (item.category || '').toLowerCase().includes(q);
          const matchSpecs = item.specifications && item.specifications.some(s => s.toLowerCase().includes(q));
          if (!matchTitle && !matchShop && !matchDesc && !matchCat && !matchSpecs) {
            return false;
          }
        }

        // 4. Date-Based Calendar Availability Filter (CRITICAL REQUIREMENT)
        if (startDate || endDate) {
          if (window.bookingService) {
            const isAvail = window.bookingService.isResourceAvailableForDates(item, startDate, endDate);
            if (!isAvail) return false;
          }
        }

        // 5. Price Filter
        if (item.pricePerDay < minPrice) return false;
        if (maxPrice && maxPrice < Infinity && item.pricePerDay > maxPrice) return false;

        // 6. Rating Filter
        if (minRating > 0 && (item.rating || 0) < minRating) return false;

        // 7. Booking Type / Emergency Filter
        if (bookingType === 'Emergency' && !item.instantDispatchAvailable) return false;
        if (bookingType === 'Planned' && item.bookingType === 'Emergency' && !item.instantDispatchAvailable) return false;
        if (instantOnly && !item.instantDispatchAvailable) return false;

        return true;
      });

      // Compute dynamic distance and match score for sorting
      const originCoords = (window.MMR_CLIENT_ORIGIN && window.MMR_CLIENT_ORIGIN.coordinates) || { lat: 19.0674, lng: 72.8687 };
      
      const enriched = results.map(item => {
        const itemCoords = item.coordinates || (window.locationService ? window.locationService.getCoordinates(item.location) : originCoords);
        const distKm = window.locationService ? window.locationService.calculateDistanceKm(originCoords, itemCoords) : 5.2;
        const matchScore = this.calculateMatchScore(item, distKm, bookingType === 'Emergency');
        
        // Check live locked dates
        const lockedDates = window.bookingService ? window.bookingService.getLockedDatesForResource(item.id) : [];
        const isLockedNow = lockedDates.includes(new Date().toISOString().split('T')[0]);

        return {
          ...item,
          distanceKm: distKm,
          smartMatchScore: matchScore,
          isCurrentlyLocked: isLockedNow,
          lockedDates
        };
      });

      // Sorting
      enriched.sort((a, b) => {
        if (sortBy === 'priceAsc') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'priceDesc') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        return b.smartMatchScore - a.smartMatchScore; // Default smartMatch
      });

      return enriched;
    }

    // Update availability indicator
    updateResourceAvailability(resourceId) {
      const item = this.getResourceById(resourceId);
      if (!item) return;

      if (window.bookingService) {
        const todayStr = new Date().toISOString().split('T')[0];
        const lockedDates = window.bookingService.getLockedDatesForResource(resourceId);
        item.availabilityStatus = lockedDates.includes(todayStr) ? 'Pre-booked' : 'Available';
        item.bookedDates = lockedDates;
        this.saveInventory();
      }
    }

    // Add new Resource (for verified Providers)
    async addResource(resourcePayload) {
      const {
        title,
        category,
        shopName,
        ownerEmail,
        location,
        pricePerDay,
        securityDeposit,
        quantityAvailable,
        description,
        specifications,
        photos,
        instantDispatchAvailable,
        timeSlots
      } = resourcePayload;

      if (!title || !category || !shopName || !pricePerDay || !location) {
        return { success: false, error: 'Please fill in all mandatory resource specifications.' };
      }

      if (window.locationService && !window.locationService.isValidMMRLocation(location)) {
        return { success: false, error: 'Resource location must be within Mumbai Metropolitan Region (MMR).' };
      }

      if (!photos || photos.length < 3 || photos.length > 4) {
        return { success: false, error: 'Please upload between 3 and 4 authentic high-resolution photos.' };
      }

      const newId = `hub-${Date.now().toString().slice(-4)}`;
      const coords = window.locationService ? window.locationService.getCoordinates(location) : { lat: 19.0674, lng: 72.8687 };

      const newResource = {
        id: newId,
        title: title.trim(),
        category,
        shopName: shopName.trim(),
        vendorType: "Commercial Partner",
        ownerEmail: ownerEmail ? ownerEmail.toLowerCase() : '',
        location,
        fulfillmentType: category === 'Spaces' ? 'Depot Self Pickup' : 'Dedicated Site Delivery',
        pricePerDay: Number(pricePerDay),
        securityDeposit: Number(securityDeposit || Math.round(pricePerDay * 0.4)),
        quantityAvailable: Number(quantityAvailable || 1),
        availabilityStatus: "Available",
        bookingType: instantDispatchAvailable ? "Emergency" : "Planned",
        verified: true,
        rating: 5.0,
        reviewsCount: 0,
        completedRentals: 0,
        description: description || 'High-performance verified commercial hospitality asset.',
        specifications: Array.isArray(specifications) ? specifications : (specifications || '').split('\n').filter(Boolean),
        photos: photos.map(p => (typeof p === 'string' ? p : p.previewUrl || p.dataUrl || p.url)),
        image: typeof photos[0] === 'string' ? photos[0] : photos[0].previewUrl || photos[0].dataUrl,
        coordinates: coords,
        instantDispatchAvailable: !!instantDispatchAvailable,
        bookedDates: [],
        timeSlots: timeSlots || ["Full Day (24 Hrs)", "12-Hour Shift"]
      };

      // Backend API call
      if (window.API_CONFIG) {
        await window.API_CONFIG.request('/resources', {
          method: 'POST',
          body: JSON.stringify(newResource)
        });
      }

      this.inventory.unshift(newResource);
      this.saveInventory();

      return {
        success: true,
        resource: newResource,
        message: 'New commercial resource published successfully to the MMR marketplace.'
      };
    }

    // Delete Resource
    async deleteResource(id, userEmail) {
      const idx = this.inventory.findIndex(item => item.id === id);
      if (idx === -1) {
        return { success: false, error: 'Resource not found.' };
      }

      if (window.API_CONFIG) {
        await window.API_CONFIG.request(`/resources/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-email': userEmail }
        });
      }

      this.inventory.splice(idx, 1);
      this.saveInventory();

      return { success: true, message: 'Resource removed from marketplace.' };
    }
  }

  if (typeof window !== 'undefined') {
    window.resourceService = new ResourceService();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceService;
  }
})(typeof window !== 'undefined' ? window : global);
