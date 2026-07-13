# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock down ProCard so only an authenticated admin can read/manage orders and the gallery, customers can only reach their own order via secret token, and the email endpoint can't be abused as an open mailer.

**Architecture:** Firebase Auth (email/password) identifies the admin; an `/admins/{uid}` whitelist node in RTDB (console-managed, never client-writable) is the authority. Database rules restrict `customOrders` reads to admin or exact-token queries (RTDB query-based rules), restrict updates to admin, and allow unauthenticated *create only* (order submission). Customer-side mutations (revision requests, payment confirmation) move to Vercel serverless functions using the Firebase Admin SDK; payment confirmation verifies the PaymentIntent with Stripe (status `succeeded` + token stamped in PI metadata) before marking the order paid. `send-proof-email` requires a verified admin Firebase ID token and escapes interpolated HTML.

**Tech Stack:** React 19 + Vite, Firebase RTDB + Auth (client SDK), `firebase-admin` (new dep, serverless only), Stripe Node SDK, Vercel serverless functions.

**Manual setup required by owner (after code lands):**
1. Firebase console → Authentication → Sign-in method → enable **Email/Password**; Users → add the admin user; copy its UID.
2. Realtime Database console → create `/admins/<UID>: true`.
3. Firebase console → Project settings → Service accounts → **Generate new private key**; paste the JSON (single line) as `FIREBASE_SERVICE_ACCOUNT` env var in Vercel (all environments) and local `.env`.
4. Deploy rules: `firebase deploy --only database`.

**Testing note:** This repo has no test runner, and `/api` functions only run under `vercel dev`/deployment. Verification per task = `npm run build` (tsc + vite) plus targeted `npx tsc --noEmit` on api files; end-to-end verification happens on a Vercel preview deploy after the manual setup steps.

---

### Task 1: Firebase Admin SDK helper library

**Files:**
- Create: `api/_lib/firebaseAdmin.ts` (underscore prefix ⇒ Vercel does not expose it as a route)
- Modify: `package.json` (add `firebase-admin`)

- [ ] **Step 1: Install dependency**

Run: `npm install firebase-admin`
Expected: added to `dependencies` in package.json.

- [ ] **Step 2: Create `api/_lib/firebaseAdmin.ts`**

```ts
import type { VercelRequest } from '@vercel/node';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  const serviceAccount = JSON.parse(raw);
  // Env vars often store the key with escaped newlines
  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL || process.env.VITE_FIREBASE_DB_URL,
  });
}

export const adminDb = () => getDatabase(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());

/** Look up a custom order by its secret approval token. */
export async function findOrderByToken(
  token: string
): Promise<{ key: string; order: Record<string, any> } | null> {
  const snap = await adminDb()
    .ref('customOrders')
    .orderByChild('approvalToken')
    .equalTo(token)
    .limitToFirst(1)
    .once('value');
  if (!snap.exists()) return null;
  const val = snap.val() as Record<string, any>;
  const key = Object.keys(val)[0];
  return { key, order: val[key] };
}

/**
 * Verify the request carries a Firebase ID token belonging to a whitelisted
 * admin (present under /admins/{uid}). Returns the uid, or null if not authorized.
 */
export async function requireAdmin(req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization || '';
  const match = /^Bearer (.+)$/.exec(Array.isArray(header) ? header[0] : header);
  if (!match) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const adminSnap = await adminDb().ref(`admins/${decoded.uid}`).once('value');
    return adminSnap.exists() ? decoded.uid : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit --esModuleInterop --skipLibCheck --module nodenext api/_lib/firebaseAdmin.ts`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json api/_lib/firebaseAdmin.ts
git commit -m "feat: add Firebase Admin SDK helper for serverless functions"
```

### Task 2: Locked-down database rules

**Files:**
- Modify: `database.rules.json` (full replacement)

- [ ] **Step 1: Replace `database.rules.json`**

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "admins": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid"
      }
    },
    "cards": {
      ".read": true,
      "$cardId": {
        ".write": "auth != null && root.child('admins').child(auth.uid).exists() && (!newData.exists() || (newData.hasChildren(['id', 'player', 'team', 'imageType', 'rarity', 'gradient']) && newData.child('id').isNumber() && newData.child('player').isString() && newData.child('team').isString() && newData.child('imageType').isString() && newData.child('rarity').isString() && newData.child('gradient').isString() && (!newData.hasChild('order') || newData.child('order').isNumber())))"
      }
    },
    "customOrders": {
      ".read": "(auth != null && root.child('admins').child(auth.uid).exists()) || (query.orderByChild == 'approvalToken' && query.equalTo != null)",
      ".indexOn": ["approvalToken"],
      "$orderId": {
        ".write": "(auth != null && root.child('admins').child(auth.uid).exists()) || (!data.exists() && newData.hasChildren(['name', 'email', 'photoUrl', 'timestamp']) && newData.child('name').isString() && newData.child('email').isString() && newData.child('photoUrl').isString() && newData.child('timestamp').isNumber() && newData.child('status').val() == 'pending' && !newData.hasChild('approvalToken') && !newData.hasChild('proofImageUrl') && !newData.hasChild('paymentIntentId') && !newData.hasChild('totalPaidCents'))"
      }
    }
  }
}
```

