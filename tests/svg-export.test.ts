import test from 'node:test';import assert from 'node:assert/strict';
import { exportSVG } from '../src/view/svg-export';import { REFERENCE } from '../src/models/io';import { small,rel } from './fixtures';
import { KINDS } from '../src/models/schema';
import { connectionSampleSVG } from '../src/view/edge-style';
test('Standalone SVG includes all 28 nodes, category labels, 90 edge records, title, legend and attribution',()=>{
  const svg=exportSVG(REFERENCE);assert.equal((svg.match(/data-node=/g)??[]).length,28);assert.equal((svg.match(/data-edge=/g)??[]).length,90);
  for(const text of ['Consciousness','Dimension A','Dimension B','Potas','SOIPS consciousness dependency model','viewBox=','<rect','<tspan','<marker'])assert.ok(svg.includes(text),text);
  assert.ok(svg.includes(REFERENCE.metadata.sourceUrl+'<'),'DOI must be exported as citation text');
  // A DOI in citation text is not an external resource; URLs in attributes remain forbidden.
  assert.ok(!/<script|foreignObject|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','').replace(REFERENCE.metadata.sourceUrl+'<','<')));
});
test('Arbitrary moved nodes, long labels and markup are escaped; current filters and credit apply',()=>{
  const m=small();m.nodes[0].label='<script> & "quoted" '+('Long label '.repeat(25));m.nodes[0].position={x:900,y:800};m.relations=[rel('root','a'),rel('root','b','supports')];
  const svg=exportSVG(m,{visibleKinds:['defining'],includeCredit:false});assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('900'));assert.equal((svg.match(/data-edge=/g)??[]).length,1);assert.ok(!svg.includes('Potas'));
  assert.ok(svg.includes('data-legend-edge="defining"'));assert.ok(!svg.includes('data-legend-edge="supports"'));
});

test('App and exported legend samples preserve the diagram stroke styles and illustrative arrow',()=>{
  const svg=exportSVG(REFERENCE,{highlight:new Set(REFERENCE.nodes.map(n=>n.id))});
  const attributes=(markup:string)=>Object.fromEntries([...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  const paths=(svg.match(/<path [^>]*>/g)??[]).map(attributes);
  const expected={
    defining:{stroke:'#7F77DD',width:'1.4',dash:undefined},
    oneOf:{stroke:'#7F77DD',width:'2',dash:'1 4'},
    supports:{stroke:'#7F77DD',width:'1.4',dash:'5 3'},
    requiredVia:{stroke:'#7F77DD',width:'1.4',dash:undefined},
    canBuildOn:{stroke:'#1D9E75',width:'1.4',dash:'4 3'},
    participation:{stroke:'#7F77DD',width:'1.4',dash:undefined},
  };
  for(const kind of KINDS){
    const relation=REFERENCE.relations.find(r=>r.kind===kind)!;
    const edge=paths.find(p=>p['data-edge']===relation.id)!;
    const exported=paths.find(p=>p['data-legend-edge']===kind)!;
    const sample=connectionSampleSVG(kind),app=attributes(sample.match(/<path data-legend-edge="[^>]*>/)![0]);
    assert.equal(edge.stroke,expected[kind].stroke);assert.equal(edge['stroke-width'],expected[kind].width);assert.equal(edge['stroke-dasharray'],expected[kind].dash);
    for(const legend of [exported,app]){
      for(const key of ['fill','stroke','stroke-width','stroke-linecap','stroke-dasharray'])assert.equal(legend[key],edge[key],`${kind}: ${key}`);
      assert.equal(Number(legend.opacity),Number(edge.opacity));assert.match(legend.d,/h48$/);
      assert.equal(!!legend['marker-end'],kind==='canBuildOn');
    }
    assert.equal(exported['marker-end'],edge['marker-end']);
    if(kind==='canBuildOn'){
      assert.equal(app['marker-end'],'url(#legend-arrow-canBuildOn)');
      const marker=sample.match(/<marker [\s\S]*?<\/marker>/)![0];
      assert.equal(marker.replace('legend-arrow-canBuildOn','build-arrow'),svg.match(/<marker [\s\S]*?<\/marker>/)![0]);
    }
  }
});
