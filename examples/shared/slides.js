const slides=[...document.querySelectorAll('.slide')];
const stage=document.querySelector('.stage');
const canvas=document.querySelector('.canvas');
const viewport=document.querySelector('.viewport');
const counter=document.querySelector('#counter');
const prev=document.querySelector('#prev');
const next=document.querySelector('#next');
let active=0;

if(new URLSearchParams(location.search).has('capture'))document.body.classList.add('capture');
function fit(){
  const rect=viewport.getBoundingClientRect();
  const scale=Math.min(rect.width/1280,rect.height/720);
  stage.style.width=`${1280*scale}px`;stage.style.height=`${720*scale}px`;
  canvas.style.transform=`scale(${scale})`;
}
function show(index,updateHash=true){
  active=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===active);slide.setAttribute('aria-hidden',String(i!==active));});
  counter.value=`${active+1} / ${slides.length}`;
  prev.disabled=active===0;next.disabled=active===slides.length-1;
  document.title=`${slides[active].dataset.title} · ${document.body.dataset.title}`;
  if(updateHash)history.replaceState(null,'',`#${active+1}`);
}
prev.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#fullscreen').addEventListener('click',async()=>{
  if(document.fullscreenElement)await document.exitFullscreen();
  else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
});
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if(['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();show(active+1);}
  if(['ArrowLeft','ArrowUp','PageUp'].includes(event.key)){event.preventDefault();show(active-1);}
  if(event.key==='Home'){event.preventDefault();show(0);}
  if(event.key==='End'){event.preventDefault();show(slides.length-1);}
});
window.addEventListener('hashchange',()=>show((Number(location.hash.slice(1))||1)-1,false));
new ResizeObserver(fit).observe(viewport);
show((Number(location.hash.slice(1))||1)-1,false);fit();