Semantics: admins (whitelisted in `/admins`) read/write everything under `cards` and `customOrders` from the client SDK. Anonymous users can (a) read the public gallery, (b) *create* a pending order with no proof/payment/token fields, (c) read an order **only** via an `orderByChild('approvalToken').equalTo(<exact token>)` query — enumeration is impossible without the 122-bit UUID. All other reads/writes are denied. `/admins` is never writable from any client (console only).

- [ ] **Step 2: Commit**

```bash
git add database.rules.json
git commit -m "fix: lock down database rules - admin whitelist, token-query reads, create-only public writes"
```

### Task 3: Client auth utility + admin login gate

**Files:**
- Create: `src/utils/auth.ts`
- Create: `src/components/AdminLogin.tsx`
- Modify: `src/utils/firebase.ts` (export `app`)
- Modify: `src/App.tsx` (gate the `admin` route)

- [ ] **Step 1: Export `app` from `src/utils/firebase.ts`**

Change `const app = initializeApp(firebaseConfig);` to `export const app = initializeApp(firebaseConfig);`

- [ ] **Step 2: Create `src/utils/auth.ts`**

```ts
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

export const signInAdmin = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOutAdmin = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getAdminIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
};
```

- [ ] **Step 3: Create `src/components/AdminLogin.tsx`**

```tsx
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { signInAdmin } from '../utils/auth';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800/50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Admin Sign In</h1>
        </div>
        <label className="block text-sm text-gray-400 mb-1" htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-amber-400"
        />
        <label className="block text-sm text-gray-400 mb-1" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-amber-400"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
```

- [ ] **Step 4: Gate the admin route in `src/App.tsx`**

Add imports:

```tsx
import AdminLogin from './components/AdminLogin';
import { subscribeToAuth, signOutAdmin } from './utils/auth';
import type { User } from 'firebase/auth';
```

Add state + subscription inside `App`:

```tsx
const [adminUser, setAdminUser] = useState<User | null>(null);
const [authReady, setAuthReady] = useState(false);

useEffect(() => {
  const unsubscribe = subscribeToAuth((user) => {
    setAdminUser(user);
    setAuthReady(true);
  });
  return () => unsubscribe();
}, []);
```

In `renderPage()`, at the top of `case 'admin':` return `<AdminLogin />` when not signed in (and a spinner while `!authReady`), and add a Sign Out button to the admin banner:

```tsx
case 'admin':
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-800/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!adminUser) {
    return <AdminLogin />;
  }
  return (
    /* existing admin JSX; banner row gains: */
    <button onClick={() => signOutAdmin()} className="ml-auto text-red-300 hover:text-white text-xs uppercase tracking-wide">
      Sign Out
    </button>
  );
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/utils/auth.ts src/utils/firebase.ts src/components/AdminLogin.tsx src/App.tsx
git commit -m "feat: require Firebase Auth sign-in for admin panel"
```

### Task 4: Lock down and sanitize `send-proof-email`

**Files:**
- Modify: `api/send-proof-email.ts`
- Modify: `src/components/AdminOrders.tsx` (send Authorization header)

- [ ] **Step 1: Add admin check + HTML escaping to `api/send-proof-email.ts`**

At top: `import { requireAdmin } from './_lib/firebaseAdmin';` and add:

```ts
const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
```

After the method check, before reading the body:

