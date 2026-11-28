import { useEffect, useMemo, useState } from 'react';
import type { User, ConfirmationResult } from 'firebase/auth';
import { firebaseEnabled, watchUser, login, logout, emailLogin, sendPhoneCode, uploadProject, downloadProjects } from './firebase';
import { ArrowRight, Code2, Download, FileCode2, FolderOpen, Play, Save, Sparkles, Workflow } from 'lucide-react';
import { exportProject, generateProject, generateSpec, listProjects, previewHtml, saveProject, type StudioProject } from './studio';
import { generateBuildBrief, type AIChoice, type InferenceSource } from './ai';
import { route } from './privacy';

export function StudioWorkspace({ initialPrompt }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt || 'A minimal developer portfolio with a clear call to action');
  const [project, setProject] = useState<StudioProject | null>(() => listProjects()[0] || null);
  const [file, setFile] = useState('index.html');
  const [tab, setTab] = useState<'code' | 'spec' | 'preview'>('code');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [aiPrompt, setAiPrompt] = useState(initialPrompt || 'Help me define the smallest useful first version of this project.');
  const [aiMode, setAiMode] = useState<AIChoice>('Hybrid');
  const [aiCloudConsent, setAiCloudConsent] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [aiSource, setAiSource] = useState<InferenceSource | null>(null);
  const [aiError, setAiError] = useState('');
  useEffect(() => watchUser(setUser), []);
  async function cloudAction(action: () => Promise<void>) {
    setBusy(true);
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Cloud action failed'); }
    finally { setBusy(false); }
  }
  const selected = project?.files.find(x => x.path === file);
  const spec = useMemo(() => { try { return generateSpec(prompt); } catch { return null; } }, [prompt]);
  function generate() {
    try {
      const next = generateProject(prompt);
      setProject(next); setFile('index.html'); setTab('code'); setMessage('Starter created locally. Review and edit the generated files.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Generation failed'); }
  }
  async function askGemini() {
    if (!aiPrompt.trim() || aiBusy) return;
    setAiBusy(true); setAiReply(''); setAiSource(null); setAiError('');
    const decision = route(aiPrompt, aiCloudConsent ? 'PUBLIC' : 'LOCAL_ONLY', aiMode);
    let timer: number | undefined;
    try {
      const response = await Promise.race([
        generateBuildBrief(aiPrompt, aiMode, undefined, aiCloudConsent ? 'PUBLIC' : 'LOCAL_ONLY'),
        new Promise<never>((_, reject) => { timer = window.setTimeout(() => reject(new Error('This request timed out. Check Firebase AI Logic, App Check, model quota, and your connection before retrying.')), 45000); }),
      ]);
      setAiReply(response.text); setAiSource(response.source);
      setMessage(`AI request completed · ${response.source === 'on_device' ? 'Gemini Nano on-device' : 'Firebase AI Logic cloud'} · ${response.trace.latencyMs ?? '—'} ms`);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Gemini could not complete this request.');
    } finally {
      if (timer !== undefined) window.clearTimeout(timer);
      setAiBusy(false);
    }
  }
  function edit(content: string) {
    if (!project) return;
    setProject({ ...project, files: project.files.map(f => f.path === file ? { ...f, content } : f) });
  }
  function save() {
    if (!project) return;
    try { saveProject(project); setMessage('Saved in this browser. Export a copy for backup.'); }
    catch { setMessage('Browser storage unavailable. Export the project instead.'); }
  }
  return <section className="studio-shell" aria-label="AI development workspace">
    <div className="studio-heading"><div><div className="eyebrow">XFREESTUDIO / BUILDER</div><h2>Agentic <em>Workspace.</em></h2><p>Plan with Gemini, then inspect and edit a local template starter. AI planning and file generation are separate actions.</p></div><span className="studio-pill">GEMINI + LOCAL WORKSPACE</span></div>
      <section className="studio-ai-copilot" aria-labelledby="studio-ai-title">
        <div className="studio-ai-head"><span className="studio-ai-icon"><Sparkles size={18}/></span><div><span className="eyebrow">FIREBASE AI LOGIC · GEMINI</span><h3 id="studio-ai-title">Project Brief Copilot</h3><p>Get an outcome, MVP, build sequence, and risks from Firebase AI Logic with an explicit privacy gate.</p></div><span className="studio-ai-model">GEMINI 3.8 FLASH</span></div>
        <label className="studio-ai-label" htmlFor="studio-ai-prompt">What do you want to plan?</label>
        <textarea id="studio-ai-prompt" value={aiPrompt} maxLength={3000} onChange={event => setAiPrompt(event.target.value)} placeholder="Describe the user, problem, and constraints…" />
        <div className="studio-ai-controls"><label>Inference mode<select value={aiMode} onChange={event => { setAiMode(event.target.value as AIChoice); setAiSource(null); }}><option value="On-device">Local only</option><option value="Hybrid">Hybrid · local first, cloud fallback</option><option value="Cloud">Cloud only · Firebase AI Logic</option></select></label><button type="button" onClick={askGemini} disabled={aiBusy || !aiPrompt.trim()}><Sparkles size={16}/>{aiBusy ? 'Asking Gemini…' : 'Generate project brief'}</button></div>
        <label className="studio-ai-consent"><input type="checkbox" checked={aiCloudConsent} disabled={aiBusy} onChange={event => setAiCloudConsent(event.target.checked)} /> Allow this prompt to use Firebase AI Logic cloud if the selected mode needs it.</label>
        <p className="studio-ai-disclosure">{!aiCloudConsent ? 'LOCAL_ONLY privacy gate: no cloud request or fallback is allowed until you check the box. Local mode requires supported Gemini Nano.' : aiMode === 'On-device' ? 'Local-only mode never uses cloud, even when consent is checked.' : aiMode === 'Hybrid' ? 'Hybrid prefers Gemini Nano and may send this prompt to Firebase AI Logic cloud when needed.' : 'Cloud mode sends this prompt to Firebase AI Logic.'}</p>
        {aiBusy && <p className="studio-ai-status" role="status">Waiting for Firebase AI Logic response…</p>}
        {aiError && <p className="studio-ai-error" role="alert">{aiError}</p>}
        {aiReply && <div className="studio-ai-response" aria-live="polite"><div><strong>Gemini response</strong><span>{aiSource === 'on_device' ? 'Gemini Nano · on-device' : 'Firebase AI Logic · cloud'}</span></div><pre>{aiReply}</pre></div>}
        {aiReply && <details className="studio-ai-trace"><summary>Privacy routing trace</summary><pre>{JSON.stringify(route(aiPrompt, aiCloudConsent ? 'PUBLIC' : 'LOCAL_ONLY', aiMode), null, 2)}</pre></details>}
      </section>
      <div className="prompt-bar"><details className="cloud-panel"><summary><strong>Firebase Cloud Projects</strong><span>{!firebaseEnabled ? 'Not configured — local only' : user ? 'Signed in: ' + (user.email || 'Google account') : 'Sign in to sync'}</span></summary><div className="cloud-controls">{firebaseEnabled && <button type="button" disabled={busy} onClick={() => cloudAction(user ? logout : login)}>{user ? 'Sign out' : 'Sign in with Google'}</button>}{firebaseEnabled && !user && <div className="firebase-auth-options"><label>Email<input aria-label="Firebase email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input aria-label="Firebase password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button type="button" disabled={busy || !email || password.length < 6} onClick={()=>cloudAction(()=>emailLogin(email,password))}>Email sign in</button><button type="button" disabled={busy || !email || password.length < 6} onClick={()=>cloudAction(()=>emailLogin(email,password,true))}>Create account</button><label>Phone (E.164)<input aria-label="Phone number" type="tel" placeholder="+919876543210" value={phone} onChange={e=>setPhone(e.target.value)}/></label><div id="firebase-phone-recaptcha"/><button type="button" disabled={busy || !/^\+[1-9]\d{7,14}$/.test(phone)} onClick={()=>cloudAction(async()=>{setConfirmation(await sendPhoneCode(phone,'firebase-phone-recaptcha'));setMessage('Verification code sent if the phone number is eligible.');})}>Send SMS code</button>{confirmation && <><label>SMS code<input aria-label="SMS verification code" inputMode="numeric" value={smsCode} onChange={e=>setSmsCode(e.target.value)}/></label><button type="button" disabled={busy || !smsCode} onClick={()=>cloudAction(async()=>{await confirmation.confirm(smsCode);setConfirmation(null);setSmsCode('');})}>Verify phone</button></>}</div>}{user && <><button type="button" disabled={busy || !project} onClick={() => cloudAction(async () => { if (project) { await uploadProject(user, project); setMessage('Saved privately to Firestore.'); } })}>Save to cloud</button><button type="button" disabled={busy} onClick={() => cloudAction(async () => { const items = await downloadProjects(user); if (items[0]) { setProject(items[0]); setFile('index.html'); setMessage('Latest cloud project loaded.'); } else setMessage('No cloud projects yet.'); })}>Load latest</button></>}</div></details><label htmlFor="studio-prompt">Describe your application</label><div className="prompt-controls"><input id="studio-prompt" value={prompt} maxLength={1200} onChange={e => setPrompt(e.target.value)} placeholder="Describe the app to scaffold..." /><button type="button" onClick={generate}><Sparkles size={17}/> Generate starter</button></div><small>Template-based scaffolding, not LLM-generated production code.</small></div>
    <div className="workspace-grid">
      <aside className="workspace-sidebar"><strong><FolderOpen size={17}/> Project files</strong>{project ? project.files.map(f => <button type="button" key={f.path} className={'file-item ' + (file === f.path ? 'active' : '')} onClick={() => { setFile(f.path); setTab('code'); }}><FileCode2 size={15}/>{f.path}</button>) : <p>Create a starter to begin.</p>}
      <div className="workspace-actions"><button type="button" disabled={!project} onClick={save}><Save size={15}/> Save</button><button type="button" disabled={!project} onClick={() => project && exportProject(project)}><Download size={15}/> Export JSON</button></div></aside>
      <div className="workspace-main">
        <div className="workspace-tabs"><button type="button" aria-pressed={tab === 'code'} className={tab === 'code' ? 'active' : ''} onClick={() => setTab('code')}><Code2 size={15}/> Code</button><button type="button" aria-pressed={tab === 'spec'} className={tab === 'spec' ? 'active' : ''} onClick={() => setTab('spec')}><Workflow size={15}/> Spec</button><button type="button" aria-pressed={tab === 'preview'} className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}><Play size={15}/> Preview</button></div>
        {tab === 'code' && <div className="editor-area"><div className="editor-caption">{selected?.path || 'No file selected'} · Editable source</div><textarea spellCheck={false} aria-label="Source code editor" value={selected?.content || ''} onChange={e => edit(e.target.value)} disabled={!selected} /></div>}
        {tab === 'spec' && <div className="spec-area">{spec && Object.entries(spec).map(([name, items]) => <div key={name}><h3>{name}</h3>{items.map(item => <p key={item}><ArrowRight size={13}/>{item}</p>)}</div>)}</div>}
        {tab === 'preview' && <div className="preview-area">{project ? <iframe title="Generated app preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewHtml(project)} /> : <p>Generate a project first.</p>}<small>Isolated iframe: scripts allowed; same-origin, forms, navigation and popups are not granted.</small></div>}
      </div>
    </div>
    <p role="status" className="workspace-message">{message}</p>
  </section>;
}
