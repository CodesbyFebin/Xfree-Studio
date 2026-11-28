import {
  createUserWithEmailAndPassword,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { AgentTrustResult, TrustDecision } from './agentTrust';
import type { StudioProject } from './studio';
import { firebaseApp } from './firebaseApp';
import { firebaseAppCheckReady } from './firebaseConfig';
export { firebaseAppCheckReady, firebaseEnabled } from './firebaseConfig';

const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

if (firebaseApp && auth && db && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
}

const MAX_PROJECT_BYTES = 450_000;
const MAX_FILE_PATH_LENGTH = 200;
const MAX_PROJECT_FILES = 10;

export function watchUser(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function login(): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function emailLogin(email: string, password: string, create = false): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured.');
  if (create) await createUserWithEmailAndPassword(auth, email, password);
  else await signInWithEmailAndPassword(auth, email, password);
}

let phoneVerifier: RecaptchaVerifier | null = null;

export async function sendPhoneCode(phone: string, elementId: string): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase is not configured.');
  if (!phoneVerifier) phoneVerifier = new RecaptchaVerifier(auth, elementId, { size: 'normal' });
  try {
    return await signInWithPhoneNumber(auth, phone, phoneVerifier);
  } catch (error) {
    phoneVerifier.clear();
    phoneVerifier = null;
    throw error;
  }
}

export async function logout(): Promise<void> {
  if (!auth) throw new Error('Firebase is not configured.');
  await signOut(auth);
}

function validateProject(project: StudioProject): void {
  if (
    !project ||
    typeof project.name !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{0,39}$/.test(project.name) ||
    typeof project.prompt !== 'string' ||
    project.prompt.length > 1200 ||
    typeof project.createdAt !== 'string' ||
    project.createdAt.length > 40 ||
    Number.isNaN(Date.parse(project.createdAt)) ||
    project.version !== 1 ||
    !Array.isArray(project.files) ||
    project.files.length > MAX_PROJECT_FILES ||
    project.files.some((file) =>
      !file ||
      typeof file.path !== 'string' ||
      file.path.length === 0 ||
      file.path.length > MAX_FILE_PATH_LENGTH ||
      file.path.startsWith('/') ||
      file.path.includes('\\') ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/.test(file.path) ||
      file.path.split('/').some((part) => !part || part === '.' || part === '..') ||
      typeof file.content !== 'string',
    )
  ) {
    throw new Error('Project data is invalid.');
  }

  if (new TextEncoder().encode(JSON.stringify(project)).length > MAX_PROJECT_BYTES) {
    throw new Error('Project is too large to sync.');
  }
}

export async function uploadProject(user: User, project: StudioProject): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  validateProject(project);

  // Firestore rules require client ISO strings. serverTimestamp() is a Timestamp
  // sentinel and was rejected by the existing rules on every save.
  await setDoc(doc(db, 'users', user.uid, 'projects', project.name), {
    ...project,
    ownerId: user.uid,
    updatedAt: new Date().toISOString(),
  });
}

function isProject(value: unknown): value is StudioProject & { updatedAt: string; ownerId: string } {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<StudioProject> & { updatedAt?: unknown; ownerId?: unknown };
  if (
    typeof project.name !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{0,39}$/.test(project.name) ||
    typeof project.prompt !== 'string' ||
    project.prompt.length > 1200 ||
    typeof project.createdAt !== 'string' ||
    Number.isNaN(Date.parse(project.createdAt)) ||
    typeof project.updatedAt !== 'string' ||
    Number.isNaN(Date.parse(project.updatedAt)) ||
    typeof project.ownerId !== 'string' ||
    project.version !== 1 ||
    !Array.isArray(project.files) ||
    project.files.length > MAX_PROJECT_FILES
  ) return false;

  return project.files.every((file) =>
    !!file &&
    typeof file.path === 'string' &&
    file.path.length > 0 &&
    file.path.length <= MAX_FILE_PATH_LENGTH &&
    !file.path.startsWith('/') &&
    !file.path.includes('\\') &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/.test(file.path) &&
    !file.path.split('/').some((part) => !part || part === '.' || part === '..') &&
    typeof file.content === 'string',
  );
}

export async function downloadProjects(user: User): Promise<StudioProject[]> {
  if (!db) throw new Error('Firebase is not configured.');
  const snapshot = await getDocs(query(
    collection(db, 'users', user.uid, 'projects'),
    orderBy('updatedAt', 'desc'),
    limit(12),
  ));
  return snapshot.docs
    .map((document) => document.data())
    .filter(isProject)
    .map(({ name, prompt, files, createdAt, version }) => ({ name, prompt, files, createdAt, version }));
}
export type SavedAgentTrustCheck = {
  id: string;
  agentName: string;
  agentRef: string;
  operation: string;
  riskLevel: 'low' | 'elevated' | 'high';
  score: number;
  decision: TrustDecision;
  createdAt: string;
};

export async function saveAgentTrustCheck(user: User, result: AgentTrustResult): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  if (result.agentName.length > 80 || result.agentRef.length > 120 || result.operation.length > 120) {
    throw new Error('Shorten the agent details before saving this check.');
  }
  await addDoc(collection(db, 'users', user.uid, 'agentTrustChecks'), {
    schemaVersion: 1,
    ownerId: user.uid,
    agentName: result.agentName.trim(),
    agentRef: result.agentRef.trim(),
    operation: result.operation,
    riskLevel: result.riskLevel,
    score: result.score,
    decision: result.decision,
    humanSignal: result.humanSignal,
    signals: result.signals,
    createdAt: serverTimestamp(),
  });
}

export async function loadAgentTrustChecks(user: User): Promise<SavedAgentTrustCheck[]> {
  if (!db) throw new Error('Firebase is not configured.');
  const snapshot = await getDocs(query(
    collection(db, 'users', user.uid, 'agentTrustChecks'),
    orderBy('createdAt', 'desc'),
    limit(8),
  ));
  return snapshot.docs.map((document) => {
    const data = document.data();
    const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
      ? data.createdAt.toDate().toLocaleString()
      : 'Just now';
    return {
      id: document.id,
      agentName: String(data.agentName || 'Agent'),
      agentRef: String(data.agentRef || ''),
      operation: String(data.operation || ''),
      riskLevel: data.riskLevel,
      score: Number(data.score || 0),
      decision: data.decision,
      createdAt,
    };
  });
}
