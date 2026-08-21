"use strict";
const TAU=Math.PI*2, GOLD=137.50776405003785, BINS=64;
const HISTORY_KEY="design-formula-history-v1";
let HISTORY=[];

const PALETTES=[
  {name:"Sunset",  colors:["#2b1055","#7597de","#ff7e5f","#feb47b","#ffe98a"]},
  {name:"Ember",   colors:["#190a05","#7a1f0c","#e0470b","#ff9e2c","#ffe9b0"]},
  {name:"Ocean",   colors:["#020b1c","#0a3d62","#1e88a8","#5fd0c5","#dffcf2"]},
  {name:"Aurora",  colors:["#03001e","#7303c0","#ec38bc","#26d0ce","#aefcff"]},
  {name:"Forest",  colors:["#0b1d13","#1e5631","#4c9141","#a4c639","#f0f5b0"]},
  {name:"Mono",    colors:["#0a0a0a","#3a3a3a","#7a7a7a","#bcbcbc","#f5f5f5"]},
  {name:"Pastel",  colors:["#ffd6e0","#c1f0f6","#d7c0f7","#c6f6c1","#fff3c4"]},
  {name:"Neon",    colors:["#0d0221","#ff006e","#fb5607","#ffbe0b","#3a86ff"]},
  {name:"Sakura",  colors:["#3a0b2e","#8e2d56","#d6336c","#f783ac","#ffe3ec"]},
  {name:"Copper",  colors:["#1a120b","#5e3a1e","#a8602e","#d98a4f","#f3d9b1"]},
  {name:"Ice",     colors:["#0b1026","#23395d","#406e8e","#8ea8c3","#eaf6ff"]},
  {name:"Spectrum",colors:["#ff0000","#ffd400","#21d400","#00b3ff","#a200ff"]},
  {name:"Vapor",   colors:["#2d1b4e","#5d2f9e","#c44ec4","#36c5d8","#aef0d0"]},
  {name:"Citrus",  colors:["#14290a","#3d6b0e","#8ab800","#d4e600","#fbffd0"]},
  {name:"Berry",   colors:["#1a0316","#5e0b4b","#a4036f","#e84a8a","#ffc2d1"]},
  {name:"Royal",   colors:["#0a0a2e","#1d2b8a","#6c5ce7","#c9a227","#ffe9a8"]},
  {name:"Magma",   colors:["#050505","#3b0a0a","#9e1a0a","#f04e0f","#ffd166"]},
  {name:"Slate",   colors:["#0e1116","#2b333f","#5c6b7a","#9fb1c1","#e8eef3"]},
];
const BGS=["#000000","#0e1733","#3a3f4a","#cfd3da","#ffffff"];

