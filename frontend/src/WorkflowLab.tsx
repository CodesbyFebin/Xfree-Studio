import { useEffect, useRef, useState } from 'react';
import { generateBuildBrief } from './ai';
import { join, route } from './privacy';
import { enqueue, listJobs, removeJob, type Job } from './workflowQueue';

export function WorkflowLab() {
  const [input, setInput] = useState('Compare two approaches to an offline-first study planner');
  const [allow, setAllow] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const log = (message: string) => setEvents(old => [...old, message]);
  async function refresh() { setJobs(await listJobs()); }
  async function recover() {
    if (lock.current || !navigator.onLine) return;
    lock.current = true; setBusy(true);
    try {
      for (const job of await listJobs()) {
        if (job.label !== 'PUBLIC' || !route(job.input, job.label, 'Cloud').cloudAllowed) {
          log('Queue policy denied: ' + job.id); continue;
        }
        log('Retrying public job ' + job.id);
        const result = await generateBuildBrief(job.input, 'Cloud', undefined, job.label);
        setOutput(result.text); log(JSON.stringify(result.trace));
        await removeJob(job.id);
        log('Queue job completed; inference timestamp ' + new Date().toISOString());
      }
    } catch (error) { log(String(error)); }
    finally { lock.current = false; setBusy(false); await refresh().catch(e => log(String(e))); }
  }
  useEffect(() => {
    void refresh().catch(e => log(String(e)));
    const online = () => { void recover(); };
    window.addEventListener('online', online);
    return () => window.removeEventListener('online', online);
  }, []);
  async function run() {
    if (lock.current || !input.trim()) return;
    lock.current = true; setBusy(true); setEvents([]); setOutput('');
    try {
      const decision = route(input, allow ? 'PUBLIC' : 'LOCAL_ONLY', 'Hybrid');
      const label = join([decision.label]);
      log('Input classification: ' + decision.label + '; downstream label: ' + label);
      const policy = route(input, label, 'Hybrid');
      log(JSON.stringify(policy));
      if (policy.cloudAllowed && policy.complexity === 'MULTI_STEP' && !navigator.onLine) {
        await enqueue(input); log('CLOUD_QUEUE: pending connectivity'); await refresh(); return;
      }
      const result = await generateBuildBrief(input, 'Hybrid', undefined, label);
      log(JSON.stringify(result.trace));
      // Deterministic local tool: count words in actual output, not a model claim.
      const words = result.text.trim().split(/\s+/u).filter(Boolean);
      const receipt = { tool: 'count_words', count: words.length, verified: words.length > 0 };
      if (!receipt.verified) throw new Error('Tool postcondition failed');
      log(JSON.stringify(receipt)); setOutput(result.text);
    } catch (error) { log(String(error)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="tab-panel" aria-label="Workflow lab">
    <h1>Hybrid Workflow Lab</h1>
    <p>Fixed executable workflow · private by default</p>
    <textarea aria-label="Workflow input" rows={4} value={input} disabled={busy} onChange={e => setInput(e.target.value)} style={{width:'100%'}}/>
    <label><input type="checkbox" checked={allow} disabled={busy} onChange={e => setAllow(e.target.checked)}/> Explicit PUBLIC consent</label>
    <ol><li>Classify input</li><li>Propagate label and route inference</li><li>Execute local word-count tool</li></ol>
    <button disabled={busy} onClick={() => void run()}>Run workflow</button>
    <button disabled={busy || !jobs.length} onClick={() => void recover()}>Retry public queue ({jobs.length})</button>
    <button disabled={busy || !jobs.length} onClick={async () => { try { for (const job of await listJobs()) await removeJob(job.id); await refresh(); } catch(e) { log(String(e)); } }}>Clear queue</button>
    <p>Only explicitly public jobs are persisted. Private failures are not queued.</p>
    <h2>Hybrid Trace</h2><pre aria-live="polite" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{events.join('\n')}</pre>
    <p style={{whiteSpace:'pre-wrap'}}>{output}</p>
  </section>;
}
