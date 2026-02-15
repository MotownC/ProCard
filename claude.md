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
- **AI**: Google Generative AI (Gemini)
- **Deployment**: Vercel (with serverless API functions in `/api`)

## Project Structure

```
api/
└── create-payment-intent.ts  # Vercel serverless: Stripe PaymentIntent creation
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
    status: 'pending' | 'proof_sent' | 'paid'
    proofImageUrl?: string
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

**Security Rules:**
- Public read access for gallery viewing
- Write validation ensures proper data structure
- Located in `database.rules.json`

**Operations:**
- `subscribeToCards()` - Real-time listener for gallery updates
- `saveCardToFirebase()` - Save new/updated cards
- `deleteCardFromFirebase()` - Remove cards (admin only)

**Custom Order Operations:**
- `saveCustomOrderToFirebase()` - Save new custom orders (status: pending)
- `subscribeToCustomOrders()` - Real-time listener for admin order panel
- `updateOrderProof()` - Admin uploads proof image + generates approval token
- `getOrderByToken()` - Look up order by approval token (for customer approval page)
- `updateOrderPayment()` - Update order with Stripe payment details (status: paid)
- `deleteCustomOrder()` - Remove custom orders

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
```

**Note:** `STRIPE_SECRET_KEY` intentionally lacks the `VITE_` prefix so Vite does NOT bundle it into client-side code. It is only accessible in Vercel serverless functions via `process.env`.

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
- `status`: `'pending'` | `'proof_sent'` | `'paid'`
- `proofImageUrl?`: Proof image uploaded by admin
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
- View all custom orders with status filters (All / Pending / Proof Sent / Paid)
- Upload proof images to orders (uploads to Cloudinary)
- Auto-generates unique approval token + customer approval link
- Copy approval link to send to customer
- View payment details and Stripe PaymentIntent ID for paid orders

## Stripe Payment Integration

### Custom Order Payment Flow
```
1. Customer submits CustomOrderForm (name, email, photo, notes) → saved to Firebase as "pending"
2. Admin designs card, uploads proof image via AdminOrders panel
3. System generates approval link: /approve?token=<uuid>
4. Admin sends link to customer
5. Customer opens link → sees proof → selects products + quantities
6. Customer pays via Stripe Elements (embedded payment form)
7. On success: Firebase order updated to "paid" with paymentIntentId, email notification sent
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
- `POST /api/create-payment-intent` — Receives `{ items: [{id, quantity}], customerEmail }`, validates against server-side pricing, creates Stripe PaymentIntent, returns `{ clientSecret, amount }`
- Vercel auto-routes `/api/*` as serverless functions before the SPA rewrite

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