function p(label,min,max,step,def,opt){return Object.assign({label,min,max,step,def},opt||{});}
const PATTERNS={
  lissajous:{name:"Lissajous",icon:"M4 13c4-9 8-9 12 0 M4 13c4 9 8 9 12 0",draw:"line",
    params:{a:p("Frequency a",1,12,1,3,{int:1}),b:p("Frequency b",1,12,1,2,{int:1}),delta:p("Phase delta",0,Math.PI,0.01,Math.PI/2,{deg:1}),harm:p("Wobble",0,0.6,0.01,0)},
    presets:{"Classic":{a:3,b:2,delta:Math.PI/2,harm:0},"Grid":{a:5,b:4,delta:Math.PI/2,harm:0},"Knot":{a:7,b:6,delta:1.1,harm:0.08},"Ribbon":{a:3,b:4,delta:0.6,harm:0.15}},
    gen(o,n){const pts=[];for(let i=0;i<n;i++){const t=i/n*TAU,w=1+o.harm*Math.sin(t*5);pts.push([Math.sin(o.a*t+o.delta)*w,Math.sin(o.b*t)*w]);}return pts;}},
  rose:{name:"Rose Curve",icon:"M10 2v16 M2 10h16 M4 4l12 12 M16 4L4 16",draw:"line",
    params:{k:p("Petal factor k",1,12,0.5,5),amp:p("Amplitude",0.3,1,0.01,1),loops:p("Loops",1,16,1,1,{int:1}),offset:p("Offset",0,0.6,0.01,0)},
    presets:{"5 Petals":{k:5,amp:1,loops:1,offset:0},"8 Petals":{k:4,amp:1,loops:1,offset:0},"Kaleidoscope":{k:3.5,amp:1,loops:4,offset:0},"Layered Bloom":{k:7,amp:1,loops:2,offset:0.12}},
    gen(o,n){const pts=[];for(let i=0;i<n;i++){const th=i/n*TAU*o.loops,r=(Math.cos(o.k*th)+o.offset)*o.amp;pts.push([r*Math.cos(th),r*Math.sin(th)]);}return pts;}},
  spiro:{name:"Spirograph",icon:"M10 2a8 8 0 100 16 8 8 0 100-16 M10 5a5 5 0 100 10 5 5 0 100-10",draw:"line",
    params:{R:p("Outer R",20,120,1,80,{int:1}),r:p("Inner r",5,90,1,33,{int:1}),d:p("Pen d",5,120,1,55,{int:1}),loops:p("Loops",1,60,1,24,{int:1})},
    presets:{"Flower Rope":{R:80,r:33,d:55,loops:33},"Nebula":{R:96,r:25,d:90,loops:25},"Gear":{R:60,r:44,d:30,loops:44},"Delicate":{R:110,r:7,d:60,loops:7}},
    gen(o,n){const pts=[],R=o.R,r=Math.max(1,o.r),d=o.d,df=R-r;for(let i=0;i<n;i++){const t=i/n*TAU*o.loops;pts.push([df*Math.cos(t)+d*Math.cos(df/r*t),df*Math.sin(t)-d*Math.sin(df/r*t)]);}return pts;}},
  phyllo:{name:"Phyllotaxis",icon:"M10 10m-1 0a1 1 0 102 0 1 1 0 10-2 0 M10 4v0 M14 7v0 M15 12v0 M11 16v0 M5 13v0 M5 7v0",draw:"dots",defaultSize:2.4,
    params:{angle:p("Divergence angle",100,180,0.01,GOLD),c:p("Spacing c",0.3,2,0.01,1),pow:p("Spread",0.35,0.7,0.01,0.5)},
    presets:{"Sunflower":{angle:GOLD,c:1,pow:0.5},"Spiral":{angle:137.3,c:1,pow:0.5},"Double Spiral":{angle:99.5,c:1.1,pow:0.5},"Radial":{angle:150,c:0.9,pow:0.55}},
    gen(o,n){const pts=[],a=o.angle*Math.PI/180;for(let i=0;i<n;i++){const r=o.c*Math.pow(i,o.pow),th=i*a;pts.push([r*Math.cos(th),r*Math.sin(th)]);}return pts;}},
  superf:{name:"Superformula",icon:"M10 2c5 0 8 4 8 8s-3 8-8 8-8-4-8-8 3-8 8-8z",draw:"line",
    params:{m:p("Symmetry m",0,20,1,6,{int:1}),n1:p("n1",0.2,8,0.05,1),n2:p("n2",0.2,8,0.05,1),n3:p("n3",0.2,8,0.05,1)},
    presets:{"Petal":{m:6,n1:1,n2:1,n3:1},"Spikes":{m:12,n1:0.3,n2:0.4,n3:0.4},"Snowflake":{m:6,n1:0.5,n2:0.5,n3:0.5},"Gear":{m:10,n1:3,n2:6,n3:6}},
    gen(o,n){const pts=[];for(let i=0;i<n;i++){const ph=i/n*TAU,t1=Math.pow(Math.abs(Math.cos(o.m*ph/4)),o.n2),t2=Math.pow(Math.abs(Math.sin(o.m*ph/4)),o.n3);let r=Math.pow(t1+t2,-1/o.n1);if(!isFinite(r))r=0;pts.push([r*Math.cos(ph),r*Math.sin(ph)]);}return pts;}},
  harmono:{name:"Harmonograph",icon:"M3 10c3-7 5-7 7 0s4 7 7 0",draw:"line",
    params:{f1:p("Frequency 1",1,8,0.01,2),f2:p("Frequency 2",1,8,0.01,3),f3:p("Frequency 3",1,8,0.01,3),f4:p("Frequency 4",1,8,0.01,2),damp:p("Damping",0,0.04,0.0005,0.004),phase:p("Phase",0,Math.PI,0.01,1)},
    presets:{"Classic":{f1:2,f2:3,f3:3,f4:2,damp:0.004,phase:1},"Near":{f1:2,f2:2.01,f3:3,f4:3.01,damp:0.002,phase:0.7},"Triangle":{f1:3,f2:1,f3:1,f4:3,damp:0.003,phase:1.57},"Echo":{f1:2,f2:5,f3:3,f4:4,damp:0.0012,phase:0.4}},
    gen(o,n){const pts=[];for(let i=0;i<n;i++){const t=i/n*120,e=Math.exp(-o.damp*t);pts.push([(Math.sin(o.f1*t+o.phase)+Math.sin(o.f2*t))*e,(Math.sin(o.f3*t+o.phase)+Math.sin(o.f4*t))*e]);}return pts;}},
  clifford:{name:"Clifford",icon:"M3 14c4-2 4-8 7-8s3 6 7 8 M3 6c4 2 11 2 14-2",draw:"dots",defaultSize:0.7,defaultDensity:10000,
    params:{a:p("a",-3,3,0.001,-1.4),b:p("b",-3,3,0.001,1.6),c:p("c",-3,3,0.001,1.0),d:p("d",-3,3,0.001,0.7)},
    presets:{"Spiral":{a:-1.4,b:1.6,c:1.0,d:0.7},"Cocoon":{a:1.7,b:1.7,c:0.6,d:1.2},"Wing":{a:-1.7,b:1.3,c:-0.1,d:-1.2},"Net":{a:1.5,b:-1.8,c:1.6,d:0.9}},
    gen(o,n){const pts=[];let x=0.1,y=0.1;for(let i=0;i<n;i++){const nx=Math.sin(o.a*y)+o.c*Math.cos(o.a*x),ny=Math.sin(o.b*x)+o.d*Math.cos(o.b*y);x=nx;y=ny;if(i>20)pts.push([x,y]);}return pts;}},
  dejong:{name:"de Jong",icon:"M4 10c2-6 10-6 12 0s-10 6-12 0",draw:"dots",defaultSize:0.7,defaultDensity:10000,
    params:{a:p("a",-3,3,0.001,1.641),b:p("b",-3,3,0.001,1.902),c:p("c",-3,3,0.001,0.316),d:p("d",-3,3,0.001,1.525)},
    presets:{"Butterfly":{a:1.641,b:1.902,c:0.316,d:1.525},"Cloud":{a:-2.0,b:-2.0,c:-1.2,d:2.0},"Fiber":{a:1.4,b:-2.3,c:2.4,d:-2.1},"Mist":{a:-2.7,b:-0.09,c:-0.86,d:-2.2}},
    gen(o,n){const pts=[];let x=0.1,y=0.1;for(let i=0;i<n;i++){const nx=Math.sin(o.a*y)-Math.cos(o.b*x),ny=Math.sin(o.c*x)-Math.cos(o.d*y);x=nx;y=ny;if(i>20)pts.push([x,y]);}return pts;}},
};

const S={pat:"lissajous",params:{},draw:"line",lineWidth:1.4,pointSize:2,opacity:1,
  density:4000,blend:false,palette:0,colorMode:"sequence",scale:0.82,rot:0,bg:"#0e1733",bgMode:"preset",bgCustom:"#1b2a4a",
  morph:true,morphSpeed:0.16,useCustom:false,customColors:["#2b1055","#7597de","#ff7e5f","#feb47b","#ffe98a"],
  smoothPath:false};
let LOCKS=new Set(["s:opacity","s:palette"]);

