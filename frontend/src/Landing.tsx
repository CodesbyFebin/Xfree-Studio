import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, BrainCircuit, Check, Code2, Cloud, FileText, Folder, Lock, Menu, Search, ShieldCheck, Sparkles, UserRoundCheck, WandSparkles, X, Zap } from 'lucide-react';
import { SEO_PAGES } from './seoPages';

type HomeProps = { openStudio: (prompt?: string) => void; openTrust: () => void };
const actions = [
  { title: 'Build a project brief', group: 'AI Studio', detail: 'Turn an idea into an MVP plan with a visible inference source.', icon: Sparkles, prompt: 'Help me turn my product idea into a focused, testable MVP brief.' },
  { title: 'Create an editable starter', group: 'Developer', detail: 'Scaffold a local project you can inspect, edit, preview, and export.', icon: Code2, prompt: 'Create an accessible responsive landing page for my project.' },
  { title: 'Explore Know Your Agent', group: 'Trust & safety', detail: 'Review explainable trust signals and human approval controls.', icon: ShieldCheck, trust: true },
  { title: 'Choose an inference mode', group: 'Privacy', detail: 'Compare local-only, hybrid fallback, and Firebase cloud modes.', icon: Lock, prompt: 'Explain the local, hybrid, and cloud inference choices in XFree Studio.' },
];
const categories = [
  { title: 'Developer', text: 'Code. Build. Debug.', icon: Code2, prompt: 'Create a useful offline-first developer tool.' },
  { title: 'AI Studio', text: 'Create. Analyze. Plan.', icon: BrainCircuit, prompt: 'Turn my idea into a weekend MVP.' },
  { title: 'Trust & safety', text: 'Identity. Scope. Human review.', icon: ShieldCheck, trust: true },
  { title: 'Projects', text: 'Edit. Preview. Export.', icon: Folder, prompt: 'Create a small, accessible web app starter.' },
];

