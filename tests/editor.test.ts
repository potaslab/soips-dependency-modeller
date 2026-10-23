import test from 'node:test';import assert from 'node:assert/strict';
import { History } from '../src/editor/history';import { deleteCategory,deleteNodes } from '../src/editor/operations';
import { autoArrange, persistMissingPositions } from '../src/view/layout';import { small,rel } from './fixtures';
import { minimalConfigurations } from '../src/analysis/configurations';import { parseModel,serializeModel } from '../src/models/io';
test('Undo/redo restores science, positions and dirty state, including saved checkpoint',()=>{
  const m=small(),h=new History(m);assert.equal(h.dirty,false);h.commit({...m,relations:[rel('root','a')]});assert.equal(h.dirty,true);h.undo();assert.equal(h.dirty,false);h.redo();assert.equal(h.model.relations.length,1);h.markSaved();assert.equal(h.dirty,false);h.undo();assert.equal(h.dirty,true);
});
test('Deletion cleans provider/context edges; category move preserves relations',()=>{
  const m=small();m.categories.push({id:'other',label:'Other',colour:'#123456',description:'',order:1});m.relations=[rel('root','b','requiredVia',{via:'a'}),rel('a','b','supports'),rel('b','c','participation',{condition:{allOf:['a']},context:'assumed'})];
  assert.equal(deleteNodes(m,['a']).relations.length,0);const moved=deleteCategory(m,'parts','other');assert.equal(moved.nodes.length,4);assert.equal(moved.relations.length,3);assert.ok(moved.nodes.every(n=>n.categoryId==='other'));assert.equal(deleteCategory(m,'parts').nodes.length,0);
});
test('Deterministic layout preserves existing nodes when new nodes arrive; round-trip preserves results',()=>{
  const m=small();m.nodes[0].position={x:32,y:44};const laid=persistMissingPositions(m);assert.deepEqual(laid.nodes[0].position,m.nodes[0].position);const before=serializeModel(laid.nodes[1] as any);laid.nodes.push({id:'new',label:'New',categoryId:'parts',description:'',order:4});assert.equal(serializeModel(persistMissingPositions(laid).nodes[1] as any),before);
  laid.relations=[rel('root','new')];const n=autoArrange(laid);assert.equal(minimalConfigurations(parseModel(serializeModel(n)),'root').minimumSize,2);assert.deepEqual(autoArrange(laid),n);
});
