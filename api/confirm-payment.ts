import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { adminDb, findOrderByToken } from './_lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, paymentIntentId, quantities } = req.body;
    if (typeof token !== 'string' || !token || typeof paymentIntentId !== 'string' || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing token or paymentIntentId' });
    }

    const found = await findOrderByToken(token);
    if (!found) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const { key, order } = found;

    // Verify with Stripe that this payment actually succeeded and belongs to this order
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not succeeded' });
    }
    if (intent.metadata.approvalToken !== token) {
      return res.status(400).json({ error: 'Payment does not match this order' });
    }
    if (order.paymentIntentId && order.paymentIntentId !== paymentIntentId) {
      return res.status(409).json({ error: 'Order already has a different payment' });
    }

    const safeQuantities: Record<string, number> = {};
    if (quantities && typeof quantities === 'object') {
      for (const [id, qty] of Object.entries(quantities)) {
        const n = Math.floor(Number(qty));
        if (Number.isFinite(n) && n > 0) safeQuantities[id] = n;
      }
    }

    await adminDb().ref(`customOrders/${key}`).update({
      paymentIntentId,
      selectedOptions: Object.keys(safeQuantities),
      quantities: safeQuantities,
      totalPaidCents: intent.amount,
      status: 'paid',
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
}
