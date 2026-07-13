import type { VercelRequest } from '@vercel/node';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  const serviceAccount = JSON.parse(raw);
  // Env vars often store the key with escaped newlines
  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL || process.env.VITE_FIREBASE_DB_URL,
  });
}

export const adminDb = () => getDatabase(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());

/** Look up a custom order by its secret approval token. */
export async function findOrderByToken(
  token: string
): Promise<{ key: string; order: Record<string, any> } | null> {
  const snap = await adminDb()
    .ref('customOrders')
    .orderByChild('approvalToken')
    .equalTo(token)
    .limitToFirst(1)
    .once('value');
  if (!snap.exists()) return null;
  const val = snap.val() as Record<string, any>;
  const key = Object.keys(val)[0];
  return { key, order: val[key] };
}

/**
 * Verify the request carries a Firebase ID token belonging to a whitelisted
 * admin (present under /admins/{uid}). Returns the uid, or null if not authorized.
 */
export async function requireAdmin(req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization || '';
  const match = /^Bearer (.+)$/.exec(Array.isArray(header) ? header[0] : header);
  if (!match) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const adminSnap = await adminDb().ref(`admins/${decoded.uid}`).once('value');
    return adminSnap.exists() ? decoded.uid : null;
  } catch {
    return null;
  }
}
