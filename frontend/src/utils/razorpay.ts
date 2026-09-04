/**
 * Razorpay Checkout script loading and typing.
 *
 * The script is fetched on demand rather than in index.html: most visitors
 * never reach checkout, and a COD order must not pull in a third-party payment
 * script at all.
 */

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (payload: never) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

// Shared across callers so a double click, or a retry after a failed payment,
// reuses the in-flight load instead of injecting a second <script>.
let loaderPromise: Promise<void> | null = null;

export function loadRazorpayCheckout(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout requires a browser environment."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`
    );

    const onLoad = () => {
      if (window.Razorpay) {
        resolve();
      } else {
        // Script executed but the global never appeared — treat as a failure so
        // the caller can surface a retry instead of hanging.
        loaderPromise = null;
        reject(new Error("Razorpay Checkout loaded but did not initialise."));
      }
    };

    const onError = () => {
      // Cleared so a later attempt can retry; an ad blocker or a dropped
      // connection is usually transient from the user's point of view.
      loaderPromise = null;
      reject(new Error("Could not load the payment gateway. Check your connection and try again."));
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);
  });

  return loaderPromise;
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions): RazorpayInstance {
  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is not loaded.");
  }

  const instance = new window.Razorpay(options);
  instance.open();
  return instance;
}
