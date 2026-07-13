import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { requireAdmin } from './_lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isHttps = (u: unknown) => typeof u === 'string' && /^https:\/\//i.test(u);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminUid = await requireAdmin(req);
  if (!adminUid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerEmail, customerName, approvalUrl, proofImageUrl, proofBackImageUrl, isRevision } = req.body;

    if (!customerEmail || !approvalUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isHttps(approvalUrl) || (proofImageUrl && !isHttps(proofImageUrl)) || (proofBackImageUrl && !isHttps(proofBackImageUrl))) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const subject = isRevision
      ? 'Your updated ProCard proof is ready!'
      : 'Your ProCard proof is ready for review!';

    const safeName = escapeHtml(customerName) || 'there';
    const greeting = isRevision
      ? `Hey ${safeName}! We've updated your card based on your feedback. Here's the revised proof:`
      : `Hey ${safeName}! Your custom card proof is ready for review.`;

    const buttonText = isRevision
      ? 'Review Updated Proof'
      : 'Review & Approve Your Card';

    const { data, error } = await resend.emails.send({
      from: 'ProCard Legends <noreply@procardlegends.com>',
      to: customerEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #22d3ee; font-size: 28px; margin-bottom: 8px;">ProCard Legends</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Custom Trading Card Design</p>

          <p style="font-size: 16px; margin-bottom: 16px;">
            ${greeting}
          </p>

          ${proofImageUrl ? `
            <div style="margin-bottom: 24px; text-align: center;">
              ${proofBackImageUrl ? `
                <table style="margin: 0 auto;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: center; padding: 0 8px;">
                      <img src="${escapeHtml(proofImageUrl)}" alt="Card front" style="max-width: 240px; border-radius: 8px; border: 2px solid #334155;" />
                      <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Front</p>
                    </td>
                    <td style="text-align: center; padding: 0 8px;">
                      <img src="${escapeHtml(proofBackImageUrl)}" alt="Card back" style="max-width: 240px; border-radius: 8px; border: 2px solid #334155;" />
                      <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Back</p>
                    </td>
                  </tr>
                </table>
              ` : `
                <img src="${escapeHtml(proofImageUrl)}" alt="Your card proof" style="max-width: 300px; border-radius: 8px; border: 2px solid #334155;" />
              `}
            </div>
          ` : ''}

          <p style="font-size: 16px; margin-bottom: 24px;">
            Click the button below to view your proof${isRevision ? ', request more changes,' : ', select your options,'} and complete your order:
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${escapeHtml(approvalUrl)}" style="display: inline-block; background: #22d3ee; color: #0f172a; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
              ${buttonText}
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            Or copy this link: <a href="${escapeHtml(approvalUrl)}" style="color: #22d3ee;">${escapeHtml(approvalUrl)}</a>
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
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, emailId: data?.id });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
