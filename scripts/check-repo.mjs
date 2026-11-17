#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];
async function walk(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  const result=[];
  for(const entry of entries){
    if(['.git','node_modules','work','outputs'].includes(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())result.push(...await walk(file));else result.push(file);
  }
  return result;
}
async function checkLink(file,url){
  const target=url.trim().split(/\s+"/)[0];
  if(!target||target.startsWith('#')||/^[a-z][a-z0-9+.-]*:/i.test(target))return;
  const clean=decodeURIComponent(target.split(/[?#]/)[0]);
  const absolute=path.resolve(path.dirname(file),clean);
  if(!(await fs.stat(absolute).catch(()=>null)))failures.push(`${path.relative(root,file)}: missing link ${target}`);
}
const files=await walk(root);
for(const file of files){
  if(file.endsWith('.md')){
    const text=await fs.readFile(file,'utf8');
    for(const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g))await checkLink(file,match[1]);
  }
  if(file.endsWith('.html')){
    const text=await fs.readFile(file,'utf8');
    for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g))await checkLink(file,match[1]);
  }
}
const manifest=JSON.parse(await fs.readFile(path.join(root,'assets/stickers/manifest.json'),'utf8'));
const ids=new Set();
for(const item of manifest.stickers){
  if(ids.has(item.id))failures.push(`Duplicate sticker ID: ${item.id}`);ids.add(item.id);
  if(!item.name_zh||!item.name_en)failures.push(`Missing bilingual label: ${item.id}`);
  const svg=await fs.readFile(path.join(root,'assets/stickers',item.file),'utf8');
  if(!svg.includes('viewBox="0 0 256 256"')||!svg.includes('<title'))failures.push(`Invalid sticker canvas/title: ${item.id}`);
  if(/<script|<image|https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg','')))failures.push(`Nonlocal sticker content: ${item.id}`);
}
for(const [name,count] of [['ai-workflow',5],['product-experiment',4],['team-retrospective',4]]){
  const html=await fs.readFile(path.join(root,'examples',name,'index.html'),'utf8');
  const actual=[...html.matchAll(/<article class="slide[\s"]/g)].length;
  if(actual!==count)failures.push(`${name}: expected ${count} slides, found ${actual}`);
  const pdf=await fs.readFile(path.join(root,'examples',name,'slides.pdf')).catch(()=>null);
  if(!pdf||pdf.subarray(0,5).toString()!=='%PDF-')failures.push(`Invalid example PDF: ${name}`);
}
for(const name of ['overview','stickers','ai-workflow','product-experiment','team-retrospective','ai-workflow-all','product-experiment-all','team-retrospective-all']){
  const file=path.join(root,'assets/previews',name+'.png');
  const bytes=await fs.readFile(file).catch(()=>null);
  if(!bytes||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))failures.push(`Invalid preview: ${name}`);
}
if(failures.length){process.stderr.write(failures.join('\n')+'\n');process.exitCode=1;}
else process.stdout.write(`Checked local links, ${ids.size} original stickers, 13 HTML slides, three PDFs and eight PNG previews.\n`);
