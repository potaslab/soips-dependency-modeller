import { findMandatoryCycle, validateModel, type Model, type Relation } from '../models/schema';
import { active } from './dependencies';
export interface AnalysisResult {exact:boolean; minimumSize:number|null; configurations:string[][]; states:number; elapsedMs:number; messages:string[]}
export function minimalConfigurations(model:Model,target:string,overrides:Model['analysisSettings']={}):AnalysisResult {
  const start=performance.now();const result:AnalysisResult={exact:false,minimumSize:null,configurations:[],states:0,elapsedMs:0,messages:[]};
  const finish=()=>{result.elapsedMs=performance.now()-start;return result;};
  const errors=validateModel(model).filter(i=>i.severity==='error');
  if(errors.length){result.messages=errors.map(i=>i.message);return finish();}
  if(!model.nodes.some(n=>n.id===target)){result.messages=['Choose an existing target node.'];return finish();}
  const settings={maxStates:50000,maxConfigurations:1000,timeoutMs:1500,...model.analysisSettings,...overrides};
  // Hard ceiling applies even to programmatic callers bypassing schema validation.
  const maxStates=Math.max(1,Math.min(settings.maxStates,1_000_000)),maxConfigs=Math.max(1,Math.min(settings.maxConfigurations,10000)),timeout=Math.max(1,Math.min(settings.timeoutMs,5000));
  const groups=new Map<string,Relation[]>();for(const r of model.relations)if(r.kind==='oneOf'){const key=JSON.stringify([r.from,r.groupId]);groups.set(key,[...(groups.get(key)??[]),r]);}
  const visited=new Set<string>();let best=Infinity,limited=false,cycleBlocked=false;
  const budget=()=>{if(result.states>=maxStates||performance.now()-start>timeout){limited=true;return false;}return true;};
  function close(set:Set<string>):boolean {
    let changed=true;while(changed){if(!budget())return false;changed=false;
      const add=(id:string)=>{if(!set.has(id)){set.add(id);changed=true;}};
      for(const r of model.relations){if(!active(r,set))continue;
        if(r.kind==='participation'){add(r.from);add(r.to);}
        else if(set.has(r.from)&&(r.kind==='defining'||r.kind==='requiredVia')){add(r.to);if(r.kind==='requiredVia')add(r.via!);}
      }
    }return true;
  }
  function search(set:Set<string>) {
    if(limited||!budget())return;result.states++;
    if(!close(set))return;
    if(set.size>best)return;
    const key=JSON.stringify([...set].sort());if(visited.has(key))return;visited.add(key);
    if(findMandatoryCycle(model,set)){cycleBlocked=true;return;}
    const missing=[...groups.values()].filter(g=>set.has(g[0].from)&&active(g[0],set)&&!g.some(r=>set.has(r.to))).sort((a,b)=>a.length-b.length)[0];
    if(!missing){if(set.size<best){best=set.size;result.configurations=[];}
      if(result.configurations.length>=maxConfigs){limited=true;return;}result.configurations.push([...set]);return;}
    if(set.size>=best)return;
    for(const r of missing)search(new Set([...set,r.to]));
  }
  search(new Set([target]));
  // A cycle in any activated branch is an unresolved model state; do not overclaim exactness.
  result.exact=!limited&&!cycleBlocked;
  if(result.exact&&Number.isFinite(best))result.minimumSize=best;
  if(limited)result.messages.push('Exact minimum not completed: state, configuration or time budget reached. Listed configurations are candidates only.');
  if(cycleBlocked)result.messages.push('Exact minimum not completed: an activated mandatory cycle blocks one or more alternatives.');
  if(!result.configurations.length&&!limited&&!cycleBlocked)result.messages.push('No valid configuration under the encoded constraints.');
  return finish();
}
export class AnalysisCache {
  private key='';private result?:AnalysisResult;
  calculate(model:Model,target:string):AnalysisResult {
    const key=JSON.stringify([model.nodes.map(n=>n.id),model.relations,model.analysisSettings,target]);
    if(key!==this.key||!this.result){this.key=key;this.result=minimalConfigurations(model,target);}return this.result;
  }
}