export function Landing({ openStudio, openTrust }: HomeProps) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return actions.filter(item => `${item.title} ${item.group} ${item.detail}`.toLowerCase().includes(q));
  }, [query]);
  const launch = (item: typeof actions[number]) => {
    if (item.trust) openTrust();
    else openStudio(item.prompt || query);
  };

  return <div className="home-hud">
    <header className="home-header">
      <a className="home-brand" href="/" aria-label="XFree home"><img src="/x-logo-cutout.png" alt=""/><span>XFree<small>SIMPLE · OPEN · FREE</small></span></a>
      <label className="home-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){if(results[0])launch(results[0]);else openStudio(query);}}} placeholder="Search XFree Studio…" aria-label="Search XFree Studio"/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><X size={15}/></button>}</label>
      <button className="home-open" onClick={()=>openStudio()}>Open Studio <ArrowRight size={16}/></button>
      <button className="home-menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
      {menuOpen&&<nav className="home-menu"><a href="#workspaces" onClick={()=>setMenuOpen(false)}>Explore workspaces</a><a href="#studio-preview" onClick={()=>setMenuOpen(false)}>XFree Studio</a><a href="#why-xfree" onClick={()=>setMenuOpen(false)}>Why XFree</a><button onClick={()=>{setMenuOpen(false);openTrust();}}>Know Your Agent</button></nav>}
      {query&&<div className="home-search-results" role="listbox" aria-label="Studio search results">{results.length?results.map(item=>{const Icon=item.icon;return <button key={item.title} role="option" onClick={()=>launch(item)}><Icon size={18}/><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowRight size={15}/></button>}):<p>No matching workspace yet. Open Studio to start with your idea.</p>}</div>}
    </header>

    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-topline">ROOT ACCESS FOR EVERYONE</div>
        <div className="home-hero-grid">
          <aside className="home-side-copy"><div>OPEN SOURCE<br/>PRIVACY BY MODE<br/>NO REQUIRED SIGNUP<br/>TOOLS FOR EVERYONE</div><span/><strong>CODE<br/>CREATE<br/>AUTOMATE<br/>ANYWHERE</strong></aside>
          <div className="home-orbit" aria-label="XFree cybernetic emblem"><div className="home-orbit-ring ring-a"/><div className="home-orbit-ring ring-b"/><div className="home-orbit-cross"/><img src="/x-logo-cutout.png" alt=""/><span className="orbit-caption orbit-caption-top">DEVELOPER · AI · PROJECTS</span><span className="orbit-caption orbit-caption-bottom">LISTENING · THINKING · DOING</span><i className="home-node node-a"/><i className="home-node node-b"/></div>
          <aside className="home-audience"><div className="audience-card"><span>BUILT FOR EVERYONE</span><strong>DEVELOPERS</strong><strong>CREATORS</strong><strong>STUDENTS</strong><strong>BUSINESSES</strong><strong>THINKERS</strong></div><em>Tools Without Limits</em></aside>
        </div>
        <h1 id="home-title"><span>XFree</span> — Free Tools.<br/>Real Freedom.</h1>
        <p className="home-lede">The XFree App opens into XFree Studio: a privacy-aware workspace for Gemini project briefs, editable local starters, and transparent AI choices.</p>
        <div className="home-hero-actions"><button className="home-open home-primary" onClick={()=>openStudio()}>Launch XFree Studio <ArrowRight size={18}/></button><a href="#workspaces">Explore the workspace <ArrowDown size={16}/></a></div>
        <div className="home-categories">{[['Developer',Code2],['AI Studio',Sparkles],['Trust & safety',ShieldCheck],['Projects',Folder]].map(([name,Icon])=>{const I=Icon as typeof Code2;return <button key={name as string} onClick={()=>name==='Trust & safety'?openTrust():openStudio()}><I size={18}/>{name as string}</button>})}</div>
        <div className="home-stats"><div><strong>3</strong><span>INFERENCE MODES</span></div><div><strong>6</strong><span>WORK AREAS</span></div><div><strong>NO</strong><span>ACCOUNT REQUIRED</span></div><div><strong>FREE</strong><span>TO EXPLORE</span></div></div>
        <div className="home-principles"><span><Lock size={14}/> Privacy by mode</span><span><Code2 size={14}/> Open source</span><span><Zap size={14}/> Browser based</span><span><Check size={14}/> Local where supported</span><span><UserRoundCheck size={14}/> Human in control</span></div>
        <a className="scroll-cue" href="#studio-preview"><span><ArrowDown size={18}/></span>SCROLL TO EXPLORE</a>
      </section>

      <section className="home-studio-section" id="studio-preview">
        <div className="workspace-mock" aria-label="Illustration of the XFree Studio workspace">
          <div className="mock-top"><i/><i/><i/><strong>XFREESTUDIO</strong><span>● WORKSPACE PREVIEW</span></div>
          <div className="mock-body"><aside><b><img src="/x-logo-cutout.png" alt=""/> XFree</b><span className="mock-active">◈ Dashboard</span><span>Developer</span><span>AI Studio</span><span>Trust Gate</span><span>Projects</span></aside><div className="mock-main"><div className="mock-greeting"><strong>Good evening, Builder</strong><small>LOCAL FIRST · CLOUD WHEN CHOSEN</small></div><div className="mock-metrics"><span><b>3</b>Modes</span><span><b>LOCAL</b>Project files</span><span><b>OPTIONAL</b>Cloud sync</span></div><div className="mock-row"><Sparkles/><span><strong>Build brief</strong><small>Ready to start with your idea</small></span><em>OPEN</em></div><div className="mock-row"><ShieldCheck/><span><strong>Know Your Agent</strong><small>Explainable signals · human review</small></span><em>OPEN</em></div><div className="mock-row"><FileText/><span><strong>Project workspace</strong><small>Edit · preview · export</small></span><em>OPEN</em></div></div></div>
        </div>
        <div className="home-section-copy"><div className="home-eyebrow">XFREE STUDIO</div><h2>Your ideas.<br/>A clearer first build.</h2><p>Turn an idea into a focused brief, choose where inference runs, and continue in an editable local workspace. The app shows whether an answer came from Gemini Nano or Firebase AI Logic cloud.</p><button className="home-open" onClick={()=>openStudio()}>Launch XFree Studio <ArrowRight size={16}/></button><ul><li><Check/> Local-only, hybrid, and cloud choices</li><li><Check/> Editable starter projects</li><li><Check/> Source shown after a successful inference</li></ul></div>
      </section>

      <section className="home-explore" id="workspaces"><div className="home-section-head"><div><div className="home-eyebrow">EXPLORE</div><h2>Choose your next workspace.</h2><p>Focused tools for making, checking, and shipping your next idea.</p></div><button className="home-outline" onClick={()=>openStudio()}>Open Studio <ArrowRight size={16}/></button></div><div className="home-workspace-grid">{categories.map(({title,text,icon:Icon,trust,prompt})=><button key={title} onClick={()=>trust?openTrust():openStudio(prompt)}><span className="workspace-icon"><Icon size={22}/></span><strong>{title}</strong><small>{text}</small><span className="workspace-link">Explore <ArrowRight size={14}/></span></button>)}</div></section>

      <section className="home-trust-section" id="why-xfree"><div className="home-trust-copy"><div className="home-eyebrow">KNOW YOUR AGENT · FIREBASE</div><h2>Agents earn trust<br/>one action at a time.</h2><p>Review identity, delegated scope, session behavior, and human authorization separately. See the evidence behind allow, step-up, hold, or block recommendations.</p><button className="home-open" onClick={openTrust}>Explore the Trust Gate <ArrowRight size={16}/></button><small>Prototype policy; demo signals are simulated. App Check attests the app, not agent identity.</small></div><div className="home-proof-list"><div><ShieldCheck/><span>VERIFIABLE EVIDENCE<strong>Credential · Signature · Scope</strong></span></div><div><Lock/><span>PRIVATE AUDIT<strong>Owner-only Firestore history</strong></span></div><div><UserRoundCheck/><span>HUMAN OVERRIDE<strong>Pause before harm</strong></span></div></div></section>

      <section className="home-why"><div className="home-eyebrow">DESIGNED AROUND YOUR CHOICE</div><h2>Private by design. Clear about the trade-offs.</h2><div className="home-benefits"><article><Lock/><strong>Choose local-only</strong><span>Keep a prompt on this device when the supported local model is available.</span></article><article><Cloud/><strong>Allow hybrid fallback</strong><span>Prefer Gemini Nano, with Firebase AI Logic cloud fallback when needed.</span></article><article><WandSparkles/><strong>Keep the work yours</strong><span>Inspect, edit, preview, and export generated starter files locally.</span></article></div></section>
      <section className="home-library" aria-labelledby="home-library-title"><div className="home-eyebrow">THE XFREE FIELD GUIDE</div><h2 id="home-library-title">Explore XFree Studio, features, and practical guides.</h2><p>Clear answers about Gemini, privacy modes, project starters, and agent trust—grounded in what the app currently does.</p><div className="home-library-grid">{SEO_PAGES.map(page=><a key={page.path} href={page.path}><span>{page.eyebrow.split(' · ')[0]}</span><strong>{page.h1}</strong><small>{page.description}</small><i>Read the guide <ArrowRight size={14}/></i></a>)}</div></section>
    </main>

    <footer className="home-footer"><a className="home-brand" href="/" aria-label="XFree home"><img src="/x-logo-cutout.png" alt=""/><span>XFree<small>SIMPLE · OPEN · FREE</small></span></a><div><strong>ROOT ACCESS FOR EVERYONE</strong><small>DEVICE FIRST. CLOUD WHEN YOU CHOOSE.</small></div><a className="home-github" href="https://github.com/CodesbyFebin/Xfree-Studio" target="_blank" rel="noopener noreferrer">GitHub repository ↗</a><button className="home-open" onClick={()=>openStudio()}>Open Studio <ArrowRight size={16}/></button></footer>
  </div>;
}
