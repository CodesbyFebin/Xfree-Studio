export type PrivacyLabel = 'PUBLIC' | 'INTERNAL' | 'LOCAL_ONLY' | 'TAINTED';
export type RoutingTrace = { label: PrivacyLabel; cloudAllowed: boolean; complexity: 'DIRECT' | 'MULTI_STEP'; mode: string; source?: string; latencyMs?: number };
export function join(labels: readonly PrivacyLabel[]): PrivacyLabel {
  if (!labels.length) return 'LOCAL_ONLY';
  if (labels.some(l => l === 'LOCAL_ONLY' || l === 'TAINTED')) return 'TAINTED';
  return labels.includes('INTERNAL') ? 'INTERNAL' : 'PUBLIC';
}
export function route(input: string, label: PrivacyLabel, choice: 'Hybrid' | 'On-device' | 'Cloud'): RoutingTrace {
  // Detection can only promote restrictions; INTERNAL has no declassification path in this MVP.
  const detected = /LOCAL_ONLY|\b\d{3}-\d{2}-\d{4}\b|password\s*[:=]|api[_ -]?key\s*[:=]|-----BEGIN .*PRIVATE KEY-----/i.test(input);
  const effective = detected || choice === 'On-device' ? 'LOCAL_ONLY' : label;
  const cloudAllowed = effective === 'PUBLIC';
  const complexity = /\b(search|compare|research|find|tool)\b|\band then\b/i.test(input) || input.length > 800 ? 'MULTI_STEP' : 'DIRECT';
  return { label: effective, cloudAllowed, complexity, mode: !cloudAllowed ? 'ONLY_ON_DEVICE' : choice === 'Cloud' ? 'ONLY_IN_CLOUD' : complexity === 'MULTI_STEP' ? 'PREFER_IN_CLOUD' : 'PREFER_ON_DEVICE' };
}
