import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
import { REFERENCE, parseModel, serializeModel } from '../src/models/io';
import { validateModel } from '../src/models/schema';
import { minimalConfigurations } from '../src/analysis/configurations';
import { expandedClosure } from '../src/analysis/dependencies';
import { scenario, scenarioNames } from './fixtures';

test('Downloadable SOIPS reference is byte-identical to the canonical CC BY 4.0 model',()=>{
  const canonical=fs.readFileSync(new URL('../src/models/soips-reference.json',import.meta.url));
  const downloadable=fs.readFileSync(new URL('../models/soips-potas2026-figure2.json',import.meta.url));
  assert.deepEqual(downloadable,canonical);
  assert.equal(REFERENCE.metadata.licence,'CC BY 4.0');
});
test('Phase 1: 28 nodes / 90 audit-backed relations, types and lossless round-trip',()=>{
  assert.equal(REFERENCE.nodes.length,28);assert.equal(REFERENCE.relations.length,90);
  assert.deepEqual(REFERENCE.relations.reduce((a,r)=>(a[r.kind]=(a[r.kind]??0)+1,a),{} as Record<string,number>),{defining:29,supports:43,canBuildOn:4,requiredVia:5,oneOf:8,participation:1});
  assert.deepEqual(validateModel(REFERENCE),[]);assert.deepEqual(parseModel(serializeModel(REFERENCE)),REFERENCE);
  assert.ok(REFERENCE.relations.every(r=>r.explanation&&r.evidence.length&&r.judgement===r.explanation.includes('[JC')));
  assert.ok(Object.isFrozen(REFERENCE.nodes[0]));
});
test('Phase 2: exact three 12-node minima with correct members and 25-node expanded closure',()=>{
  const result=minimalConfigurations(REFERENCE,'CON');assert.equal(result.exact,true);assert.equal(result.minimumSize,12);assert.equal(result.configurations.length,3);
  const core=['CON','FCOG','AWA','A2','A4','RA','TF','GF','RO'];
  const expected=[['MON','B2','CI'],['MON','LEA','B1'],['EVA','B2','CI']].map(a=>[...core,...a].sort().join(','));
  assert.deepEqual(result.configurations.map(a=>a.sort().join(',')).sort(),expected.sort());
  const expanded=expandedClosure(REFERENCE,'CON');assert.equal(expanded.size,25);for(const id of ['AGE','PLA','PRE'])assert.ok(!expanded.has(id));
});
const expected=[[12,1,25],[12,5,25],[12,2,25],[13,2,25],[13,2,25],[9,3,25],[12,3,28],[12,3,25],[12,3,25]];
for(const [index,name] of scenarioNames.entries())test(`S1.10: ${name}`,()=>{const m=scenario(name),r=minimalConfigurations(m,'CON');assert.equal(r.exact,true,r.messages.join('\n'));assert.deepEqual([r.minimumSize,r.configurations.length,expandedClosure(m,'CON').size],expected[index]);});
