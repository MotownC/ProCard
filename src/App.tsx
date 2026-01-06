import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import OrderForm from './components/OrderForm';
import CustomOrderForm from './components/CustomOrderForm';
import Checkout from './components/Checkout';
import Roadmap from './components/Roadmap';
import { CardRarity, ShowcaseCard } from './types';
import { subscribeToCards, saveCardToFirebase, deleteCardFromFirebase } from './utils/firebase';

const getRandomCard = (cards: ShowcaseCard[]): ShowcaseCard | undefined => {
  if (cards.length === 0) return undefined;
  return cards[Math.floor(Math.random() * cards.length)];
};

const DEFAULT_CARDS: ShowcaseCard[] = [
  { 
    id: 0, 
    player: 'JAXSON "THE JET"', 
    team: "TIGERS | QB", 
    imageType: "action", 
    rarity: CardRarity.HOLOGRAPHIC, 
    gradient: "from-cyan-400 to-purple-600" 
  },
  { id: 1, player: "LEO STRIDE", team: "WILDCATS", imageType: "action", rarity: CardRarity.HOLOGRAPHIC, gradient: "from-purple-600 to-blue-600" },
  { id: 2, player: "MIA HAMMER", team: "COMETS", imageType: "portrait", rarity: CardRarity.CHROME, gradient: "from-orange-500 to-red-600" },
  { id: 3, player: "JAYDEN FAST", team: "RAPTORS", imageType: "action", rarity: CardRarity.ONE_OF_ONE, gradient: "from-yellow-400 to-yellow-700" },
  { id: 4, player: "SAM SPIKE", team: "VOLLEY ELITE", imageType: "action", rarity: CardRarity.BASE, gradient: "from-green-500 to-emerald-700" },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [cards, setCards] = useState<ShowcaseCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Subscribe to Firebase updates with Safety Timeout
  useEffect(() => {
    let isMounted = true;
    let hasLoadedData = false;

    // 1. Setup Firebase Listener
    const unsubscribe = subscribeToCards((firebaseCards) => {
      if (!isMounted) return;
      hasLoadedData = true; // Mark as successfully connected
      
      if (firebaseCards && firebaseCards.length > 0) {
        setCards(firebaseCards);
      } else {
        // If DB is empty, use defaults
        setCards(DEFAULT_CARDS);
      }
      setIsLoaded(true);
    });

    // 2. Safety Timeout: Force load ONLY if we haven't heard from Firebase yet
    const timeout = setTimeout(() => {
      if (!hasLoadedData) {
        console.warn("Firebase took too long. Showing default cards.");
        setCards(DEFAULT_CARDS);
        setIsLoaded(true);
      }
    }, 5000); // Increased to 5 seconds

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const handleAddCards = async (newCards: ShowcaseCard[]) => {
    // We do NOT update local state here manually. 
    // We let the Firebase subscription update the UI to ensure sync.
    for (const card of newCards) {
      await saveCardToFirebase(card);
    }
  };

  const handleUpdateCard = async (updatedCard: ShowcaseCard) => {
    await saveCardToFirebase(updatedCard);
  };

  const handleRemoveCard = async (id: number) => {
    await deleteCardFromFirebase(id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero setPage={setCurrentPage} featuredCard={getRandomCard(cards)} />
            <Gallery 
              cards={cards} 
              onAddCards={handleAddCards} 
              onUpdateCard={handleUpdateCard}
              onRemoveCard={handleRemoveCard} 
              isAdmin={false} 
            />
          </>
        );
      case 'gallery':
        return (
          <Gallery 
            cards={cards} 
            onAddCards={handleAddCards} 
            onUpdateCard={handleUpdateCard}
            onRemoveCard={handleRemoveCard} 
            isAdmin={false} 
          />
        );
      case 'admin':
        return (
          <div className="bg-slate-800/50 min-h-screen pb-20">
            <div className="bg-red-900/20 border-b border-red-500/30 py-4 mb-8">
              <div className="max-w-7xl mx-auto px-4 text-red-200 font-mono text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                ADMIN MODE ACTIVE: Connected to Cloud Database.
              </div>
            </div>
            <Gallery 
              cards={cards} 
              onAddCards={handleAddCards} 
              onUpdateCard={handleUpdateCard}
              onRemoveCard={handleRemoveCard} 
              isAdmin={true} 
            />
          </div>
        );
      case 'create':
case 'checkout':
  return (
    <>
      <div style={{ display: currentPage === 'create' ? 'block' : 'none' }}>
        <OrderForm
          setPage={setCurrentPage}
          setPendingOrder={setPendingOrder}
        />
      </div>

      <div style={{ display: currentPage === 'checkout' ? 'block' : 'none' }}>
        <Checkout
          pendingOrder={pendingOrder}
          setPage={setCurrentPage}
        />
      </div>
    </>
  );

      case 'custom':
        return <CustomOrderForm setPage={setCurrentPage} />;
      case 'roadmap':
        return <Roadmap />;
      default:
        return <Hero setPage={setCurrentPage} featuredCard={cards[0]} />;
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-mono">Syncing with HQ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar currentPage={currentPage} setPage={setCurrentPage} />
      <main className="pt-16">
        {renderPage()}
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2026 ProCard Legends. Transform your game.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;