export function el<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string):HTMLElementTagNameMap[K] {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
export function button(text:string,action:()=>void,className?:string){const b=el('button',text,className);b.type='button';b.onclick=action;return b;}
export function field(form:HTMLElement,label:string,value:string|number='',type='text',choices?:{value:string;label:string}[]) {
  const wrapper=el('label',undefined,'field'),caption=el('span',label);let input:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement;
  if(choices){input=el('select');for(const c of choices){const option=el('option',c.label);option.value=c.value;input.append(option);}}
  else if(type==='textarea'){input=el('textarea');input.rows=3;}else{input=el('input');input.type=type;}
  input.value=String(value);input.setAttribute('aria-label',label);wrapper.append(caption,input);form.append(wrapper);return input;
}
export function check(form:HTMLElement,label:string,value=false){const wrapper=el('label',undefined,'check'),input=el('input');input.type='checkbox';input.checked=value;wrapper.append(input,document.createTextNode(label));form.append(wrapper);return input;}
export function dialog(title:string,content:HTMLElement){const d=el('dialog'),close=button('Close',()=>d.close());d.append(el('h2',title),content,close);document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();return d;}
export const lines=(value:string)=>value.split('\n').map(s=>s.trim()).filter(Boolean);
