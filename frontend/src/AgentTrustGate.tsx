import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { ArrowRight, BadgeCheck, Fingerprint, LockKeyhole, ShieldAlert, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { evaluateAgentTrust, trustPresets, type AgentTrustInput, type AgentTrustResult, type AgentTrustSignals, type HumanSignal, type RiskLevel, type TrustDecision } from './agentTrust';
import { emailLogin, loadAgentTrustChecks, logout, saveAgentTrustCheck, watchUser, type SavedAgentTrustCheck } from './firebase';
import { firebaseAppCheckReady, firebaseEnabled } from './firebaseConfig';

const initialInput: AgentTrustInput = {
  agentName: 'Nova Assistant',
  agentRef: 'did:web:nova.example',
  operation: 'Read account balance',
  riskLevel: 'low',
  humanSignal: 'clear',
  signals: {
    credentialVerified: true,
    signatureValid: true,
    scopeMatches: true,
    behaviorNormal: true,
    appCheckConfigured: firebaseAppCheckReady,
    humanConfirmed: true,
  },
};

const signalItems: Array<{ key: keyof AgentTrustSignals; label: string; detail: string }> = [
  { key: 'credentialVerified', label: 'Issuer credential verified', detail: 'Agent identity is linked to a trusted issuer.' },
  { key: 'signatureValid', label: 'Request signature valid', detail: 'The request is signed and has not been changed.' },
  { key: 'scopeMatches', label: 'Delegated scope matches', detail: 'This operation is explicitly within the agent’s authority.' },
  { key: 'behaviorNormal', label: 'Behavior matches baseline', detail: 'The current session matches the demo baseline.' },
  { key: 'appCheckConfigured', label: 'Firebase App Check configured', detail: 'App Check helps attest the app, not identify an agent or a human.' },
  { key: 'humanConfirmed', label: 'Human authorization present', detail: 'A human approved this specific operation.' },
];

const decisionInfo: Record<TrustDecision, { title: string; subtitle: string; icon: typeof ShieldCheck }> = {
  ALLOW: { title: 'Allow', subtitle: 'Evidence meets the demo policy.', icon: ShieldCheck },
  STEP_UP: { title: 'Step-up authentication', subtitle: 'Verify the human and transaction before proceeding.', icon: Fingerprint },
  HOLD: { title: 'Hold for a human', subtitle: 'Pause the automated action and route for review.', icon: UserRoundCheck },
  BLOCK: { title: 'Block request', subtitle: 'A required identity, signature, or scope check failed.', icon: ShieldAlert },
};

export function AgentTrustGate() {
  const [input, setInput] = useState<AgentTrustInput>(initialInput);
  const [result, setResult] = useState<AgentTrustResult>(() => evaluateAgentTrust(initialInput));
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<SavedAgentTrustCheck[]>([]);

  useEffect(() => watchUser(setUser), []);
  useEffect(() => {
    let active = true;
    if (!user) { setHistory([]); return () => { active = false; }; }
    void loadAgentTrustChecks(user).then((items) => { if (active) setHistory(items); }).catch(() => { if (active) setMessage('Could not load the private audit trail.'); });
    return () => { active = false; };
  }, [user]);

  const DecisionIcon = decisionInfo[result.decision].icon;
  const scoreColor = result.decision === 'ALLOW' ? 'trust-green' : result.decision === 'BLOCK' ? 'trust-red' : 'trust-amber';
  const updateSignal = (key: keyof AgentTrustSignals, checked: boolean) => setInput((current) => ({ ...current, signals: { ...current.signals, [key]: checked } }));
  const runEvaluation = () => { const next = evaluateAgentTrust(input); setResult(next); setMessage(''); };
  const loadPreset = (preset: AgentTrustInput) => { setInput(preset); setResult(evaluateAgentTrust(preset)); setMessage(''); };

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (!email || password.length < 6) return;
    setAuthBusy(true);
    try { await emailLogin(email, password); setPassword(''); setMessage('Signed in. Your private trust history is ready.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in failed.'); }
    finally { setAuthBusy(false); }
  }

  async function saveDecision() {
    if (!user || saving) return;
    setSaving(true);
    try {
      await saveAgentTrustCheck(user, result);
      setHistory(await loadAgentTrustChecks(user));
      setMessage('Saved to your private Firestore audit trail.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save the trust check.'); }
    finally { setSaving(false); }
  }

  const factorTotal = useMemo(() => result.factors.reduce((total, factor) => total + factor.points, 0), [result]);

  return <section className="trust-gate" aria-label="Know Your Agent Trust Gate">
    <header className="trust-hero">
      <div className="trust-kicker"><span className="trust-kicker-dot"/> KNOW YOUR AGENT · FIREBASE TRUST GATE</div>
      <h1>Prove the agent.<br/><em>Respect the human.</em></h1>
      <p>Explainable checks for agent identity, delegated authority and session risk—then hold sensitive actions for a human when the evidence is weak.</p>
      <div className="trust-hero-chips"><span><Fingerprint size={15}/> Signed identity</span><span><ShieldCheck size={15}/> Least-privilege scope</span><span><UserRoundCheck size={15}/> Human override</span></div>
    </header>

    <div className="trust-presets" aria-label="Load a demo scenario">
      <div><strong>Try a scenario</strong><small>Deterministic demo signals; no bank connection.</small></div>
      {trustPresets.map((preset) => <button type="button" key={preset.label} onClick={() => loadPreset(preset.input)}><span>{preset.label}</span><small>{preset.description}</small></button>)}
    </div>

    <div className="trust-layout">
      <div className="trust-input-card">
        <div className="trust-card-heading"><div><span className="trust-step">01 / EVIDENCE</span><h2>Evaluate an action</h2></div><BadgeCheck size={21}/></div>
        <label className="trust-field">Agent display name<input maxLength={80} value={input.agentName} onChange={(event) => setInput({ ...input, agentName: event.target.value })}/></label>
        <label className="trust-field">Agent reference<input maxLength={120} value={input.agentRef} onChange={(event) => setInput({ ...input, agentRef: event.target.value })}/><small>Use a demo DID or non-personal identifier.</small></label>
        <div className="trust-field-row">
          <label className="trust-field">Requested operation<select value={input.operation} onChange={(event) => setInput({ ...input, operation: event.target.value })}><option>Read account balance</option><option>Share financial data</option><option>Change repayment date</option><option>Change payee</option><option>Transfer funds</option></select></label>
          <label className="trust-field">Action exposure<select value={input.riskLevel} onChange={(event) => setInput({ ...input, riskLevel: event.target.value as RiskLevel })}><option value="low">Low</option><option value="elevated">Elevated</option><option value="high">High</option></select></label>
        </div>
        <div className="trust-signal-list"><div className="trust-signal-title">Evidence signals <small>Toggle for this scenario</small></div>
          {signalItems.map((item) => <label className="trust-signal" key={item.key}><input type="checkbox" checked={input.signals[item.key]} disabled={item.key === 'appCheckConfigured'} onChange={(event) => updateSignal(item.key, event.target.checked)}/><span><strong>{item.label}</strong><small>{item.detail}</small></span><i>{item.key === 'appCheckConfigured' ? (input.signals.appCheckConfigured ? 'READY' : 'OFF') : (input.signals[item.key] ? 'PASS' : 'MISSING')}</i></label>)}
        </div>
        <label className="trust-field trust-human-field">Human safety signal<select value={input.humanSignal} onChange={(event) => setInput({ ...input, humanSignal: event.target.value as HumanSignal })}><option value="clear">No pause signal</option><option value="pause">Person requested a pause</option><option value="distress">Possible distress cue · manual demo input</option></select><small>Distress is a manual demo input, not automatic voice or emotion detection.</small></label>
        <button type="button" className="trust-evaluate" onClick={runEvaluation}>Run explainable trust check <ArrowRight size={17}/></button>
        <p className="trust-demo-note"><LockKeyhole size={14}/> Demo policy only. Signals are simulated and do not authorize or block real banking actions.</p>
      </div>

      <div className="trust-result-column">
        <article className={'trust-result-card ' + scoreColor} aria-live="polite">
          <div className="trust-result-top"><span className="trust-step">02 / DECISION</span><span className="trust-demo-tag">EXPLAINABLE POLICY</span></div>
          <div className="trust-score-row"><div className="trust-score"><strong>{result.score}</strong><span>/ 100</span></div><div className="trust-score-copy"><small>AGENT TRUST SCORE</small><h2>{result.agentName || 'Unnamed agent'}</h2><p>{result.operation} · {result.riskLevel} exposure</p></div></div>
          <div className="trust-meter" role="meter" aria-label="Agent trust score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.score}><span style={{ width: `${result.score}%` }}/></div>
          <div className={'trust-decision decision-' + result.decision.toLowerCase()}><DecisionIcon size={22}/><div><strong>{decisionInfo[result.decision].title}</strong><span>{decisionInfo[result.decision].subtitle}</span></div></div>
          <p className="trust-explanation">{result.explanation}</p>
          <div className="trust-next-step"><strong>NEXT SAFE STEP</strong><span>{result.nextStep}</span></div>
          <div className="trust-result-summary"><span>REQUEST</span><strong>{result.agentRef} → {result.operation}</strong><span>POINTS</span><strong>{factorTotal} evidence points</strong></div>
        </article>

        <article className="trust-breakdown-card">
          <div className="trust-card-heading"><div><span className="trust-step">03 / REASONS</span><h2>Show your work</h2></div><span className="trust-weight-label">WEIGHTED SIGNALS</span></div>
          {result.factors.map((factor) => <div className="trust-factor" key={factor.name}><span className={factor.points > 0 ? 'factor-pass' : 'factor-fail'}>{factor.points > 0 ? '+' : '−'}</span><div><strong>{factor.name}</strong><small>{factor.detail}</small></div><b>{factor.points}/{factor.name === 'Issuer credential' || factor.name === 'Request signature' ? 25 : factor.name === 'Delegated scope' ? 20 : factor.name === 'Behavior baseline' || factor.name === 'Firebase App Check' ? 10 : factor.name === 'Human authorization' ? 5 : 5}</b></div>)}
          <div className="trust-appcheck-note"><ShieldCheck size={16}/><span>App Check helps Firebase verify the app instance. Agent identity and user consent still need their own proofs.</span></div>
        </article>

        <article className="trust-roadmap-card">
          <span className="trust-step">NEXT INNOVATION LAYER</span><h2>Human-safety signals</h2>
          <p>Voice distress support should be opt-in, processed on-device where possible, and route ambiguous cues to a human—not make an automated lending decision.</p>
          <div><span>01 · Signed agent passports</span><span>02 · Verifiable delegation receipts</span><span>03 · Consent-first voice pause</span></div>
        </article>
      </div>
    </div>

    <section className="trust-audit-card">
      <div className="trust-audit-head"><div><span className="trust-step">04 / PRIVATE AUDIT</span><h2>Keep a reviewable trail</h2><p>Save only the decision, demo signals and timestamp to your own Firestore space.</p></div><span className="trust-private-label"><LockKeyhole size={14}/> PRIVATE TO YOUR ACCOUNT</span></div>
      {!firebaseEnabled ? <p className="trust-auth-message">Firebase is not configured in this build.</p> : user ? <div className="trust-signed-in"><span>Signed in · {user.email || 'Firebase account'}</span><div><button type="button" className="trust-save" disabled={saving} onClick={saveDecision}>{saving ? 'Saving…' : 'Save this decision'}</button><button type="button" className="trust-signout" onClick={() => void logout()}>Sign out</button></div></div> : <form className="trust-login" onSubmit={signIn}><span>Sign in to save this check. You can run all scenarios without signing in.</span><input type="email" autoComplete="email" aria-label="Email address" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)}/><input type="password" autoComplete="current-password" aria-label="Password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)}/><button type="submit" disabled={authBusy || !email || password.length < 6}>{authBusy ? 'Signing in…' : 'Sign in'}</button></form>}
      {message && <p className="trust-status" role="status">{message}</p>}
      {history.length > 0 && <div className="trust-history"><strong>Recent checks</strong>{history.map((item) => <div className="trust-history-row" key={item.id}><span className={'history-dot decision-' + item.decision.toLowerCase()}/><strong>{item.agentName}</strong><span>{item.operation}</span><b>{item.score} · {item.decision}</b><small>{item.createdAt}</small></div>)}</div>}
      <small className="trust-retention">Append-only from the client. Owners can delete their own records. This prototype is not a tamper-proof regulated audit system.</small>
    </section>
  </section>;
}
