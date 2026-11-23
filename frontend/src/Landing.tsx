import { useMemo, useState } from 'react';
import { ArrowRight, BrainCircuit, Code2, Database, Globe, ShieldCheck, Zap, Search, Github, Lock, Sparkles, BarChart3 } from 'lucide-react';
const tools = [
  {name:'JSON Formatter',type:'Developer',desc:'Format and validate JSON',url:'https://xfree.in'},
  {name:'Regex Tester',type:'Developer',desc:'Explore regular expressions',url:'https://xfree.in'},
  {name:'AI Workspace',type:'AI',desc:'Open the XFree Studio builder',url:'/studio'},
  {name:'Data Utilities',type:'Data',desc:'Explore structured data tools',url:'https://xfree.in'},
  {name:'SEO Tools',type:'SEO',desc:'Discover web optimization tools',url:'https://xfree.in'},
];
const categories = [
  {label:'Developer Tools',icon:Code2,detail:'Code. Build. Debug.'},
  {label:'AI Tools',icon:BrainCircuit,detail:'Create. Analyze. Automate.'},
  {label:'Data Tools',icon:Database,detail:'Format. Convert. Validate.'},
  {label:'Web Tools',icon:Globe,detail:'Optimize. Test. Deploy.'},
  {label:'SEO Tools',icon:BarChart3,detail:'Analyze. Rank. Grow.'},
  {label:'Productivity',icon:Zap,detail:'Simplify. Organize. Achieve.'},
];
export function Landing({openStudio}:{openStudio:()=>void}) {
  const [search,setSearch] = useState('');
  const matches = useMemo(()=>tools.filter(t=>(t.name+' '+t.type+' '+t.desc).toLowerCase().includes(search.trim().toLowerCase())),[search]);
  return <div className="xfree-home">
    <header className="xfree-header"><a className="xfree-logo" href="/" aria-label="XFree home"><span>X</span>Free</a><nav aria-label="Main navigation"><a href="#tools">Tools</a><a href="#why">Why XFree</a><a href="#studio">Studio</a></nav><button className="xfree-cta" onClick={openStudio}>LAUNCH STUDIO <ArrowRight size={17}/></button></header>
    <main>
      <section className="xfree-hero"><div className="xfree-eyebrow">ROOT ACCESS FOR EVERYONE</div><div className="xfree-emblem" aria-hidden="true"><span>X</span></div><h1><span>XFree</span> — Free Tools. Real Freedom.</h1><p>Meet XFree App and XFree Studio — one workspace for developer, AI, data, SEO and web tools.</p><div className="xfree-search"><Search size={21}/><input aria-label="Search XFree tools" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tools — JSON, Regex, SEO, AI…"/><a href="#search-results">Search</a></div>{search.trim() && <div id="search-results" className="xfree-results" role="status">{matches.length ? matches.map(t=><button key={t.name} onClick={()=>t.url==='/studio'?openStudio():window.open(t.url,'_blank','noopener,noreferrer')}><strong>{t.name}</strong><span>{t.desc} →</span></button>):<p>No matching tools. Try “AI”, “JSON”, or “SEO”.</p>}</div>}<div className="xfree-trust"><span><Lock size={16}/> Privacy-first</span><span><Code2 size={16}/> Open source</span><span><Zap size={16}/> Browser-based</span></div></section>
      <section id="studio" className="xfree-feature"><div><div className="xfree-eyebrow">XFREE STUDIO</div><h2>Your complete toolkit<br/>in one workspace.</h2><p>Build editable starter projects, preview them in your browser, and optionally sync your projects with Firebase when configured.</p><button className="xfree-cta" onClick={openStudio}>Launch XFree Studio <ArrowRight size={18}/></button></div><div className="xfree-feature-preview"><div className="xfree-preview-top"><span/><span/><span/></div><div className="xfree-preview-title">XFREE STUDIO / WORKSPACE</div><div className="xfree-preview-grid"><div>PROJECTS <strong>Build</strong></div><div>EDITOR <strong>Code</strong></div><div>FIREBASE <strong>Sync</strong></div><div>PREVIEW <strong>Run</strong></div></div><Sparkles className="xfree-preview-spark" size={56}/></div></section>
      <section id="tools" className="xfree-tools"><div className="xfree-eyebrow">EXPLORE</div><h2>Tool Categories</h2><p>Everything you need. All in one place.</p><div className="xfree-categories">{categories.map(({label,icon:Icon,detail})=><button key={label} onClick={label==='AI Tools'?openStudio:()=>document.getElementById('search-results')?.scrollIntoView({behavior:'smooth'})}><Icon size={32}/><strong>{label}</strong><small>{detail}</small></button>)}</div></section>
      <section id="why" className="xfree-why"><div><ShieldCheck size={28}/><strong>Privacy-first</strong><span>Local project editing by default</span></div><div><Zap size={28}/><strong>Fast and lightweight</strong><span>Modern React experience</span></div><div><Github size={28}/><strong>Open source</strong><span>Transparent, inspectable code</span></div></section>
    </main><footer className="xfree-footer"><div className="xfree-logo"><span>X</span>Free</div><p>Simple tools. Real freedom.</p><a href="https://github.com/CodesbyFebin/Xfree-Studio" target="_blank" rel="noopener noreferrer">GitHub repository ↗</a><button onClick={openStudio}>Open Studio →</button></footer>
  </div>;
}