```ts
const adminUid = await requireAdmin(req);
if (!adminUid) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Then escape every interpolated value: `customerName` → `escapeHtml(customerName)` in the greeting, and wrap `approvalUrl`, `proofImageUrl`, `proofBackImageUrl` with `escapeHtml()` at each interpolation site. Additionally validate the URLs are https:

```ts
const isHttps = (u: unknown) => typeof u === 'string' && /^https:\/\//i.test(u);
if (!isHttps(approvalUrl) || (proofImageUrl && !isHttps(proofImageUrl)) || (proofBackImageUrl && !isHttps(proofBackImageUrl))) {
  return res.status(400).json({ error: 'Invalid URL' });
}
```

- [ ] **Step 2: Attach the ID token in `AdminOrders.tsx`**

Import `getAdminIdToken` from `../utils/auth`; in `handleProofUpload`'s email fetch:

```ts
const idToken = await getAdminIdToken();
const resp = await fetch('/api/send-proof-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({ /* unchanged */ }),
});
```

- [ ] **Step 3: Build + typecheck api file, commit**

```bash
npm run build
git add api/send-proof-email.ts src/components/AdminOrders.tsx
git commit -m "fix: require admin auth for proof emails and escape HTML interpolation"
```

### Task 5: Server-side revision requests

**Files:**
- Create: `api/request-revision.ts`
- Modify: `src/components/OrderApproval.tsx` (`handleRequestRevision`)
- Modify: `src/utils/firebase.ts` (delete `requestRevision`)

- [ ] **Step 1: Create `api/request-revision.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb, findOrderByToken } from './_lib/firebaseAdmin';

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
```

- [ ] **Step 2: Point `OrderApproval.tsx` at the endpoint**

Remove `requestRevision` from the firebase import; replace the call in `handleRequestRevision`:

```ts
const resp = await fetch('/api/request-revision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, feedback: feedbackText.trim() }),
});
if (!resp.ok) {
  const data = await resp.json().catch(() => ({}));
  throw new Error(data.error || 'Failed to submit feedback');
}
```

- [ ] **Step 3: Delete `requestRevision` from `src/utils/firebase.ts`** (now dead — rules would deny it anyway)

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add api/request-revision.ts src/components/OrderApproval.tsx src/utils/firebase.ts
git commit -m "feat: move revision requests to serverless endpoint with Admin SDK"
```

### Task 6: Verified server-side payment confirmation

**Files:**
- Modify: `api/create-payment-intent.ts` (stamp approval token in PI metadata)
- Create: `api/confirm-payment.ts`
- Modify: `src/components/OrderApproval.tsx` (`handleProceedToPayment`, `handlePaymentSuccess`)
- Modify: `src/utils/firebase.ts` (delete `updateOrderPayment` and dead `updateCustomOrderStatus`)

- [ ] **Step 1: Stamp token into PaymentIntent metadata**

In `api/create-payment-intent.ts`, read `token` from the body and add to metadata:

```ts
const { items, customerEmail, token } = req.body;
// ...
metadata: {
  items: JSON.stringify(items),
  ...(typeof token === 'string' && token ? { approvalToken: token } : {}),
},
```

Also cap quantities: `const quantity = Math.min(100, Math.max(1, Math.floor(Number(item.quantity) || 1)));`

- [ ] **Step 2: Create `api/confirm-payment.ts`**

```ts
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
```

- [ ] **Step 3: Update `OrderApproval.tsx`**

`handleProceedToPayment` body gains `token`:

```ts
body: JSON.stringify({ items: getSelectedItems(), customerEmail: order.email, token }),
```

`handlePaymentSuccess` replaces `updateOrderPayment(...)` with:

```ts
const resp = await fetch('/api/confirm-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, paymentIntentId, quantities }),
});
if (!resp.ok) {
  const data = await resp.json().catch(() => ({}));
  throw new Error(data.error || 'Failed to record payment');
}
```

Remove `updateOrderPayment` from the firebase import. (Keep the existing emailjs notification block unchanged.)

- [ ] **Step 4: Delete `updateOrderPayment` and dead `updateCustomOrderStatus` from `src/utils/firebase.ts`**

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add api/create-payment-intent.ts api/confirm-payment.ts src/components/OrderApproval.tsx src/utils/firebase.ts
git commit -m "feat: verify Stripe payment server-side before marking order paid"
```

### Task 7: Documentation

**Files:**
- Modify: `CLAUDE.md` (env vars, rules description, payment flow, admin setup)

- [ ] **Step 1: Update CLAUDE.md**

Add `FIREBASE_SERVICE_ACCOUNT` to env vars; document admin auth (`/admins/{uid}` whitelist + Email/Password provider), the new rules semantics, and the new endpoints (`/api/request-revision`, `/api/confirm-payment`); update the payment-flow steps 6–7 to note server-side Stripe verification.

- [ ] **Step 2: Final verification + commit**

```bash
npm run build
git add CLAUDE.md docs/superpowers/plans/2026-07-12-security-hardening.md
git commit -m "docs: document admin auth, secured rules, and server-verified payments"
```

## Self-Review

- **Spec coverage:** issue 1 (public PII) → Task 2 read rules; issue 2 (open writes) → Task 2 write rules; issue 4 (ungated admin) → Task 3; issue 5 (open mailer + HTML injection) → Task 4; customer flows preserved → Tasks 5–6; payment trust (bonus, issue 3 substantially) → Task 6. ✓
- **Placeholder scan:** all steps carry concrete code/commands. ✓
- **Type consistency:** `requireAdmin`/`findOrderByToken`/`adminDb` names match between Task 1 and Tasks 4–6; `getAdminIdToken` matches Task 3 ↔ Task 4. ✓
