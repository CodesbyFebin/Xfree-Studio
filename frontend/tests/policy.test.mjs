import test from 'node:test';
import assert from 'node:assert/strict';
import { route, join } from '../src/privacy.ts';
import { order, combine, executeTool, freshness } from '../src/workflow.ts';
test('restricted labels never choose cloud', () => {
  for (const label of ['LOCAL_ONLY','TAINTED','INTERNAL']) for (const mode of ['Cloud','Hybrid','On-device']) {
    const result = route('compare options',label,mode);
    assert.equal(result.cloudAllowed,false); assert.equal(result.mode,'ONLY_ON_DEVICE');
  }
});
test('heuristic promotes public fake SSN', () => assert.equal(route('123-45-6789','PUBLIC','Cloud').cloudAllowed,false));
test('public complex task prefers cloud', () => assert.equal(route('compare options','PUBLIC','Hybrid').mode,'PREFER_IN_CLOUD'));
test('taint propagates', () => { assert.equal(join(['PUBLIC','LOCAL_ONLY']),'TAINTED'); assert.equal(combine([{text:'a',label:'TAINTED'}]).label,'TAINTED'); });
test('cycles and missing dependencies rejected', () => {
  assert.throws(() => order([{id:'a',kind:'tool',parents:['a']}]));
  assert.throws(() => order([{id:'a',kind:'tool',parents:['b']}]));
});
test('topological ordering', () => assert.deepEqual(order([{id:'b',kind:'tool',parents:['a']},{id:'a',kind:'input',parents:[]}]).map(n=>n.id),['a','b']));
test('tool allowlist and taint', () => {
  const value = {text:'one two',label:'LOCAL_ONLY'};
  assert.throws(() => executeTool({name:'fetch'},value));
  assert.throws(() => executeTool({name:'count_words',url:'https://example.com'},value));
  const result = executeTool({name:'count_words'},value);
  assert.equal(result.receipt.count,2); assert.equal(result.value.label,'TAINTED');
});
test('freshness does not invent grounding', () => {
  assert.equal(freshness(null,1000),'UNKNOWN');
  assert.equal(freshness(0,240000),'STALE');
  assert.equal(freshness(0,1000),'CURRENT');
});
