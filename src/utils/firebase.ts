import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { ShowcaseCard } from "../types";

// ------------------------------------------------------------------
// SECURE FIREBASE CONFIG
// Values are loaded from your .env file.
// ------------------------------------------------------------------

// Casting import.meta to any to avoid TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
const env = (import.meta as any).env;

const firebaseConfig = {
   apiKey: env.VITE_FIREBASE_API_KEY,
   authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
   databaseURL: env.VITE_FIREBASE_DB_URL,
   projectId: env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: env.VITE_FIREBASE_SENDER_ID,
   appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
// Simple check to ensure keys are loaded
if (!firebaseConfig.apiKey) {
  console.error("Firebase Config Missing! Check your .env file variables.");
}

// FIX: Use direct named import instead of namespace import
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Debug connection state
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("🟢 Connected to Firebase Realtime Database");
  } else {
    console.log("🔴 Disconnected from Firebase");
  }
});

export const subscribeToCards = (callback: (cards: ShowcaseCard[]) => void) => {
  const cardsRef = ref(db, 'cards');
  
  return onValue(cardsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log("🔥 Data received:", Object.keys(data).length, "cards");
      const cardList = Object.values(data) as ShowcaseCard[];
      callback(cardList.sort((a, b) => b.id - a.id));
    } else {
      console.log("🔥 Database is empty.");
      callback([]);
    }
  }, (error) => {
    console.error("🔥 Read Error:", error);
    callback([]); 
  });
};

export const saveCardToFirebase = async (card: ShowcaseCard) => {
  try {
    const cardRef = ref(db, 'cards/' + card.id);
    await set(cardRef, card);
    console.log("✅ Saved card:", card.id);
  } catch (error: any) {
    console.error("🔥 Save Error:", error);
    alert(`Database Error: ${error.message}`);
  }
};

export const deleteCardFromFirebase = async (id: number) => {
  try {
    const cardRef = ref(db, 'cards/' + id);
    await remove(cardRef);
  } catch (error) {
    console.error("Delete Error:", error);
    alert("Failed to delete.");
  }
};