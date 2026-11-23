export const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;

export const firebaseEnabled = Object.values(config).every(
  (value) => typeof value === 'string' && value.length > 0,
);

export const firebaseAppCheckReady = Boolean(firebaseEnabled && recaptchaSiteKey);
