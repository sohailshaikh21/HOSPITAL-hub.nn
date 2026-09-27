/** Frontend-only UPI QR payment helper. Payments are not verified by this app. */
(function(window) {
  'use strict';

  const UPI_ID_STORAGE_KEY = 'hospitalityhub_merchant_upi_id';

  function isValidUpiId(upiId) {
    return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(String(upiId || '').trim());
  }

  class PaymentService {
    getUpiId() {
      return window.localStorage.getItem(UPI_ID_STORAGE_KEY) || '';
    }

    isValidUpiId(upiId) {
      return isValidUpiId(upiId);
    }

    saveUpiId(upiId) {
      const normalizedUpiId = String(upiId || '').trim();
      if (!isValidUpiId(normalizedUpiId)) {
        return { success: false, error: 'Enter a valid merchant UPI ID, for example business@bank.' };
      }
      window.localStorage.setItem(UPI_ID_STORAGE_KEY, normalizedUpiId);
      return { success: true, upiId: normalizedUpiId };
    }

    createUpiPaymentUri({ upiId, amount, payeeName = 'HospitalityHub', note = 'Booking advance' }) {
      const normalizedUpiId = String(upiId || '').trim();
      const paymentAmount = Number(amount);
      if (!isValidUpiId(normalizedUpiId)) {
        return { success: false, error: 'Enter a valid merchant UPI ID to generate the payment QR.' };
      }
      if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        return { success: false, error: 'The payment amount must be greater than zero.' };
      }

      const params = new URLSearchParams({
        pa: normalizedUpiId,
        pn: payeeName,
        am: paymentAmount.toFixed(2),
        cu: 'INR',
        tn: note
      });
      return { success: true, uri: `upi://pay?${params.toString()}` };
    }

    async renderQrCode(canvas, paymentUri) {
      try {
        if (typeof window.QRCode !== 'function') {
          return { success: false, error: 'The local QR generator is unavailable. Reload the app and try again.' };
        }
        new window.QRCode(canvas, {
          text: paymentUri,
          width: 220,
          height: 220,
          correctLevel: window.QRCode.CorrectLevel.M
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message || 'Could not render the UPI payment QR.' };
      }
    }
  }

  if (typeof window !== 'undefined') window.paymentService = new PaymentService();
  if (typeof module !== 'undefined' && module.exports) module.exports = PaymentService;
})(typeof window !== 'undefined' ? window : global);