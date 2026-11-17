#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const assets=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/stickers');
const HELP=`Export the bundled original SVG stickers. No dependencies or network access.
Usage: node scripts/render-stickers.mjs [options]
  --list          List the bundled stickers
  --icons NAMES   Comma-separated names, or all
                  Default: lightbulb,magnifier,puzzle,paper-plane
  --output DIR    Output directory (default: work/whiteboard-stickers)
  --accent HEX    Main fill (default: #CD8292)
  --pale HEX      Pale fill (default: #F5E1E7)
  --ink HEX       Outline (default: #242424)
  --help          Show this help
Requires Node.js 22+. Source artwork: assets/stickers/*.svg, MIT license.
`;

async function main(){
  const {values}=parseArgs({options:{list:{type:'boolean'},icons:{type:'string'},output:{type:'string'},accent:{type:'string'},pale:{type:'string'},ink:{type:'string'},help:{type:'boolean'}}});
  if(values.help){process.stdout.write(HELP);return;}
  const manifest=JSON.parse(await fs.readFile(path.join(assets,'manifest.json'),'utf8'));
  if(values.list){process.stdout.write(JSON.stringify({license:manifest.license,stickers:manifest.stickers},null,2)+'\n');return;}
  const palette={accent:values.accent??manifest.palette.accent,pale:values.pale??manifest.palette.pale,ink:values.ink??manifest.palette.ink};
  for(const [key,color] of Object.entries(palette))if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error(`Invalid ${key} color. Use #RRGGBB.`);
  const byId=new Map(manifest.stickers.map(item=>[item.id,item]));
  const names=values.icons==='all'?[...byId.keys()]:[...new Set((values.icons??'lightbulb,magnifier,puzzle,paper-plane').split(',').map(s=>s.trim()).filter(Boolean))];
  if(!names.length)throw new Error('At least one sticker is required.');
  const selected=names.map(id=>{if(!byId.has(id))throw new Error(`Unknown sticker: ${id}. Run --list.`);return byId.get(id);});
  const replacements=new Map(Object.entries(palette).map(([key,color])=>[manifest.palette[key].toUpperCase(),color]));
  const output=path.resolve(values.output??'work/whiteboard-stickers');
  const files=await Promise.all(selected.map(async item=>{
    const original=await fs.readFile(path.join(assets,item.file),'utf8');
    return {name:item.file,svg:original.replace(/#[0-9a-f]{6}/gi,color=>replacements.get(color.toUpperCase())??color)};
  }));
  for(const file of files)if(path.resolve(assets,file.name)===path.resolve(output,file.name))throw new Error('Choose an output directory outside the source sticker folder.');
  await fs.mkdir(output,{recursive:true});
  for(const file of files)await fs.writeFile(path.join(output,file.name),file.svg);
  process.stdout.write(JSON.stringify({license:manifest.license,palette,files:files.map(file=>path.join(output,file.name))},null,2)+'\n');
}
main().catch(error=>{process.stderr.write(`render-stickers: ${error.message}\n`);process.exitCode=1;});
