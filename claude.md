# ProCard Legends

A React + TypeScript web application for creating custom sports trading cards with real-time background removal, multiple design styles, and PDF export capabilities.

## Project Overview

ProCard is a card creation tool that allows users to:
- Upload photos and automatically remove backgrounds using AI
- Create custom sports trading cards with multiple design templates
- Add player details, stats, and biographical information
- Export cards as high-quality PDFs
- Share created cards in a public gallery

## Tech Stack

- **Frontend**: React 19.2.1, TypeScript 5.2.2
- **Build Tool**: Vite 5.4.21
- **Styling**: TailwindCSS 3.4.1
- **Database**: Firebase Realtime Database 10.8.0
- **Image Processing**:
  - `@imgly/background-removal` for AI background removal
  - `html-to-image` for card rendering
- **PDF Generation**: `pdf-lib` 1.17.1
- **Icons**: Lucide React
- **Payments**: Stripe (Elements + PaymentIntent API)
- **Email**: Resend (transactional emails from `noreply@procardlegends.com`)
- **AI**: Google Generative AI (Gemini)
- **Deployment**: Vercel (with serverless API functions in `/api`)

## Project Structure

```
api/
├── _lib/
│   └── firebaseAdmin.ts      # Shared Firebase Admin SDK helpers (not routed)
├── create-payment-intent.ts  # Vercel serverless: Stripe PaymentIntent creation
├── confirm-payment.ts        # Vercel serverless: verify Stripe payment, mark order paid
├── request-revision.ts       # Vercel serverless: customer revision feedback
└── send-proof-email.ts       # Vercel serverless: Resend proof email (admin only)
src/
├── components/
│   ├── OrderForm.tsx        # Main card creation interface
│   ├── Gallery.tsx          # Showcase gallery with Firebase sync
│   ├── Checkout.tsx         # PDF generation/order completion (self-serve)
│   ├── CustomOrderForm.tsx  # Custom design service order form
│   ├── OrderApproval.tsx    # Customer proof approval + Stripe checkout
│   ├── PaymentForm.tsx      # Stripe Elements payment form wrapper
│   ├── AdminOrders.tsx      # Admin: manage orders, upload proofs, copy approval links
│   ├── Pricing.tsx          # Pricing tiers display
│   ├── Hero.tsx             # Landing page hero section
│   ├── Navbar.tsx           # Navigation bar
│   └── Roadmap.tsx          # Feature roadmap
├── config/
│   └── pricing.ts           # Shared pricing constants and helpers
├── lib/
│   └── stripe.ts            # Stripe.js loader initialization
├── utils/
│   ├── firebase.ts          # Firebase database operations
│   └── cloudinary.ts        # Image upload to Cloudinary
├── types.ts                 # TypeScript type definitions
└── App.tsx                  # Main app component with routing
```

## Key Features

### Card Design Styles

The app supports 5 different card background styles:
1. **Standard** - Classic layout with diagonal accent
2. **Radar** - Radar chart background with stats visualization
3. **Tech** - Futuristic grid pattern design
4. **Cyber** - Neon grid with perspective effect
5. **Impact** - Bold, high-contrast design with large numbers
6. **Splatter** - Paint splatter artistic style

### Card Components

**Front Side:**
- Player photo (with AI background removal option)
- Player name, team, position, number
- Sport type
- Customizable colors (primary, secondary, accent)
- Logo upload support
- Draggable text elements for positioning

**Back Side:**
- Player biography
- Physical stats (height, weight, hometown, year)
- Custom stat field
- Power rating (1-100 scale)
- Stat labels customization

### Firebase Integration

**Database Structure:**
```
cards/
  {cardId}/
    id: number
    player: string
    team: string
    imageType: string
    rarity: CardRarity
    gradient: string
    imageUrl?: string
    backImageUrl?: string

customOrders/
  {timestamp}/
    name, email, phone, photoUrl, notes, timestamp
    status: 'pending' | 'proof_sent' | 'paid' | 'complete'
    proofImageUrl?: string
    proofBackImageUrl?: string
    approvalToken?: string
    selectedOptions?: string[]
    quantities?: Record<string, number>
    totalPaidCents?: number
    paymentIntentId?: string
```

**Note:** The `approvalToken` field requires a Firebase index for querying. Add to `database.rules.json`:
```json
"customOrders": {
  ".indexOn": ["approvalToken"]
}
```

**Security Rules** (`database.rules.json`):
- `/admins/{uid}: true` is the admin whitelist — managed only via Firebase console, never client-writable
- `cards`: public read; writes require an authenticated whitelisted admin
- `customOrders`: full read/write for whitelisted admins; anonymous users may only (a) **create** a `pending` order without proof/payment/token fields, and (b) read a single order via an exact `orderByChild('approvalToken').equalTo(token)` query (tokens are UUIDs, so enumeration is infeasible)
- All other reads/writes are denied; customer mutations go through serverless endpoints using the Admin SDK

