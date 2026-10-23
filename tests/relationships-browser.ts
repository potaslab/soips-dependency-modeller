import {chromium,firefox,type Page} from 'playwright';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {small,rel} from './fixtures';import type {Model} from '../src/models/schema';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'test-results');await fs.mkdir(out,{recursive:true});
const model=small(['root','a','b','c','d','provider']);
model.relations=[rel('root','a','defining',{id:'hard',explanation:'Original evidence and decision',evidence:['Source 1']}),rel('root','b','supports',{id:'support'}),rel('root','b','oneOf',{id:'choice-b',groupId:'g'}),rel('root','c','oneOf',{id:'choice-c',groupId:'g'}),rel('provider','c','supports',{id:'supply'}),rel('root','c','requiredVia',{id:'via',via:'provider'}),rel('a','b','participation',{id:'participates',condition:{allOf:['root']},context:'a uses b information'}),rel('root','d','canBuildOn',{id:'illustrative',condition:{allOf:['root']}})];
const file=path.join(out,'relationship-editor-fixture.json');await fs.writeFile(file,JSON.stringify(model));
async function snapshot(page:Page,name:string):Promise<Model>{const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save JSON',exact:true}).click();const download=await pending,filename=path.join(out,name);await download.saveAs(filename);return JSON.parse(await fs.readFile(filename,'utf8'));}
const results=[];
for(const [name,type] of [['chromium',chromium],['firefox',firefox]] as const){
  const browser=await type.launch({headless:true}),context=await browser.newContext({offline:true,viewport:{width:1440,height:1100},acceptDownloads:true}),page=await context.newPage();
  let cancelNext=false;const alerts:string[]=[],errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{if(d.type()==='alert')alerts.push(d.message());if(cancelNext&&d.type()==='confirm'){cancelNext=false;await d.dismiss();}else await d.accept();});
  try{
    await page.goto(pathToFileURL(path.join(root,'dist/SOIPS-Dependency-Modeller.html')).href);
    const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Open JSON',exact:true}).click();await (await chooser).setFiles(file);await page.waitForFunction(()=>document.querySelectorAll('#graph [data-node]').length===6);
    await page.getByRole('button',{name:'Edit',exact:true}).click();await page.getByLabel('Analysis target',{exact:true}).selectOption('root');
    const panel=page.locator('.relationships'),row=(id:string)=>panel.locator(`[data-relation-id="${id}"]`),toggle=(id:string)=>row(id).getByRole('checkbox');
    assert.equal(await toggle('hard').isChecked(),true);
    cancelNext=true;await toggle('hard').click();assert.equal(await toggle('hard').isChecked(),true);
    await toggle('hard').click();assert.equal(await toggle('hard').isChecked(),false);assert.ok(!(await snapshot(page,`${name}-relationship-off.json`)).relations.some(r=>r.id==='hard'));
    await toggle('hard').click();assert.equal(await toggle('hard').isChecked(),true);assert.deepEqual((await snapshot(page,`${name}-relationship-restored.json`)).relations.find(r=>r.id==='hard'),model.relations.find(r=>r.id==='hard'));
    await toggle('choice-b').click();assert.equal(await toggle('choice-b').isChecked(),false);assert.equal(await toggle('support').isChecked(),true);await toggle('choice-b').click();
    await toggle('illustrative').click();await toggle('illustrative').click();assert.deepEqual((await snapshot(page,`${name}-relationship-context.json`)).relations.find(r=>r.id==='illustrative'),model.relations.find(r=>r.id==='illustrative'));
    await panel.getByLabel('Find relationship node',{exact:true}).fill('d');
    await panel.locator('[data-node-id="d"]:not([data-relation-id])').getByRole('checkbox').click();
    const added=(await snapshot(page,`${name}-relationship-added.json`)).relations.find(r=>r.from==='root'&&r.to==='d'&&r.kind==='defining');assert.ok(added);await toggle(added.id).click();
    await panel.getByRole('button',{name:'Used by',exact:true}).click();await panel.locator('[data-node-id="d"]:not([data-relation-id])').getByRole('checkbox').click();
    const reverse=(await snapshot(page,`${name}-relationship-used-by.json`)).relations.find(r=>r.from==='d'&&r.to==='root'&&r.kind==='defining');assert.ok(reverse);await toggle(reverse.id).click();assert.equal(await toggle(reverse.id).isChecked(),false);await toggle(reverse.id).click();assert.equal(await toggle(reverse.id).isChecked(),true);await toggle(reverse.id).click();
    await panel.getByRole('button',{name:'Depends on',exact:true}).click();await panel.getByLabel('Find relationship node',{exact:true}).fill('b');await panel.getByLabel('New link type',{exact:true}).selectOption('oneOf');await panel.getByLabel('New alternative group ID',{exact:true}).fill('independent-group');
    await panel.locator('[data-node-id="b"]:not([data-relation-id])').getByRole('checkbox').click();assert.ok((await snapshot(page,`${name}-relationship-groups.json`)).relations.some(r=>r.from==='root'&&r.to==='b'&&r.groupId==='independent-group'));assert.equal(await toggle('choice-b').isChecked(),true);
    await panel.getByLabel('Find relationship node',{exact:true}).fill('');await row('via').getByRole('button',{name:'Edit relation',exact:true}).click();assert.equal(await page.getByLabel('Provider node (requiredVia only)',{exact:true}).inputValue(),'provider');
    await page.getByLabel('Analysis target',{exact:true}).selectOption('provider');await toggle('supply').click();assert.match(alerts.pop()??'',/provider must have/);assert.equal(await toggle('supply').isChecked(),true);
    await page.getByLabel('Analysis target',{exact:true}).selectOption('root');await panel.getByLabel('New link type',{exact:true}).selectOption('participation');await panel.getByLabel('Find relationship node',{exact:true}).fill('d');await panel.locator('[data-node-id="d"]:not([data-relation-id])').getByRole('checkbox').click();assert.equal(await page.getByLabel('Source node (requires / uses contributor)',{exact:true}).inputValue(),'root');assert.equal(await page.getByLabel('Contributor node (type a name or ID)',{exact:true}).inputValue(),'d');assert.equal(await page.getByLabel('Relation type',{exact:true}).inputValue(),'participation');
    await panel.getByLabel('New link type',{exact:true}).selectOption('defining');await panel.getByLabel('Find relationship node',{exact:true}).fill('');await panel.screenshot({path:path.join(out,`${name}-relationship-checklist.png`)});
    assert.deepEqual(alerts,[]);assert.deepEqual(errors,[]);results.push({browser:name,status:'PASS',checks:'both directions, removal/cancel/restoration, identical evidence/context, independent pair records and groups, new links, provider validation, advanced form endpoints'});console.log(`${name}: PASS — relationship checklist`);
  }finally{await context.close();await browser.close();}
}
await fs.writeFile(path.join(out,'relationship-results.json'),JSON.stringify(results,null,2));
