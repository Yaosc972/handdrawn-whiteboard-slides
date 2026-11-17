import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=path.join(root,'scripts/render-stickers.mjs');
const run=(args,cwd)=>spawnSync(process.execPath,[script,...args],{cwd,encoding:'utf8'});

test('lists all bundled assets without external dependencies',()=>{
  const r=run(['--list']);assert.equal(r.status,0,r.stderr);
  const result=JSON.parse(r.stdout);assert.equal(result.license,'MIT');
  assert.equal(result.stickers.length,12);assert.equal(new Set(result.stickers.map(s=>s.id)).size,12);
});

test('exports from another working directory and recolors without changing geometry',async()=>{
  const cwd=await fs.mkdtemp(path.join(os.tmpdir(),'whiteboard-slides-'));
  try{
    const r=run(['--icons','magnifier,puzzle','--output','export','--accent','#123456','--pale','#ABCDEF'],cwd);
    assert.equal(r.status,0,r.stderr);
    const svg=await fs.readFile(path.join(cwd,'export/magnifier.svg'),'utf8');
    const source=await fs.readFile(path.join(root,'assets/stickers/magnifier.svg'),'utf8');
    assert.ok(svg.includes('#123456'));assert.ok(svg.includes('#ABCDEF'));assert.ok(svg.includes('#FFFFFF'));
    assert.deepEqual([...svg.matchAll(/d="([^"]+)"/g)].map(x=>x[1]),[...source.matchAll(/d="([^"]+)"/g)].map(x=>x[1]));
    assert.deepEqual((await fs.readdir(path.join(cwd,'export'))).sort(),['magnifier.svg','puzzle.svg']);
  }finally{await fs.rm(cwd,{recursive:true,force:true});}
});

test('rejects invalid selections before creating output',async()=>{
  const cwd=await fs.mkdtemp(path.join(os.tmpdir(),'whiteboard-slides-'));
  try{
    for(const args of [['--icons','lightbulb,missing'],['--icons','../../outside'],['--accent','pink']]){
      const r=run([...args,'--output','export'],cwd);assert.equal(r.status,1);assert.match(r.stderr,/Unknown sticker|Invalid accent/);
      await assert.rejects(fs.stat(path.join(cwd,'export')),{code:'ENOENT'});
    }
  }finally{await fs.rm(cwd,{recursive:true,force:true});}
});

test('exports the full set and protects original source assets',async()=>{
  const cwd=await fs.mkdtemp(path.join(os.tmpdir(),'whiteboard-slides-'));
  try{
    let r=run(['--icons','all','--output',cwd]);assert.equal(r.status,0,r.stderr);assert.equal((await fs.readdir(cwd)).length,12);
    r=run(['--icons','lightbulb','--output',path.join(root,'assets/stickers')]);assert.equal(r.status,1);assert.match(r.stderr,/outside the source/);
  }finally{await fs.rm(cwd,{recursive:true,force:true});}
});
