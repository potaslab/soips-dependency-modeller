import { clone } from '../models/io';import type { Model } from '../models/schema';
export function attachedRelations(model:Model,ids:string[]){return model.relations.filter(r=>ids.includes(r.from)||ids.includes(r.to)||!!r.via&&ids.includes(r.via)||r.condition?.allOf.some(id=>ids.includes(id)));}
export function deleteNodes(model:Model,ids:string[]):Model {
  const next=clone(model),remove=new Set(attachedRelations(model,ids).map(r=>r.id));next.nodes=next.nodes.filter(n=>!ids.includes(n.id));next.relations=next.relations.filter(r=>!remove.has(r.id));
  if(next.view.defaultRoot&&ids.includes(next.view.defaultRoot))next.view.defaultRoot=next.nodes[0]?.id;return next;
}
export function deleteCategory(model:Model,id:string,moveTo?:string):Model {
  if(moveTo===id||moveTo&&!model.categories.some(c=>c.id===moveTo))throw Error('Choose another existing category.');
  const next=moveTo?clone(model):deleteNodes(model,model.nodes.filter(n=>n.categoryId===id).map(n=>n.id));
  next.categories=next.categories.filter(c=>c.id!==id);if(moveTo)for(const n of next.nodes)if(n.categoryId===id)n.categoryId=moveTo;return next;
}
