import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { ShowcaseCard } from "../types";

const firebaseConfig = {
   apiKey: "AIzaSyBAC4Kc6Sr_1PqfmaWb3Xjf67xFE-EMlyw",
   authDomain: "procard-85e8c.firebaseapp.com",
   databaseURL: "https://procard-85e8c-default-rtdb.firebaseio.com",
   projectId: "procard-85e8c",
   storageBucket: "procard-85e8c.firebasestorage.app",
   messagingSenderId: "807835398510",
   appId: "1:807835398510:web:7fb4d27378cc197f32917f"
};

// Initialize Firebase
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