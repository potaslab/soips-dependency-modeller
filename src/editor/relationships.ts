import type { Kind, Model, Relation } from '../models/schema';
import { KINDS } from '../models/schema';
import { clone } from '../models/io';
import { kindLabels } from '../view/svg-export';
import { button, el, field } from '../ui/dom';

export interface RelationshipState {
  selected?:string; direction:'depends'|'usedBy'; query:string; kind:Kind; groupId:string;
  removed:Map<string,Relation>; scrollTop:number;
}
export const createRelationshipState=():RelationshipState=>({direction:'depends',query:'',kind:'defining',groupId:'',removed:new Map(),scrollTop:0});
interface Actions {
  change:(model:Model)=>boolean;
  remove:(next:Model,description:string,affected:Relation[])=>boolean;
  edit:(relation:Relation)=>void;
  addAdvanced:(from:string,to:string,kind:Kind)=>void;
}

export function renderRelationships(container:HTMLElement,model:Model,selected:string|undefined,state:RelationshipState,actions:Actions) {
  container.replaceChildren();container.className='relationships';
  const node=model.nodes.find(n=>n.id===selected);
  if(!node){container.append(el('p','Select a node above or in the graph to toggle its relationships.','muted'));return;}
  if(state.selected!==selected){state.selected=selected;state.query='';state.scrollTop=0;}
  container.append(el('h3',`Relationships for ${node.label}`));
  const tabs=el('div',undefined,'actions');
  for(const [direction,label] of [['depends','Depends on'],['usedBy','Used by']] as const){const b=button(label,()=>{state.direction=direction;state.scrollTop=0;renderRelationships(container,model,selected,state,actions);},state.direction===direction?'active':'');b.setAttribute('aria-pressed',String(state.direction===direction));tabs.append(b);}
  container.append(tabs,el('p',state.direction==='depends'?`Choose contributors to ${node.label}.`:`Choose nodes that use ${node.label} as a contributor.`,'muted'),el('p','Checked = a link in this working model. Uncheck to remove it; check again to restore it during this editing session. Undo is also available. Save JSON downloads your changes.','muted'));
  const search=field(container,'Find relationship node',state.query,'search');
  const kind=field(container,'New link type',state.kind,'text',KINDS.map(k=>({value:k,label:kindLabels[k]})));
  const group=field(container,'New alternative group ID',state.groupId);
  const hint=el('p',undefined,'muted');container.append(hint);
  const list=el('div',undefined,'relationship-list');list.setAttribute('aria-label',`Relationships for ${node.label}`);container.append(list);
  list.addEventListener('scroll',()=>{state.scrollTop=list.scrollTop;});
  const renderList=()=>{
    group.parentElement!.hidden=state.kind!=='oneOf';
    hint.textContent=state.kind==='oneOf'?'Each named alternative group is required independently. Enter the group before adding a node.':state.kind==='requiredVia'||state.kind==='participation'?'New links of this type open the detailed form for provider/context information.':'New links use the selected type. Existing links keep their own type, evidence and conditions.';
    list.replaceChildren();
    const match=(r:Relation)=>state.direction==='depends'?r.from===node.id:r.to===node.id;
    const active=model.relations.filter(match),removed=[...state.removed.values()].filter(r=>match(r)&&!model.relations.some(a=>a.id===r.id)&&model.nodes.some(n=>n.id===r.from)&&model.nodes.some(n=>n.id===r.to));
    const records=[...active,...removed];
    const others=model.nodes.filter(n=>n.id!==node.id||records.some(r=>r.from===n.id&&r.to===n.id)).filter(n=>(n.label+' '+(n.code??'')+' '+n.id).toLowerCase().includes(state.query.toLowerCase()));
    others.sort((a,b)=>Number(records.some(r=>(state.direction==='depends'?r.to:r.from)===b.id))-Number(records.some(r=>(state.direction==='depends'?r.to:r.from)===a.id))||a.order-b.order);
    for(const other of others){const links=records.filter(r=>(state.direction==='depends'?r.to:r.from)===other.id);
      const choices:(Relation|undefined)[]=[...links];if(!links.some(r=>r.kind===state.kind&&(state.kind!=='oneOf'||r.groupId===state.groupId.trim())))choices.push(undefined);
      for(const relation of choices){
        const row=el('div',undefined,'relationship-row');row.dataset.nodeId=other.id;if(relation)row.dataset.relationId=relation.id;
        const enabled=!!relation&&model.relations.some(r=>r.id===relation.id),label=el('label',undefined,'relationship-toggle'),input=el('input');input.type='checkbox';input.checked=enabled;input.setAttribute('aria-label',`${other.label} · ${relation?kindLabels[relation.kind]:'add '+kindLabels[state.kind]}${relation?' · '+relation.id:''}`);
        const text=el('span'),name=el('strong',other.label),description=el('small',relation?`${kindLabels[relation.kind]}${relation.groupId?' · group '+relation.groupId:''}${relation.via?' · via '+relation.via:''}${relation.condition?' · when '+relation.condition.allOf.join(', '):''}${enabled?'':' · removed; check to restore'}`:`Add ${kindLabels[state.kind]}`);text.append(name,description);label.append(input,text);row.append(label);
        input.onchange=()=>{
          if(enabled&&relation){const next=clone(model);next.relations=next.relations.filter(r=>r.id!==relation.id);
            const previous=state.removed.get(relation.id);state.removed.set(relation.id,clone(relation));
            if(!actions.remove(next,`Remove ${model.nodes.find(n=>n.id===relation.from)?.label} → ${model.nodes.find(n=>n.id===relation.to)?.label} (${kindLabels[relation.kind]}).`,[relation])){input.checked=true;if(previous)state.removed.set(relation.id,previous);else state.removed.delete(relation.id);}
          }else if(relation){const next=clone(model);next.relations.push(clone(relation));if(!actions.change(next))input.checked=false;
          }else {
            const from=state.direction==='depends'?node.id:other.id,to=state.direction==='depends'?other.id:node.id;
            if(state.kind==='requiredVia'||state.kind==='participation'){input.checked=false;actions.addAdvanced(from,to,state.kind);return;}
            if(state.kind==='oneOf'&&!state.groupId.trim()){input.checked=false;alert('Enter an alternative group ID before adding a one-of link.');group.focus();return;}
            const next=clone(model);next.relations.push({id:crypto.randomUUID(),from,to,kind:state.kind,...(state.kind==='oneOf'?{groupId:state.groupId.trim()}:{}),explanation:'',evidence:[],judgement:true});if(!actions.change(next))input.checked=false;
          }
        };
        if(relation){const details=el('details');details.append(el('summary','Type / evidence'),el('p',relation.explanation||'No justification recorded.','muted'),el('p',relation.evidence.join('\n')||'No source recorded.','muted'));if(relation.context)details.append(el('p',relation.context,'muted'));row.append(details);if(enabled)row.append(button('Edit relation',()=>actions.edit(relation)));}
        list.append(row);
      }
    }
    if(!others.length)list.append(el('p','No matching nodes.','muted'));
    list.scrollTop=state.scrollTop;
  };
  search.oninput=()=>{state.query=search.value;state.scrollTop=0;renderList();};kind.onchange=()=>{state.kind=kind.value as Kind;renderList();};group.oninput=()=>{state.groupId=group.value;renderList();};renderList();
}
