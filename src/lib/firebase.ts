import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyB9YvFT-uzccwoir9Gofa4CDkR4gM3lF60',
  authDomain: 'oyeride-b6973.firebaseapp.com',
  projectId: 'oyeride-b6973',
  storageBucket: 'oyeride-b6973.firebasestorage.app',
  messagingSenderId: '339897437664',
  appId: '1:339897437664:web:630ee65f16488c3385af85',
  measurementId: 'G-B114PFT2X4',
  databaseURL: 'https://oyeride-b6973-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  ignoreUndefinedProperties: true,
} as any);

export const database = getDatabase(app);

// Messaging is only available in browsers that support it (not Node/SW context)
export const messagingPromise = isSupported().then((ok) => (ok ? getMessaging(app) : null));

export default app;
