# Email Notification Setup Guide

This guide will help you set up email notifications for custom order submissions using EmailJS (free tier available).

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions
5. Copy your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template:

```
Subject: 🎨 New ProCard Custom Order

New custom card order received!

Customer: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
Order Time: {{order_time}}

Photo: {{photo_url}}

Notes:
{{notes}}

---
Login to your admin dashboard to view and manage this order.
```

4. Save the template and copy the **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `abc123xyz789`)

## Step 5: Add Environment Variables

Add these to your `.env` file (or Vercel environment variables):

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123xyz789
```

## Step 6: Deploy

After adding the environment variables:

1. Rebuild your app: `npm run build`
2. Deploy to Vercel (it will automatically pick up the new env vars)

## Testing

1. Submit a test custom order through your app
2. Check your email inbox for the notification
3. Check the browser console for `📧 Email notification sent`

## Free Tier Limits

EmailJS free tier includes:
- 200 emails/month
- No credit card required
- Perfect for getting started

## Troubleshooting

**No email received?**
- Check spam/junk folder
- Verify environment variables are set correctly in Vercel
- Check browser console for errors
- Make sure your EmailJS account is verified

**Email fails but order still works?**
- This is normal! Email is optional and won't break order submission
- Orders are still saved to Firebase
- You can still view them in the admin dashboard

## Alternative: View Orders in Admin Dashboard

Even without email setup, you can:
1. Go to `/admin` page
2. Click **Custom Orders** tab
3. See all pending orders with photos and customer info
4. Click email addresses to contact customers directly

The admin dashboard updates in real-time as new orders come in!
