import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

const projectId = 'demo-xfree-studio-rules';
let testEnv;

before(async () => {
  const rules = await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port: 8085, rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv?.cleanup();
});

function project(ownerId = 'alice') {
  return {
    name: 'demo-project',
    prompt: 'A small example project',
    files: [{ path: 'index.html', content: '<main>Hello</main>' }],
    createdAt: '2026-11-27T00:00:00.000Z',
    updatedAt: '2026-11-27T00:00:00.000Z',
    version: 1,
    ownerId,
  };
}

test('an owner can create and read their project', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const ref = doc(alice, 'users/alice/projects/demo-project');
  await assertSucceeds(setDoc(ref, project()));
  const snapshot = await assertSucceeds(getDoc(ref));
  assert.equal(snapshot.data()?.ownerId, 'alice');
});

test('another signed-in user cannot read or create under the owner path', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const bob = testEnv.authenticatedContext('bob').firestore();
  const aliceRef = doc(alice, 'users/alice/projects/demo-project');
  await assertSucceeds(setDoc(aliceRef, project()));
  await assertFails(getDoc(doc(bob, 'users/alice/projects/demo-project')));
  await assertFails(setDoc(doc(bob, 'users/alice/projects/other'), project('bob')));
});

test('anonymous users cannot read projects', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(alice, 'users/alice/projects/demo-project'), project()));
  const anonymous = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonymous, 'users/alice/projects/demo-project')));
});

test('writes reject forged ownership and oversized prompts', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const ref = doc(alice, 'users/alice/projects/demo-project');
  await assertFails(setDoc(ref, project('bob')));
  await assertFails(setDoc(ref, { ...project(), prompt: 'x'.repeat(1201) }));
});

test('writes reject malformed file records and unsafe paths', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const ref = doc(alice, 'users/alice/projects/demo-project');
  await assertFails(setDoc(ref, { ...project(), files: [{ path: '../private', content: 'x' }] }));
  await assertFails(setDoc(ref, { ...project(), files: [{ path: 'index.html', content: 'x', executable: true }] }));
  await assertFails(setDoc(ref, { ...project(), files: [{ path: 'index.html', content: 'x'.repeat(450001) }] }));
  await assertFails(setDoc(ref, { ...project(), files: Array.from({ length: 11 }, (_, i) => ({ path: `file-${i}.txt`, content: 'x' })) }));
});

test('an edit cannot rewrite project creation time', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const ref = doc(alice, 'users/alice/projects/demo-project');
  await assertSucceeds(setDoc(ref, project()));
  await assertFails(updateDoc(ref, { createdAt: '2026-11-28T00:00:00.000Z' }));
});

function trustCheck(ownerId = 'alice') {
  return {
    schemaVersion: 1,
    ownerId,
    agentName: 'Demo Agent',
    agentRef: 'did:web:agent.example',
    operation: 'Prepare transfer for human review',
    riskLevel: 'elevated',
    score: 70,
    decision: 'STEP_UP',
    humanSignal: 'pause',
    signals: {
      credentialVerified: true,
      signatureValid: true,
      scopeMatches: true,
      behaviorNormal: false,
      appCheckConfigured: true,
      humanConfirmed: false,
    },
    createdAt: serverTimestamp(),
  };
}

test('an owner can append and read a private Trust Gate check', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const checks = collection(alice, 'users/alice/agentTrustChecks');
  const created = await assertSucceeds(addDoc(checks, trustCheck()));
  const snapshot = await assertSucceeds(getDoc(created));
  assert.equal(snapshot.data()?.ownerId, 'alice');
  assert.equal(snapshot.data()?.decision, 'STEP_UP');
});

test('Trust Gate history is private and cannot be edited', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const bob = testEnv.authenticatedContext('bob').firestore();
  const created = await assertSucceeds(addDoc(collection(alice, 'users/alice/agentTrustChecks'), trustCheck()));
  await assertFails(getDoc(doc(bob, `users/alice/agentTrustChecks/${created.id}`)));
  await assertFails(updateDoc(created, { decision: 'ALLOW' }));
});

test('Trust Gate writes reject forged ownership and malformed decision records', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  const checks = collection(alice, 'users/alice/agentTrustChecks');
  await assertFails(addDoc(checks, trustCheck('bob')));
  await assertFails(addDoc(checks, { ...trustCheck(), score: 101 }));
  await assertFails(addDoc(checks, { ...trustCheck(), signals: { credentialVerified: true } }));
});
