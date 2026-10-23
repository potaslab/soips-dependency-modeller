import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const build=spawnSync(process.execPath,[path.join(root,'scripts/build.mjs')],{stdio:'inherit'});if(build.status)process.exit(build.status);
const port=Number(process.env.PORT??4173);
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(!['/','/index.html','/SOIPS-Dependency-Modeller.html'].includes(url.pathname)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(root,'dist/index.html')).pipe(res);}).listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${port} — rebuild after source edits.`));
