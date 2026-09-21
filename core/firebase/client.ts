import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// App Check belongs to the reusable infrastructure layer. It is enabled only
// when a site key is configured, which keeps local/preview environments usable.
if (typeof window !== 'undefined') {
  const appCheckEnabled = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_ENABLED === '1';
  const appCheckSiteKey =
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY || firebaseConfig.recaptchaSiteKey;

  if (appCheckEnabled && appCheckSiteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Firebase App Check initialization warning:', error);
      }
    }
  }
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };

  console.error('Firestore operation failed:', errInfo);
  throw new Error(JSON.stringify(errInfo));
}
