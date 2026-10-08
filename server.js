import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(root,'public'); const dataDir=path.join(root,'data'); const dbFile=path.join(dataDir,'data.json');
fs.mkdirSync(dataDir,{recursive:true}); if(!fs.existsSync(dbFile))fs.writeFileSync(dbFile,JSON.stringify({users:{},progress:{},notes:{},exams:{}},null,2));
const read=()=>JSON.parse(fs.readFileSync(dbFile,'utf8')); const write=x=>fs.writeFileSync(dbFile,JSON.stringify(x,null,2));
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj));};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2e6)req.destroy()});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch{reject(new Error('Invalid JSON'))}})});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff'};
async function api(req,res,url){
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end()}
 const db=read(); const parts=url.pathname.split('/').filter(Boolean);
 if(url.pathname==='/api/health')return json(res,200,{ok:true,service:'moxue',aiConfigured:!!process.env.AI_API_KEY});
 if(url.pathname==='/api/session'&&req.method==='POST'){const b=await body(req);const email=String(b.email||'').trim().toLowerCase();if(!email)return json(res,400,{error:'Email is required'});let u=Object.values(db.users).find(x=>x.email===email);if(!u){u={id:crypto.randomUUID(),email,name:String(b.name||'学习者'),created_at:new Date().toISOString()};db.users[u.id]=u;write(db)}return json(res,200,u)}
 if(parts[0]==='api'&&parts[1]==='state'&&req.method==='GET'){const u=db.users[parts[2]];if(!u)return json(res,404,{error:'User not found'});return json(res,200,{user:u,progress:db.progress[u.id]||{},notes:Object.values(db.notes).filter(x=>x.user_id===u.id),exams:Object.values(db.exams).filter(x=>x.user_id===u.id).slice(-20)})}
 if(parts[0]==='api'&&parts[1]==='progress'&&req.method==='PUT'){const b=await body(req);db.progress[parts[2]]??={};db.progress[parts[2]][b.key]=b.value;write(db);return json(res,200,{ok:true})}
 if(parts[0]==='api'&&parts[1]==='notes'&&req.method==='POST'){const b=await body(req);const id=b.id||crypto.randomUUID();db.notes[id]={id,user_id:parts[2],title:String(b.title||''),content:String(b.content||''),created_at:new Date().toISOString(),updated_at:new Date().toISOString()};write(db);return json(res,200,{id})}
 if(parts[0]==='api'&&parts[1]==='notes'&&parts.length===4&&req.method==='DELETE'){delete db.notes[parts[3]];write(db);return json(res,200,{ok:true})}
 if(parts[0]==='api'&&parts[1]==='exams'&&req.method==='POST'){const b=await body(req);const id=crypto.randomUUID();db.exams[id]={id,user_id:parts[2],level:b.level,score:b.score,payload:b.payload||{},created_at:new Date().toISOString()};write(db);return json(res,200,{id})}
 if(url.pathname==='/api/ai'&&req.method==='POST'){if(!process.env.AI_API_KEY)return json(res,503,{error:'AI is not configured. Set AI_API_KEY on the server.'});const b=await body(req);const r=await fetch(process.env.AI_API_URL||'https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.AI_API_KEY}`},body:JSON.stringify({model:process.env.AI_MODEL||'gpt-4o-mini',messages:b.messages||[],temperature:b.temperature??.3,response_format:b.response_format})});const t=await r.text();res.writeHead(r.status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});return res.end(t)}
 return json(res,404,{error:'Not found'});
}
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/'))return await api(req,res,u);let p=decodeURIComponent(u.pathname);if(p==='/'||p==='')p='/index.html';const fp=path.normalize(path.join(publicDir,p));if(!fp.startsWith(publicDir))return json(res,403,{error:'Forbidden'});if(!fs.existsSync(fp)||fs.statSync(fp).isDirectory())return fs.createReadStream(path.join(publicDir,'index.html')).pipe(res);res.writeHead(200,{'Content-Type':mime[path.extname(fp)]||'application/octet-stream','Cache-Control':p.includes('sw.js')?'no-cache':'public, max-age=3600'});fs.createReadStream(fp).pipe(res)}catch(e){json(res,500,{error:e.message})}});
server.listen(Number(process.env.PORT||8787),()=>console.log(`墨学 Mòxué → http://localhost:${process.env.PORT||8787}`));
