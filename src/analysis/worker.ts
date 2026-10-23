import { minimalConfigurations } from './configurations';import type { Model } from '../models/schema';
const worker=globalThis as unknown as {onmessage:(event:MessageEvent<{model:Model;target:string}>)=>void;postMessage:(data:unknown)=>void};
worker.onmessage=event=>worker.postMessage(minimalConfigurations(event.data.model,event.data.target));
