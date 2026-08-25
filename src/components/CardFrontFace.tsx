import React from 'react';
import { ShowcaseCard } from '../types';

// Generate Cloudinary srcset for responsive images
const cloudinarySrcSet = (url: string | undefined) => {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  const widths = [320, 480, 640];
  return widths.map(w => {
    const transformed = url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`);
    return `${transformed} ${w}w`;
  }).join(', ');
};

// Shared front-face visuals for a gallery card: image, shine, and (for non-uploads)
// the gradient footer with player/team info. Used by both the admin grid (GalleryCard)
// and the visitor coverflow (GalleryCarousel) so a card looks identical in both places.
const CardFrontFace: React.FC<{ card: ShowcaseCard }> = ({ card }) => {
  const isUpload = card.imageType === 'upload';

  return (
    <div className="h-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
      <img
        src={card.imageUrl || `https://picsum.photos/300/500?random=${card.id + 10}`}
        srcSet={cloudinarySrcSet(card.imageUrl)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
        alt={card.player}
        loading="lazy"
        className="w-full h-full object-fill"
      />

      <div className="absolute inset-0 card-shine opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>

      {!isUpload && (
        <>
          <div className="absolute inset-0 carbon-fibre opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute bottom-0 w-full p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-['Teko'] font-bold text-white leading-none tracking-wide italic uppercase truncate max-w-[150px]">{card.player}</h3>
                <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase truncate max-w-[150px]">{card.team}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                  <span className="text-xs font-bold text-white">#{card.id.toString().slice(-2)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardFrontFace;
