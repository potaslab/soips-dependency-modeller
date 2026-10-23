import test from 'node:test';import assert from 'node:assert/strict';
import { exportSVG } from '../src/view/svg-export';import { REFERENCE } from '../src/models/io';import { small,rel } from './fixtures';
test('Standalone SVG includes all 28 nodes, category labels, 90 edge records, title, legend and attribution',()=>{
  const svg=exportSVG(REFERENCE);assert.equal((svg.match(/data-node=/g)??[]).length,28);assert.equal((svg.match(/data-edge=/g)??[]).length,90);
  for(const text of ['Consciousness','Dimension A','Dimension B','Potas','SOIPS consciousness dependency model','viewBox=','<rect','<tspan','<marker'])assert.ok(svg.includes(text),text);
  assert.ok(!/<script|foreignObject|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));
});
test('Arbitrary moved nodes, long labels and markup are escaped; current filters and credit apply',()=>{
  const m=small();m.nodes[0].label='<script> & "quoted" '+('Long label '.repeat(25));m.nodes[0].position={x:900,y:800};m.relations=[rel('root','a'),rel('root','b','supports')];
  const svg=exportSVG(m,{visibleKinds:['defining'],includeCredit:false});assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('900'));assert.equal((svg.match(/data-edge=/g)??[]).length,1);assert.ok(!svg.includes('Potas'));
});
