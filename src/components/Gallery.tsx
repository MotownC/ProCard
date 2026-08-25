import React, { useRef, useState } from 'react';
import { CardRarity, ShowcaseCard } from '../types';
import { Upload, Trash2, Plus, X, Maximize2, RefreshCw, ImagePlus, Palette, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import CardFrontFace from './CardFrontFace';
import GalleryCarousel from './GalleryCarousel';

// Generate Cloudinary srcset for responsive images (still used for the back-face image below)
const cloudinarySrcSet = (url: string | undefined) => {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  const widths = [320, 480, 640];
  return widths.map(w => {
    const transformed = url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`);
    return `${transformed} ${w}w`;
  }).join(', ');
};

interface GalleryProps {
  cards: ShowcaseCard[];
  onAddCards: (newCards: ShowcaseCard[]) => void;
  onUpdateCard: (card: ShowcaseCard) => void;
  onRemoveCard: (id: number) => void;
  isAdmin?: boolean;
}

const COLOR_OPTIONS = [
  { name: 'Red', value: 'from-red-600 to-orange-600', dot: 'bg-red-500' },
  { name: 'Orange', value: 'from-orange-500 to-red-500', dot: 'bg-orange-500' },
  { name: 'Gold', value: 'from-yellow-400 to-amber-600', dot: 'bg-yellow-400' },
  { name: 'Green', value: 'from-green-500 to-emerald-600', dot: 'bg-green-500' },
  { name: 'Cyan', value: 'from-cyan-500 to-blue-500', dot: 'bg-cyan-500' },
  { name: 'Purple', value: 'from-purple-600 to-pink-600', dot: 'bg-purple-500' },
  { name: 'Silver', value: 'from-slate-100 to-slate-400', dot: 'bg-slate-200' },
  { name: 'Midnight', value: 'from-slate-700 to-black', dot: 'bg-slate-800' },
];

const Gallery: React.FC<GalleryProps> = ({ cards, onAddCards, onUpdateCard, onRemoveCard, isAdmin = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);
  const [isModalFlipped, setIsModalFlipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Sort cards by order field (if present), otherwise by id
  const sortedCards = [...cards].sort((a, b) => {
    const orderA = a.order ?? a.id;
    const orderB = b.order ?? b.id;
    return orderA - orderB;
  });

  const handleMoveUp = (card: ShowcaseCard) => {
    const currentIndex = sortedCards.findIndex(c => c.id === card.id);
    if (currentIndex <= 0) return; // Already at the top

    const prevCard = sortedCards[currentIndex - 1];
    const currentOrder = card.order ?? card.id;
    const prevOrder = prevCard.order ?? prevCard.id;

    // Swap orders
    onUpdateCard({ ...card, order: prevOrder });
    onUpdateCard({ ...prevCard, order: currentOrder });
  };

  const handleMoveDown = (card: ShowcaseCard) => {
    const currentIndex = sortedCards.findIndex(c => c.id === card.id);
    if (currentIndex >= sortedCards.length - 1) return; // Already at the bottom

    const nextCard = sortedCards[currentIndex + 1];
    const currentOrder = card.order ?? card.id;
    const nextOrder = nextCard.order ?? nextCard.id;

    // Swap orders
    onUpdateCard({ ...card, order: nextOrder });
    onUpdateCard({ ...nextCard, order: currentOrder });
  };

  const handleUploadNew = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const newCards: ShowcaseCard[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1}/${files.length}...`);
        
        try {
          const imageUrl = await uploadToCloudinary(file);
          
          newCards.push({
            id: Date.now() + i,
            player: "YOUR DESIGN",
            team: "CUSTOM",
            imageType: "upload",
            rarity: CardRarity.ONE_OF_ONE,
            gradient: "from-cyan-500 to-blue-500",
            imageUrl: imageUrl
          });
        } catch (e) {
          console.error("Error uploading file", e);
          alert(`Failed to upload ${file.name}. Check API Keys.`);
        }
      }
      
      if (newCards.length > 0) {
          onAddCards(newCards);
      }
      setIsUploading(false);
      setUploadProgress('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openModal = (card: ShowcaseCard) => {
    setSelectedCard(card);
    setIsModalFlipped(false);
  };

  const openModalFlipped = (card: ShowcaseCard) => {
    setSelectedCard(card);
    setIsModalFlipped(true);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setIsModalFlipped(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="text-left">
          <h2 className="text-4xl font-bold text-white font-['Teko'] mb-2">HALL OF FAME</h2>
          <p className="text-gray-400">Showcase of our premium custom designs. Click a card to expand.</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadNew}
              className="hidden"
              multiple
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? uploadProgress || 'Uploading...' : 'Upload Designs'}
            </button>
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
          <p className="text-gray-500">Gallery is empty.</p>
          {isAdmin && (
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-amber-400 hover:text-amber-300 font-medium flex items-center justify-center gap-2 mx-auto"
            >
                <Plus className="w-4 h-4" /> Add Card
            </button>
          )}
        </div>
      ) : isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {sortedCards.map((card, index) => (
            <GalleryCard
              key={card.id}
              card={card}
              onRemove={() => onRemoveCard(card.id)}
              onExpand={() => openModal(card)}
              onExpandFlipped={() => openModalFlipped(card)}
              onUpdate={onUpdateCard}
              onMoveUp={() => handleMoveUp(card)}
              onMoveDown={() => handleMoveDown(card)}
              isAdmin={isAdmin}
              isFirst={index === 0}
              isLast={index === sortedCards.length - 1}
            />
          ))}
        </div>
      ) : (
        <GalleryCarousel cards={sortedCards} onSelectCentered={openModal} />
      )}

      {/* Expanded Card Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md transition-opacity duration-300"
          onClick={closeModal}
        >
          <button 
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[110]"
            onClick={(e) => { e.stopPropagation(); closeModal(); }}
          >
            <X className="w-8 h-8" />
          </button>

          <div 
            className="relative w-full max-w-lg lg:max-w-xl aspect-[2.5/3.5] perspective-1000 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
             <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isModalFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                
                {/* --- MODAL FRONT --- */}
                <div className="absolute inset-0 [backface-visibility:hidden]">
                    <div className={`absolute -inset-2 bg-gradient-to-r ${selectedCard.gradient} rounded-3xl blur-2xl opacity-50`}></div>
                    <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-2xl flex flex-col">
                        <div className="h-full relative overflow-hidden bg-slate-900 group flex items-center justify-center">
                            
                            {selectedCard.backImageUrl && !isModalFlipped && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsModalFlipped(true); }}
                                    className="absolute top-4 right-4 z-50 p-3 bg-slate-900/80 text-amber-400 hover:text-white rounded-full hover:bg-amber-600 transition-colors shadow-lg"
                                    title="Flip Card"
                                >
                                    <RefreshCw className="w-6 h-6" />
                                </button>
                            )}

                            {/* UPDATED: object-fill stretches image to fit exactly */}
                            <img 
                            src={selectedCard.imageUrl || `https://picsum.photos/800/1200?random=${selectedCard.id + 10}`} 
                            alt={selectedCard.player} 
                            className="w-full h-full object-fill"
                            />
                            
                            <div className="absolute inset-0 card-shine opacity-30 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40 pointer-events-none mix-blend-overlay"></div>

                            {selectedCard.imageType !== 'upload' && (
                                <>
                                    <div className="absolute inset-0 carbon-fibre opacity-10 mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 w-full p-8 bg-slate-900/40 backdrop-blur-md border-t border-white/10">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-amber-400 font-bold tracking-[0.3em] text-lg font-['Teko'] uppercase mb-1 drop-shadow-md">{selectedCard.team}</p>
                                                <h2 className="text-7xl font-['Teko'] font-bold text-white leading-none italic uppercase drop-shadow-2xl">{selectedCard.player}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- MODAL BACK --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className={`absolute -inset-2 bg-gradient-to-r ${selectedCard.gradient} rounded-3xl blur-2xl opacity-50`}></div>
                    <div className="relative w-full h-full bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-2xl flex flex-col">
                        {isModalFlipped && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsModalFlipped(false); }}
                                className="absolute top-4 right-4 z-50 p-3 bg-slate-900/80 text-amber-400 hover:text-white rounded-full hover:bg-amber-600 transition-colors shadow-lg"
                                title="Flip to Front"
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                        )}
                        
                        <div className="h-full w-full bg-slate-900 relative flex items-center justify-center">
                             {selectedCard.backImageUrl ? (
                                <div className="w-full h-full relative">
                                    {/* UPDATED: object-fill stretches back image */}
                                    <img 
                                        src={selectedCard.backImageUrl} 
                                        alt="Card Back" 
                                        className="w-full h-full object-fill"
                                    />
                                    <div className="absolute inset-0 card-shine opacity-10 pointer-events-none"></div>
                                </div>
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No Back Image</div>
                             )}
                        </div>
                    </div>
                </div>

             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryCard: React.FC<{
  card: ShowcaseCard;
  onRemove: () => void;
  onExpand: () => void;
  onExpandFlipped: () => void;
  onUpdate: (card: ShowcaseCard) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isAdmin: boolean;
  isFirst: boolean;
  isLast: boolean;
}> = ({ card, onRemove, onExpand, onExpandFlipped, onUpdate, onMoveUp, onMoveDown, isAdmin, isFirst, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isUpload = card.imageType === 'upload';
  const hasBack = !!card.backImageUrl;

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        const imageUrl = await uploadToCloudinary(file);
        onUpdate({ ...card, backImageUrl: imageUrl });
        setIsFlipped(true);
      } catch(e) {
        alert("Failed to upload back image.");
      }
      setIsUploading(false);
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <>
    <div
      className="group relative w-full max-w-[320px] aspect-[2.5/3.5] mx-auto cursor-pointer perspective-1000"
      onClick={isFlipped ? onExpandFlipped : onExpand}
    >
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* --- FRONT FACE --- */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-800">
           
           {!isFlipped && (
             <div className="absolute top-2 right-2 z-30 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {hasBack && (
                   <button
                     onClick={handleFlip}
                     className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-amber-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Flip to Back"
                   >
                     <RefreshCw className="w-4 h-4" />
                   </button>
                )}

                {/* ADMIN CONTROLS */}
                {isAdmin && isUpload && !hasBack && (
                    <>
                      <input
                         type="file"
                         ref={backInputRef}
                         className="hidden"
                         accept="image/*"
                         onChange={handleBackUpload}
                         onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           backInputRef.current?.click();
                        }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-yellow-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add Back Photo"
                      >
                        {isUploading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <ImagePlus className="w-4 h-4" />}
                      </button>
                    </>
                )}

                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDelete(true);
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-gray-400 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>
           )}

           {/* ADMIN: Arrow Buttons for Reordering */}
           {!isFlipped && isAdmin && (
             <div className="absolute top-2 left-2 z-30 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                {!isFirst && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveUp();
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-amber-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
                {!isLast && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveDown();
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-amber-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                )}
             </div>
           )}

           {!isFlipped && (
             <div className="absolute top-3 left-3 z-20 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                <Maximize2 className="w-4 h-4 text-white" />
             </div>
           )}

           <div className="relative h-full">
              <CardFrontFace card={card} />

              {/* ADMIN CONTROLS: Color Picker */}
              {isAdmin && isUpload && (
                <div
                  className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 p-2 rounded-full bg-slate-900/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Palette className="w-3 h-3 text-gray-400 mr-1" />
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => onUpdate({ ...card, gradient: color.value })}
                      className={`w-4 h-4 rounded-full ${color.dot} border border-white/30 hover:scale-125 transition-transform ${card.gradient === color.value ? 'ring-2 ring-white scale-110' : ''}`}
                      title={`Set Glow: ${color.name}`}
                    />
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* --- BACK FACE --- */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-800">
            <div className="relative w-full h-full">
               {/* Desktop version - same as front */}
               <div className="hidden md:block">
                 <div className="absolute top-3 left-3 z-20 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                    <Maximize2 className="w-4 h-4 text-white" />
                 </div>
                 
                 <button
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFlip(e); }}
                     className="absolute top-2 right-2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-amber-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Flip to Front"
                   >
                     <RefreshCw className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Mobile/iOS version - same as front */}
               <div className="md:hidden">
                 <div className="absolute top-3 left-3 z-20 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                    <Maximize2 className="w-4 h-4 text-white" />
                 </div>
                 
                 <button
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFlip(e); }}
                     className="absolute top-2 right-2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900/80 text-amber-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Flip to Front"
                   >
                     <RefreshCw className="w-4 h-4" />
                 </button>
               </div>

               {card.backImageUrl ? (
                   <div className="w-full h-full relative">
                       <img
                         src={card.backImageUrl}
                         srcSet={cloudinarySrcSet(card.backImageUrl)}
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                         alt={`${card.player} card back`}
                         loading="lazy"
                         className="w-full h-full object-fill"
                       />
                       <div className="absolute inset-0 card-shine opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                   </div>
               ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-gray-500 p-6 text-center">
                       <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                           <div className="font-['Teko'] text-3xl text-slate-500 font-bold">PC</div>
                       </div>
                       <p className="font-['Teko'] text-2xl uppercase">Official Legend</p>
                       <p className="text-sm">ProCard Authenticated</p>
                   </div>
               )}
            </div>
        </div>
      </div>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500 -z-10`}></div>
    </div>

    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Remove Card</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Remove <span className="text-white font-semibold">{card.player}</span> from the gallery? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); onRemove(); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Gallery;