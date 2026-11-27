import { useEffect, useRef, useState } from 'react';
import { generateBuildBrief } from './ai';
import { join, route } from './privacy';
import { order, combine, executeTool, classify, freshness, type Node, type Value } from './workflow';
import { enqueue, listJobs, removeJob, type Job } from './workflowQueue';

export function WorkflowLab() {
  const [graph, setGraph] = useState(JSON.stringify([{id:'input',kind:'input',parents:[]},{id:'brief',kind:'inference',parents:['input'],mode:'Hybrid'},{id:'count',kind:'tool',parents:['brief']}], null, 2));
  const [groundedAt, setGroundedAt] = useState<number | null>(null);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
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
        setOutput(result.text); setGroundedAt(null); log(JSON.stringify(result.trace));
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
    lock.current = true; setBusy(true); setEvents([]); setOutput(''); setGroundedAt(null);
    try {
      const nodes = order(JSON.parse(graph) as Node[]);
      const values = new Map<string, Value>();
      const initial = classify(input, allow ? 'PUBLIC' : 'LOCAL_ONLY');
      for (const node of nodes) {
        if (node.kind === 'input') { values.set(node.id, initial); log(node.id + ': ' + initial.label); continue; }
        const value = combine(node.parents.map(id => values.get(id)!));
        if (node.kind === 'tool') {
          const result = executeTool({name:'count_words'}, value);
          values.set(node.id,result.value); log(node.id + ': ' + JSON.stringify(result.receipt)); continue;
        }
        const mode = node.mode ?? 'Hybrid';
        const policy = route(value.text,value.label,mode);
        log(node.id + ': ' + JSON.stringify(policy));
        if (policy.cloudAllowed && (mode === 'Cloud' || policy.complexity === 'MULTI_STEP') && !navigator.onLine) {
          if (nodes.length !== 3 || node.parents.length !== 1 || nodes.find(n => n.id === node.parents[0])?.kind !== 'input' || nodes.filter(n => n.kind === 'inference').length !== 1) throw Error('Offline recovery supports only a single inference from original input');
          await enqueue(value.text); log('CLOUD_QUEUE: inference only; downstream nodes not resumed'); await refresh(); return;
        }
        const result = await generateBuildBrief(value.text,mode,undefined,value.label);
        values.set(node.id,{text:result.text,label:join([result.trace.label])});
        log(node.id + ': ' + JSON.stringify(result.trace)); setOutput(result.text);
      }
    } catch (error) { log(String(error)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="tab-panel" aria-label="Workflow lab">
    <h1>Hybrid Workflow Lab</h1>
    <p>Editable dependency graph · private by default</p>
    <textarea aria-label="Workflow input" rows={4} value={input} disabled={busy} onChange={e => setInput(e.target.value)} style={{width:'100%'}}/>
    <label><input type="checkbox" checked={allow} disabled={busy} onChange={e => setAllow(e.target.checked)}/> Explicit PUBLIC consent</label>
    <details><summary>Edit workflow graph (JSON)</summary><textarea aria-label="Workflow graph JSON" rows={12} value={graph} disabled={busy} onChange={e => setGraph(e.target.value)} style={{width:'100%',fontFamily:'monospace'}}/></details>
    <p>Grounding freshness: {freshness(groundedAt,clock)} (no external grounding source configured)</p>
    <button disabled={busy} onClick={() => void run()}>Run workflow</button>
    <button disabled={busy || !jobs.length} onClick={() => void recover()}>Retry public queue ({jobs.length})</button>
    <button disabled={busy || !jobs.length} onClick={async () => { try { for (const job of await listJobs()) await removeJob(job.id); await refresh(); } catch(e) { log(String(e)); } }}>Clear queue</button>
    <p>Only explicitly public jobs are persisted. Private failures are not queued.</p>
    <h2>Hybrid Trace</h2><pre aria-live="polite" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{events.join('\n')}</pre>
    <p style={{whiteSpace:'pre-wrap'}}>{output}</p>
  </section>;
}