**Admin Authentication:**
- Firebase Auth Email/Password provider must be enabled; create the admin user in the console and add its UID under `/admins/{uid}: true`
- The `/admin` route renders `AdminLogin.tsx` until signed in (`src/utils/auth.ts`)
- Serverless endpoints that require admin (e.g. `send-proof-email`) verify the Firebase ID token sent as `Authorization: Bearer <token>` and check the `/admins` whitelist

**Operations:**
- `subscribeToCards()` - Real-time listener for gallery updates
- `saveCardToFirebase()` - Save new/updated cards
- `deleteCardFromFirebase()` - Remove cards (admin only)

**Custom Order Operations:**
- `saveCustomOrderToFirebase()` - Save new custom orders (status: pending)
- `subscribeToCustomOrders()` - Real-time listener for admin order panel
- `updateOrderProof()` - Admin uploads front (+ optional back) proof image + generates approval token
- `getOrderByToken()` - Look up order by approval token (for customer approval page)
- `updateOrderComplete()` - Mark order as shipped/complete (status: complete)
- `deleteCustomOrder()` - Remove custom orders
- Customer-side mutations (revision requests, payment confirmation) are NOT client Firebase writes — they go through `/api/request-revision` and `/api/confirm-payment` (Admin SDK)

## Environment Variables

Required variables in `.env`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DB_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_STRIPE_PUBLISHABLE_KEY=    # pk_test_... or pk_live_...
STRIPE_SECRET_KEY=               # sk_test_... or sk_live_... (server-side only, no VITE_ prefix)
RESEND_API_KEY=                  # Resend API key (server-side only, no VITE_ prefix)
FIREBASE_SERVICE_ACCOUNT=        # Firebase service account JSON, single line (server-side only)
```

**Note:** `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, and `FIREBASE_SERVICE_ACCOUNT` intentionally lack the `VITE_` prefix so Vite does NOT bundle them into client-side code. They are only accessible in Vercel serverless functions via `process.env`. Generate the service account key in Firebase console → Project settings → Service accounts.

## Development Workflow

### Running Locally
```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Build for production
npm run preview    # Preview production build
```

### Testing on iOS
Use ngrok to expose local dev server:
```bash
npm run dev
ngrok http 5173    # In separate terminal
# Open ngrok URL on iOS device
```

### Deployment
- Automatically deploys to Vercel on push to main branch
- Firebase rules must be deployed separately:
  ```bash
  firebase deploy --only database
  ```

## Common Issues & Solutions

### iOS Rendering Issues
- Double-capture workaround implemented for iOS camera bugs
- Blob URL cleanup to prevent memory issues
- Touch event handling for draggable elements

### Font Rendering (Impact Style)
- Use `drop-shadow` filter instead of `WebkitTextStroke` to avoid multi-path stroke issues on numbers like 4, 6, 9
- Gradient text uses `background-clip: text` technique

### Firebase Permission Errors
- Ensure `.read: true` is set at both `/cards` level AND `/cards/$cardId` level
- Write validation checks for required fields to prevent malformed data
- `customOrders` requires `.indexOn: ["approvalToken"]` for token-based queries

### Vercel API Routes
- Serverless functions in `/api` won't work with `npm run dev` — use `vercel dev` or deploy to test
- The SPA rewrite in `vercel.json` must exclude `/api/*` routes: `/((?!api/).*)`

## Type Definitions

### ShowcaseCard
Used for gallery display of uploaded cards.

### PlayerDetails
Form data for card creation including name, team, position, etc.

### BackDetails
Player statistics and biographical information for card back.

### CardRarity
Enum: BASE, CHROME, HOLOGRAPHIC, ONE_OF_ONE

### CustomOrder
Order data for custom design service. Key fields:
- `name`, `email`, `phone`, `photoUrl`, `notes`, `timestamp`
- `status`: `'pending'` | `'proof_sent'` | `'paid'` | `'complete'`
- `proofImageUrl?`: Front proof image uploaded by admin
- `proofBackImageUrl?`: Back proof image uploaded by admin (optional)
- `approvalToken?`: UUID for customer approval link
- `selectedOptions?`, `quantities?`: What the customer ordered
- `totalPaidCents?`, `paymentIntentId?`: Stripe payment details

### PricingOption (in `src/config/pricing.ts`)
Pricing tier definition with `id`, `name`, `priceInCents`, `type` (base/addon/bundle), `description`.

## Git Workflow

- Main branch: `main`
- Remote: `https://github.com/MotownC/ProCard.git`
- Commit format includes Claude Code attribution

## Admin Features

Access admin mode via navbar for:
- Upload custom designs to gallery
- Delete cards from gallery
- Add back images to cards
- Customize card gradients/colors

