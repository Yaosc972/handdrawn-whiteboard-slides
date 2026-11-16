#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {parseArgs} from 'node:util';

const HELP = `Render installed claude-whiteboard Pictogram stickers as SVG.
Usage: node render-stickers.mjs [options]
  --source PATH    Skill directory or editor app.js
  --list           List available sticker names without writing files
  --icons NAMES    Comma-separated names (default: lightbulb,magnifier,puzzle,paper-plane)
  --output DIR     Output directory (default: work/whiteboard-stickers)
  --accent HEX     Main fill (default: #CD8292)
  --pale HEX       Pale fill (default: #F5E1E7)
  --ink HEX        Ink (default: #242424)
  --help           Show usage
Requires Node.js 22+. No bundled third-party artwork or network access.
`;

const {values} = parseArgs({options:{
  source:{type:'string'},list:{type:'boolean'},icons:{type:'string'},
  output:{type:'string'},accent:{type:'string'},pale:{type:'string'},ink:{type:'string'},
  help:{type:'boolean'},
}});

async function isFile(file) {
  try { return (await fs.stat(file)).isFile(); } catch (e) {
    if(e.code==='ENOENT'||e.code==='ENOTDIR')return false;
    throw e;
  }
}

async function sourceFile(explicit) {
  const suffix=path.join('scripts','editor','artifact-type','app.js');
  if(explicit) {
    const p=path.resolve(explicit);
    if(await isFile(p))return p;
    if(await isFile(path.join(p,suffix)))return path.join(p,suffix);
    throw new Error('Source does not contain the whiteboard editor app.js: '+p);
  }
  const codexRoots=[process.env.CODEX_HOME,path.join(os.homedir(),'.codex')].filter(Boolean);
  const candidates=[];
  for(const root of [...new Set(codexRoots)]) {
    const cache=path.join(root,'plugins','cache','baoyu-design','baoyu-whiteboard');
    let entries=[];
    try { entries=await fs.readdir(cache,{withFileTypes:true}); }
    catch(e) { if(e.code!=='ENOENT')throw e; }
    const versions=entries.filter(x=>x.isDirectory()).map(x=>x.name)
      .sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
    for(const version of versions)candidates.push(path.join(cache,version,'skills','claude-whiteboard',suffix));
    candidates.push(path.join(root,'skills','claude-whiteboard',suffix));
  }
  candidates.push(path.join(os.homedir(),'.agents','skills','claude-whiteboard',suffix));
  for(const file of candidates)if(await isFile(file))return file;
  throw new Error('Installed claude-whiteboard not found. Pass --source PATH or use original artwork.');
}

function readLibrary(bundle) {
  const marker=bundle.indexOf('"STICKER_PACK_ART_IDS"');
  if(marker<0)throw new Error('Unsupported editor: sticker data marker is missing.');
  const modulePattern=/function\s+([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/g;
  const matches=[...bundle.slice(0,marker).matchAll(modulePattern)];
  const module=matches.at(-1);
  if(!module)throw new Error('Unsupported editor: sticker data module not found.');
  modulePattern.lastIndex=marker;
  const next=modulePattern.exec(bundle);
  if(!next)throw new Error('Unsupported editor: sticker data module boundary not found.');
  const body=bundle.slice(module.index,next.index);
  if(!body.includes('"PICTOGRAM_PATHS"'))throw new Error('Unsupported editor: pictogram paths are missing.');
  const parameter=module[2].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const registrarMatch=body.match(new RegExp('([A-Za-z_$][\\w$]*)\\(\\s*'+parameter+'\\s*,\\s*"STICKER_PACK_ART_IDS"'));
  if(!registrarMatch)throw new Error('Unsupported editor: export registrar not found.');
  const registrar=registrarMatch[1];
  const context=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
  const program=`function ${registrar}(o,k,g,s){Object.defineProperty(o,k,{enumerable:true,configurable:true,get:g,...s?{set:s}:{}})};${body};globalThis.result={};${module[1]}(globalThis.result)();`;
  vm.runInContext(program,context,{timeout:1000});
  const result=JSON.parse(JSON.stringify(context.result.PICTOGRAM_PATHS));
  if(!result||Array.isArray(result)||typeof result!=='object')throw new Error('Invalid Pictogram data.');
  return result;
}

function xml(s) {
  return String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function pathElement(source,fill,stroke='none',width=0) {
  if(typeof source!=='string')throw new Error('Invalid sticker path.');
  const evenOdd=source.startsWith('~');
  const d=evenOdd?source.slice(1):source;
  return `<path d="${xml(d)}" fill-rule="${evenOdd?'evenodd':'nonzero'}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
}

function render(item,palette) {
  if(!item||typeof item.back!=='string'||!Array.isArray(item.fill)||!Array.isArray(item.line))throw new Error('Unsupported Pictogram shape schema.');
  const all=[item.back,...item.fill,...item.line].filter(Boolean);
  const rim=all.map(d=>pathElement(d,'#FFFFFF','#FFFFFF',22)).join('');
  const art=pathElement(item.back,palette.pale)+item.fill.map(d=>pathElement(d,palette.accent)).join('')+
    item.line.map(d=>pathElement(d,palette.ink,palette.ink,8)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="640" height="640"><g stroke-linecap="round" stroke-linejoin="round">${rim}${art}</g></svg>\n`;
}

async function main() {
  if(values.help){process.stdout.write(HELP);return;}
  const palette={accent:values.accent??'#CD8292',pale:values.pale??'#F5E1E7',ink:values.ink??'#242424'};
  for(const [key,color] of Object.entries(palette))if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Invalid '+key+' color. Use #RRGGBB.');
  const source=await sourceFile(values.source);
  const library=readLibrary(await fs.readFile(source,'utf8'));
  const names=Object.keys(library).filter(k=>k.startsWith('pictogram-')).map(k=>k.slice(10)).sort();
  if(values.list){process.stdout.write(JSON.stringify({source,icons:names},null,2)+'\n');return;}
  const chosen=[...new Set((values.icons??'lightbulb,magnifier,puzzle,paper-plane').split(',').map(x=>x.trim()).filter(Boolean))];
  if(!chosen.length)throw new Error('At least one icon is required.');
  const outputs=chosen.map(name=>{
    if(!names.includes(name))throw new Error('Unknown Pictogram: '+name+'. Run --list.');
    return {name,svg:render(library['pictogram-'+name],palette)};
  });
  const directory=path.resolve(values.output??'work/whiteboard-stickers');
  await fs.mkdir(directory,{recursive:true});
  for(const {name,svg} of outputs)await fs.writeFile(path.join(directory,name+'.svg'),svg);
  process.stdout.write(JSON.stringify({source,palette,files:outputs.map(x=>path.join(directory,x.name+'.svg'))},null,2)+'\n');
}

main().catch(error=>{process.stderr.write('render-stickers: '+error.message+'\n');process.exitCode=1;});
