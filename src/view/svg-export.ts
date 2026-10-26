import { KINDS, type Kind, type Model } from '../models/schema';
import { active } from '../analysis/dependencies';
import { placedNodes, wrap } from './layout';
import { edgeAttributes, buildArrowDefinition, legendEdge, legendStyleNote } from './edge-style';
export const escapeXML=(value:unknown)=>String(value??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!)).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'');
export const kindLabels:Record<Kind,string>={defining:'Defining',oneOf:'At least one of each group',supports:'Optional support',requiredVia:'Required through provider',canBuildOn:'Can build on · illustrative',participation:'Contextual participation'};
export interface ViewOptions {highlight?:Set<string>;selected?:string;visibleKinds?:Kind[];includeCredit?:boolean;caption?:string;interactive?:boolean}
export function svgDiagram(model:Model,options:ViewOptions={}):string {
  const esc=escapeXML,nodes=placedNodes(model),map=new Map(nodes.map(n=>[n.id,n]));
  const bands=model.categories.filter(c=>c.band).flatMap(c=>{const members=nodes.filter(n=>n.categoryId===c.id);if(!members.length)return [];
    const left=Math.min(...members.map(n=>n.position.x-n.width/2)),x=left<8?left-(c.labelSpace??24):Math.max(8,left-(c.labelSpace??24));
    const y=Math.min(...members.map(n=>n.position.y))-14,right=Math.max(...members.map(n=>n.position.x+n.width/2))+8,bottom=Math.max(...members.map(n=>n.position.y+n.height))+14;
    return [{c,x,y,right,bottom}];});
  const shiftX=-Math.min(0,...nodes.map(n=>n.position.x-n.width/2-4),...bands.map(b=>b.x-4));
  const shiftY=-Math.min(0,...bands.map(b=>b.y-4));
  const width=Math.max(680,...nodes.map(n=>n.position.x+n.width/2+24),...bands.map(b=>b.right+12))+shiftX,graphHeight=Math.max(544,...nodes.map(n=>n.position.y+n.height+24),...bands.map(b=>b.bottom+12))+shiftY;
  const heading=options.interactive?0:94,titleLines=wrap(model.metadata.title,width-48,20),titleHeight=titleLines.length*24;
  const top=options.interactive?0:Math.max(heading,titleHeight+62),highlight=options.highlight;
  const kinds=options.visibleKinds??model.view.visibleRelations??[...KINDS];
  const isIn=(id:string)=>!highlight||highlight.has(id);
  const textLines=(lines:string[],x:number,y:number,size:number,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#302E3C">${lines.map((line,i)=>`<tspan x="${x}" dy="${i?size+2:0}">${esc(line)}</tspan>`).join('')}</text>`;
  const out:string[]=[];
  for(const {c,x,y,right,bottom} of bands) {
    out.push(`<g data-category="${esc(c.id)}"><rect x="${x}" y="${y}" width="${right-x}" height="${bottom-y}" rx="14" fill="${c.colour}" fill-opacity=".07" stroke="${c.colour}" stroke-opacity=".5"/>${textLines(wrap(c.label,Math.max(60,(c.labelSpace??100)-10)),x+10,y+26,12,'start')}</g>`);
  }
  for(const r of model.relations) {
    if(!kinds.includes(r.kind))continue;
    const contextActive=active(r,highlight??new Set(nodes.map(n=>n.id)));
    if(r.condition&&!contextActive)continue;
    let a=map.get(r.kind==='requiredVia'?r.via!:r.from),b=map.get(r.to);if(!a||!b)continue;
    const hi=isIn(r.from)&&isIn(r.to)&&(r.kind!=='requiredVia'||isIn(r.via!));
    const opacity=highlight?(hi?.95:.08):.5;
    let d:string;
    if(r.kind==='canBuildOn') {
      // The illustrative arrow runs from potential contributor to the form it can build.
      [a,b]=[b,a];const x1=a.position.x+a.width/2,x2=b.position.x-b.width/2,y1=a.position.y+a.height/2,y2=b.position.y+b.height/2;
      d=r.condition?`M${x1-14} ${a.position.y} C${x1} ${a.position.y-30} ${x2} ${b.position.y-30} ${x2+14} ${b.position.y}`:`M${x1} ${y1} C${(x1+x2)/2} ${y1} ${(x1+x2)/2} ${y2} ${x2} ${y2}`;
    }else {const y1=a.position.y+a.height,y2=b.position.y,m=(y1+y2)/2;d=`M${a.position.x} ${y1} C${a.position.x} ${m} ${b.position.x} ${m} ${b.position.x} ${y2}`;}
    out.push(`<path data-edge="${esc(r.id)}" d="${d}" ${edgeAttributes(r.kind,!!(hi&&highlight))} opacity="${opacity}"><title>${esc(`${map.get(r.from)?.label} → ${map.get(r.to)?.label}: ${kindLabels[r.kind]}${r.groupId?' ('+r.groupId+')':''}${r.via?' via '+map.get(r.via)?.label:''}. ${r.context??''} ${r.explanation}`)}</title></path>`);
  }
  for(const n of nodes){const c=model.categories.find(c=>c.id===n.categoryId)!,x=n.position.x-n.width/2,y=n.position.y;
    out.push(`<g data-node="${esc(n.id)}"${options.interactive?` tabindex="0" role="button" aria-label="${esc(n.label)}" style="cursor:pointer"`:''} opacity="${isIn(n.id)?1:.28}"><title>${esc(n.label+' — '+n.description)}</title><rect x="${x}" y="${y}" width="${n.width}" height="${n.height}" rx="8" fill="${c.fill??c.colour}" fill-opacity="${c.fill?1:.14}" stroke="${c.colour}" stroke-width="${n.id===options.selected?2.5:highlight&&isIn(n.id)?1.5:.7}"/>${textLines(n.lines,n.position.x,y+(n.height-(n.lines.length-1)*14)/2+4,12)}</g>`);
  }
  const legend:string[]=[];let legendY=graphHeight+25;
  if(!options.interactive){
    for(const c of [...model.categories].sort((a,b)=>a.order-b.order)){const lines=wrap(c.label,width-80);legend.push(`<rect x="24" y="${legendY-10}" width="10" height="10" rx="2" fill="${c.colour}"/>${textLines(lines,45,legendY,12,'start')}`);legendY+=lines.length*14+8;}
    for(const k of kinds){const lines=wrap(kindLabels[k],width-114);legend.push(`${legendEdge(k,24,legendY-4)}${textLines(lines,90,legendY,12,'start')}`);legendY+=Math.max(24,lines.length*14+8);}
    const noteLines=wrap(legendStyleNote,width-48,11);legend.push(textLines(noteLines,24,legendY+4,11,'start'));legendY+=noteLines.length*13+12;
    const credits=options.includeCredit??model.view.includeCredit??true;
    const foot=['Structural configurations within an interpretive model; not empirical proof.',...(credits?[model.metadata.citation||`${model.metadata.authors.join(', ')} ${model.metadata.year??''}`, 'SOIPS Dependency Modeller · developed from SOIPS · J. R. Potas (2026)']:[])];
    for(const line of foot){const lines=wrap(line,width-48,11);legend.push(textLines(lines,24,legendY+8,11,'start'));legendY+=lines.length*13+10;}
  }
  const height=top+(options.interactive?graphHeight:legendY+15);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Segoe UI, Arial, sans-serif"${options.interactive?' role="group" aria-label="Dependency graph"':''}><rect width="100%" height="100%" fill="#FCFCFB"/><defs>${buildArrowDefinition()}</defs>${options.interactive?'':textLines(titleLines,24,30,20,'start')+textLines(wrap(`Version ${model.metadata.version} · ${options.caption??'Dependency diagram'}`,width-48),24,titleHeight+32,12,'start')}<g transform="translate(0 ${top})"><g transform="translate(${shiftX} ${shiftY})">${out.join('')}</g><g data-export-legend="true">${legend.join('')}</g></g></svg>`;
}
export const exportSVG=(model:Model,options:ViewOptions={})=>'<?xml version="1.0" encoding="UTF-8"?>\n'+svgDiagram(model,{...options,interactive:false});
