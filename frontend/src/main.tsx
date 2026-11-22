import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, BrainCircuit, Cpu, Globe2, Network, Shield, Terminal, Workflow } from 'lucide-react';
import './style.css';
import { StudioWorkspace } from './StudioWorkspace';

type Tool = 'word_count' | 'word_frequency' | 'echo';
type Task = { id: string; agent_id: string; tool: string; state: string; input: string; output?: string | null };
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function executeLocal(tool: Tool, text: string): string {
  if (tool === 'echo') return text;
  if (tool === 'word_count') return JSON.stringify({ count: text.split(/\s+/).filter(Boolean).length }, null, 2);
  const counts = new Map<string, number>();
  text.split(/\s+/).forEach(word => {
    const key = word.toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return JSON.stringify({ items: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([term, count]) => ({ term, count })) }, null, 2);
}

function App() {
  const [input, setInput] = useState('Build an agentic future with Rust');
  const [tool, setTool] = useState<Tool>('word_count');
  const [cloud, setCloud] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setOutput(null);
    setError('');
    setTask(null);
    try {
      if (!cloud) {
        setOutput(executeLocal(tool, input));
      } else {
        if (!API_BASE) throw new Error('Remote API is not configured. Switch to Local mode.');
        const response = await fetch(`${API_BASE}/v1/tasks`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ agent_id: 'utility-agent', tool, input })
        });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json() as Task;
        setTask(data);
        setOutput(data.output || data.state);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <nav className="navigation">
        <div className="brand"><span className="brand-symbol">X</span><span>Xfree Studio <b>Ω</b></span></div>
        <span className="tag">RUST CORE · A2A ROADMAP · MCP ROADMAP</span>
      </nav>
      <header className="hero">
        <div className="eyebrow">AGENTIC SYSTEMS / V1 WORKSPACE PREVIEW</div>
        <h1>Build beyond <em>limits.</em></h1>
        <p>Tools that work today. A modular Rust foundation for more powerful agents, workflows and interoperability tomorrow.</p>
        <div className="features">
          <article><Cpu /><strong>Rust Core</strong><small>Explicit task states</small></article>
          <article><Network /><strong>A2A Fabric</strong><small>Planned interoperability</small></article>
          <article><Terminal /><strong>MCP Fabric</strong><small>Experimental JSON-RPC</small></article>
          <article><Shield /><strong>Local First</strong><small>Browser demo with no upload</small></article>
        </div>
      </header>
      <section className="console">
        <div className="section-title"><Activity size={20} /> Utility Studio <span className="status">{cloud ? 'Remote development API' : 'Browser-local'}</span></div>
        <p className="helper">This demonstration executes real deterministic text tools. It does not invoke an LLM or claim autonomous-agent execution.</p>
        <div className="form-row">
          <label htmlFor="tool">Tool</label>
          <select id="tool" value={tool} onChange={e => setTool(e.target.value as Tool)}>
            <option value="word_count">Word count</option>
            <option value="word_frequency">Word frequency</option>
            <option value="echo">Echo text</option>
          </select>
        </div>
        <label htmlFor="input">Input text</label>
        <textarea id="input" maxLength={32000} value={input} onChange={e => setInput(e.target.value)} />
        <div className="run-row">
          <label className="mode"><input type="checkbox" checked={cloud} onChange={e => setCloud(e.target.checked)} /> Use remote development API</label>
          <button type="button" onClick={run} disabled={busy || !input.trim()}>{busy ? 'Running…' : 'Execute tool'} <ArrowRight size={17} /></button>
        </div>
        {error && <p role="alert" className="error">{error}</p>}
        {output !== null && <div className="output"><span>{task ? `Task ${task.id} · ${task.state}` : 'Local execution completed'}</span><pre>{output}</pre></div>}
      </section>
      <StudioWorkspace />
      <section className="roadmap">
        <div><BrainCircuit /><strong>Agentic kernel</strong><span>Next: durable tasks and supervision</span></div>
        <div><Workflow /><strong>Execution fabric</strong><span>Next: workflows and recovery</span></div>
        <div><Globe2 /><strong>Interoperability</strong><span>Next: official A2A + MCP conformance</span></div>
      </section>
      <footer>XFREESTUDIO Ω · Source-first platform foundation · Not yet production hardened</footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
