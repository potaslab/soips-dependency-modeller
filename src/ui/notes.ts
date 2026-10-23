import { el } from './dom';

// Render the Markdown subset used by the audit without interpreting imported HTML.
// Text always enters through text nodes; no model content is assigned to innerHTML.
function inline(parent:HTMLElement,text:string) {
  const tokens=/\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;
  let end=0;
  for(const match of text.matchAll(tokens)) {
    parent.append(document.createTextNode(text.slice(end,match.index)));
    parent.append(el(match[1]!==undefined?'strong':match[2]!==undefined?'em':'code',match[1]??match[2]??match[3]));
    end=match.index!+match[0].length;
  }
  parent.append(document.createTextNode(text.slice(end)));
}

export function renderNotes(text:string):HTMLDivElement {
  const content=el('div',undefined,'source-notes');
  let paragraph:HTMLParagraphElement|undefined,list:HTMLUListElement|undefined;
  for(const line of text.replace(/\r\n?/g,'\n').split('\n')) {
    if(!line.trim()){paragraph=undefined;list=undefined;continue;}
    const item=line.match(/^\s*[-*+]\s+(.+)$/),heading=line.match(/^#{1,6}\s+(.+)$/);
    if(item) {
      paragraph=undefined;
      if(!list){list=el('ul');content.append(list);}
      const li=el('li');inline(li,item[1]);list.append(li);
    }else if(heading) {
      paragraph=undefined;list=undefined;
      const h=el('h3');inline(h,heading[1]);content.append(h);
    }else {
      list=undefined;
      if(!paragraph){paragraph=el('p');content.append(paragraph);}else paragraph.append(el('br'));
      inline(paragraph,line);
    }
  }
  return content;
}
