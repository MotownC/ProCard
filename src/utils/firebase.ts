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

// Custom Order Submission
export interface CustomOrder {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  notes: string;
  timestamp: number;
  status?: string;
}

export const saveCustomOrderToFirebase = async (order: CustomOrder) => {
  try {
    const orderRef = ref(db, 'customOrders/' + order.timestamp);
    await set(orderRef, { ...order, status: 'pending' });
    console.log("✅ Saved custom order:", order.timestamp);
  } catch (error: any) {
    console.error("🔥 Custom Order Save Error:", error);
    throw new Error(`Failed to submit order: ${error.message}`);
  }
};

export const subscribeToCustomOrders = (callback: (orders: CustomOrder[]) => void) => {
  const ordersRef = ref(db, 'customOrders');

  return onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const orderList = Object.values(data) as CustomOrder[];
      // Sort by timestamp descending (newest first)
      callback(orderList.sort((a, b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("🔥 Custom Orders Read Error:", error);
    callback([]);
  });
};

export const updateCustomOrderStatus = async (timestamp: number, status: string) => {
  try {
    const orderRef = ref(db, 'customOrders/' + timestamp);
    await set(orderRef, { status } as any);
    console.log("✅ Updated order status:", timestamp, status);
  } catch (error: any) {
    console.error("🔥 Status Update Error:", error);
    throw new Error(`Failed to update status: ${error.message}`);
  }
};

export const deleteCustomOrder = async (timestamp: number) => {
  try {
    const orderRef = ref(db, 'customOrders/' + timestamp);
    await remove(orderRef);
    console.log("✅ Deleted custom order:", timestamp);
  } catch (error) {
    console.error("🔥 Delete Error:", error);
    throw error;
  }
};