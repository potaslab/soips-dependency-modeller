import test from 'node:test';import assert from 'node:assert/strict';
import { parseModel, serializeModel, workingCopy, REFERENCE } from '../src/models/io';
import { validateModel } from '../src/models/schema';import { small, rel } from './fixtures';
test('Invalid import structures, schema versions and dangling references are rejected',()=>{
  for(const value of [null,[],{},'text',{...small(),schemaVersion:'9'},{...small(),nodes:[null]}])assert.throws(()=>parseModel(JSON.stringify(value)));
  const m=small();m.relations=[rel('root','missing')];assert.throws(()=>parseModel(serializeModel(m)),/existing nodes/);
  m.relations=[rel('root','a','oneOf')];assert.throws(()=>parseModel(serializeModel(m)),/groupId/);
});
test('Empty model valid; unknown extensions, quotes and script-like labels survive round-trip safely',()=>{
  const m=small([]);assert.deepEqual(validateModel(m),[]);
  const extra={...small(),customData:{note:'<script>alert("hi")</script>'}};assert.deepEqual(parseModel(serializeModel(extra)),extra);
});
test('Working copies preserve reference and source attribution while acquiring distinct IDs',()=>{
  const copy=workingCopy(REFERENCE);copy.nodes[0].label='Edited';assert.equal(REFERENCE.nodes[0].label,'Consciousness');assert.notEqual(copy.modelId,REFERENCE.modelId);assert.equal(copy.metadata.citation,REFERENCE.metadata.citation);
});
test('Malformed optional fields yield actionable validation errors without crashing the validator',()=>{
  for(const bad of [null,12,'text',{},[]]){const m=small();m.metadata.researchReady=true;m.relations=[{...rel('root','a','oneOf',{groupId:'g'}),condition:{allOf:bad},explanation:bad,evidence:bad} as any];assert.doesNotThrow(()=>validateModel(m));assert.ok(validateModel(m).some(i=>i.severity==='error'));}
});
