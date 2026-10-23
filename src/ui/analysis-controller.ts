import {minimalConfigurations,type AnalysisResult} from '../analysis/configurations';import type {Model} from '../models/schema';
declare const __ANALYSIS_WORKER_SOURCE__:string;
// Bundle the worker into a Blob: both hosted and file:// builds have no external assets.
export class AnalysisController {
  private key='';private result?:AnalysisResult;private worker?:Worker;
  constructor(private onReady:()=>void){}
  calculate(model:Model,target:string):AnalysisResult {
    const key=JSON.stringify([model.nodes.map(n=>n.id),model.relations,model.analysisSettings,target]);
    if(this.key!==key){this.key=key;this.result=undefined;this.worker?.terminate();let url:string|undefined;
      const fallback=()=>{this.result=minimalConfigurations(model,target,{timeoutMs:100,maxStates:5000});this.result.messages.push('Background worker unavailable; used a reduced 100 ms / 5,000 state budget.');queueMicrotask(this.onReady);};
      try {url=URL.createObjectURL(new Blob([__ANALYSIS_WORKER_SOURCE__],{type:'text/javascript'}));const worker=this.worker=new Worker(url);
        worker.onmessage=event=>{if(this.key===key){this.result=event.data;this.onReady();}worker.terminate();};
        worker.onerror=event=>{event.preventDefault();worker.terminate();if(this.key===key)fallback();};worker.postMessage({model,target});
      }catch {fallback();}finally{if(url)URL.revokeObjectURL(url);}
    }
    return this.result??{exact:false,minimumSize:null,configurations:[],states:0,elapsedMs:0,messages:['Calculating in the background…']};
  }
}
