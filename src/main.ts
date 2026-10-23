import { REFERENCE, clone, newModel, workingCopy, parseModel, serializeModel, safeFilename } from './models/io';
import { KINDS, validateModel, type Model, type Kind } from './models/schema';
import { trace, expandedClosure, directRequirements, directDependents, configurationReasons, compareConfigurations, active } from './analysis/dependencies';
import { AnalysisController } from './ui/analysis-controller';import { History } from './editor/history';import { renderEditor } from './editor/editor';
import { autoArrange, placedNodes, persistMissingPositions } from './view/layout';
import { svgDiagram, exportSVG, kindLabels, type ViewOptions } from './view/svg-export';import { el, button, field, check, dialog } from './ui/dom';
import { renderNotes } from './ui/notes';
import { createRelationshipState } from './editor/relationships';
let history=new History(REFERENCE),reference=true,mode:'explore'|'edit'='explore',target=history.model.view.defaultRoot??'',selected:string|undefined;
let action:'all'|'trace'|'minimum'|'expanded'='all',direction:'down'|'up'='down',defOnly=false,minimumIndex=0,compareIndex=0,zoom=1;
let relationshipState=createRelationshipState();
let visibleKinds=[...KINDS] as Kind[],includeCredit=true;const cache=new AnalysisController(()=>{if(action==='minimum'){renderAnalysis();renderGraph();renderDetails();}});
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><div><p class="eyebrow">A research tool for organisational dependency models</p><h1>SOIPS Dependency Modeller</h1><p class="origin">Developed from the Self-Organising Information-Processing Systems Hypothesis · <b>J. R. Potas (2026)</b></p></div><button id="about">About / Cite / Help</button></header>
<nav id="toolbar" aria-label="Model files"></nav><div id="identity"></div>
<div class="modebar"><div id="modes" role="group" aria-label="Application mode"></div><div id="status" role="status"></div><div id="history"></div></div>
<main><aside id="editor" hidden></aside><section class="explorer"><div id="explore-controls" class="controls"></div><div id="analysis" aria-live="polite"></div><div id="graph-tools" class="actions"></div><div id="graph-scroll" tabindex="0" aria-label="Scrollable graph"><div id="graph"></div></div><div id="legend" class="legend"></div><div id="details"></div></section></main><div id="validation" role="status"></div><footer>SOIPS Dependency Modeller · J. R. Potas (2026). Dependency configurations reflect the assumptions specified in each model.</footer>`;
const get=(id:string)=>document.getElementById(id)!;
const discard=()=>!history.dirty||confirm('There are unsaved model changes. Download Save JSON to keep them. Discard changes and continue?');
function download(content:string,name:string,type:string){const url=URL.createObjectURL(new Blob([content],{type})),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function load(model:Model,isReference=false){history=new History(model);relationshipState=createRelationshipState();reference=isReference;target=model.view.defaultRoot??model.nodes[0]?.id??'';selected=undefined;mode='explore';action='all';minimumIndex=compareIndex=0;zoom=model.view.zoom??1;visibleKinds=model.view.visibleRelations??[...KINDS];includeCredit=model.view.includeCredit??true;render();}
function editable(){if(!reference)return true;if(!confirm('The bundled Figure 2 reference is immutable. Create an editable copy with its source citation preserved?'))return false;const copy=workingCopy(history.model);history=new History(history.model);history.commit(copy);reference=false;return true;}
function commit(model:Model){const errors=validateModel(model).filter(i=>i.severity==='error');if(errors.length){alert('Changes were not saved:\n'+errors.map(i=>i.message).join('\n'));return false;}
  model=persistMissingPositions(model);model.metadata.updated=new Date().toISOString();history.commit(model);if(!model.nodes.some(n=>n.id===target))target=model.nodes[0]?.id??'';if(!model.nodes.some(n=>n.id===selected))selected=undefined;minimumIndex=0;render();return true;}
const toolbar=get('toolbar');toolbar.append(
  button('New blank model',()=>{if(discard())load(newModel());}),
  button('Open JSON',()=>{if(!discard())return;const input=el('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{if(input.files?.[0])load(parseModel(await input.files[0].text()));}catch(error){alert(`Import rejected. Current model preserved.\n${(error as Error).message}`);}};input.click();}),
  button('Save JSON',()=>{const next=clone(history.model);if(!reference){next.view={...next.view,defaultRoot:target||undefined,zoom,visibleRelations:visibleKinds,includeCredit};history.commit(next);}download(serializeModel(history.model),safeFilename(history.model.metadata.title,'json'),'application/json');history.markSaved();render();},'primary'),
  button('Duplicate reference',()=>{if(!discard())return;relationshipState=createRelationshipState();history=new History(REFERENCE);history.commit(workingCopy(REFERENCE));reference=false;mode='edit';target=history.model.view.defaultRoot??'';selected=undefined;action='all';render();}),
  button('Open reference',()=>{if(discard())load(REFERENCE,true);}),
  button('Export SVG',()=>download(exportSVG(history.model,currentView()),safeFilename(history.model.metadata.title+'-'+action,'svg'),'image/svg+xml'))
);
function currentView():ViewOptions {const model=history.model;let highlight:Set<string>|undefined;
  if(action==='minimum'){const r=cache.calculate(model,target);const configuration=r.configurations[minimumIndex];if(configuration)highlight=new Set(configuration);}
  if(action==='trace')highlight=trace(model,target,direction,defOnly?['defining','oneOf','requiredVia','participation']:visibleKinds.filter(k=>k!=='canBuildOn'));
  if(action==='expanded')highlight=expandedClosure(model,target);
  return {highlight,selected,visibleKinds:defOnly||action==='minimum'?visibleKinds.filter(k=>k!=='supports'):visibleKinds,includeCredit,caption:action==='minimum'?(cache.calculate(model,target).exact?'Minimum-cardinality configuration':'Candidate configuration · exact minimum not completed'):action==='expanded'?'Expanded contributors · not a minimum':action==='trace'?`${direction==='down'?'Depends on':'Used by'} trace · alternatives unresolved`:'All model relationships'};
}
function render(){const model=history.model;
  if(!model.nodes.some(n=>n.id===target))target=model.view.defaultRoot??model.nodes[0]?.id??'';
  if(!model.nodes.some(n=>n.id===selected))selected=undefined;
  get('identity').replaceChildren(el('strong',model.metadata.title),el('span',reference?'Reference model · immutable':'Working copy',reference?'badge':'badge working'),el('span',model.metadata.authors.join(', ')||'Authorship not set','muted'));
  get('status').textContent=history.dirty?'● Unsaved changes — use Save JSON':'Saved / unmodified';get('status').className=history.dirty?'dirty':'';
  const undo=button('Undo',()=>{history.undo();render();}),redo=button('Redo',()=>{history.redo();render();});undo.disabled=!history.canUndo;redo.disabled=!history.canRedo;get('history').replaceChildren(undo,redo);
  get('modes').replaceChildren(button('Explore',()=>{mode='explore';render();},mode==='explore'?'active':''),button('Edit',()=>{if(editable()){mode='edit';render();}},mode==='edit'?'active':''));
  document.body.classList.toggle('editing',mode==='edit');get('editor').hidden=mode!=='edit';
  if(mode==='edit')renderEditor(get('editor'),model,selected,{change:commit,select:id=>{selected=id;target=id;minimumIndex=0;render();},target},relationshipState);
  renderControls();renderAnalysis();renderGraph();renderDetails();
  const issues=validateModel(model);get('validation').replaceChildren(...issues.map(i=>el('p',`${i.severity}: ${i.message}`,i.severity==='error'?'error':'muted')));
}
function renderControls(){const c=get('explore-controls');c.replaceChildren();const model=history.model;
  const search=field(c,'Find node','','search'),targetSelect=field(c,'Analysis target',target,'text',[{value:'',label:'Choose any node'},...model.nodes.map(n=>({value:n.id,label:n.label}))]);
  search.oninput=()=>{const query=search.value.toLowerCase();for(const option of (targetSelect as HTMLSelectElement).options)option.hidden=!!query&&!option.textContent!.toLowerCase().includes(query);};
  search.onkeydown=e=>{if(e.key==='Enter'){const node=model.nodes.find(n=>(n.label+' '+n.code+' '+n.id).toLowerCase().includes(search.value.toLowerCase()));if(node){target=node.id;selected=target;minimumIndex=0;render();}}};
  targetSelect.onchange=()=>{target=targetSelect.value;selected=target;minimumIndex=0;render();};
  const directionSelect=field(c,'Direction',direction,'text',[{value:'down',label:'Depends on'},{value:'up',label:'Used by'}]);directionSelect.onchange=()=>{direction=directionSelect.value as typeof direction;action='trace';render();};
  const defining=check(c,'Defining only (including alternatives / via)',defOnly);defining.onchange=()=>{defOnly=defining.checked;render();};
  const row=el('div',undefined,'actions full');row.append(button('Trace connections',()=>{action='trace';render();},action==='trace'?'active':''),button('Calculate minimal configurations',()=>{action='minimum';minimumIndex=0;render();},action==='minimum'?'active':''),button('Show extended / supporting contributors',()=>{action='expanded';render();},action==='expanded'?'active':''),button('Show whole model',()=>{action='all';render();}));c.append(row);
  const filters=el('details'),summary=el('summary','Relationship display & export options');filters.append(summary);for(const kind of KINDS){const input=check(filters,kindLabels[kind],visibleKinds.includes(kind));input.onchange=()=>{visibleKinds=input.checked?[...visibleKinds,kind]:visibleKinds.filter(k=>k!==kind);render();};}const credit=check(filters,'Include model citation and software credit in SVG',includeCredit);credit.onchange=()=>{includeCredit=credit.checked;};c.append(filters);
}
function renderAnalysis(){const area=get('analysis'),model=history.model;area.replaceChildren();
  if(!target){area.append(el('p',model.nodes.length?'Choose a target to analyse.':'Start a blank model in Edit: add a category, then nodes and their dependencies.','notice'));return;}
  if(action==='minimum'){
    const r=cache.calculate(model,target);minimumIndex=Math.min(minimumIndex,Math.max(0,r.configurations.length-1));
    area.append(el('strong',r.exact?`${r.minimumSize??'No'} nodes · ${r.configurations.length} tied minimum-cardinality configuration(s)`:'Exact minimum not completed','result'));
    for(const message of r.messages)area.append(el('p',message,'error'));
    if(r.configurations.length){const select=field(area,r.exact?'Choose minimum':'Choose known candidate',minimumIndex,'text',r.configurations.map((s,i)=>({value:String(i),label:`${r.exact?'Minimum':'Candidate'} ${i+1} of ${r.configurations.length} · ${s.length} nodes`})));select.onchange=()=>{minimumIndex=Number(select.value);render();};
      const compare=field(area,'Compare against',Math.min(compareIndex,r.configurations.length-1),'text',r.configurations.map((_,i)=>({value:String(i),label:`Configuration ${i+1}`})));compare.onchange=()=>{compareIndex=Number(compare.value);render();};
      const a=new Set(r.configurations[minimumIndex]),b=new Set(r.configurations[Math.min(compareIndex,r.configurations.length-1)]),diff=compareConfigurations(a,b),name=(id:string)=>model.nodes.find(n=>n.id===id)?.label??id;
      area.append(el('p',`Only selected: ${diff.onlyA.map(name).join(', ')||'none'}. Only comparison: ${diff.onlyB.map(name).join(', ')||'none'}.`,'muted'));
      const edges=(s:Set<string>)=>model.relations.filter(r=>['defining','oneOf','requiredVia','participation'].includes(r.kind)&&s.has(r.from)&&s.has(r.to)&&active(r,s)).map(r=>r.id),ea=edges(a),eb=edges(b);
      area.append(el('p',`Different active requirement records: ${[...ea.filter(id=>!eb.includes(id)),...eb.filter(id=>!ea.includes(id))].join(', ')||'none'}. ${r.states} search states.`,'muted'));
    }
    area.append(el('p','Structural candidates under the encoded assumptions. Participation is an assumed relationship; including both components does not demonstrate it.','notice'));
  }else if(action==='expanded')area.append(el('p',`${expandedClosure(model,target).size} nodes in expanded closure. Follows defining, all alternatives, required-through and supports; activates contextual participation. Illustrative build-on links do not enlarge this closure. This is not a minimum configuration.`,'notice'));
  else if(action==='trace')area.append(el('p',`${currentView().highlight?.size??0} nodes in a ${direction==='down'?'dependency':'potential-use'} trace. Includes all reachable alternatives; it does not select one valid configuration.${direction==='up'?' Reverse context links indicate potential uses.':''}`,'notice'));
  else area.append(el('p',`${model.nodes.length} nodes · ${model.relations.length} relations. Select a box to inspect and trace its connections.`,'muted'));
}
function renderGraph(){const model=history.model,graph=get('graph'),view=currentView();graph.innerHTML=svgDiagram(model,{...view,interactive:true});const svg=graph.querySelector('svg')!;const width=Number(svg.getAttribute('width')),height=Number(svg.getAttribute('height'));svg.style.width=width*zoom+'px';svg.style.height=height*zoom+'px';
  const tools=get('graph-tools'),zoomLabel=el('span',`${Math.round(zoom*100)}%`);tools.replaceChildren(button('−',()=>{zoom=Math.max(.25,zoom-.15);renderGraph();}),zoomLabel,button('+',()=>{zoom=Math.min(3,zoom+.15);renderGraph();}),button('Fit',()=>{zoom=Math.max(.65,Math.min(1,(get('graph-scroll').clientWidth-12)/width));renderGraph();}),button('100%',()=>{zoom=1;renderGraph();}));
  if(mode==='edit')tools.append(button('Auto arrange',()=>{if(confirm('Reposition every node by category? Logical relations stay the same. Undo is available.'))commit(autoArrange(model));}));
  tools.append(el('span',mode==='edit'?'Drag any node to move it. Its X/Y fields update on drop; Save JSON keeps the layout.':'To move nodes, switch to Edit mode.','muted'));
  for(const g of graph.querySelectorAll<SVGGElement>('[data-node]')){
    const id=g.getAttribute('data-node')!;let dragged=false;g.style.cursor=mode==='edit'?'grab':'pointer';
    const pick=()=>{selected=selected===id?undefined:id;if(selected)target=id;action='trace';minimumIndex=0;render();};
    g.addEventListener('click',()=>{if(!dragged)pick();});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}});
    g.addEventListener('pointerdown',e=>{if(mode!=='edit'||e.button!==0)return;e.preventDefault();g.focus();g.style.cursor='grabbing';const start={x:e.clientX,y:e.clientY};const n=placedNodes(model).find(n=>n.id===id)!;g.setPointerCapture(e.pointerId);dragged=false;let dx=0,dy=0;
      const move=(event:PointerEvent)=>{dx=(event.clientX-start.x)/zoom;dy=(event.clientY-start.y)/zoom;if(Math.abs(dx)+Math.abs(dy)>4){dragged=true;g.setAttribute('transform',`translate(${dx} ${dy})`);}};
      const end=()=>{g.removeEventListener('pointermove',move);g.removeEventListener('pointerup',end);g.removeEventListener('pointercancel',cancel);g.style.cursor='grab';if(dragged){const next=clone(model);next.nodes.find(n=>n.id===id)!.position={x:Math.round(Math.max(n.width/2,n.position.x+dx)*10)/10,y:Math.round(Math.max(18,n.position.y+dy)*10)/10};selected=id;commit(next);}};
      const cancel=()=>{g.removeEventListener('pointermove',move);g.removeEventListener('pointerup',end);g.removeEventListener('pointercancel',cancel);g.removeAttribute('transform');g.style.cursor='grab';};g.addEventListener('pointermove',move);g.addEventListener('pointerup',end);g.addEventListener('pointercancel',cancel);
    });
  }
  const legend=get('legend');legend.replaceChildren();for(const c of model.categories){const item=el('span'),swatch=el('i');swatch.style.background=c.colour;item.append(swatch,document.createTextNode(c.label));legend.append(item);}for(const kind of visibleKinds)legend.append(el('span',`${kind==='oneOf'?'···':kind==='supports'?'┄':kind==='canBuildOn'?'⇢':'—'} ${kindLabels[kind]}`));
}
function renderDetails(){const area=get('details'),model=history.model;area.replaceChildren();const node=model.nodes.find(n=>n.id===(selected||target));if(!node)return;
  area.append(el('h2',node.label),el('p',node.description));const groups=directRequirements(model,node.id);
  for(const kind of KINDS){if(!groups[kind].length)continue;area.append(el('h3',kindLabels[kind]));for(const r of groups[kind]){
    const d=el('details'),label=model.nodes.find(n=>n.id===r.to)?.label??r.to;d.append(el('summary',`${label}${r.groupId?' · group '+r.groupId:''}${r.via?' · via '+r.via:''}${r.judgement?' [JC]':''}`),el('p',r.explanation||'No justification recorded.'),el('p',r.evidence.join('\n')||'No source recorded.','muted'));
    if(r.condition)d.append(el('p',`Activation: all of ${r.condition.allOf.join(', ')}. ${r.context??''}`));area.append(d);
  }}
  const dependents=directDependents(model,node.id);area.append(el('h3','Direct dependents / contexts'),el('p',dependents.length?dependents.map(r=>`${r.from} (${kindLabels[r.kind]}${r.condition?.allOf.includes(node.id)?'; activated in this context':''})`).join(', '):'No direct uses recorded.'));
  const view=currentView();if(action==='minimum'&&view.highlight){const reasons=configurationReasons(model,target,view.highlight);area.append(el('h3','Why each node is included'));const ul=el('ul');for(const [id,why] of reasons)ul.append(el('li',`${model.nodes.find(n=>n.id===id)?.label}: ${why.join('; ')}`));area.append(ul);
    for(const r of model.relations.filter(r=>r.kind==='participation'&&active(r,view.highlight!)))area.append(el('p',`Explicit participation (${r.id}): ${r.context}. ${r.explanation}`,'notice'));
  }
  if(node.notes){const d=el('details');d.append(el('summary','Full source / interpretation notes'),renderNotes(node.notes));area.append(d);}
}
get('about').onclick=()=>{const content=el('div'),model=history.model;for(const text of ['Interactive tool for constructing and exploring organisational dependency models. Developed from SOIPS — J. R. Potas (2026).','Model authors: '+(model.metadata.authors.join(', ')||'Not supplied'),'Please cite: '+(model.metadata.citation||'Set your model citation in Edit → Model information.'),'Source publication / DOI: '+(model.metadata.sourceUrl||'Pending; no publication link supplied.'),'Start: Explore the reference, select any box, then calculate minima or trace connections. Edit creates a working copy. Save JSON downloads all model information; Open JSON restores it. Export SVG saves a complete standalone vector diagram.','Creating a model: Create categories, add elements, and define their dependencies. You can specify mandatory relationships, alternative contributors or optional supporting relationships. For dependencies that require a particular provider, identify how that provider supplies the required component. Context-dependent relationships should specify when and how they apply.','Drag nodes in Edit, or use position fields for keyboard control. Fit keeps larger models readable through scrolling. Undo/Redo: toolbar or Ctrl/Cmd+Z outside form fields.','Search is bounded (default 50,000 states, 1,000 configurations, 1,500 ms). Exact minimum not completed means displayed candidates are not proven minima. Change limits in Edit → Model information.','The reference follows Supplementary S1. Green build-on links are illustrative. The analysis reports the consequences of the dependencies specified in each model; it does not independently validate those assumptions. Software: MIT Licence, © 2026 J. R. Potas. SOIPS reference model: CC BY 4.0, J. R. Potas (2026).'])content.append(el('p',text));for(const [label,href] of [['MIT software licence','https://opensource.org/license/mit'],['SOIPS model licence (CC BY 4.0)','https://creativecommons.org/licenses/by/4.0/legalcode']]){const link=el('a',label);link.href=href;link.target='_blank';link.rel='noopener noreferrer';content.appendChild(el('p')).append(link);}if(model.metadata.sourceUrl){try{const url=new URL(model.metadata.sourceUrl);if(['https:','http:'].includes(url.protocol)){const link=el('a','Open model source / publication');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}}catch{}}dialog('About / Cite / Help',content);};
window.addEventListener('beforeunload',e=>{if(history.dirty){e.preventDefault();e.returnValue='';}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){e.preventDefault();if(e.shiftKey)history.redo();else history.undo();render();}});
render();
