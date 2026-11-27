import { join, route, type PrivacyLabel } from './privacy.ts';
export type Node = { id: string; kind: 'input' | 'inference' | 'tool'; parents: string[]; mode?: 'Hybrid' | 'On-device' | 'Cloud' };
export type Value = { text: string; label: PrivacyLabel };
export function order(nodes: Node[]): Node[] {
  if (!nodes.length || nodes.length > 20) throw Error('Invalid graph size');
  const map = new Map(nodes.map(n => [n.id,n]));
  if (map.size !== nodes.length) throw Error('Duplicate node');
  const done = new Set<string>(), active = new Set<string>(), result: Node[] = [];
  function visit(id: string) {
    if (done.has(id)) return;
    if (active.has(id)) throw Error('Cycle detected');
    const n = map.get(id);
    if (!n) throw Error('Unknown dependency');
    if (!['input','inference','tool'].includes(n.kind) || (n.kind === 'input' ? n.parents.length !== 0 : n.parents.length === 0)) throw Error('Invalid node');
    if (n.mode && !['Hybrid','On-device','Cloud'].includes(n.mode)) throw Error('Invalid mode');
    active.add(id); n.parents.forEach(visit); active.delete(id); done.add(id); result.push(n);
  }
  nodes.forEach(n => visit(n.id)); return result;
}
export function combine(values: Value[]): Value {
  return { text: values.map(v => v.text).join('\n'), label: join(values.map(v => v.label)) };
}
export function executeTool(call: unknown, value: Value) {
  if (!call || typeof call !== 'object' || Array.isArray(call)) throw Error('Invalid tool call');
  const c = call as Record<string, unknown>;
  if (Object.keys(c).length !== 1 || c.name !== 'count_words') throw Error('Tool not allowed');
  if (typeof value.text !== 'string' || value.text.length > 50000) throw Error('Invalid tool input');
  const count = value.text.trim().split(/\s+/u).filter(Boolean).length;
  return { value: { text: String(count), label: join([value.label]) }, receipt: { tool: 'count_words', count, verified: Number.isSafeInteger(count) && count >= 0 } };
}
export function freshness(groundedAt: number | null, now = Date.now(), ttl = 240000) {
  if (groundedAt === null || !Number.isFinite(groundedAt) || groundedAt > now) return 'UNKNOWN';
  return now - groundedAt >= ttl ? 'STALE' : 'CURRENT';
}
export function classify(text: string, label: PrivacyLabel): Value {
  return { text, label: route(text,label,'Hybrid').label };
}
