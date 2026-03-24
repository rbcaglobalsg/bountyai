import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
    console.warn('STRIPE_SECRET_KEY is not set. Payments will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-01-27-acacia' as any, // 20.4.1 version might need a compatible version string
    typescript: true,
});
