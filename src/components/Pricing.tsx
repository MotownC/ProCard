import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PricingProps {
  setPage: (page: string) => void;
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="hsl(240, 15%, 9%)"
    stroke="hsl(240, 15%, 9%)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
}

const PricingCard: React.FC<{ tier: PricingTier }> = ({ tier }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'hsla(240, 15%, 9%, 1)',
    backgroundImage:
      'radial-gradient(at 88% 40%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),' +
      ' radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),' +
      ' radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),' +
      ' radial-gradient(at 0% 64%, hsla(38, 92%, 45%, 1) 0px, transparent 85%),' +
      ' radial-gradient(at 41% 94%, hsla(43, 96%, 65%, 1) 0px, transparent 85%),' +
      ' radial-gradient(at 100% 99%, hsla(32, 95%, 48%, 1) 0px, transparent 85%)',
    boxShadow: '0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset',
  };

  const borderContainerStyle: React.CSSProperties = {
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: -10,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% + 2px)',
    height: 'calc(100% + 2px)',
    backgroundImage:
      'linear-gradient(0deg, hsla(38, 92%, 60%, 0) -50%, hsla(38, 60%, 40%, 0) 100%)',
    borderRadius: '1rem',
  };

  const rotatingBorderStyle: React.CSSProperties = {
    content: '""',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 200,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(0deg)',
    transformOrigin: 'left',
    width: '200%',
    height: '10rem',
    backgroundImage:
      'linear-gradient(0deg, hsla(38, 92%, 55%, 0) 0%, hsl(38, 92%, 55%) 40%, hsl(38, 92%, 55%) 60%, hsla(38, 60%, 40%, 0) 100%)',
    animation: 'rotate 8s linear infinite',
  };

  return (
    <div
      className="relative hover:bg-white/[0.04] transition-all duration-300 group rounded-2xl p-6 flex flex-col w-full"
      style={cardStyle}
    >
      {tier.popular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-amber-500 text-black text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="flex-grow relative z-[1]">
        <div style={borderContainerStyle}>
          <div style={rotatingBorderStyle}></div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white font-['Teko'] tracking-wide mb-1">
            {tier.name}
          </h3>
          <p className="text-xs text-neutral-400">{tier.description}</p>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-semibold tracking-tight text-white">
              {tier.price}
            </span>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-neutral-300">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-4 h-4 mt-0.5 bg-amber-500 rounded-full flex-shrink-0">
                <CheckIcon />
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Pricing: React.FC<PricingProps> = ({ setPage }) => {
  const pricingTiers: PricingTier[] = [
    {
      name: 'Single Sided',
      price: '$10',
      description: 'Perfect for showcasing your best moment',
      features: [
        'Professional card design',
        'Printed on 15mil smooth photo matte card stock',
        'Sturdy, premium feel in hand',
        'One design iteration included'
      ],
      popular: false
    },
    {
      name: 'Double Sided',
      price: '$15',
      description: 'Tell the full story with front and back',
      features: [
        'Front and back design',
        'Printed on 15mil double-sided glossy card stock',
        'Sturdy, premium feel in hand',
        'Two design iterations included',
        'Stats or info on back side'
      ],
      popular: false
    },
    {
      name: 'Magnetic Case',
      price: '+$5',
      description: 'Premium protection for your card',
      features: [
        'Protective magnetic case',
        'UV-resistant material',
        'Crystal clear display',
        'Prevents scratches and bending',
        'Add-on to any card order'
      ],
      popular: false
    },
    {
      name: 'Digital Download',
      price: '+$10',
      description: 'High-resolution digital file',
      features: [
        'High-res digital file (300 DPI)',
        'Perfect for social media',
        'Print your own copies',
        'Keep forever in the cloud',
        'Add-on to any card order'
      ],
      popular: false
    },
    {
      name: 'Deluxe Package',
      price: '$25',
      description: 'The ultimate card experience',
      features: [
        'Custom double-sided card ($15 value)',
        'Printed on 15mil double-sided glossy card stock',
        'Silver mylar collector packaging',
        'Magnetic protective case ($5 value)',
        'High-res digital download ($10 value)',
        'Three design iterations included',
        'Priority 24-hour turnaround',
        'Save $5 with this bundle!'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen w-full bg-neutral-950 py-12 px-4">
      <style>{`@keyframes rotate { to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <h1 className="text-5xl md:text-6xl font-bold text-white font-['Teko'] tracking-tight text-center">
            PRICING
          </h1>
          <p className="mt-4 text-lg text-neutral-400 text-center max-w-2xl mx-auto">
            Professional trading cards at transparent prices. Choose the package that fits your needs.
          </p>
        </div>

        {/* Base Cards + Add-Ons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Base Cards */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-5">
              Step 1 — Choose Your Card
            </p>
            <div className="flex flex-col gap-5">
              <PricingCard tier={pricingTiers[0]} />
              <PricingCard tier={pricingTiers[1]} />
            </div>
          </div>

          {/* Right: Add-Ons */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
              Step 2 — Add-Ons{' '}
              <span className="text-neutral-500 font-normal normal-case tracking-normal">(optional)</span>
            </p>
            <div className="flex flex-col gap-5">
              <PricingCard tier={pricingTiers[2]} />
              <PricingCard tier={pricingTiers[3]} />
            </div>
          </div>
        </div>

        {/* Deluxe Bundle — full width */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Or save with the bundle
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <PricingCard tier={pricingTiers[4]} />
        </div>

        {/* Team Discount Banner */}
        <div className="mt-10 rounded-2xl p-5 border border-amber-500/30 bg-amber-500/10 text-center">
          <p className="text-white text-base">
            <span className="font-bold">Ordering for the whole team?</span>{' '}
            We offer big discounts for bulk team orders —{' '}
            <a href="mailto:support@procardlegends.com" className="text-amber-400 hover:text-amber-300 transition-colors underline">
              contact us for custom pricing
            </a>.
          </p>
        </div>

        {/* How It Works */}
        <div className="mt-16 rounded-2xl p-8 border border-white/10" style={{ backgroundColor: 'hsla(240, 15%, 9%, 1)' }}>
          <h2 className="text-3xl font-bold text-white font-['Teko'] mb-4 text-center tracking-wide">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Your Photo</h3>
              <p className="text-neutral-400">
                Submit your best action shot through our Custom Design Service
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">We Design Your Card</h3>
              <p className="text-neutral-400">
                Our team creates a professional design and sends you a proof within 24-48 hours
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Approve & Order</h3>
              <p className="text-neutral-400">
                Review your card design, select your packages and quantities, and place your order
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Receive Your Cards</h3>
              <p className="text-neutral-400">
                Your premium trading cards are printed and shipped straight to your door
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setPage('custom')}
            className="gradient-btn gradient-btn-primary px-8 py-4 text-white font-bold rounded-xl text-lg"
          >
            Order Your Custom Card
          </button>
          <p className="text-neutral-400 mt-4">
            Questions? Contact us at <a href="mailto:support@procardlegends.com" className="text-amber-400 hover:text-amber-300 transition-colors underline">support@procardlegends.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
