import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripeInstance: Promise<Stripe | null> | null = null;

export const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    // Return a deferred promise that resolves once getStripe() is called
    return null;
  }
  return loadStripe(key);
})();

export function getStripe(): Promise<Stripe | null> {
  if (!stripeInstance) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key is not configured');
      return Promise.resolve(null);
    }
    stripeInstance = loadStripe(key);
  }
  return stripeInstance;
}
