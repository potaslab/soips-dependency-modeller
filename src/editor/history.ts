import { clone, serializeModel } from '../models/io';
import type { Model } from '../models/schema';
export class History {
  model:Model;private past:Model[]=[];private future:Model[]=[];private saved:string;
  constructor(model:Model){this.model=clone(model);this.saved=serializeModel(model);}
  get dirty(){return serializeModel(this.model)!==this.saved;}
  get canUndo(){return this.past.length>0;}get canRedo(){return this.future.length>0;}
  commit(next:Model){if(serializeModel(next)===serializeModel(this.model))return;this.past.push(clone(this.model));if(this.past.length>100)this.past.shift();this.future=[];this.model=clone(next);}
  undo(){const previous=this.past.pop();if(previous){this.future.push(this.model);this.model=previous;}}
  redo(){const next=this.future.pop();if(next){this.past.push(this.model);this.model=next;}}
  markSaved(){this.saved=serializeModel(this.model);}
}
