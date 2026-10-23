import type { Model, ModelNode } from '../models/schema';
export interface PlacedNode extends ModelNode {position:{x:number;y:number};width:number;height:number;lines:string[]}
export function wrap(text:string,width:number,fontSize=12):string[] {
  const max=Math.max(3,Math.floor((width-8)/(fontSize*.49))),lines:string[]=[];let line='';
  for(const word of text.replace(/-(?=\S)/g,'- ').split(/\s+/)){
    if(word.length>max){if(line){lines.push(line);line='';}for(let i=0;i<word.length;i+=max)lines.push(word.slice(i,i+max));continue;}
    if(line&&line.length+word.length+1>max){lines.push(line);line=word;}else line+=(line?' ':'')+word;
  }if(line)lines.push(line);return lines.length?lines:[''];
}
export function placedNodes(model:Model):PlacedNode[] {
  const occupied=model.nodes.filter(n=>n.position).map(n=>({x:n.position!.x,y:n.position!.y}));
  const categories=[...model.categories].sort((a,b)=>a.order-b.order);
  const generated:PlacedNode[]=[];
  return [...model.nodes].sort((a,b)=>a.order-b.order).map(n=>{
    const width=n.width??150,lines=wrap(n.shortLabel||n.label,width),height=Math.max(n.height??42,lines.length*14+12);
    let position=n.position;
    if(!position){let index=0;const row=categories.findIndex(c=>c.id===n.categoryId);
      const savedPeers=model.nodes.filter(p=>p.categoryId===n.categoryId&&p.position);
      const peers=savedPeers.length?[...savedPeers,...generated.filter(p=>p.categoryId===n.categoryId)]:[];
      if(peers.length){const rightmost=peers.reduce((a,b)=>a.position!.x+(a.width??150)/2>b.position!.x+(b.width??150)/2?a:b);position={x:rightmost.position!.x+(rightmost.width??150)/2+width/2+35,y:rightmost.position!.y};}
      else {
      do {position={x:110+(index%4)*180,y:30+row*150+Math.floor(index/4)*75};index++;}while(occupied.some(p=>Math.abs(p.x-position!.x)<170&&Math.abs(p.y-position!.y)<65));occupied.push(position);
      }
    }const placed={...n,position,width,height,lines};generated.push(placed);return placed;
  });
}
export function autoArrange(model:Model):Model {
  let y=30;const categories=[...model.categories].sort((a,b)=>a.order-b.order);const positions=new Map<string,{x:number;y:number}>();
  for(const c of categories){const nodes=model.nodes.filter(n=>n.categoryId===c.id).sort((a,b)=>a.order-b.order);let rowHeight=70;
    for(const [i,n] of nodes.entries()){if(i%4===0&&i>0){y+=rowHeight+25;rowHeight=70;}const height=Math.max(n.height??42,wrap(n.shortLabel||n.label,n.width??150).length*14+12);rowHeight=Math.max(rowHeight,height);positions.set(n.id,{x:140+(i%4)*220,y});}
    y+=rowHeight+65;
  }return {...model,nodes:model.nodes.map(n=>({...n,position:positions.get(n.id)}))};
}
export function persistMissingPositions(model:Model):Model {const placed=placedNodes(model);return {...model,nodes:model.nodes.map(n=>n.position?n:{...n,position:placed.find(p=>p.id===n.id)!.position})};}
