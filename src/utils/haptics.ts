/**
 * Prayog India Haptic Feedback Utility
 * Delivers native tactile feedback on mobile devices (iOS Safari / Android Chrome / PWAs)
 * via navigator.vibrate with safe SSR checks and silent fallbacks on unsupported hardware.
 */
export const haptic = {
  /** Ultra-light tactile click (tabs, chips, drawer toggles, bottom bar items) */
  light: () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  },

  /** Medium tactile response (standard button presses, action buttons, dialogs) */
  medium: () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(22);
      } catch {}
    }
  },

  /** Stepper click (quantity increment / decrement, variant / radio select) */
  selection: () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  },

  /** Satisfying confirmation pulse (Add to Cart, Wishlist toggle, Order Placed, OTP Verified) */
  success: () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 50, 22]);
      } catch {}
    }
  },

  /** Alert / Warning pattern (form validation errors, out of stock, removal) */
  warning: () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch {}
    }
  },
};
