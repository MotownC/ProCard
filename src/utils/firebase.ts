import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { ShowcaseCard } from "../types";

// ------------------------------------------------------------------
// SECURE FIREBASE CONFIG
// Using direct import.meta.env access for Vite production build safety
// ------------------------------------------------------------------
const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
   databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
   appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebaseConfig.apiKey) {
  console.error("Firebase Config Missing! Check Vercel Environment Variables.");
}

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
      // Firebase stores data as an object of keys; convert to array
      const cardList = Object.values(data) as ShowcaseCard[];
      // Sort by ID descending (newest first)
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