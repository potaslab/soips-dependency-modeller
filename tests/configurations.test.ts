import test from 'node:test';import assert from 'node:assert/strict';
import { minimalConfigurations, AnalysisCache } from '../src/analysis/configurations';
import { expandedClosure, trace } from '../src/analysis/dependencies';
import { small, rel } from './fixtures';
test('Independent alternative groups and shared prerequisites minimise globally',()=>{
  const m=small(['root','a','b','c','cost']);m.relations=[rel('root','a','oneOf',{groupId:'g1'}),rel('root','b','oneOf',{groupId:'g1'}),rel('root','b','oneOf',{id:'g2b',groupId:'g2'}),rel('root','c','oneOf',{groupId:'g2'}),rel('a','cost')];
  const r=minimalConfigurations(m,'root');assert.equal(r.minimumSize,2);assert.deepEqual(r.configurations,[['root','b']]);
  assert.equal(trace(m,'root').size,5); // trace includes every alternative, not a valid single minimum
});
test('requiredVia verifies provider supply and includes provider and operation',()=>{
  const m=small();m.relations=[rel('root','b','requiredVia',{via:'a'}),rel('a','b','supports')];
  assert.equal(minimalConfigurations(m,'root').minimumSize,3);
  m.relations.pop();assert.match(minimalConfigurations(m,'root').messages.join(),/provider/);
});
test('Participation activates only in its named context, and is an explicit relationship',()=>{
  const m=small();m.relations=[rel('a','b','participation',{condition:{allOf:['root']},context:'a receives b information'})];
  assert.equal(minimalConfigurations(m,'root').minimumSize,3);assert.equal(minimalConfigurations(m,'a').minimumSize,1);
});
test('Optional supports and build-on never force minima; contextual rules activate after closure',()=>{
  const m=small();m.relations=[rel('root','a'),rel('root','b','supports'),rel('a','c','canBuildOn'),rel('a','b','defining',{id:'conditional',condition:{allOf:['root']}})];
  assert.equal(minimalConfigurations(m,'root').minimumSize,3);assert.equal(minimalConfigurations(m,'a').minimumSize,1);assert.equal(expandedClosure(m,'root').size,3);
});
test('Mandatory cycles block exactness; optional cycles do not; invalid target and caps are explicit',()=>{
  const m=small();m.relations=[rel('root','a'),rel('a','root')];assert.match(minimalConfigurations(m,'root').messages.join(),/Circular/);
  m.relations=[rel('root','a','supports'),rel('a','root','supports')];assert.equal(minimalConfigurations(m,'root').minimumSize,1);
  assert.equal(minimalConfigurations(m,'missing').exact,false);assert.equal(minimalConfigurations(m,'root',{maxStates:1}).exact,false);
});
test('Activated mandatory cycle is reported instead of a false minimum',()=>{
  const m=small();m.relations=[rel('root','a'),rel('a','root','defining',{condition:{allOf:['root']}})];assert.equal(minimalConfigurations(m,'root').exact,false);
});
test('Configuration budget never labels a truncated tie enumeration exact',()=>{
  const m=small();m.relations=[rel('root','a','oneOf',{groupId:'g'}),rel('root','b','oneOf',{groupId:'g'})];const r=minimalConfigurations(m,'root',{maxConfigurations:1});assert.equal(r.exact,false);assert.equal(r.minimumSize,null);assert.equal(r.configurations.length,1);assert.match(r.messages.join(),/Exact minimum not completed/);
});
test('50–100 nodes and stable cache across colour/layout edits',()=>{
  const m=small(Array.from({length:100},(_,i)=>'n'+i));m.relations=m.nodes.slice(1).map((n,i)=>rel('n'+i,n.id));
  const cache=new AnalysisCache(),a=cache.calculate(m,'n0');assert.equal(a.minimumSize,100);
  m.nodes[0].position={x:600,y:400};m.categories[0].colour='#ffffff';assert.equal(cache.calculate(m,'n0'),a);
  m.relations.pop();assert.equal(cache.calculate(m,'n0').minimumSize,99);
});
test('Search agrees with independent exhaustive subset oracle on 30 small arbitrary models',()=>{
  for(let seed=1;seed<=30;seed++){
    let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/2**32);
    const m=small(['root','a','b','c','d','e']);
    for(let i=0;i<5;i++)for(let j=i+1;j<6;j++)if(random()<.4)m.relations.push(rel(m.nodes[i].id,m.nodes[j].id,random()<.5?'defining':'oneOf',{groupId:'g'+(j%2)}));
    const valid:string[][]=[];for(let bits=1;bits<64;bits+=2){const s=m.nodes.filter((_,i)=>bits&(1<<i)).map(n=>n.id);const set=new Set(s);
      if(m.relations.every(r=>!set.has(r.from)||(r.kind==='defining'?set.has(r.to):m.relations.some(t=>t.kind==='oneOf'&&t.from===r.from&&t.groupId===r.groupId&&set.has(t.to)))))valid.push(s);}
    const min=Math.min(...valid.map(s=>s.length)),r=minimalConfigurations(m,'root');assert.equal(r.minimumSize,min);assert.deepEqual(r.configurations.map(s=>s.sort().join()).sort(),valid.filter(s=>s.length===min).map(s=>s.sort().join()).sort());
  }
});
