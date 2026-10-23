import { KINDS, type Kind, type Model, type Relation } from '../models/schema';
export const active=(r:Relation,set:Set<string>)=>!r.condition||r.condition.allOf.every(id=>set.has(id));
export function directRequirements(model:Model,id:string) {return Object.fromEntries(KINDS.map(k=>[k,model.relations.filter(r=>r.from===id&&r.kind===k)])) as Record<Kind,Relation[]>;}
export function directDependents(model:Model,id:string) {return model.relations.filter(r=>r.to===id||r.via===id||r.condition?.allOf.includes(id));}
export function trace(model:Model,target:string,direction:'down'|'up'='down',kinds:Kind[]=['defining','oneOf','requiredVia','participation']):Set<string> {
  const set=new Set(model.nodes.some(n=>n.id===target)?[target]:[]);let changed=true;
  while(changed){changed=false;const add=(id:string)=>{if(!set.has(id)){set.add(id);changed=true;}};
    for(const r of model.relations){if(!kinds.includes(r.kind))continue;
      if(direction==='down'){
        if(!active(r,set))continue;
        if((r.kind==='participation'&&r.condition)||set.has(r.from)){add(r.to);if(r.kind==='participation')add(r.from);if(r.kind==='requiredVia'&&r.via)add(r.via);}
      }else if(set.has(r.to)||(r.kind==='requiredVia'&&r.via&&set.has(r.via))||r.condition?.allOf.some(id=>set.has(id))) {
        // Reverse trace is a potential-use graph, not a proof of context activation.
        add(r.from);if(r.kind==='participation')for(const id of r.condition?.allOf??[])add(id);
      }
    }
  }return set;
}
export const expandedClosure=(model:Model,target:string)=>trace(model,target,'down',['defining','oneOf','requiredVia','supports','participation']);
export function configurationReasons(model:Model,target:string,set:Set<string>):Map<string,string[]> {
  const reasons=new Map([...set].map(id=>[id,[] as string[]]));reasons.get(target)?.push('Selected analysis target');
  for(const r of model.relations){if(!active(r,set)||!set.has(r.from))continue;
    if(r.kind==='defining')reasons.get(r.to)?.push(`Required by ${r.from} (${r.id})`);
    if(r.kind==='oneOf'&&set.has(r.to))reasons.get(r.to)?.push(`Satisfies ${r.from} alternative group ${r.groupId} (${r.id})`);
    if(r.kind==='requiredVia'){reasons.get(r.to)?.push(`Required by ${r.from} through ${r.via} (${r.id})`);reasons.get(r.via!)?.push(`Provider for ${r.from} → ${r.to} (${r.id})`);}
    if(r.kind==='participation')for(const id of [r.from,r.to])reasons.get(id)?.push(`Assumed participation under ${r.condition?.allOf.join(', ')} (${r.id})`);
  }return reasons;
}
export function compareConfigurations(a:Set<string>,b:Set<string>) {return {onlyA:[...a].filter(id=>!b.has(id)),onlyB:[...b].filter(id=>!a.has(id)),common:[...a].filter(id=>b.has(id))};}
