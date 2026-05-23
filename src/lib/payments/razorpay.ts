/**
 * Razorpay Web Checkout integration utility bridge for Trelis Life.
 * Dynamically loads checkout.js and initializes payments.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically injects Razorpay Checkout script into the DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutOptions {
  onSuccess: () => void;
  onError: (err: any) => void;
}

/**
 * Initializes Razorpay checkout window
 */
export async function initializeCheckout(options: CheckoutOptions): Promise<void> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      options.onError(new Error('Razorpay Checkout SDK failed to load.'));
      return;
    }

    // Configure client-side Razorpay test parameters
    const paymentConfig = {
      // Standard Razorpay Public Test Key for clean client-side beta demo/checkout
      key: 'rzp_test_TrelisLifeKeyPlaceholder',
      amount: 29900, // ₹299.00
      currency: 'INR',
      name: 'Trelis Life',
      description: 'Trelis Plus - Monthly subscription',
      image: '/assets/logo.png', // Premium logo fallback
      handler: function (response: any) {
        console.log('Razorpay payment successful:', response);
        options.onSuccess();
      },
      prefill: {
        name: 'Trelis Member',
        email: 'member@trelis.life',
      },
      theme: {
        color: '#2A7F7F', // Luxury Accent Teal matching our brand
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal dismissed.');
          options.onError(new Error('Payment window closed.'));
        }
      }
    };

    const rzpInstance = new window.Razorpay(paymentConfig);
    rzpInstance.open();
  } catch (err) {
    console.error('Razorpay initialization failed:', err);
    options.onError(err);
  }
}
