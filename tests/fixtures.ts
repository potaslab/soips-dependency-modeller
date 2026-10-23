import { clone, REFERENCE } from '../src/models/io';
import type { Model, Relation } from '../src/models/schema';
export const reference=()=>clone(REFERENCE);
export function small(ids=['root','a','b','c']):Model {return {schemaVersion:'1.0.0',modelId:'test',metadata:{title:'Engineering example',authors:['Other researcher'],description:'',version:'1'},categories:[{id:'parts',label:'Parts',description:'',colour:'#248A71',order:0}],nodes:ids.map((id,order)=>({id,label:id,categoryId:'parts',description:'',order})),relations:[],view:{defaultRoot:ids[0]}};}
export const rel=(from:string,to:string,kind:Relation['kind']='defining',extra:Partial<Relation>={}):Relation=>({id:`${from}-${to}-${kind}`,from,to,kind,explanation:'Test assumption',evidence:['Test source'],judgement:true,...extra});
export const scenarioNames=['Inference requires relational models','Regulation without transmission','Monitoring requires retention','Flexible cognition requires elementary cognition','A4 requires relational models','A4 optional','Awareness response mapped to agency','Perception requires inference','Elementary cognition alternatives'] as const;
export function scenario(name:typeof scenarioNames[number]):Model {
  const m=reference();const change=(from:string,to:string,kind:Relation['kind'])=>{const r=m.relations.find(r=>r.from===from&&r.to===to)!;r.kind=kind;};
  switch(name){
    case 'Inference requires relational models':change('B2','A3','defining');break;
    case 'Regulation without transmission':change('B3','A1','supports');break;
    case 'Monitoring requires retention':change('MON','B1','defining');break;
    case 'Flexible cognition requires elementary cognition':change('FCOG','ECOG','defining');break;
    case 'A4 requires relational models':change('A4','A3','defining');break;
    case 'A4 optional':change('FCOG','A4','supports');break;
    case 'Awareness response mapped to agency':m.relations.find(r=>r.from==='AWA'&&r.to==='B3')!.to='AGE';break;
    case 'Perception requires inference':change('PER','B2','defining');break;
    case 'Elementary cognition alternatives': {
      // S1 Table 3's complete alternative reading: representations OR inferred relationships,
      // independently of the existing derive-conclusions/guide-responses functional group.
      const r=m.relations.find(r=>r.from==='ECOG'&&r.to==='A2')!;r.kind='oneOf';r.groupId='ECOG-information';
      m.relations.push(rel('ECOG','B2','oneOf',{id:'sensitivity-inferred-relationships',groupId:'ECOG-information'}));break;
    }
  }return m;
}
