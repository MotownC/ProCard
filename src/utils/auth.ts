import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

export const signInAdmin = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOutAdmin = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getAdminIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
};
