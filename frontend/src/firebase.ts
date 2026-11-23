import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import type { StudioProject } from './studio';
const config = {apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};
export const firebaseEnabled = Object.values(config).every(v => typeof v === 'string' && v.length > 0);
const app = firebaseEnabled ? getApps()[0] || initializeApp(config) : null;
// Configure a production reCAPTCHA v3 site key in the Firebase App Check console.
// Do not activate App Check without a registered key: it would break cloud requests.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
if (app && appCheckSiteKey && typeof window !== 'undefined') {
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appCheckSiteKey), isTokenAutoRefreshEnabled: true });
}
export const firebaseApp = app;
export const appCheckConfigured = Boolean(app && appCheckSiteKey);
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
export function watchUser(cb:(u:User|null)=>void):()=>void { if (!auth) { cb(null); return ()=>{}; } return onAuthStateChanged(auth,cb); }
export async function login(){ if(!auth) throw Error('Firebase not configured'); await signInWithPopup(auth,new GoogleAuthProvider()); }
export async function emailLogin(email:string,password:string,create=false){if(!auth)throw Error('Firebase not configured');if(create)await createUserWithEmailAndPassword(auth,email,password);else await signInWithEmailAndPassword(auth,email,password);}
let phoneVerifier: RecaptchaVerifier | null = null;
export async function sendPhoneCode(phone:string,elementId:string):Promise<ConfirmationResult>{
 if(!auth)throw Error('Firebase not configured');
 if(!phoneVerifier)phoneVerifier=new RecaptchaVerifier(auth,elementId,{size:'normal'});
 try { return await signInWithPhoneNumber(auth,phone,phoneVerifier); }
 catch(e){phoneVerifier.clear();phoneVerifier=null;throw e;}
}
export async function logout(){ if(!auth) throw Error('Firebase not configured'); await signOut(auth); }
export async function uploadProject(u:User,p:StudioProject){if(!db)throw Error('Firebase not configured');if(p.files.length>30||JSON.stringify(p).length>450000)throw Error('Project too large');await setDoc(doc(db,'users',u.uid,'projects',p.name),{...p,ownerId:u.uid,updatedAt:serverTimestamp()});}
export async function downloadProjects(u:User):Promise<StudioProject[]>{if(!db)throw Error('Firebase not configured');const snap=await getDocs(query(collection(db,'users',u.uid,'projects'),orderBy('updatedAt','desc'),limit(12)));return snap.docs.map(d=>d.data()).filter((p):p is StudioProject=>typeof p.name==='string'&&typeof p.prompt==='string'&&p.version===1&&Array.isArray(p.files)&&p.files.every((f:unknown)=>typeof f==='object'&&f!==null&&typeof (f as {path?:unknown}).path==='string'&&typeof (f as {content?:unknown}).content==='string')).map(p=>({name:p.name,prompt:p.prompt,files:p.files,createdAt:p.createdAt,version:1}));}
