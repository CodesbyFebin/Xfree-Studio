import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bell, BrainCircuit, Check, Cloud, Code2, FileText, Folder, Globe, Grid2X2, Keyboard, Link2, Menu, Mic, Paperclip, PenLine, Settings, ShieldCheck, Sparkles, Volume2, WandSparkles, X, Zap } from 'lucide-react';
import { StudioWorkspace } from './StudioWorkspace';
import './style.css';

type Tab = 'Command' | 'Files' | 'Tools' | 'AI' | 'Projects';
type Mode = 'Local' | 'Cloud';
const suggestions = [
  { icon: Code2, label: 'Create a Python script' },
  { icon: FileText, label: 'Analyze this file' },
  { icon: WandSparkles, label: 'Generate an image' },
  { icon: Link2, label: 'Summarize a webpage' },
  { icon: Globe, label: 'Open SEO tools' },
  { icon: PenLine, label: 'Write an article' },
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
  const [mode, setMode] = useState<Mode>('Local');
  const [drawer, setDrawer] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('How can I help you today?');
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const [fileName, setFileName] = useState('');
  const recognition = useRef<SpeechAPI | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { recognition.current?.stop(); }, []);
  function send(value = prompt) {
    const text = value.trim();
    if (!text) return;
    setPrompt(text);
    setReply(mode === 'Cloud'
      ? 'Cloud agent execution is not connected yet. Your request remains in this browser.'
      : 'Ready to help locally. Open Projects to scaffold a starter or Tools to use the existing utilities.');
    setNotice('Request captured locally. No external AI service was contacted.');
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
      <div className="mode-switch" role="group" aria-label="Execution mode"><button className={mode === 'Local' ? 'selected' : ''} onClick={() => setMode('Local')}><span className="online-dot"/> Local</button><button className={mode === 'Cloud' ? 'selected' : ''} onClick={() => {setMode('Cloud');setNotice('Cloud mode is a visual preview; no cloud AI backend is connected.');}}><Cloud size={17}/> Cloud</button></div>
      <div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('No new notifications.')}><Bell /></button><button className="icon-button" aria-label="Toggle light and dark theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Settings /></button></div>
    </header>
    <main className="dashboard">
      <aside className={'left-rail ' + (drawer ? 'drawer-open' : '')}>
        <nav className="rail-menu" aria-label="Main menu">{['AI ASSISTANT','TOOLS','AUTOMATION','PROJECTS','FILES','SETTINGS'].map((name,i) => <button key={name} className={i === 0 && tab === 'Command' ? 'active' : ''} onClick={() => { setTab(name === 'PROJECTS' ? 'Projects' : name === 'FILES' ? 'Files' : name === 'TOOLS' ? 'Tools' : name === 'AI ASSISTANT' ? 'Command' : 'AI');setDrawer(false); }}>{name}</button>)}</nav>
        <div className="rail-card"><div className="card-title">ONLINE <span className="online-dot"/></div><p>100% LOCAL<br/>PRIVACY FIRST<br/>NO SIGNUP<br/>OPEN SOURCE</p></div>
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
          <div className="greeting"><h1>I'm <em>X</em>, your AI assistant.</h1><p>{reply}</p></div>
          <div className="voice-row"><button className="round-control" aria-label="Start or stop voice recognition" onClick={speak}><Mic size={32}/></button><div className={'waveform ' + (listening ? 'is-listening' : '')} aria-hidden="true">{Array.from({length:59},(_,i)=><span key={i} style={{height: (7 + Math.abs(Math.sin(i*1.7)*Math.cos(i*.34))*50)+'px'}} />)}</div><button className="round-control" aria-label="Use keyboard" onClick={() => document.getElementById('command-input')?.focus()}><Keyboard size={28}/></button></div>
          <div className="voice-caption">{listening ? 'Listening… tap to stop' : 'Tap to speak'}<small>{listening ? 'Microphone is active' : 'or type your request below'}</small></div>
          <div className="suggestions">{suggestions.map(({icon:Icon,label})=><button key={label} onClick={() => {setPrompt(label);setNotice('Suggestion selected. Press Send to continue.');}}><Icon size={19}/>{label}</button>)}</div>
        </> : tab === 'Projects' ? <StudioWorkspace /> : <div className="tab-panel"><div className="eyebrow">XFREESTUDIO / {tab.toUpperCase()}</div><h1>{tab}</h1><p>{tab === 'Files' ? 'Choose a local file to attach to your request. File contents are not uploaded.' : tab === 'Tools' ? 'Use the existing Xfree utility workspace and project builder.' : 'AI orchestration and automation integrations are under development.'}</p><button className="primary-action" onClick={() => setTab('Projects')}>Open project builder <ArrowRight size={18}/></button></div>}
      </section>
      <aside className="right-rail"><div className="rail-card jarvis"><div className="card-title">JARVIS MODE <span className="online-dot"/></div>{['LISTENING','UNDERSTANDING','PLANNING','EXECUTING','COMPLETE'].map((stage,i)=><div className={'stage ' + (i === 0 ? 'active' : '')} key={stage}><span className="stage-dot"/>{stage}</div>)}</div><div className="perks">{[[Zap,'FAST'],[ShieldCheck,'PRIVATE'],[Globe,'LOCAL'],[Sparkles,'UNLIMITED'],[Check,'YOURS']].map(([Icon,label])=>{const I=Icon as typeof Zap;return <div key={label as string}><I size={19}/>{label as string}</div>})}</div><div className="rail-card voice-card"><strong>SPEAK NATURALLY</strong><p>“Convert this file”<br/>“Analyze this code”<br/>“Generate a website”</p></div></aside>
    </main>
    <section className="lower-dashboard">
      <div className="command-bar"><input ref={fileInput} type="file" hidden onChange={e => {const f=e.target.files?.[0];if(f){setFileName(f.name);setNotice('Selected '+f.name+'. The file has not been uploaded.');}}}/><button className="attach-button" aria-label="Attach a file" onClick={() => fileInput.current?.click()}><Paperclip/></button><input id="command-input" aria-label="Type your request" placeholder={fileName ? 'Attached: '+fileName+' — type your request…' : 'Or type your request here…'} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') send();}}/><span className="mode-label"><span className="online-dot"/>{mode}</span><button className="send-button" aria-label="Send request" onClick={() => send()}><ArrowRight size={28}/></button></div>
      {notice && <p className="notice" role="status">{notice} <button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14}/></button></p>}
      <div className="category-grid">{categories.map(({name,sub,icon:Icon})=><button key={name} onClick={() => setTab(name === 'Developer' ? 'Projects' : 'Tools')}><Icon size={28}/><strong>{name}</strong><small>{sub}</small></button>)}</div>
      <nav className="bottom-nav" aria-label="Workspace tabs">{navigation.map(name=>{const Icon = name === 'Command' ? Volume2 : name === 'Files' ? Folder : name === 'Tools' ? Grid2X2 : name === 'AI' ? Sparkles : FileText;return <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}><Icon size={27}/><span>{name}</span></button>})}</nav>
    </section>
    <footer className="footer"><div className="footer-brand"><i>X</i>Free</div><div><strong>ROOT ACCESS FOR EVERYONE</strong><small>SIMPLE TOOLS. REAL FREEDOM.</small></div><span><span className="online-dot"/> v1.0.0 UI</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
