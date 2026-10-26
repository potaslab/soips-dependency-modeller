import type { Kind } from '../models/schema';

const buildColour='#1D9E75';
const styles:Record<Kind,{width:number;dash?:string;arrow?:boolean}>={
  defining:{width:1.4},
  oneOf:{width:2,dash:'1 4'},
  supports:{width:1.4,dash:'5 3'},
  requiredVia:{width:1.4},
  canBuildOn:{width:1.4,dash:'4 3',arrow:true},
  participation:{width:1.4},
};

// Graph edges and both legends use the established diagram encoding.
export function edgeAttributes(kind:Kind,highlighted=false,markerId='build-arrow'):string {
  const style=styles[kind],colour=kind==='canBuildOn'?buildColour:highlighted?'#7F77DD':'#99968F';
  return `fill="none" stroke="${colour}" stroke-width="${style.width}" stroke-linecap="round"${style.dash?` stroke-dasharray="${style.dash}"`:''}${style.arrow?` marker-end="url(#${markerId})"`:''}`;
}

export const buildArrowDefinition=(id='build-arrow')=>`<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="${buildColour}" stroke-width="1.5"/></marker>`;

export const legendStyleNote='Samples show highlighted connection styles; defining, provider and participation links share a solid style.';
export const legendEdge=(kind:Kind,x:number,y:number,markerId='build-arrow')=>`<path data-legend-edge="${kind}" d="M${x} ${y}h48" ${edgeAttributes(kind,true,markerId)} opacity=".95"/>`;

export function connectionSampleSVG(kind:Kind):string {
  const markerId=`legend-arrow-${kind}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="legend-sample" width="60" height="24" viewBox="0 0 60 24" aria-hidden="true" focusable="false"><defs>${kind==='canBuildOn'?buildArrowDefinition(markerId):''}</defs>${legendEdge(kind,4,12,markerId)}</svg>`;
}
