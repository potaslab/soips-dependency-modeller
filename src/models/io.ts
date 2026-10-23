import type { Model } from './schema';
import { validateModel } from './schema';
import referenceData from './soips-reference.json';
export const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
export function deepFreeze<T>(value:T):T {if(value&&typeof value==='object'){Object.freeze(value);for(const v of Object.values(value))deepFreeze(v);}return value;}
export const REFERENCE=deepFreeze(referenceData as Model);
export function parseModel(text:string):Model {
  if(text.length>5_000_000)throw Error('JSON exceeds the 5 MB import limit.');
  const value:unknown=JSON.parse(text);const errors=validateModel(value).filter(i=>i.severity==='error');
  if(errors.length)throw Error(errors.map(i=>i.message).join('\n'));return value as Model;
}
export function serializeModel(model:Model):string {return JSON.stringify(model,null,2)+'\n';}
export function safeFilename(title:string,extension:string) {return (title.replace(/[^\p{L}\p{N}._-]+/gu,'-').replace(/^[.-]+|[.-]+$/g,'').slice(0,90)||'dependency-model')+'.'+extension;}
export function newModel():Model {return {schemaVersion:'1.0.0',modelId:crypto.randomUUID(),metadata:{title:'Untitled dependency model',authors:[],description:'',version:'0.1.0',created:new Date().toISOString(),updated:new Date().toISOString()},categories:[],nodes:[],relations:[],view:{includeCredit:true},analysisSettings:{maxStates:50000,maxConfigurations:1000,timeoutMs:1500}};}
export function workingCopy(model:Model):Model {const copy=clone(model);copy.modelId=crypto.randomUUID();copy.metadata.provenance={derivedFrom:model.modelId,sourceCitation:model.metadata.citation??'',prior:model.metadata.provenance??null};copy.metadata.modificationNotes='Editable derivative; describe changes and add authorship.';return copy;}
