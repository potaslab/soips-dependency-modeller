export const KINDS = ['defining','oneOf','supports','requiredVia','canBuildOn','participation'] as const;
export type Kind = typeof KINDS[number];
export interface Category { id:string; label:string; colour:string; fill?:string; description:string; order:number; band?:boolean; labelSpace?:number }
export interface ModelNode { id:string; label:string; shortLabel?:string; code?:string; categoryId:string; description:string; notes?:string; references?:string[]; order:number; position?:{x:number;y:number}; width?:number; height?:number }
export interface Relation { id:string; from:string; to:string; kind:Kind; groupId?:string; via?:string; condition?:{allOf:string[]}; context?:string; explanation:string; evidence:string[]; judgement:boolean; provenance?:unknown }
export interface Model {
  schemaVersion:'1.0.0'; modelId:string;
  metadata:{title:string; authors:string[]; year?:number; description:string; version:string; citation?:string|null; sourceUrl?:string|null; licence?:string; created?:string; updated?:string; researchReady?:boolean; provenance?:unknown; modificationNotes?:string};
  categories:Category[]; nodes:ModelNode[]; relations:Relation[];
  view:{defaultRoot?:string; visibleRelations?:Kind[]; zoom?:number; includeCredit?:boolean};
  analysisSettings?:{maxStates?:number; maxConfigurations?:number; timeoutMs?:number};
}
export interface Issue { severity:'error'|'warning'; message:string }
export function validateModel(input:unknown):Issue[] {
  const issues:Issue[]=[];
  const error=(message:string)=>issues.push({severity:'error',message});
  const warn=(message:string)=>issues.push({severity:'warning',message});
  const obj=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const str=(v:unknown)=>typeof v==='string';
  const text=(v:unknown)=>str(v)&&!!(v as string).trim();
  const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
  const strings=(v:unknown)=>Array.isArray(v)&&v.every(str);
  if(!obj(input))return [{severity:'error',message:'Model must be a JSON object.'}];
  const m=input;
  if(m.schemaVersion!=='1.0.0')error('Unsupported schemaVersion; expected 1.0.0. No migration is available.');
  if(!text(m.modelId))error('modelId must be a nonempty string.');
  if(!obj(m.metadata)||!text(m.metadata.title)||!strings(m.metadata.authors)||!str(m.metadata.description)||!str(m.metadata.version))error('metadata needs a title, authors array, description and version.');
  if(obj(m.metadata)) {
    for(const key of ['citation','sourceUrl','licence','created','updated','modificationNotes'])if(m.metadata[key]!=null&&!str(m.metadata[key]))error(`metadata.${key} must be text.`);
    if(m.metadata.year!==undefined&&(!Number.isInteger(m.metadata.year)||m.metadata.year<0))error('metadata.year must be a nonnegative integer.');
    if(m.metadata.researchReady!==undefined&&typeof m.metadata.researchReady!=='boolean')error('metadata.researchReady must be boolean.');
  }
  for(const field of ['nodes','categories','relations'])if(!Array.isArray(m[field]))error(`${field} must be an array.`);
  if(!Array.isArray(m.nodes)||!Array.isArray(m.categories)||!Array.isArray(m.relations))return issues;
  if(m.nodes.length>2000||m.relations.length>20000||m.categories.length>500) {error('Document exceeds import limits (2,000 nodes, 20,000 relations, 500 categories).');return issues;}
  const ids=(items:any[],name:string)=>{const result=new Set<string>();for(const item of items){if(!obj(item)||!text(item.id))error(`${name} needs a stable nonempty ID.`);else if(result.has(item.id))error(`Duplicate ${name} ID: ${item.id}`);else result.add(item.id);}return result;};
  const categories=ids(m.categories,'category'),nodes=ids(m.nodes,'node');ids(m.relations,'relation');
  for(const c of m.categories)if(obj(c)) {
    if(!text(c.label)||!str(c.description)||!finite(c.order)||!/^#[0-9a-f]{6}$/i.test(c.colour)|| (c.fill!==undefined&&!/^#[0-9a-f]{6}$/i.test(c.fill)))error(`Category ${c.id}: label, description, order and six-digit hex colour required.`);
    if(c.band!==undefined&&typeof c.band!=='boolean')error(`Category ${c.id}: band must be boolean.`);
    if(c.labelSpace!==undefined&&(!finite(c.labelSpace)||c.labelSpace<0||c.labelSpace>1000))error(`Category ${c.id}: invalid labelSpace.`);
  }
  for(const n of m.nodes)if(obj(n)) {
    if(!text(n.label)||!str(n.description)||!finite(n.order)||!categories.has(n.categoryId))error(`Node ${n.id}: label, description, order and existing categoryId required.`);
    for(const key of ['shortLabel','code','notes'])if(n[key]!==undefined&&!str(n[key]))error(`Node ${n.id}: ${key} must be text.`);
    if(n.references!==undefined&&!strings(n.references))error(`Node ${n.id}: references must be a text array.`);
    if(n.position!==undefined&&(!obj(n.position)||!finite(n.position.x)||!finite(n.position.y)||n.position.x<0||n.position.y<0||n.position.x>100000||n.position.y>100000))error(`Node ${n.id}: position must contain finite x/y between 0 and 100,000.`);
    for(const key of ['width','height'])if(n[key]!==undefined&&(!finite(n[key])||n[key]<20||n[key]>2000))error(`Node ${n.id}: ${key} must be between 20 and 2,000.`);
  }
  const groups=new Map<string,string>();
  for(const r of m.relations)if(obj(r)) {
    if(!nodes.has(r.from)||!nodes.has(r.to))error(`Relation ${r.id}: from/to must reference existing nodes.`);
    if(!KINDS.includes(r.kind))error(`Relation ${r.id}: unknown kind ${r.kind}.`);
    if(!str(r.explanation)||!strings(r.evidence)||typeof r.judgement!=='boolean')error(`Relation ${r.id}: explanation, evidence array and judgement boolean required.`);
    if(r.condition!==undefined&&(!obj(r.condition)||!strings(r.condition.allOf)||!r.condition.allOf.length||r.condition.allOf.some((id:string)=>!nodes.has(id))))error(`Relation ${r.id}: condition.allOf must name existing nodes.`);
    if(r.context!==undefined&&!str(r.context))error(`Relation ${r.id}: context must be text.`);
    if(r.kind==='oneOf') {
      if(!text(r.groupId))error(`Relation ${r.id}: oneOf needs an explicit groupId.`);
      const key=JSON.stringify([r.from,r.groupId]),condition=JSON.stringify(Array.isArray(r.condition?.allOf)?r.condition.allOf.slice().sort():[]);
      if(groups.has(key)&&groups.get(key)!==condition)error(`Alternative group ${r.groupId}: all members must share the activation condition.`);
      groups.set(key,condition);
    }
    if(r.kind==='requiredVia') {
      if(!nodes.has(r.via)||r.via===r.from||r.via===r.to)error(`Relation ${r.id}: requiredVia needs a distinct existing provider.`);
      if(!m.relations.some((s:any)=>obj(s)&&s.from===r.via&&s.to===r.to&&['defining','supports'].includes(s.kind)&&!s.condition))error(`Relation ${r.id}: provider must have an unconditional defining/supports link supplying ${r.to}.`);
    }
    if(r.kind==='participation'&&(!r.condition||!text(r.context)))error(`Relation ${r.id}: participation needs an explicit condition and context explanation.`);
    if(m.metadata?.researchReady&&['defining','oneOf','requiredVia','participation'].includes(r.kind)&&(!text(r.explanation)||!Array.isArray(r.evidence)||!r.evidence.some((s:any)=>text(s))))warn(`Research assumption ${r.id} lacks justification/evidence.`);
  }
  if(!obj(m.view))error('view must be an object.');else {
    if(m.view.defaultRoot!==undefined&&!nodes.has(m.view.defaultRoot))error('view.defaultRoot references a missing node.');
    if(m.view.visibleRelations!==undefined&&(!Array.isArray(m.view.visibleRelations)||m.view.visibleRelations.some((k:Kind)=>!KINDS.includes(k))))error('view.visibleRelations contains invalid kinds.');
    if(m.view.zoom!==undefined&&(!finite(m.view.zoom)||m.view.zoom<.1||m.view.zoom>4))error('view.zoom must be between 0.1 and 4.');
    if(m.view.includeCredit!==undefined&&typeof m.view.includeCredit!=='boolean')error('view.includeCredit must be boolean.');
  }
  if(m.analysisSettings!==undefined) {
    if(!obj(m.analysisSettings))error('analysisSettings must be an object.');else for(const [key,max] of [['maxStates',1000000],['maxConfigurations',10000],['timeoutMs',5000]] as const){const v=m.analysisSettings[key];if(v!==undefined&&(!Number.isInteger(v)||v<1||v>max))error(`analysisSettings.${key} must be an integer from 1 to ${max}.`);}
  }
  // Only unconditional hard dependency cycles are fatal at validation; activated cycles are also checked during search.
  if(!issues.some(i=>i.severity==='error')) {
    const cycle=findMandatoryCycle(m as Model);
    if(cycle)error(`Circular mandatory dependencies: ${cycle.join(' → ')}. Resolve before exact analysis.`);
  }
  return issues;
}
export function findMandatoryCycle(m:Model,selected?:Set<string>):string[]|undefined {
  const adj=new Map(m.nodes.map(n=>[n.id,[] as string[]]));
  for(const r of m.relations) {
    if(selected&&!selected.has(r.from))continue;
    if(r.condition&&(!selected||!r.condition.allOf.every(id=>selected.has(id))))continue;
    if(r.kind==='defining'||r.kind==='requiredVia'){adj.get(r.from)?.push(r.to);if(r.via&&r.kind==='requiredVia')adj.get(r.from)?.push(r.via);}
  }
  const done=new Set<string>(),stack:string[]=[];
  function visit(id:string):string[]|undefined {const index=stack.indexOf(id);if(index>=0)return [...stack.slice(index),id];if(done.has(id))return;stack.push(id);for(const next of adj.get(id)??[]){const found=visit(next);if(found)return found;}stack.pop();done.add(id);}
  for(const id of adj.keys()){const found=visit(id);if(found)return found;}
}
