import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, get, query, orderByChild, equalTo } from "firebase/database";
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
  // Payment & proof approval fields
  proofImageUrl?: string;
  approvalToken?: string;
  selectedOptions?: string[];
  quantities?: Record<string, number>;
  totalPaidCents?: number;
  paymentIntentId?: string;
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

// Update order with proof image and approval token
export const updateOrderProof = async (timestamp: number, proofImageUrl: string, approvalToken: string) => {
  try {
    const orderRef = ref(db, 'customOrders/' + timestamp);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) throw new Error('Order not found');
    const existing = snapshot.val();
    await set(orderRef, { ...existing, proofImageUrl, approvalToken, status: 'proof_sent' });
    console.log("✅ Updated order proof:", timestamp);
  } catch (error: any) {
    console.error("🔥 Proof Update Error:", error);
    throw new Error(`Failed to update proof: ${error.message}`);
  }
};

// Look up an order by its approval token
export const getOrderByToken = async (token: string): Promise<CustomOrder | null> => {
  try {
    const ordersRef = ref(db, 'customOrders');
    const q = query(ordersRef, orderByChild('approvalToken'), equalTo(token));
    const snapshot = await get(q);
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    const orders = Object.values(data) as CustomOrder[];
    return orders[0] || null;
  } catch (error) {
    console.error("🔥 Token Lookup Error:", error);
    return null;
  }
};

// Mark order as complete (shipped)
export const updateOrderComplete = async (timestamp: number) => {
  try {
    const orderRef = ref(db, 'customOrders/' + timestamp);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) throw new Error('Order not found');
    const existing = snapshot.val();
    await set(orderRef, { ...existing, status: 'complete' });
    console.log("✅ Marked order complete:", timestamp);
  } catch (error: any) {
    console.error("🔥 Complete Update Error:", error);
    throw new Error(`Failed to mark complete: ${error.message}`);
  }
};

// Update order after successful payment
export const updateOrderPayment = async (
  timestamp: number,
  paymentData: {
    paymentIntentId: string;
    selectedOptions: string[];
    quantities: Record<string, number>;
    totalPaidCents: number;
  }
) => {
  try {
    const orderRef = ref(db, 'customOrders/' + timestamp);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) throw new Error('Order not found');
    const existing = snapshot.val();
    await set(orderRef, { ...existing, ...paymentData, status: 'paid' });
    console.log("✅ Updated order payment:", timestamp);
  } catch (error: any) {
    console.error("🔥 Payment Update Error:", error);
    throw new Error(`Failed to update payment: ${error.message}`);
  }
};