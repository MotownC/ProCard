import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { ShowcaseCard } from '../types';

interface HeroProps {
  setPage: (page: string) => void;
  featuredCard?: ShowcaseCard;
}

const Hero: React.FC<HeroProps> = ({ setPage, featuredCard }) => {
  // Default fallback if no card is provided
  const card = featuredCard || {
    id: 0,
    player: 'LEGEND MAKER',
    team: 'CREATE YOURS',
    gradient: 'from-slate-700 to-slate-900',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    imageType: 'action'
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 pt-24 pb-12 lg:pt-32 lg:pb-24">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 text-sm font-medium mb-6">
            <Star className="w-3 h-3 fill-cyan-400" />
            <span>Next Gen Sports Design</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-none font-['Teko']">
            TURN SUNDAY GAMES <br />
            INTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ETERNAL LEGENDS</span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-lg mx-auto lg:mx-0">
            We transform your raw action shots into professional-grade trading cards. Better than retail. Custom made. Built for glory.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => setPage('create')}
              className="px-8 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold transition-all flex items-center justify-center gap-2"
            >
              Create Card (DIY)
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage('custom')}
              className="px-8 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              Custom Design Service
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage('gallery')}
              className="px-8 py-3 rounded-lg border border-slate-600 hover:bg-slate-800 text-white font-medium transition-all"
            >
              View Gallery
            </button>
          </div>
        </div>
        
        <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center perspective-1000">
          {/* 
              CARD DIMENSIONS: 
              aspect-[2.5/3.5] creates exact trading card proportions (2.5" x 3.5")
              w-80 provides appropriate size on desktop
          */}
          <div className="relative w-80 aspect-[2.5/3.5] rounded-xl shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-500 group">
             {/* Dynamic Gradient Background */}
             <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-xl opacity-50`}></div>
             <div className="absolute inset-0 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center">
                
                {/* 
                    IMAGE: 
                    Changed to 'object-cover' so the image fills the entire card area without black bars.
                */}
                <img 
                  src={card.imageUrl || `https://picsum.photos/400/600?random=${card.id}`} 
                  alt="Card Sample" 
                  className="w-full h-full object-cover bg-black opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlays (Only show if not an upload, to keep consistency with Gallery) */}
                {card.imageType !== 'upload' && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                        <h3 className="text-3xl font-['Teko'] font-bold text-white uppercase italic leading-none drop-shadow-md">{card.player}</h3>
                        <div className="flex justify-between items-end mt-1">
                            <p className="text-cyan-400 font-bold uppercase tracking-wider drop-shadow-md">{card.team}</p>
                            <span className="text-xs text-gray-400 border border-gray-600 px-1 rounded bg-black/50">RC</span>
                        </div>
                        </div>
                    </>
                )}
             </div>
             {/* Shine Effect */}
             <div className="absolute inset-0 pointer-events-none card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;