function isLocked(k){return LOCKS.has(k);}
function lockMarkup(on){return on
  ?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
  :`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;}
function makeLock(slot){
  const key=slot.dataset.lock;
  const btn=document.createElement("button");
  btn.type="button"; btn.className="lockbtn"+(isLocked(key)?" locked":"");
  btn.setAttribute("aria-label",isLocked(key)?"Locked from shuffle":"Allow shuffle to change this");
  btn.setAttribute("aria-pressed",String(isLocked(key)));
  btn.title=isLocked(key)?"Locked from shuffle":"Allow shuffle to change this";
  btn.innerHTML=lockMarkup(isLocked(key));
  btn.onclick=()=>{const on=!LOCKS.has(key);if(on)LOCKS.add(key);else LOCKS.delete(key);btn.classList.toggle("locked",on);btn.setAttribute("aria-pressed",String(on));btn.setAttribute("aria-label",on?"Locked from shuffle":"Allow shuffle to change this");btn.title=on?"Locked from shuffle":"Allow shuffle to change this";btn.innerHTML=lockMarkup(on);};
  slot.innerHTML=""; slot.appendChild(btn);
}
function fillLocks(root){root.querySelectorAll(".lockslot").forEach(makeLock);}

let cX=new Float32Array(0), cY=new Float32Array(0);
let tX=new Float32Array(0), tY=new Float32Array(0);
let curPal=[], tPal=[];
let curBg=[12,14,20], tBg=[12,14,20];
let booted=false, animating=false, raf=0;
let shareTimer=0;

let sxBuf=new Float32Array(0), syBuf=new Float32Array(0);
let tBuf=new Float32Array(0), tvalsDirty=true;
let bpBins=null;
let frameCacheDirty=true;
const fc=document.createElement("canvas"), fctx=fc.getContext("2d");

const cv=document.getElementById("view"), ctx=cv.getContext("2d");
let DPR=Math.min(window.devicePixelRatio||1,2), CW=0, CH=0;

function resize(){
  const st=cv.parentElement.getBoundingClientRect();
  CW=Math.floor(st.width); CH=Math.floor(st.height);
  cv.style.width=CW+"px"; cv.style.height=CH+"px";
  cv.width=Math.floor(CW*DPR); cv.height=Math.floor(CH*DPR);
  fc.width=cv.width; fc.height=cv.height;
  frameCacheDirty=true;
  paint();
}

function hex2rgb(h){h=h.replace("#","");return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function sampleRGB(pal,t){t=t<0?0:t>1?1:t;const s=(pal.length-1)*t,i=Math.floor(s),f=s-i,a=pal[i],b=pal[Math.min(i+1,pal.length-1)];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}
function resampleArr(src,M){const L=src.length,out=new Float32Array(M);if(L===0)return out;if(L===M){out.set(src);return out;}for(let i=0;i<M;i++){const pos=M>1?i/(M-1)*(L-1):0,j=Math.floor(pos),f=pos-j;out[i]=src[j]+(src[Math.min(j+1,L-1)]-src[j])*f;}return out;}
function paletteName(){return S.useCustom?"Custom":PALETTES[S.palette].name;}

function computeTVals(nx,ny,out){
  const N=nx.length; if(!out||out.length!==N)out=new Float32Array(N);
  if(S.colorMode==="sequence"){for(let i=0;i<N;i++)out[i]=N>1?i/(N-1):0;}
  else if(S.colorMode==="distance"){let mr=1e-9;for(let i=0;i<N;i++){const r=Math.hypot(nx[i],ny[i]);if(r>mr)mr=r;}for(let i=0;i<N;i++)out[i]=Math.hypot(nx[i],ny[i])/mr;}
  else if(S.colorMode==="velocity"){let mx=1e-9;const seg=new Float32Array(N);for(let i=1;i<N;i++){seg[i]=Math.hypot(nx[i]-nx[i-1],ny[i]-ny[i-1]);if(seg[i]>mx)mx=seg[i];}seg[0]=seg[1]||0;for(let i=0;i<N;i++)out[i]=seg[i]/mx;}
  else {for(let i=0;i<N;i++)out[i]=1;}
  return out;
}
function ensureTvals(nx,ny){ if(tvalsDirty){ tBuf=computeTVals(nx,ny,tBuf); tvalsDirty=false; } }

function setGeoTarget(){
  const def=PATTERNS[S.pat], raw=def.gen(S.params,S.density|0), M=raw.length;
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  for(let i=0;i<M;i++){const x=raw[i][0],y=raw[i][1];if(x<minx)minx=x;if(y<miny)miny=y;if(x>maxx)maxx=x;if(y>maxy)maxy=y;}
  const half=Math.max(maxx-minx,maxy-miny)/2||1, cxm=(minx+maxx)/2, cym=(miny+maxy)/2;
  const ntX=new Float32Array(M), ntY=new Float32Array(M);
  for(let i=0;i<M;i++){ntX[i]=(raw[i][0]-cxm)/half;ntY[i]=(raw[i][1]-cym)/half;}
  if(cX.length!==M){cX=resampleArr(cX,M);cY=resampleArr(cY,M);}
  tX=ntX; tY=ntY;
  tvalsDirty=true; frameCacheDirty=true;
}
function activeColors(){return S.useCustom?S.customColors:PALETTES[S.palette].colors;}
function setColorTarget(){tPal=activeColors().map(hex2rgb);if(curPal.length!==tPal.length)curPal=tPal.map(c=>c.slice());frameCacheDirty=true;}
function setBgTarget(){if(S.bg!=="transparent")tBg=hex2rgb(S.bg);frameCacheDirty=true;}
function snapAll(){cX=Float32Array.from(tX);cY=Float32Array.from(tY);curPal=tPal.map(c=>c.slice());curBg=tBg.slice();}
function commit(snap){if(snap||!S.morph){snapAll();render();return;}startAnim();}
function startAnim(){if(!animating){animating=true;raf=requestAnimationFrame(tick);}}
function tick(){
  const k=S.morphSpeed, N=cX.length; let moving=false;
  for(let i=0;i<N;i++){const dx=tX[i]-cX[i], dy=tY[i]-cY[i];if(dx*dx+dy*dy>1e-7)moving=true;cX[i]+=dx*k; cY[i]+=dy*k;}
  for(let pi=0;pi<curPal.length;pi++)for(let c=0;c<3;c++){const d=tPal[pi][c]-curPal[pi][c];if(Math.abs(d)>0.4)moving=true;curPal[pi][c]+=d*k;}
  for(let c=0;c<3;c++){const d=tBg[c]-curBg[c];if(Math.abs(d)>0.4)moving=true;curBg[c]+=d*k;}
  frameCacheDirty=true; tvalsDirty=true;
  render();
  if(moving){raf=requestAnimationFrame(tick);}else{snapAll();render();animating=false;}
}
function paint(){frameCacheDirty=true;if(!animating)render();}

function paintPattern(g,W,H,pal,sw){
  const N=cX.length; if(!N)return;
  const fit=Math.min(W,H)*0.46*S.scale, cx=W/2, cy=H/2;
  const rot=S.rot*Math.PI/180, cs=Math.cos(rot), sn=Math.sin(rot);
  if(sxBuf.length!==N){sxBuf=new Float32Array(N);syBuf=new Float32Array(N);tBuf=new Float32Array(N);}
  const sx=sxBuf, sy=syBuf;
  for(let i=0;i<N;i++){const dx=cX[i]*fit, dy=cY[i]*fit; sx[i]=cx+dx*cs-dy*sn; sy[i]=cy+dx*sn+dy*cs;}
  ensureTvals(cX,cY);
  const tvals=tBuf;
  const lw=S.lineWidth*sw, ps=S.pointSize*sw;
  g.globalAlpha=S.opacity;
  g.globalCompositeOperation=S.blend?"lighter":"source-over";
  g.lineCap="round"; g.lineJoin="round";
  if(S.colorMode==="solid"){
    const c=pal[pal.length-1], col=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
    if(S.draw==="line"){g.strokeStyle=col; g.lineWidth=lw;g.beginPath();g.moveTo(sx[0],sy[0]);for(let i=1;i<N;i++)g.lineTo(sx[i],sy[i]);g.stroke();}
    else{g.fillStyle=col;const r=ps, arc=r>1, path=new Path2D();for(let i=0;i<N;i++){if(arc){path.moveTo(sx[i]+r,sy[i]);path.arc(sx[i],sy[i],r,0,TAU);}else{const s=Math.max(1,r*1.6);path.rect(sx[i]-s/2,sy[i]-s/2,s,s);}}g.fill(path);}
  }else{
    if(!bpBins||bpBins.length!==BINS)bpBins=new Array(BINS);
    const bp=bpBins; for(let b=0;b<BINS;b++)bp[b]=new Path2D();
    if(S.draw==="line"){for(let i=1;i<N;i++){let b=(tvals[i]*BINS)|0;if(b<0)b=0;else if(b>=BINS)b=BINS-1;bp[b].moveTo(sx[i-1],sy[i-1]);bp[b].lineTo(sx[i],sy[i]);}g.lineWidth=lw;for(let b=0;b<BINS;b++){const c=sampleRGB(pal,(b+0.5)/BINS);g.strokeStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;g.stroke(bp[b]);}}
    else{const r=ps, arc=r>1, s=Math.max(1,r*1.6);for(let i=0;i<N;i++){let b=(tvals[i]*BINS)|0;if(b<0)b=0;else if(b>=BINS)b=BINS-1;const pth=bp[b];if(arc){pth.moveTo(sx[i]+r,sy[i]);pth.arc(sx[i],sy[i],r,0,TAU);}else{pth.rect(sx[i]-s/2,sy[i]-s/2,s,s);}}for(let b=0;b<BINS;b++){const c=sampleRGB(pal,(b+0.5)/BINS);g.fillStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;g.fill(bp[b]);}}
  }
  g.globalAlpha=1; g.globalCompositeOperation="source-over";
}
function render(){
  if(frameCacheDirty){
    fctx.setTransform(DPR,0,0,DPR,0,0);
    fctx.globalAlpha=1; fctx.globalCompositeOperation="source-over";
    if(S.bg==="transparent"){fctx.clearRect(0,0,CW,CH);const cell=12;for(let y=0;y<CH;y+=cell)for(let x=0;x<CW;x+=cell){fctx.fillStyle=(((x/cell|0)+(y/cell|0))&1)?"#2b2f38":"#343943";fctx.fillRect(x,y,cell,cell);}}
    else{fctx.fillStyle=`rgb(${curBg[0]|0},${curBg[1]|0},${curBg[2]|0})`;fctx.fillRect(0,0,CW,CH);}
    fctx.strokeStyle="rgba(160,170,190,0.05)";fctx.lineWidth=1;
    const mx=((CW/2)|0)+0.5, my=((CH/2)|0)+0.5;
    fctx.beginPath();fctx.moveTo(mx,0);fctx.lineTo(mx,CH);fctx.moveTo(0,my);fctx.lineTo(CW,my);fctx.stroke();
    paintPattern(fctx,CW,CH,curPal,1);
    frameCacheDirty=false;
  }
  ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over";
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.drawImage(fc,0,0);
  const N=cX.length;
  document.getElementById("readout").textContent=`${PATTERNS[S.pat].name} · ${N.toLocaleString()} pt · ${paletteName()}`;
}

function compactState(){
  return {v:1,p:S.pat,params:S.params,draw:S.draw,lw:S.lineWidth,ps:S.pointSize,op:S.opacity,d:S.density,blend:S.blend?1:0,palette:S.palette,cm:S.colorMode,scale:S.scale,rot:S.rot,bg:S.bg,bgm:S.bgMode,bgc:S.bgCustom,morph:S.morph?1:0,ms:S.morphSpeed,custom:S.useCustom?S.customColors:null,smooth:S.smoothPath?1:0,locks:[...LOCKS]};
}
function expandState(o){
  if(!o||!PATTERNS[o.p])return;
  S.pat=o.p;S.params=Object.assign({},o.params||{});S.draw=o.draw||S.draw;S.lineWidth=Number.isFinite(+o.lw)?+o.lw:S.lineWidth;S.pointSize=Number.isFinite(+o.ps)?+o.ps:S.pointSize;S.opacity=Number.isFinite(+o.op)?+o.op:S.opacity;S.density=Number.isFinite(+o.d)?+o.d:S.density;S.blend=!!o.blend;S.palette=Number.isFinite(+o.palette)?+o.palette:S.palette;S.colorMode=o.cm||S.colorMode;S.scale=Number.isFinite(+o.scale)?+o.scale:S.scale;S.rot=Number.isFinite(+o.rot)?+o.rot:S.rot;S.bg=o.bg||S.bg;S.bgMode=o.bgm||S.bgMode;S.bgCustom=o.bgc||S.bgCustom;S.morph=o.morph!==0;S.morphSpeed=Number.isFinite(+o.ms)?+o.ms:S.morphSpeed;S.useCustom=Array.isArray(o.custom);if(S.useCustom)S.customColors=o.custom.slice();S.smoothPath=!!o.smooth;LOCKS=new Set(Array.isArray(o.locks)?o.locks:["s:opacity","s:palette"]);
}
function encodeState(){const json=JSON.stringify(compactState());const bytes=new TextEncoder().encode(json);let bin="";bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function decodeState(token){token=token.replace(/-/g,"+").replace(/_/g,"/");while(token.length%4)token+="=";const bin=atob(token);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}
function loadStateFromURL(){
  try{
    const params=new URLSearchParams(location.hash.startsWith("#")?location.hash.slice(1):location.hash);
    const token=params.get("state");
    if(token){expandState(decodeState(token));return true;}
  }catch(e){}
  return false;
}
function updateURL(replace){
  try{
    const url=new URL(location.href);
    url.hash=`state=${encodeState()}`;
    history[replace?"replaceState":"pushState"]({state:url.hash},"",url);
  }catch(e){}
}
async function copyShareURL(){
  updateURL(false);
  const url=location.href;
  try{await navigator.clipboard.writeText(url);showShare("Share URL copied.");}
  catch(e){
    const ta=document.createElement("textarea");ta.value=url;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();
    try{document.execCommand("copy");showShare("Share URL copied.");}
    catch(err){showShare("Share URL is ready in the address bar.");}
    ta.remove();
  }
}
function showShare(msg){const el=document.getElementById("shareStatus");clearTimeout(shareTimer);el.textContent=msg;shareTimer=setTimeout(()=>{el.textContent="";},3200);}

function loadHistory(){try{HISTORY=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]").filter(e=>e&&e.state);HISTORY=HISTORY.slice(0,8);}catch(e){HISTORY=[];}}
function saveHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(HISTORY.slice(0,8)));}catch(e){}}
function saveHistoryEntry(){
  const entry={id:Date.now(),label:`${PATTERNS[S.pat].name} ${paletteName()}`,state:compactState(),thumb:""};
  try{entry.thumb=cv.toDataURL("image/png",0.72);}catch(e){}
  HISTORY=[entry,...HISTORY.filter(e=>e.id!==entry.id)].slice(0,8);saveHistory();buildHistory();
}
function buildHistory(){
  const el=document.getElementById("history");if(!el)return;el.innerHTML="";
  if(!HISTORY.length){el.innerHTML=`<div class="empty-state">No history yet. Shuffle, remix, or edit a preset to start collecting states.</div>`;return;}
  HISTORY.forEach(entry=>{
    const b=document.createElement("button");b.type="button";b.className="history-item";b.setAttribute("aria-label",`Restore ${entry.label}`);
    b.innerHTML=`<span class="history-thumb" style="background-image:url('${(entry.thumb||"").replace(/'/g,"%27")}')"></span><span class="history-label">${entry.label}</span>`;
    b.onclick=()=>restoreHistory(entry.id);
    el.appendChild(b);
  });
}
function restoreHistory(id){
  const entry=HISTORY.find(e=>e.id===id);if(!entry)return;
  expandState(entry.state);buildPicker();buildPresets();buildParams();buildPalettes();buildBgs();fillLocks(document.getElementById("secStyle"));fillLocks(document.getElementById("secColor"));syncStyle();setColorTarget();setBgTarget();commit(false);updateURL(true);
}
function clearHistory(){HISTORY=[];saveHistory();buildHistory();showShare("History cleared.");}

function loadPattern(key){
  S.pat=key;
  const def=PATTERNS[key];
  S.params={}; for(const k in def.params)S.params[k]=def.params[k].def;
  if(!isLocked("s:draw"))S.draw=def.draw;
  if(!isLocked("s:pointSize"))S.pointSize=def.defaultSize||2;
  if(!isLocked("s:density"))S.density=def.defaultDensity||(def.draw==="dots"?10000:4000);
  buildPicker();buildPresets();buildParams();syncStyle();
  setGeoTarget();setColorTarget();setBgTarget();
  if(!booted){snapAll();render();booted=true;}else{commit(false);}
  setTimeout(saveHistoryEntry,120);
}
function buildPicker(){
  const el=document.getElementById("picker");el.innerHTML="";
  for(const key in PATTERNS){const def=PATTERNS[key];
    const b=document.createElement("button");b.type="button";b.className="pat"+(key===S.pat?" on":"");b.setAttribute("aria-label",`Use ${def.name}`);b.setAttribute("aria-pressed",String(key===S.pat));b.title=def.name;
    b.innerHTML=`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${def.icon}"/></svg><span>${def.name}</span>`;
    b.onclick=()=>loadPattern(key);el.appendChild(b);}
}
function buildPresets(){
  const el=document.getElementById("presets");el.innerHTML="";const def=PATTERNS[S.pat];
  for(const name in def.presets){const vals=def.presets[name];
    const b=document.createElement("button");b.type="button";b.className="preset";b.textContent=name;b.setAttribute("aria-label",`Apply ${name} preset`);
    b.onclick=()=>{Object.assign(S.params,vals);buildParams();setGeoTarget();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(b);}
}
function buildParams(){
  const el=document.getElementById("params");el.innerHTML="";const def=PATTERNS[S.pat];
  for(const k in def.params){const pp=def.params[k];
    const id=`param-${S.pat}-${k}`, valId=`${id}-value`;
    const f=document.createElement("div");f.className="field";
    f.innerHTML=`<div class="field-top"><label for="${valId}">${pp.label}</label><span class="ft-right"><span class="lockslot" data-lock="p:${S.pat}:${k}"></span><input class="val" id="${valId}" type="text"></span></div><input type="range" id="${id}" min="${pp.min}" max="${pp.max}" step="${pp.step}">`;
    const range=f.querySelector('input[type=range]'),val=f.querySelector('.val');
    range.setAttribute("aria-label",pp.label);val.setAttribute("aria-label",`${pp.label} value`);
    const disp=v=>pp.deg?(v*180/Math.PI).toFixed(0)+"deg":(pp.int?(+v).toFixed(0):(+v).toFixed(pp.step<0.01?3:2));
    range.value=S.params[k];val.value=disp(S.params[k]);
    range.oninput=()=>{S.params[k]=parseFloat(range.value);val.value=disp(S.params[k]);setGeoTarget();commit(false);};
    val.onchange=()=>{let v=parseFloat(val.value.replace("deg",""));if(pp.deg)v=v*Math.PI/180;if(isNaN(v))v=pp.def;v=Math.max(pp.min,Math.min(pp.max,v));S.params[k]=v;range.value=v;val.value=disp(v);setGeoTarget();commit(false);setTimeout(saveHistoryEntry,120);};
    el.appendChild(f);}
  fillLocks(el);
}
function pencilSVG(){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;}
function buildPalettes(){
  const el=document.getElementById("palettes");el.innerHTML="";
  PALETTES.forEach((pp,i)=>{const on=!S.useCustom&&i===S.palette;const b=document.createElement("button");b.type="button";b.className="chip"+(on?" on":"");
    b.style.background=`linear-gradient(90deg,${pp.colors.join(",")})`;b.title=pp.name;b.setAttribute("aria-label",`Use ${pp.name} palette`);b.setAttribute("aria-pressed",String(on));b.innerHTML=`<span>${pp.name}</span>`;
    b.onclick=()=>{S.useCustom=false;S.palette=i;buildPalettes();setColorTarget();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(b);});
  const on=S.useCustom;const cb=document.createElement("button");cb.type="button";cb.className="chip chip-custom"+(on?" on":"");
  cb.title="Custom gradient";cb.setAttribute("aria-label","Use custom gradient");cb.setAttribute("aria-pressed",String(on));cb.style.background=`linear-gradient(90deg,${S.customColors.join(",")})`;cb.innerHTML=`<span class="chip-tag">${pencilSVG()}Custom</span>`;
  cb.onclick=()=>{S.useCustom=true;buildPalettes();setColorTarget();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(cb);
  buildCustomEditor();
}
function buildCustomEditor(){
  const ed=document.getElementById("customEditor");
  ed.classList.toggle("hidden",!S.useCustom);
  ed.innerHTML=""; if(!S.useCustom)return;
  const row=document.createElement("div");row.className="custom-row";
  S.customColors.forEach((c,i)=>{
    const wrap=document.createElement("div");wrap.className="cc";
    const inp=document.createElement("input");inp.type="color";inp.value=c;inp.setAttribute("aria-label",`Custom color ${i+1}`);
    inp.oninput=()=>{S.customColors[i]=inp.value;const cc=document.querySelector("#palettes .chip-custom");if(cc)cc.style.background=`linear-gradient(90deg,${S.customColors.join(",")})`;setColorTarget();commit(false);};
    wrap.appendChild(inp);
    if(S.customColors.length>2){const rm=document.createElement("button");rm.type="button";rm.className="cc-rm";rm.innerHTML="&times;";rm.title="Remove color";rm.setAttribute("aria-label",`Remove custom color ${i+1}`);rm.onclick=()=>{S.customColors.splice(i,1);buildPalettes();setColorTarget();commit(false);setTimeout(saveHistoryEntry,120);};wrap.appendChild(rm);}
    row.appendChild(wrap);
  });
  ed.appendChild(row);
  if(S.customColors.length<7){const add=document.createElement("button");add.type="button";add.className="btn cc-add";add.textContent="+ Add color";add.setAttribute("aria-label","Add custom color");add.onclick=()=>{S.customColors.push(S.customColors[S.customColors.length-1]||"#ffffff");buildPalettes();setColorTarget();commit(false);setTimeout(saveHistoryEntry,120);};ed.appendChild(add);}
}
function buildBgs(){
  const el=document.getElementById("bgs");el.innerHTML="";
  BGS.forEach(c=>{const on=S.bgMode==="preset"&&c===S.bg;const b=document.createElement("button");b.type="button";b.className="chip"+(on?" on":"");b.style.background=c;b.title=c;b.setAttribute("aria-label",`Use ${c} background`);b.setAttribute("aria-pressed",String(on));
    b.onclick=()=>{S.bgMode="preset";S.bg=c;buildBgs();setBgTarget();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(b);});
  const tr=document.createElement("button");const trOn=S.bgMode==="transparent";tr.type="button";tr.className="chip chip-transparent"+(trOn?" on":"");tr.title="Transparent background";tr.setAttribute("aria-label","Use transparent background");tr.setAttribute("aria-pressed",String(trOn));
  tr.innerHTML=`<span class="chip-tag">Transparent</span>`;
  tr.onclick=()=>{S.bgMode="transparent";S.bg="transparent";buildBgs();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(tr);
  const cu=document.createElement("button");const cuOn=S.bgMode==="custom";cu.type="button";cu.className="chip chip-bgcustom"+(cuOn?" on":"");cu.title="Custom background color";cu.setAttribute("aria-label","Use custom background color");cu.setAttribute("aria-pressed",String(cuOn));cu.style.background=S.bgCustom;
  cu.innerHTML=`<span class="chip-tag">${pencilSVG()}Custom</span>`;
  cu.onclick=()=>{S.bgMode="custom";S.bg=S.bgCustom;buildBgs();setBgTarget();commit(false);setTimeout(saveHistoryEntry,120);};el.appendChild(cu);
  buildBgEditor();
}
function buildBgEditor(){
  const ed=document.getElementById("bgEditor");
  ed.classList.toggle("hidden",S.bgMode!=="custom");
  ed.innerHTML=""; if(S.bgMode!=="custom")return;
  const row=document.createElement("div");row.className="custom-row";
  const wrap=document.createElement("div");wrap.className="cc";
  const inp=document.createElement("input");inp.type="color";inp.value=S.bgCustom;inp.setAttribute("aria-label","Custom background color");
  inp.oninput=()=>{S.bgCustom=inp.value;S.bg=inp.value;const cu=document.querySelector("#bgs .chip-bgcustom");if(cu)cu.style.background=S.bgCustom;setBgTarget();commit(false);};
  wrap.appendChild(inp);row.appendChild(wrap);ed.appendChild(row);
}
function num(id){return document.getElementById(id);}
function bindRange(rId,vId,key,fmt,label,after){
  const r=num(rId),v=num(vId);
  r.setAttribute("aria-label",label);v.setAttribute("aria-label",`${label} value`);
  r.oninput=()=>{S[key]=parseFloat(r.value);v.value=fmt(S[key]);(after||paint)();};
  v.onchange=()=>{let x=parseFloat(v.value);if(isNaN(x))x=S[key];x=Math.max(+r.min,Math.min(+r.max,x));S[key]=x;r.value=x;v.value=fmt(x);(after||paint)();setTimeout(saveHistoryEntry,120);};
}
function setToggle(id,on){const el=num(id);el.classList.toggle("on",on);el.setAttribute("aria-checked",String(on));}
function syncStyle(){
  num("rWidth").value=S.lineWidth;num("vWidth").value=S.lineWidth.toFixed(1);
  num("rSize").value=S.pointSize;num("vSize").value=S.pointSize.toFixed(1);
  num("rOpacity").value=S.opacity;num("vOpacity").value=S.opacity.toFixed(2);
  const dmax=S.draw==="dots"?10000:60000; num("rDensity").max=dmax; if(S.density>dmax)S.density=dmax;
  num("rDensity").value=S.density;num("vDensity").value=(S.density|0);
  num("rScale").value=S.scale;num("vScale").value=S.scale.toFixed(2);
  num("rRot").value=S.rot;num("vRot").value=S.rot.toFixed(0);
  num("rMorph").value=S.morphSpeed;num("vMorph").value=S.morphSpeed.toFixed(2);
  setToggle("tBlend",S.blend);setToggle("tMorph",S.morph);setToggle("tSmooth",S.smoothPath);
  num("fMorph").classList.toggle("hidden",!S.morph);
  document.querySelectorAll('#drawMode button').forEach(b=>{const on=b.dataset.v===S.draw;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
  document.querySelectorAll('#colorMode button').forEach(b=>{const on=b.dataset.v===S.colorMode;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
  num("fWidth").classList.toggle("hidden",S.draw!=="line");
  num("fSize").classList.toggle("hidden",S.draw!=="dots");
  document.querySelectorAll('.sec-head').forEach(h=>h.setAttribute("aria-expanded",String(!h.parentElement.classList.contains("collapsed"))));
}

const rnd=(a,b)=>a+Math.random()*(b-a);
function shuffle(){
  const def=PATTERNS[S.pat];
  for(const k in def.params){if(isLocked(`p:${S.pat}:${k}`))continue;const pp=def.params[k];let v=rnd(pp.min,pp.max);if(pp.int)v=Math.round(v);S.params[k]=v;}
  if(!isLocked("s:draw"))S.draw=Math.random()<0.5?"line":"dots";
  if(!isLocked("s:lineWidth"))S.lineWidth=+rnd(0.4,4).toFixed(1);
  if(!isLocked("s:pointSize"))S.pointSize=+rnd(0.5,4).toFixed(1);
  if(!isLocked("s:opacity"))S.opacity=+rnd(0.3,1).toFixed(2);
  if(!isLocked("s:density")){const dots=S.draw==="dots";S.density=Math.round(rnd(dots?4000:1000,dots?10000:12000)/100)*100;}
  if(!isLocked("s:palette")){S.useCustom=false;S.palette=Math.floor(Math.random()*PALETTES.length);}
  buildParams();buildPalettes();syncStyle();setColorTarget();setBgTarget();commit(false);setTimeout(saveHistoryEntry,120);
}
function shuffleColor(){S.useCustom=false;S.palette=Math.floor(Math.random()*PALETTES.length);const m=["sequence","distance","velocity"];S.colorMode=m[Math.floor(Math.random()*m.length)];buildPalettes();syncStyle();setColorTarget();commit(false);setTimeout(saveHistoryEntry,120);}
function fullRandom(){const keys=Object.keys(PATTERNS);loadPattern(keys[Math.floor(Math.random()*keys.length)]);shuffle();shuffleColor();}
function remixUnlocked(){
  const def=PATTERNS[S.pat];
  let changed=false;
  for(const k in def.params){if(isLocked(`p:${S.pat}:${k}`))continue;const pp=def.params[k];let v=rnd(pp.min,pp.max);if(pp.int)v=Math.round(v);S.params[k]=v;changed=true;}
  if(!isLocked("s:lineWidth")){S.lineWidth=+rnd(0.4,4).toFixed(1);changed=true;}
  if(!isLocked("s:pointSize")){S.pointSize=+rnd(0.5,4).toFixed(1);changed=true;}
  if(!isLocked("s:opacity")){S.opacity=+rnd(0.3,1).toFixed(2);changed=true;}
  if(!isLocked("s:density")){const dots=S.draw==="dots";S.density=Math.round(rnd(dots?4000:1000,dots?10000:12000)/100)*100;changed=true;}
  if(!isLocked("s:palette")){S.useCustom=false;S.palette=Math.floor(Math.random()*PALETTES.length);changed=true;}
  if(changed){buildParams();buildPalettes();syncStyle();setColorTarget();setBgTarget();commit(false);setTimeout(saveHistoryEntry,120);}
}

function circ(x,y,r){return `M${(x-r).toFixed(2)} ${y.toFixed(2)}a${r} ${r} 0 1 0 ${(2*r).toFixed(2)} 0a${r} ${r} 0 1 0 ${(-2*r).toFixed(2)} 0`;}
function simplifyRDP(px,py,eps){
  const N=px.length; if(N<=2){const a=[];for(let i=0;i<N;i++)a.push(i);return a;}
  const keep=new Uint8Array(N); keep[0]=1; keep[N-1]=1;
  const eps2=eps*eps, stack=[[0,N-1]];
  while(stack.length){
    const seg=stack.pop(), a=seg[0], b=seg[1]; if(b<=a+1)continue;
    const ax=px[a],ay=py[a],dx=px[b]-ax,dy=py[b]-ay,len2=dx*dx+dy*dy;
    let maxD=-1,maxI=-1;
    for(let i=a+1;i<b;i++){let d2;if(len2>0){const cr=dx*(py[i]-ay)-dy*(px[i]-ax);d2=cr*cr/len2;}else{const ex=px[i]-ax,ey=py[i]-ay;d2=ex*ex+ey*ey;}if(d2>maxD){maxD=d2;maxI=i;}}
    if(maxD>eps2){keep[maxI]=1;stack.push([a,maxI]);stack.push([maxI,b]);}
  }
  const idx=[];for(let i=0;i<N;i++)if(keep[i])idx.push(i);return idx;
}
function smoothPathD(pts){
  const n=pts.length, q=v=>v.toFixed(2);
  if(n===0)return"";
  if(n===1)return `M${q(pts[0][0])} ${q(pts[0][1])}`;
  if(n===2)return `M${q(pts[0][0])} ${q(pts[0][1])}L${q(pts[1][0])} ${q(pts[1][1])}`;
  const CORNER=Math.cos(75*Math.PI/180);
  const tx=new Array(n),ty=new Array(n);
  for(let i=0;i<n;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[Math.min(n-1,i+1)];
    let vx=(p2[0]-p0[0])/6,vy=(p2[1]-p0[1])/6;
    if(i>0&&i<n-1){const ax=p1[0]-p0[0],ay=p1[1]-p0[1],bx=p2[0]-p1[0],by=p2[1]-p1[1];const la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);if(la>1e-6&&lb>1e-6&&(ax*bx+ay*by)/(la*lb)<CORNER){vx=0;vy=0;}}
    tx[i]=vx;ty[i]=vy;
  }
  let d=`M${q(pts[0][0])} ${q(pts[0][1])}`;
  for(let i=0;i<n-1;i++){const p1=pts[i],p2=pts[i+1];d+=`C${q(p1[0]+tx[i])} ${q(p1[1]+ty[i])} ${q(p2[0]-tx[i+1])} ${q(p2[1]-ty[i+1])} ${q(p2[0])} ${q(p2[1])}`;}
  return d;
}
function exportSVG(){
  const def=PATTERNS[S.pat], raw=def.gen(S.params,S.density|0), M=raw.length;
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  for(let i=0;i<M;i++){const x=raw[i][0],y=raw[i][1];if(x<minx)minx=x;if(y<miny)miny=y;if(x>maxx)maxx=x;if(y>maxy)maxy=y;}
  const half=Math.max(maxx-minx,maxy-miny)/2||1,cxm=(minx+maxx)/2,cym=(miny+maxy)/2;
  const nx=new Float32Array(M),ny=new Float32Array(M);
  for(let i=0;i<M;i++){nx[i]=(raw[i][0]-cxm)/half;ny[i]=(raw[i][1]-cym)/half;}
  const tvals=computeTVals(nx,ny);
  const EW=1000,EH=1000,fit=Math.min(EW,EH)*0.46*S.scale,cx=EW/2,cy=EH/2,rot=S.rot*Math.PI/180,cs=Math.cos(rot),sn=Math.sin(rot);
  const px=new Float64Array(M),py=new Float64Array(M);
  for(let i=0;i<M;i++){const dx=nx[i]*fit,dy=ny[i]*fit;px[i]=cx+dx*cs-dy*sn;py[i]=cy+dx*sn+dy*cs;}
  const pal=activeColors().map(hex2rgb);
  const hx=c=>"#"+[c[0],c[1],c[2]].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
  const f2=v=>v.toFixed(2);
  let body="";
  if(S.smoothPath&&S.draw==="line"){const col=hx(pal[pal.length-1]);const idx=simplifyRDP(px,py,0.5), sp=idx.map(i=>[px[i],py[i]]);body=`<path d="${smoothPathD(sp)}" fill="none" stroke="${col}" stroke-width="${S.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;}
  else if(S.colorMode==="solid"){const col=hx(pal[pal.length-1]);if(S.draw==="line"){let pts="";for(let i=0;i<M;i++)pts+=f2(px[i])+","+f2(py[i])+" ";body=`<polyline points="${pts.trim()}" fill="none" stroke="${col}" stroke-width="${S.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;}else{const r=S.pointSize;let d="";for(let i=0;i<M;i++)d+=circ(px[i],py[i],r);body=`<path d="${d}" fill="${col}"/>`;}}
  else{const dBins=new Array(BINS).fill("");if(S.draw==="line"){for(let i=1;i<M;i++){let b=(tvals[i]*BINS)|0;if(b<0)b=0;else if(b>=BINS)b=BINS-1;dBins[b]+=`M${f2(px[i-1])} ${f2(py[i-1])}L${f2(px[i])} ${f2(py[i])}`;}for(let b=0;b<BINS;b++){if(!dBins[b])continue;const c=hx(sampleRGB(pal,(b+0.5)/BINS));body+=`<path d="${dBins[b]}" fill="none" stroke="${c}" stroke-width="${S.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;}}else{const r=S.pointSize;for(let i=0;i<M;i++){let b=(tvals[i]*BINS)|0;if(b<0)b=0;else if(b>=BINS)b=BINS-1;dBins[b]+=circ(px[i],py[i],r);}for(let b=0;b<BINS;b++){if(!dBins[b])continue;const c=hx(sampleRGB(pal,(b+0.5)/BINS));body+=`<path d="${dBins[b]}" fill="${c}"/>`;}}}
  const blend=S.blend?` style="mix-blend-mode:screen"`:"";
  const bgRect=S.bg==="transparent"?"":`<rect width="${EW}" height="${EH}" fill="${S.bg}"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${EW}" height="${EH}" viewBox="0 0 ${EW} ${EH}">${bgRect}<g${blend} opacity="${S.opacity}">${body}</g></svg>`;
  download(new Blob([svg],{type:"image/svg+xml"}),`formula-${S.pat}-${stamp()}.svg`);
}
function exportPNG(){
  const OUT=3000, off=document.createElement("canvas"); off.width=OUT; off.height=OUT;
  const g=off.getContext("2d");
  if(S.bg!=="transparent"){g.fillStyle=S.bg; g.fillRect(0,0,OUT,OUT);}
  const sw=OUT/Math.max(1,Math.min(CW,CH));
  paintPattern(g,OUT,OUT,activeColors().map(hex2rgb),sw);
  off.toBlob(b=>{const name=`formula-${S.pat}-${stamp()}.png`;if(window.matchMedia("(max-width:760px)").matches)showImageModal(URL.createObjectURL(b));else download(b,name);},"image/png");
}
function showImageModal(url){const m=document.getElementById("pngModal");document.getElementById("pngImg").src=url;m._url=url;requestAnimationFrame(()=>m.classList.add("open"));document.getElementById("pngClose").focus();}
function closeImageModal(){const m=document.getElementById("pngModal");m.classList.remove("open");if(m._url){const u=m._url;m._url=null;setTimeout(()=>URL.revokeObjectURL(u),500);}}
function stamp(){const d=new Date(),z=n=>String(n).padStart(2,"0");return`${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}

function init(){
  loadHistory();
  loadStateFromURL();
  buildPalettes();buildBgs();
  loadPattern(S.pat);
  fillLocks(document.getElementById("secStyle"));
  fillLocks(document.getElementById("secColor"));
  bindRange("rWidth","vWidth","lineWidth",v=>v.toFixed(1),"Line width");
  bindRange("rSize","vSize","pointSize",v=>v.toFixed(1),"Dot size");
  bindRange("rOpacity","vOpacity","opacity",v=>v.toFixed(2),"Opacity");
  bindRange("rScale","vScale","scale",v=>v.toFixed(2),"Scale");
  bindRange("rRot","vRot","rot",v=>v.toFixed(0),"Rotation");
  bindRange("rMorph","vMorph","morphSpeed",v=>v.toFixed(2),"Morph speed");
  bindRange("rDensity","vDensity","density",v=>(v|0),"Density",()=>{setGeoTarget();commit(false);setTimeout(saveHistoryEntry,120);});

  document.querySelectorAll('#drawMode button').forEach(b=>b.onclick=()=>{S.draw=b.dataset.v;const dmax=S.draw==="dots"?10000:60000;if(S.density>dmax)S.density=dmax;syncStyle();setGeoTarget();commit(false);setTimeout(saveHistoryEntry,120);});
  document.querySelectorAll('#colorMode button').forEach(b=>b.onclick=()=>{S.colorMode=b.dataset.v;tvalsDirty=true;syncStyle();paint();setTimeout(saveHistoryEntry,120);});
  document.getElementById("tBlend").onclick=()=>{S.blend=!S.blend;syncStyle();paint();setTimeout(saveHistoryEntry,120);};
  document.getElementById("tMorph").onclick=()=>{S.morph=!S.morph;syncStyle();if(!S.morph){frameCacheDirty=true;tvalsDirty=true;snapAll();render();}setTimeout(saveHistoryEntry,120);};
  document.getElementById("tSmooth").onclick=()=>{S.smoothPath=!S.smoothPath;syncStyle();showShare(S.smoothPath?"Smooth SVG export enabled.":"Smooth SVG export disabled.");};
  document.querySelectorAll('.toggle').forEach(t=>t.addEventListener('keydown',e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();t.click();}}));
  document.getElementById("bShuffle").onclick=shuffle;
  document.getElementById("bColor").onclick=shuffleColor;
  document.getElementById("bFull").onclick=fullRandom;
  document.getElementById("bCopyURL").onclick=copyShareURL;
  document.getElementById("bRemix").onclick=remixUnlocked;
  document.getElementById("bClearHistory").onclick=clearHistory;
  document.getElementById("bSVG").onclick=exportSVG;
  document.getElementById("pngClose").onclick=closeImageModal;
  document.getElementById("pngModal").onclick=e=>{if(e.target.id==="pngModal")closeImageModal();};
  document.getElementById("bPNG").onclick=exportPNG;
  document.getElementById("bReset").onclick=()=>loadPattern(S.pat);
  document.querySelectorAll('.sec-head').forEach(h=>h.onclick=()=>{h.parentElement.classList.toggle("collapsed");syncStyle();});
  window.addEventListener("keydown",e=>{if(e.key==="Escape")closeImageModal();});
  window.addEventListener("resize",resize);
  buildHistory();
  resize();
}
init();
