import { route } from './privacy';
export type Job = { id: string; input: string; label: 'PUBLIC'; createdAt: number };
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('xfree-public-jobs', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('jobs', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction('jobs', mode);
      const request = operation(tx.objectStore('jobs'));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? new Error('Queue transaction aborted'));
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function enqueue(input: string): Promise<Job> {
  if (!route(input, 'PUBLIC', 'Cloud').cloudAllowed) throw new Error('Cloud queue denied');
  const job: Job = { id: crypto.randomUUID(), input, label: 'PUBLIC', createdAt: Date.now() };
  await transaction('readwrite', store => store.add(job));
  return job;
}
export const listJobs = () => transaction<Job[]>('readonly', store => store.getAll());
export const removeJob = (id: string) => transaction('readwrite', store => store.delete(id));
