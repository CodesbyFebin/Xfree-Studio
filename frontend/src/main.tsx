import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bell, BrainCircuit, Check, Cloud, Code2, FileText, Folder, Globe, Grid2X2, Keyboard, Link2, Menu, Mic, Paperclip, PenLine, Settings, ShieldCheck, Sparkles, Volume2, WandSparkles, X, Zap } from 'lucide-react';
import type { AIChoice, InferenceSource } from './ai';
import { route, type RoutingTrace } from './privacy';
import { firebaseAppCheckReady, firebaseEnabled } from './firebaseConfig';
import './style.css';
import { Landing } from './Landing';
import './landing.css';

type Tab = 'Command' | 'Files' | 'Tools' | 'AI' | 'Projects';
type Mode = AIChoice;
const hybridAIReady = firebaseEnabled && firebaseAppCheckReady;
const WorkflowLab = lazy(() => import('./WorkflowLab').then(module => ({ default: module.WorkflowLab })));
const StudioWorkspace = lazy(() => import('./StudioWorkspace').then((module) => ({ default: module.StudioWorkspace })));
const suggestions = [
  { icon: Code2, label: 'Plan a useful offline-first developer tool' },
  { icon: FileText, label: 'Turn my idea into a weekend MVP' },
  { icon: WandSparkles, label: 'Design a private AI study companion' },
  { icon: Link2, label: 'Find the riskiest assumption in my idea' },
  { icon: Globe, label: 'Define a clear first user and problem' },
  { icon: PenLine, label: 'Create a testable launch plan' },
];
const navigation: Tab[] = ['Command', 'Files', 'Tools', 'AI', 'Projects'];
const categories = [
  { name: 'Developer', sub: 'Code. Build. Debug.', icon: Code2 },
  { name: 'AI Tools', sub: 'Create. Analyze. Automate.', icon: BrainCircuit },
  { name: 'Web Tools', sub: 'Convert. Optimize. Deploy.', icon: Globe },
  { name: 'Productivity', sub: 'Simplify. Organize. Achieve.', icon: Zap },
];
type SpeechAPI = { start(): void; stop(): void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type SpeechCtor = new () => SpeechAPI;
declare global { interface Window { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor } }

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [tab, setTab] = useState<Tab>('Command');
  const [mode, setMode] = useState<Mode>('Hybrid');
  const [publicInput, setPublicInput] = useState(false);
  const [trace, setTrace] = useState<RoutingTrace | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('Describe a real user and the problem you want to solve. X will turn it into a focused first-release plan.');
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const [fileName, setFileName] = useState('');
  const [briefIdea, setBriefIdea] = useState('');
  const [sending, setSending] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [inferenceSource, setInferenceSource] = useState<InferenceSource | null>(null);
  const recognition = useRef<SpeechAPI | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { recognition.current?.stop(); }, []);
  async function send(value = prompt) {
    const text = value.trim();
    if (!text || sending) return;
    setPrompt(text);
    const decision = route(text, publicInput ? 'PUBLIC' : 'LOCAL_ONLY', mode);
    setTrace(decision);
    setBriefIdea(decision.cloudAllowed ? text : '');
    setSending(true);
    setInferenceSource(null);
    setReply('Turning your idea into a clear, testable build brief…');
    setNotice(!decision.cloudAllowed ? 'Privacy gate: cloud denied. Local inference only.' : mode === 'Hybrid'
      ? 'Hybrid mode prefers Chrome’s on-device model and falls back to Firebase AI Logic cloud when needed.'
      : mode === 'On-device'
        ? 'On-device only. Your prompt will not be sent to the cloud.'
        : 'Cloud only. Your prompt will be sent to Firebase AI Logic.');
    try {
      const { generateBuildBrief } = await import('./ai');
      const result = await generateBuildBrief(text, mode, (progress) => {
        setNotice(`Preparing the on-device model · ${Math.round(progress * 100)}%`);
      }, publicInput ? 'PUBLIC' : 'LOCAL_ONLY');
      setTrace(result.trace);
      setReply(result.text);
      setInferenceSource(result.source);
      setNotice(result.source === 'on_device'
        ? 'Completed on-device. Your prompt stayed on this device.'
        : 'Completed with the Firebase AI Logic cloud model.');
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'The build brief could not be generated.');
      setNotice(!decision.cloudAllowed ? 'Private execution failed closed. No cloud fallback.' : hybridAIReady
        ? 'Check App Check, Firebase AI Logic setup, and network access, then try again.'
        : 'Add the Firebase web config and App Check site key, then enable AI Logic in the Firebase Console.');
    } finally {
      setSending(false);
    }
  }
  async function prepareDevice() {
    if (preparing || sending) return;
    setPreparing(true);
    setNotice('Preparing Gemini Nano. First-time setup may download the local model.');
    try {
      const { prepareOnDeviceModel } = await import('./ai');
      await prepareOnDeviceModel((progress) => setNotice(`Preparing Gemini Nano · ${Math.round(progress * 100)}%`));
      setNotice('Gemini Nano is ready. Choose Device for private-only inference or Hybrid to allow cloud fallback.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'This browser could not prepare an on-device model.');
    } finally {
      setPreparing(false);
    }
  }
  function speak() {
    if (listening) { recognition.current?.stop(); setListening(false); return; }
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) { setNotice('Voice recognition is unavailable in this browser. Use the keyboard instead.'); return; }
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = 'en-US'; instance.continuous = false; instance.interimResults = false;
    instance.onresult = event => { const words = Array.from(event.results).map(result => result[0].transcript).join(' '); setPrompt(words); setReply('I heard: ' + words); };
    instance.onerror = () => { setListening(false); setNotice('Microphone access failed or was denied.'); };
    instance.onend = () => setListening(false);
    try { instance.start(); setListening(true); setNotice('Listening using your browser speech recognition. Availability and privacy depend on the browser.'); }
    catch { setNotice('Unable to start microphone.'); }
  }
  return <div className={'app-shell ' + theme}>
    <div className="ambient ambient-top" /><div className="ambient ambient-bottom" />
    <header className="topbar">
      <button className="icon-button menu-toggle" aria-label="Open menu" onClick={() => setDrawer(!drawer)}><Menu /></button>
      <div className="wordmark"><div><strong><i>X</i>Free</strong> <b>Studio</b></div><small>APP.XFREE.IN</small></div>
      <div className="mode-switch" role="group" aria-label="AI inference mode"><button aria-pressed={mode === 'Hybrid'} className={mode === 'Hybrid' ? 'selected' : ''} onClick={() => setMode('Hybrid')}><Sparkles size={15}/> Hybrid</button><button aria-pressed={mode === 'On-device'} className={mode === 'On-device' ? 'selected' : ''} onClick={() => setMode('On-device')}><span className="online-dot"/> Device</button><button aria-pressed={mode === 'Cloud'} className={mode === 'Cloud' ? 'selected' : ''} onClick={() => setMode('Cloud')}><Cloud size={15}/> Cloud</button></div>
      <div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('No new notifications.')}><Bell /></button><button className="icon-button" aria-label="Toggle light and dark theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Settings /></button></div>
    </header>
    <main className="dashboard">
      <aside className={'left-rail ' + (drawer ? 'drawer-open' : '')}>
        <nav className="rail-menu" aria-label="Main menu">{['AI ASSISTANT','TOOLS','AUTOMATION','PROJECTS','FILES','SETTINGS'].map((name,i) => <button key={name} className={i === 0 && tab === 'Command' ? 'active' : ''} onClick={() => { setTab(name === 'PROJECTS' ? 'Projects' : name === 'FILES' ? 'Files' : name === 'TOOLS' ? 'Tools' : name === 'AI ASSISTANT' ? 'Command' : 'AI');setDrawer(false); }}>{name}</button>)}</nav>
        <div className="rail-card"><div className="card-title">HYBRID AI <span className="online-dot"/></div><p>DEVICE FIRST<br/>CLOUD FALLBACK<br/>YOU CHOOSE<br/>PRIVATE BY DESIGN</p></div>
        <div className="rail-card voice-card"><Volume2 size={34}/><p>VOICE READY</p></div>
      </aside>
      <section className="center-stage">
        {tab === 'Command' ? <>
          <div className="emblem-stage">
            <div className="orb orb-outer"/><div className="orb orb-inner"/><div className="orb orb-cross"/>
            <div className="orbit-label">X · YOUR AI ASSISTANT</div>
            <div className="emblem" aria-label="Xfree emblem"><span className="emblem-left">X</span><span className="emblem-right">X</span><span className="emblem-core"/></div>
            <div className="orb-caption">LISTENING · THINKING · DOING</div>
          </div>
          <div className="greeting"><h1>Build ideas into <em>better briefs.</em></h1><p aria-live="polite">{reply}</p>{trace && <details open><summary>Hybrid Trace</summary><pre style={{whiteSpace:'pre-wrap',textAlign:'left'}}>{JSON.stringify(trace, null, 2)}</pre></details>}{inferenceSource && <><span className="inference-badge">{inferenceSource === 'on_device' ? '✳ GEMINI NANO · ON DEVICE' : '☁ FIREBASE AI LOGIC · CLOUD'}</span>{trace?.cloudAllowed && <button className="build-idea-action" type="button" onClick={() => setTab('Projects')}>Build a starter from this idea <ArrowRight size={15}/></button>}</>}<div className="ai-controls"><button className="prepare-button" type="button" disabled={!hybridAIReady || preparing || sending} onClick={prepareDevice}>{preparing ? 'Preparing local model…' : 'Prepare Gemini Nano'}</button><span>{!hybridAIReady ? 'Add Firebase + App Check config to enable AI' : 'Chrome desktop 139+ supports on-device inference'}</span></div></div>
          <div className="voice-row"><button className="round-control" aria-label="Start or stop voice recognition" disabled={!publicInput} onClick={speak}><Mic size={32}/></button><div className={'waveform ' + (listening ? 'is-listening' : '')} aria-hidden="true">{Array.from({length:59},(_,i)=><span key={i} style={{height: (7 + Math.abs(Math.sin(i*1.7)*Math.cos(i*.34))*50)+'px'}} />)}</div><button className="round-control" aria-label="Use keyboard" onClick={() => document.getElementById('command-input')?.focus()}><Keyboard size={28}/></button></div>
          <div className="voice-caption">{listening ? 'Listening… tap to stop' : 'Tap to speak'}<small>{listening ? 'Microphone is active' : 'or type your request below'}</small></div>
          <div className="suggestions">{suggestions.map(({icon:Icon,label})=><button key={label} onClick={() => {setPrompt(label);setNotice('Prompt ready. Choose Hybrid, Device, or Cloud, then send it.');}}><Icon size={19}/>{label}</button>)}</div>
        </> : tab === 'Projects' ? <Suspense fallback={<div className="tab-panel">Opening the project workspace…</div>}><StudioWorkspace initialPrompt={briefIdea} /></Suspense> : tab === 'AI' ? <Suspense fallback={<div>Opening workflow lab…</div>}><WorkflowLab /></Suspense> : <div className="tab-panel"><div className="eyebrow">XFREESTUDIO / {tab.toUpperCase()}</div><h1>{tab}</h1><p>{tab === 'Files' ? 'File contents stay out of this build-brief demo. You can still scaffold and preview a starter project.' : tab === 'Tools' ? 'Use the local project builder, then shape your next step with the hybrid AI assistant.' : 'Firebase AI Logic uses Gemini Nano on supported Chrome desktops and falls back to the cloud model when needed.'}</p><button className="primary-action" onClick={() => setTab('Command')}>Try the hybrid assistant <ArrowRight size={18}/></button></div>}
      </section>
      <aside className="right-rail"><div className="rail-card jarvis"><div className="card-title">BUILD BRIEF <span className="online-dot"/></div>{['REAL USER','CORE PROBLEM','SMALL MVP','BUILD STEPS','TEST SIGNAL'].map((stage,i)=><div className={'stage ' + (i === 0 ? 'active' : '')} key={stage}><span className="stage-dot"/>{stage}</div>)}</div><div className="perks">{[[Zap,'FAST'],[ShieldCheck,'PRIVATE'],[Globe,'HYBRID'],[Sparkles,'FALLBACK'],[Check,'YOUR CHOICE']].map(([Icon,label])=>{const I=Icon as typeof Zap;return <div key={label as string}><I size={19}/>{label as string}</div>})}</div><div className="rail-card voice-card"><strong>WHAT X RETURNS</strong><p>Outcome<br/>MVP<br/>Build sequence<br/>Risks</p></div></aside>
    </main>
    <section className="lower-dashboard">
      <div className="command-bar"><input ref={fileInput} type="file" hidden onChange={e => {const f=e.target.files?.[0];if(f){setFileName(f.name);setNotice('Selected '+f.name+'. This demo does not upload file contents.');}}}/><button className="attach-button" aria-label="Choose a file" onClick={() => fileInput.current?.click()}><Paperclip/></button><input id="command-input" aria-label="Describe a project idea" placeholder={fileName ? 'Selected: '+fileName+' — describe your idea…' : 'Describe a project idea to get a build brief…'} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') send();}}/><span className="mode-label"><span className="online-dot"/>{mode}</span><button className="send-button" aria-label="Generate build brief" disabled={sending || !prompt.trim()} onClick={() => send()}><ArrowRight size={28}/></button></div>
      <label><input type="checkbox" checked={publicInput} disabled={sending} onChange={e => setPublicInput(e.target.checked)}/> Explicitly allow cloud processing of this input (PUBLIC)</label><p className="ai-disclosure">{!publicInput ? 'LOCAL_ONLY: cloud inference denied regardless of mode.' : mode === 'Hybrid' ? 'Hybrid prefers Gemini Nano, but may send your prompt to Firebase AI Logic cloud if the local model is unavailable. Choose Device to keep it local.' : mode === 'On-device' ? 'Device mode never sends the prompt to cloud. Chrome may need to download Gemini Nano first.' : 'Cloud mode sends the prompt to the Firebase AI Logic model. App Check protects the request.'}</p>
      {notice && <p className="notice" role="status">{notice} <button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14}/></button></p>}
      <div className="category-grid">{categories.map(({name,sub,icon:Icon})=><button key={name} onClick={() => setTab(name === 'Developer' ? 'Projects' : 'Tools')}><Icon size={28}/><strong>{name}</strong><small>{sub}</small></button>)}</div>
      <nav className="bottom-nav" aria-label="Workspace tabs">{navigation.map(name=>{const Icon = name === 'Command' ? Volume2 : name === 'Files' ? Folder : name === 'Tools' ? Grid2X2 : name === 'AI' ? Sparkles : FileText;return <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}><Icon size={27}/><span>{name}</span></button>})}</nav>
    </section>
    <footer className="footer"><div className="footer-brand"><i>X</i>Free</div><div><strong>FROM IDEA TO A TESTABLE MVP</strong><small>DEVICE FIRST. CLOUD WHEN NEEDED.</small></div><span><span className="online-dot"/> FIREBASE AI LOGIC</span></footer>
  </div>;
}
function Root() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  function navigate(next: string) {
    window.history.pushState({}, '', next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return path.replace(/\/+$/, '') === '/studio'
    ? <div><button className="back-to-xfree" onClick={() => navigate('/')}>← XFree Home</button><App /></div>
    : <Landing openStudio={() => navigate('/studio')} />;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