### Custom Order Management (Admin > Custom Orders tab)
- View all custom orders with status filters (All / Pending / Proof Sent / Paid / Complete)
- Upload front and back proof images to orders (back is optional, both upload to Cloudinary)
- Auto-generates unique approval token + customer approval link
- Auto-sends proof notification email to customer via Resend (shows front & back side-by-side if both provided)
- Copy approval link to send to customer manually (fallback)
- View payment details and Stripe PaymentIntent ID for paid orders
- Mark paid orders as shipped/complete via checkbox

## Stripe Payment Integration

### Custom Order Payment Flow
```
1. Customer submits CustomOrderForm (name, email, photo, notes) → saved to Firebase as "pending"
2. Admin designs card, uploads front proof image (+ optional back) via AdminOrders panel
3. System generates approval link: /approve?token=<uuid>
4. Proof notification email auto-sent to customer via Resend (with front & back preview + approval link)
5. Customer opens link → sees front/back proof side-by-side → selects products + quantities
6. Customer pays via Stripe Elements (embedded payment form)
7. On success: client calls /api/confirm-payment, which verifies the PaymentIntent
   with Stripe (status succeeded + metadata approvalToken matches the order)
   before marking the order "paid" via the Admin SDK
8. Admin marks order as shipped → status updated to "complete"
```

### Pricing Configuration
Defined in `src/config/pricing.ts`. Five tiers:
- Single Sided Card: $10.00 (base)
- Double Sided Card: $15.00 (base)
- Magnetic Case: $5.00 (addon)
- Digital Download: $10.00 (addon)
- Deluxe Package: $25.00 (bundle)

Prices are validated server-side in `api/create-payment-intent.ts` — client sends option IDs and quantities, server calculates the total.

### Serverless API
- `POST /api/create-payment-intent` — Receives `{ items: [{id, quantity}], customerEmail, token }`, validates against server-side pricing (quantities capped at 100), stamps the approval token into PaymentIntent metadata, returns `{ clientSecret, amount }`
- `POST /api/confirm-payment` — Receives `{ token, paymentIntentId, quantities }`, verifies the PaymentIntent succeeded and its `metadata.approvalToken` matches, then marks the order paid (Admin SDK)
- `POST /api/request-revision` — Receives `{ token, feedback }` (≤2000 chars), appends a customer message and sets status `revision_requested` (Admin SDK)
- `POST /api/send-proof-email` — **Admin only** (requires `Authorization: Bearer <Firebase ID token>` from a whitelisted admin). Receives `{ customerEmail, customerName, approvalUrl, proofImageUrl, proofBackImageUrl?, isRevision }`, sends styled HTML email via Resend with all interpolated values HTML-escaped, returns `{ success, emailId }`
- Shared Admin SDK helpers live in `api/_lib/firebaseAdmin.ts` (underscore dir = not routed)
- **Pinned:** `firebase-admin` must stay on v13 — v14 pulls `jwks-rsa@4` → `jose@6` (ESM-only), which crashes Vercel functions at cold start with `ERR_REQUIRE_ESM`. Also do NOT add `@vercel/node` as a package dependency (Vercel supplies it at build; the api files' type-only imports work without it installed).
- **Vercel env gotcha:** env values are baked into each deployment at build time — a deleted project env var only breaks the NEXT deploy. If all functions suddenly return `FUNCTION_INVOCATION_FAILED`, check Settings → Environment Variables first (this happened with a deleted `STRIPE_SECRET_KEY`).
- Vercel auto-routes `/api/*` as serverless functions before the SPA rewrite
- **Important:** `vercel.json` rewrite uses `/((?!api/).*)` to avoid intercepting API routes

### Testing Stripe
- Use test keys (`pk_test_...` / `sk_test_...`) during development
- Test card: `4242 4242 4242 4242`, any future expiry, any 3-digit CVC
- Declined card: `4000 0000 0000 0002`
- View test payments: https://dashboard.stripe.com/test/payments
- To go live: swap test keys for live keys in Vercel env vars (no code changes)

## Image Processing Pipeline

1. User uploads photo
2. Optional AI background removal via `@imgly/background-removal`
3. Image displayed in card preview
4. On export: `html-to-image` converts card DOM to canvas
5. Canvas data embedded in PDF via `pdf-lib`
6. For gallery: Images uploaded to Cloudinary, URLs stored in Firebase

## Browser Compatibility

- Chrome/Edge: Full support
- Safari: Full support with iOS-specific touch handling
- Firefox: Full support
- Mobile Safari (iOS): Special handling for camera and rendering bugs

## Performance Considerations

- AI background removal runs in-browser (can be slow on mobile)
- Firebase real-time subscriptions with 5s timeout fallback
- Card preview uses CSS transforms for performance
- Gallery images lazy-loaded from Cloudinary CDN

## Future Roadmap

See `Roadmap.tsx` component for planned features including:
- Mobile app
- Team bulk orders
- NFT integration
- Trading marketplace
