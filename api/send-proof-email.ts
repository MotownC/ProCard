import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, approvalUrl, proofImageUrl } = req.body;

    if (!customerEmail || !approvalUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: 'ProCard Legends <onboarding@resend.dev>',
      to: customerEmail,
      subject: 'Your ProCard proof is ready for review!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #22d3ee; font-size: 28px; margin-bottom: 8px;">ProCard Legends</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Custom Trading Card Design</p>

          <p style="font-size: 16px; margin-bottom: 16px;">
            Hey ${customerName || 'there'}! Your custom card proof is ready for review.
          </p>

          ${proofImageUrl ? `
            <div style="margin-bottom: 24px; text-align: center;">
              <img src="${proofImageUrl}" alt="Your card proof" style="max-width: 300px; border-radius: 8px; border: 2px solid #334155;" />
            </div>
          ` : ''}

          <p style="font-size: 16px; margin-bottom: 24px;">
            Click the button below to view your proof, select your options, and complete your order:
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${approvalUrl}" style="display: inline-block; background: #22d3ee; color: #0f172a; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
              Review & Approve Your Card
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            Or copy this link: <a href="${approvalUrl}" style="color: #22d3ee;">${approvalUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

          <p style="font-size: 12px; color: #475569; text-align: center;">
            ProCard Legends — Custom Sports Trading Cards
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, emailId: data?.id });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
