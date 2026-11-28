export type TrustDecision = 'ALLOW' | 'STEP_UP' | 'HOLD' | 'BLOCK';
export type RiskLevel = 'low' | 'elevated' | 'high';
export type HumanSignal = 'clear' | 'pause' | 'distress';

export type AgentTrustSignals = {
  credentialVerified: boolean;
  signatureValid: boolean;
  scopeMatches: boolean;
  behaviorNormal: boolean;
  appCheckConfigured: boolean;
  humanConfirmed: boolean;
};

export type AgentTrustInput = {
  agentName: string;
  agentRef: string;
  operation: string;
  riskLevel: RiskLevel;
  humanSignal: HumanSignal;
  signals: AgentTrustSignals;
};

export type TrustFactor = { name: string; points: number; detail: string };

export type AgentTrustResult = AgentTrustInput & {
  score: number;
  decision: TrustDecision;
  factors: TrustFactor[];
  explanation: string;
  nextStep: string;
};

const riskPoints: Record<RiskLevel, number> = { low: 5, elevated: 3, high: 0 };

export function evaluateAgentTrust(input: AgentTrustInput): AgentTrustResult {
  const { signals } = input;
  const factors: TrustFactor[] = [
    { name: 'Issuer credential', points: signals.credentialVerified ? 25 : 0, detail: signals.credentialVerified ? 'Credential is marked verified by its issuer.' : 'No issuer-verified agent credential was supplied.' },
    { name: 'Request signature', points: signals.signatureValid ? 25 : 0, detail: signals.signatureValid ? 'Request signature is marked valid.' : 'Request signature is missing or invalid.' },
    { name: 'Delegated scope', points: signals.scopeMatches ? 20 : 0, detail: signals.scopeMatches ? 'Requested operation is inside the declared delegation.' : 'Requested operation is outside the declared delegation.' },
    { name: 'Behavior baseline', points: signals.behaviorNormal ? 10 : 0, detail: signals.behaviorNormal ? 'Session behavior matches the demo baseline.' : 'Session behavior differs from the demo baseline.' },
    { name: 'Firebase App Check', points: signals.appCheckConfigured ? 10 : 0, detail: signals.appCheckConfigured ? 'App Check is configured for this app; it does not prove agent identity.' : 'App Check is not configured in this client.' },
    { name: 'Human authorization', points: signals.humanConfirmed ? 5 : 0, detail: signals.humanConfirmed ? 'A human authorization signal is present.' : 'Human authorization is not confirmed.' },
    { name: 'Action exposure', points: riskPoints[input.riskLevel], detail: `Action exposure is ${input.riskLevel}.` },
  ];
  const score = factors.reduce((total, factor) => total + factor.points, 0);

  let decision: TrustDecision;
  let explanation: string;
  let nextStep: string;

  if (input.humanSignal !== 'clear') {
    decision = 'HOLD';
    explanation = input.humanSignal === 'distress'
      ? 'A possible distress cue is present. Stop the automated action and bring in a trained human reviewer.'
      : 'A person asked to pause. Respect the request and stop the automated action.';
    nextStep = 'Keep the transaction on hold until a human reviewer confirms that it is safe to continue.';
  } else if (!signals.credentialVerified || !signals.signatureValid || !signals.scopeMatches) {
    decision = 'BLOCK';
    explanation = 'A required identity, signature, or authority check failed. The agent must not proceed.';
    nextStep = 'Reject this request and re-issue a correctly identified, signed, and scoped authorization.';
  } else if (input.riskLevel === 'high' || !signals.humanConfirmed || !signals.behaviorNormal || score < 85) {
    decision = score < 55 ? 'HOLD' : 'STEP_UP';
    explanation = input.riskLevel === 'high'
      ? 'This action has high exposure and needs stronger human authentication.'
      : !signals.behaviorNormal
        ? 'The behavior differs from the expected baseline; verify the user and transaction.'
        : !signals.humanConfirmed
          ? 'The agent is authenticated, but explicit human authorization is missing.'
          : 'The evidence is incomplete for automatic approval.';
    nextStep = decision === 'HOLD'
      ? 'Pause processing and route the case to a human reviewer.'
      : 'Require step-up authentication and re-evaluate before execution.';
  } else {
    decision = 'ALLOW';
    explanation = 'Identity, request integrity, delegated authority, session behavior, and human authorization meet the demo policy.';
    nextStep = 'Allow this operation under the displayed scope and keep the decision in the private audit trail.';
  }

  return { ...input, score, decision, factors, explanation, nextStep };
}

export const trustPresets: Array<{ label: string; description: string; input: AgentTrustInput }> = [
  {
    label: 'Verified assistant',
    description: 'Signed, scoped request with human approval',
    input: {
      agentName: 'Nova Assistant', agentRef: 'did:web:nova.example', operation: 'Read account balance', riskLevel: 'low', humanSignal: 'clear',
      signals: { credentialVerified: true, signatureValid: true, scopeMatches: true, behaviorNormal: true, appCheckConfigured: true, humanConfirmed: true },
    },
  },
  {
    label: 'Scope mismatch',
    description: 'Agent attempts an action outside its grant',
    input: {
      agentName: 'Nova Assistant', agentRef: 'did:web:nova.example', operation: 'Transfer funds', riskLevel: 'elevated', humanSignal: 'clear',
      signals: { credentialVerified: true, signatureValid: true, scopeMatches: false, behaviorNormal: true, appCheckConfigured: true, humanConfirmed: true },
    },
  },
  {
    label: 'Borrower requests a pause',
    description: 'Human safety signal overrides agent trust',
    input: {
      agentName: 'Repayment Assistant', agentRef: 'did:web:repayment.example', operation: 'Change repayment date', riskLevel: 'elevated', humanSignal: 'pause',
      signals: { credentialVerified: true, signatureValid: true, scopeMatches: true, behaviorNormal: true, appCheckConfigured: true, humanConfirmed: true },
    },
  },
  {
    label: 'Unusual high-impact action',
    description: 'Behavior anomaly requires step-up authentication',
    input: {
      agentName: 'Nova Assistant', agentRef: 'did:web:nova.example', operation: 'Change payee', riskLevel: 'high', humanSignal: 'clear',
      signals: { credentialVerified: true, signatureValid: true, scopeMatches: true, behaviorNormal: false, appCheckConfigured: true, humanConfirmed: false },
    },
  },
];
