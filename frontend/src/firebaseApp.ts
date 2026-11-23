import { getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { config, firebaseEnabled, recaptchaSiteKey } from './firebaseConfig';

export const firebaseApp = firebaseEnabled ? getApps()[0] ?? initializeApp(config) : null;
const appCheckDebug = import.meta.env.DEV && import.meta.env.VITE_APPCHECK_DEBUG === 'true';

if (firebaseApp && recaptchaSiteKey && appCheckDebug && typeof self !== 'undefined') {
  Object.assign(self, { FIREBASE_APPCHECK_DEBUG_TOKEN: true });
}

if (firebaseApp && recaptchaSiteKey) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
