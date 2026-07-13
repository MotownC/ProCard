import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb, findOrderByToken } from './_lib/firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, feedback } = req.body;
    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    const text = typeof feedback === 'string' ? feedback.trim() : '';
    if (!text || text.length > 2000) {
      return res.status(400).json({ error: 'Feedback must be 1-2000 characters' });
    }

    const found = await findOrderByToken(token);
    if (!found) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const { key, order } = found;
    if (order.status === 'paid' || order.status === 'complete') {
      return res.status(400).json({ error: 'Order is already finalized' });
    }

    const messages = Array.isArray(order.messages) ? order.messages : [];
    messages.push({
      id: crypto.randomUUID(),
      sender: 'customer',
      text,
      timestamp: Date.now(),
    });

    await adminDb().ref(`customOrders/${key}`).update({
      messages,
      status: 'revision_requested',
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Revision request error:', error);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
}
