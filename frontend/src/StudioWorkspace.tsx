import { useEffect, useMemo, useState } from 'react';
import type { User, ConfirmationResult } from 'firebase/auth';
import { firebaseEnabled, watchUser, login, logout, emailLogin, sendPhoneCode, uploadProject, downloadProjects } from './firebase';
import { ArrowRight, Code2, Download, FileCode2, FolderOpen, Play, Save, Sparkles, Workflow } from 'lucide-react';
import { exportProject, generateProject, generateSpec, listProjects, previewHtml, saveProject, type StudioProject } from './studio';

export function StudioWorkspace() {
  const [prompt, setPrompt] = useState('A minimal developer portfolio with a clear call to action');
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
    <div className="studio-heading"><div><div className="eyebrow">XFREESTUDIO / BUILDER</div><h2>Agentic <em>Workspace.</em></h2><p>Specification-driven starter generation, editable project files and a sandboxed preview. No cloud upload.</p></div><span className="studio-pill">LOCAL · V1 PREVIEW</span></div>
    <div className="prompt-bar"><div className="cloud-controls"><strong>Firebase Cloud Projects · Optional</strong><span>{!firebaseEnabled ? 'Not configured — local only' : user ? 'Signed in: ' + (user.email || 'Google account') : 'Sign in to sync'}</span>{firebaseEnabled && <button type="button" disabled={busy} onClick={() => cloudAction(user ? logout : login)}>{user ? 'Sign out' : 'Sign in with Google'}</button>}{firebaseEnabled && !user && <div className="firebase-auth-options"><label>Email<input aria-label="Firebase email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input aria-label="Firebase password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button type="button" disabled={busy || !email || password.length < 6} onClick={()=>cloudAction(()=>emailLogin(email,password))}>Email sign in</button><button type="button" disabled={busy || !email || password.length < 6} onClick={()=>cloudAction(()=>emailLogin(email,password,true))}>Create account</button><label>Phone (E.164)<input aria-label="Phone number" type="tel" placeholder="+919876543210" value={phone} onChange={e=>setPhone(e.target.value)}/></label><div id="firebase-phone-recaptcha"/><button type="button" disabled={busy || !/^\\+[1-9]\\d{7,14}$/.test(phone)} onClick={()=>cloudAction(async()=>{setConfirmation(await sendPhoneCode(phone,'firebase-phone-recaptcha'));setMessage('Verification code sent if the phone number is eligible.');})}>Send SMS code</button>{confirmation && <><label>SMS code<input aria-label="SMS verification code" inputMode="numeric" value={smsCode} onChange={e=>setSmsCode(e.target.value)}/></label><button type="button" disabled={busy || !smsCode} onClick={()=>cloudAction(async()=>{await confirmation.confirm(smsCode);setConfirmation(null);setSmsCode('');})}>Verify phone</button></>}</div>}{user && <><button type="button" disabled={busy || !project} onClick={() => cloudAction(async () => { if (project) { await uploadProject(user, project); setMessage('Saved privately to Firestore.'); } })}>Save to cloud</button><button type="button" disabled={busy} onClick={() => cloudAction(async () => { const items = await downloadProjects(user); if (items[0]) { setProject(items[0]); setFile('index.html'); setMessage('Latest cloud project loaded.'); } else setMessage('No cloud projects yet.'); })}>Load latest</button></>}</div><label htmlFor="studio-prompt">Describe your application</label><div className="prompt-controls"><input id="studio-prompt" value={prompt} maxLength={1200} onChange={e => setPrompt(e.target.value)} placeholder="Describe the app to scaffold..." /><button type="button" onClick={generate}><Sparkles size={17}/> Generate starter</button></div><small>Template-based scaffolding, not LLM-generated production code.</small></div>
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
