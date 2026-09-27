/**
 * HospitalityHub B2B Resource Exchange
 * Booking & Calendar Lock Service
 * 
 * Enforces strict date collision prevention, automated calendar locking,
 * date-based resource availability, booking cancellations, and real-time status management.
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'hub_bookings_v3';

  // Seed standard confirmed and active bookings
  const SEED_BOOKINGS = [
    {
      id: "BKG-1011",
      resourceId: "hub-01",
      resourceTitle: "500-Seater Grand Banquet Hall & Manicured Lawn",
      category: "Spaces",
      providerEmail: "procurement@imperialbanquets.in",
      providerBusiness: "Imperial Banquets & Hospitality Ltd",
      seekerEmail: "director@tajbanquets.in",
      seekerBusiness: "Taj Lands End Event Services",
      seekerPhone: "+91 98211 44556",
      startDate: "2026-10-10",
      endDate: "2026-10-14",
      days: 4,
      dailyRate: 28000,
      baseAmount: 112000,
      securityDeposit: 12000,
      logisticsFee: 0,
      tokenPaid: 22400, // 20% advance
      totalAmount: 124000,
      paymentMethod: "UPI (HDFC Business)",
      paymentStatus: "Payment Successful (Escrow Locked)",
      status: "Confirmed", // 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Expired'
      notes: "Annual Global Tech Summit Leadership Dinner. Verified FSSAI catering NOC on file.",
      createdAt: "2026-09-20T10:30:00.000Z"
    },
    {
      id: "BKG-1012",
      resourceId: "hub-03",
      resourceTitle: "10-Tray Commercial Rational Combi Oven & Steamer",
      category: "Kitchen",
      providerEmail: "mahesh@royalkitchens.in",
      providerBusiness: "Royal Kitchens & Equipment Depot",
      seekerEmail: "procurement@imperialbanquets.in",
      seekerBusiness: "Imperial Banquets & Hospitality Ltd",
      seekerPhone: "+91 98200 12345",
      startDate: "2026-09-18",
      endDate: "2026-09-20",
      days: 2,
      dailyRate: 9500,
      baseAmount: 19000,
      securityDeposit: 4500,
      logisticsFee: 850,
      tokenPaid: 3800,
      totalAmount: 24350,
      paymentMethod: "Corporate Card (Mastercard)",
      paymentStatus: "Payment Successful (Escrow Locked)",
      status: "Completed",
      notes: "Emergency banquet surge production. Returned with clean post-dispatch audit.",
      createdAt: "2026-09-15T08:15:00.000Z"
    }
  ];

  class BookingService {
    constructor() {
      this.bookings = this.loadBookings();
    }

    loadBookings() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return SEED_BOOKINGS;
    }

    saveBookings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookings));
      } catch (e) {}
    }

    // Store a booking in this browser without syncing it to the backend.
    recordBookingLocally(booking) {
      if (!booking || !booking.id) return;
      this.bookings = [booking, ...this.bookings.filter(item => item.id !== booking.id)];
      this.saveBookings();
    }

    // Generate array of ISO date strings ('YYYY-MM-DD') between startDate and endDate inclusive
    getDateRangeArray(startDateStr, endDateStr) {
      const dates = [];
      const curr = new Date(startDateStr);
      const last = new Date(endDateStr);

      while (curr <= last) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    }

    // Get all locked/booked dates for a specific resource
    getLockedDatesForResource(resourceId) {
      if (!resourceId) return [];
      
      const activeBookings = this.bookings.filter(b => 
        b.resourceId === resourceId &&
        (b.status === 'Confirmed' || b.status === 'Pending')
      );

      const lockedDates = new Set();
      activeBookings.forEach(b => {
        const span = this.getDateRangeArray(b.startDate, b.endDate);
        span.forEach(d => lockedDates.add(d));
      });

      return Array.from(lockedDates).sort();
    }

    // Check if requested date range collides with any existing confirmed booking
    checkCollision(resourceId, startDateStr, endDateStr, excludeBookingId = null) {
      if (!resourceId || !startDateStr || !endDateStr) {
        return { hasCollision: false };
      }

      const reqStart = new Date(startDateStr);
      const reqEnd = new Date(endDateStr);

      if (reqEnd < reqStart) {
        return {
          hasCollision: true,
          error: 'End date cannot precede start date.'
        };
      }

      const activeBookings = this.bookings.filter(b =>
        b.resourceId === resourceId &&
        b.id !== excludeBookingId &&
        (b.status === 'Confirmed' || b.status === 'Pending')
      );

      for (const booking of activeBookings) {
        const bStart = new Date(booking.startDate);
        const bEnd = new Date(booking.endDate);

        // Standard interval overlap test: max(start1, start2) <= min(end1, end2)
        if (reqStart <= bEnd && reqEnd >= bStart) {
          return {
            hasCollision: true,
            conflictingBooking: booking,
            error: `Dates (${startDateStr} to ${endDateStr}) overlap with an existing confirmed booking (${booking.startDate} to ${booking.endDate}).`
          };
        }
      }

      return { hasCollision: false };
    }

    // Check if resource is available for specified dates
    isResourceAvailableForDates(resource, startDateStr, endDateStr) {
      if (!startDateStr && !endDateStr) {
        // General check: if today is within any active booking period
        const todayStr = new Date().toISOString().split('T')[0];
        const locked = this.getLockedDatesForResource(resource.id);
        return !locked.includes(todayStr);
      }

      const start = startDateStr || new Date().toISOString().split('T')[0];
      const end = endDateStr || start;
      const collision = this.checkCollision(resource.id, start, end);
      return !collision.hasCollision;
    }

    // Create a new booking & lock calendar dates
    async createBooking(bookingPayload) {
      const {
        resourceId,
        resourceTitle,
        category,
        providerEmail,
        providerBusiness,
        seekerEmail,
        seekerBusiness,
        seekerPhone,
        startDate,
        endDate,
        dailyRate,
        securityDeposit,
        logisticsFee,
        paymentMethod,
        notes,
        paymentStatus,
        status,
        localOnly = false
      } = bookingPayload;

      // 1. Validate mandatory fields
      if (!resourceId || !startDate || !endDate || !seekerEmail) {
        return { success: false, error: 'Missing required booking parameters.' };
      }

      // 2. Prevent Double Booking
      const collisionCheck = this.checkCollision(resourceId, startDate, endDate);
      if (collisionCheck.hasCollision) {
        return {
          success: false,
          error: collisionCheck.error || 'The selected dates have just been reserved by another enterprise.'
        };
      }

      // 3. Compute duration & costs
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      
      const baseAmount = days * dailyRate;
      const deposit = securityDeposit || 0;
      const delivery = logisticsFee || 0;
      const tokenPaid = Math.round(baseAmount * 0.20); // 20% advance token
      const totalAmount = baseAmount + deposit + delivery;

      const newBooking = {
        id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
        resourceId,
        resourceTitle,
        category: category || 'Hospitality Resource',
        providerEmail: providerEmail.toLowerCase(),
        providerBusiness,
        seekerEmail: seekerEmail.toLowerCase(),
        seekerBusiness: seekerBusiness || 'Enterprise Hospitality Partner',
        seekerPhone: seekerPhone || '',
        startDate,
        endDate,
        days,
        dailyRate,
        baseAmount,
        securityDeposit: deposit,
        logisticsFee: delivery,
        tokenPaid,
        totalAmount,
        paymentMethod: paymentMethod || 'UPI Instant Escrow',
        paymentStatus: paymentStatus || 'Payment Successful (Escrow Locked)',
        status: status || 'Confirmed',
        notes: notes || 'Standard B2B commercial rental with 20% booking advance.',
        createdAt: new Date().toISOString()
      };

      // Try Backend REST API
      if (!localOnly && window.API_CONFIG) {
        await window.API_CONFIG.request('/requests', {
          method: 'POST',
          body: JSON.stringify({
            id: newBooking.id,
            assetId: resourceId,
            assetTitle: resourceTitle,
            providerEmail: newBooking.providerEmail,
            seekerEmail: newBooking.seekerEmail,
            seekerBusiness: newBooking.seekerBusiness,
            seekerContact: newBooking.seekerPhone,
            startDate: newBooking.startDate,
            endDate: newBooking.endDate,
            days: newBooking.days,
            dailyRate: newBooking.dailyRate,
            totalAmount: newBooking.totalAmount,
            tokenAmount: newBooking.tokenPaid,
            escrowDeposit: newBooking.securityDeposit,
            bookingMode: 'Planned Advance',
            status: 'Approved'
          })
        });
      }

      this.recordBookingLocally(newBooking);

      // Trigger resource service update
      if (window.resourceService) {
        window.resourceService.updateResourceAvailability(resourceId);
      }

      return {
        success: true,
        booking: newBooking,
        message: newBooking.status === 'Pending'
          ? `Booking #${newBooking.id} is pending manual payment confirmation.`
          : `Booking #${newBooking.id} confirmed. Calendar dates (${startDate} to ${endDate}) have been locked.`
      };
    }

    // Cancel a booking and immediately release the dates
    async cancelBooking(bookingId, cancellationReason = '') {
      const idx = this.bookings.findIndex(b => b.id === bookingId);
      if (idx === -1) {
        return { success: false, error: 'Booking not found.' };
      }

      const booking = this.bookings[idx];
      if (booking.status === 'Cancelled') {
        return { success: false, error: 'This booking is already cancelled.' };
      }

      booking.status = 'Cancelled';
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = cancellationReason || 'Cancelled by enterprise user';
      booking.paymentStatus = 'Refund Initiated (Escrow Released)';

      // Backend sync
      if (window.API_CONFIG) {
        await window.API_CONFIG.request(`/requests/${bookingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'Rejected',
            notes: `Cancelled: ${cancellationReason}`
          })
        });
      }

      this.saveBookings();

      // Automatically release dates in resource availability
      if (window.resourceService) {
        window.resourceService.updateResourceAvailability(booking.resourceId);
      }

      return {
        success: true,
        booking,
        message: `Booking #${bookingId} has been cancelled. Locked dates (${booking.startDate} to ${booking.endDate}) are now released and available to the marketplace.`
      };
    }

    // Get bookings for user (either as seeker or provider)
    getUserBookings(userEmail, role = 'seeker') {
      if (!userEmail) return [];
      const clean = userEmail.toLowerCase();
      
      return this.bookings.filter(b => {
        if (role === 'provider') {
          return b.providerEmail && b.providerEmail.toLowerCase() === clean;
        }
        return b.seekerEmail && b.seekerEmail.toLowerCase() === clean;
      });
    }

    // Check if a user has completed an eligible booking for a resource (for review eligibility)
    hasCompletedBooking(userEmail, resourceId) {
      if (!userEmail || !resourceId) return false;
      const clean = userEmail.toLowerCase();
      return this.bookings.some(b => 
        b.resourceId === resourceId &&
        b.seekerEmail && b.seekerEmail.toLowerCase() === clean &&
        (b.status === 'Completed' || b.status === 'Confirmed')
      );
    }
  }

  if (typeof window !== 'undefined') {
    window.bookingService = new BookingService();
    window.SEED_BOOKINGS = SEED_BOOKINGS;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookingService;
  }
})(typeof window !== 'undefined' ? window : global);
