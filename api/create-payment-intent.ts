import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Server-side pricing lookup — never trust client-sent amounts
const PRICING: Record<string, number> = {
  'single-sided': 1000,
  'double-sided': 1500,
  'magnetic-case': 500,
  'digital-download': 1000,
  'deluxe-package': 2500,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerEmail, token } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items selected' });
    }

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Calculate total server-side
    let totalCents = 0;
    for (const item of items) {
      const price = PRICING[item.id];
      if (price === undefined) {
        return res.status(400).json({ error: `Invalid option: ${item.id}` });
      }
      const quantity = Math.min(100, Math.max(1, Math.floor(Number(item.quantity) || 1)));
      totalCents += price * quantity;
    }

    if (totalCents < 50) {
      return res.status(400).json({ error: 'Minimum charge is $0.50' });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: {
        items: JSON.stringify(items),
        ...(typeof token === 'string' && token ? { approvalToken: token } : {}),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: totalCents,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
}
