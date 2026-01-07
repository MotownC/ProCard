import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';

interface PricingProps {
  setPage: (page: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ setPage }) => {
  const pricingTiers = [
    {
      name: 'Single Sided',
      price: '$10',
      description: 'Perfect for showcasing your best moment',
      features: [
        'Professional card design',
        'High-quality print',
        'Standard glossy finish',
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
        'High-quality print',
        'Standard glossy finish',
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
      name: 'Deluxe Package',
      price: '$25',
      description: 'The ultimate card experience',
      features: [
        'Custom double-sided card',
        'Magnetic protective case',
        'High-res digital download',
        'Three design iterations included',
        'Priority 24-hour turnaround',
        'Perfect for serious collectors'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <h1 className="text-5xl md:text-6xl font-bold text-white font-['Teko'] mb-4 text-center">
            PRICING
          </h1>
          <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
            Professional trading cards at transparent prices. Choose the package that fits your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-slate-800 rounded-xl p-6 border-2 transition-all hover:scale-105 ${
                tier.popular
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'border-slate-700 hover:border-cyan-500'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white font-['Teko'] mb-2">
                  {tier.name}
                </h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                  {tier.price}
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white font-['Teko'] mb-4 text-center">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Your Photo</h3>
              <p className="text-gray-400">
                Submit your best action shot through our Custom Design Service
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">We Design Your Card</h3>
              <p className="text-gray-400">
                Our team creates a professional design and sends you a proof within 24-48 hours
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Receive Your Cards</h3>
              <p className="text-gray-400">
                Approve the design and receive your premium trading cards
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setPage('custom')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold rounded-lg transition-all text-lg"
          >
            Get Started with Custom Design
          </button>
          <p className="text-gray-400 mt-4">
            Questions? Contact us at support@procardlegends.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
