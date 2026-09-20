(() => {
"use strict";

const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);

const store={
  get(k,d){try{return localStorage.getItem(k)??d}catch{return d}},
  set(k,v){try{localStorage.setItem(k,String(v))}catch{}}
};

const game={
  state:"menu", difficulty:store.get("psDifficulty","medium"),
  shots:0, goals:0, score:0, streak:0, totalGoals:Number(store.get("psGoals",0)),
  best:Number(store.get("psBest",0)), coins:Number(store.get("psCoins",250)),
  aimX:0, aimY:.5, power:.25, charging:false, chargeDir:1,
  curve:0, ball:null, keeperX:0, keeperTarget:0, resultTimer:0,
  drag:false, dpr:1, w:0, h:0, last:0, raf:0
};

const DIFF={
 easy:{save:.13,speed:2.8},
 medium:{save:.27,speed:3.8},
 hard:{save:.43,speed:5.2}
};

function resize(){
  game.dpr=Math.min(devicePixelRatio||1,2);
  game.w=innerWidth; game.h=innerHeight;
  canvas.width=Math.max(1,Math.floor(game.w*game.dpr));
  canvas.height=Math.max(1,Math.floor(game.h*game.dpr));
  canvas.style.width=game.w+"px"; canvas.style.height=game.h+"px";
  ctx.setTransform(game.dpr,0,0,game.dpr,0,0);
}
addEventListener("resize",resize);
resize();

function goal(){
  const mobile=game.w<700;
  const w=Math.min(game.w*(mobile?.86:.62),650);
  const h=Math.min(game.h*(mobile?.30:.34),245);
  return {x:(game.w-w)/2,y:mobile?Math.max(112,game.h*.17):game.h*.18,w,h};
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function setText(id,v){const e=$(id);if(e)e.textContent=v}
function message(t,type=""){const e=$("message");if(e){e.textContent=t;e.className="message "+type}}
function updateHud(){
  setText("coins",game.coins); setText("level",Math.floor(game.totalGoals/5)+1);
  setText("score",game.score); setText("shots",game.shots);
  setText("goals",game.goals); setText("best",game.best);
  const p=$("powerFill");if(p)p.style.width=(game.power*100)+"%";
}
function setDifficulty(d){
  if(!DIFF[d])return;
  game.difficulty=d;store.set("psDifficulty",d);
  document.querySelectorAll("[data-diff]").forEach(b=>b.classList.toggle("active",b.dataset.diff===d));
  message(d.toUpperCase()+" KEEPER","info");
}
function showScreen(id){
  ["menu","gameUI","result","stats","settings"].forEach(x=>$(x)?.classList.add("hidden"));
  $(id)?.classList.remove("hidden");
}
function start(){
  game.state="aim";game.shots=0;game.goals=0;game.score=0;game.streak=0;
  game.aimX=0;game.aimY=.5;game.power=.25;game.chargeDir=1;game.charging=false;
  game.curve=0;game.ball=null;game.keeperX=0;game.keeperTarget=0;
  showScreen("gameUI");updateHud();message("DRAG TO AIM • HOLD SHOOT","info");
}
function menu(){
  game.state="menu";game.charging=false;game.drag=false;game.ball=null;
  showScreen("menu");updateHud();message("READY TO PLAY","info");
}
function aim(x,y){
  if(game.state!=="aim")return;
  const g=goal(),r=canvas.getBoundingClientRect();
  const px=x-r.left,py=y-r.top;
  game.aimX=clamp((px-(g.x+g.w/2))/(g.w*.5),-1,1);
  game.aimY=clamp((py-g.y)/g.h,.03,.97);
}
function chargeStart(e){
  if(e)e.preventDefault();
  if(game.state==="aim"){game.charging=true;message("RELEASE TO SHOOT","info")}
}
function chargeEnd(e){
  if(e)e.preventDefault();
  if(!game.charging)return;
  game.charging=false;
  if(game.state==="aim")shoot();
}
function shoot(){
  if(game.state!=="aim")return;
  const g=goal(),d=DIFF[game.difficulty];
  const p=clamp(game.power,.1,1);
  const spread=(1-p)*.07+.008;
  const tx=game.aimX+(Math.random()-.5)*spread;
  const ty=game.aimY+(Math.random()-.5)*spread*.65;
  const corner=Math.min(1,Math.abs(tx)*.65+Math.abs(ty-.5));
  const save=clamp(d.save+game.shots*.018-corner*.12,.05,.82);
  const saved=Math.random()<save;
  game.shots++;
  game.keeperTarget=clamp(tx+(Math.random()-.5)*.28,-1,1);
  game.ball={t:0,dur:.72-(p*.16),tx,ty,saved,curve:game.curve,p};
  game.state="flight";message("SHOT!","info");updateHud();
}
function finishShot(){
  const b=game.ball;if(!b)return;
  game.ball=null;
  const scored=!b.saved;
  if(scored){
    game.goals++;game.streak++;
    const points=100+game.streak*25;
    const reward=25+game.streak*5;
    game.score+=points;game.coins+=reward;game.totalGoals++;
    game.best=Math.max(game.best,game.score);
    store.set("psCoins",game.coins);store.set("psGoals",game.totalGoals);store.set("psBest",game.best);
    message("GOAL! +"+points+"  •  +"+reward+" COINS","good");
  }else{
    game.streak=0;message("SAVED!","bad");
  }
  updateHud();
  game.state="result";
  $("resultTitle").textContent=scored?"GOAL!":"SAVED!";
  $("resultText").textContent="Round: "+game.goals+" goals from "+game.shots+" shots";
  showScreen("result");
}
function nextShot(){
  if(game.state!=="result")return;
  if(game.shots>=5){
    $("resultTitle").textContent=game.goals>=3?"SHOOTOUT WON":"SHOOTOUT OVER";
    $("resultText").textContent=game.goals+" / 5 goals • "+game.score+" points";
    $("nextBtn").textContent="PLAY AGAIN";
    game.state="roundover";
    return;
  }
  $("nextBtn").textContent="NEXT SHOT";
  game.state="aim";game.aimX=0;game.aimY=.5;game.power=.25;game.curve=0;game.keeperX=0;
  showScreen("gameUI");message("AIM YOUR NEXT SHOT","info");updateHud();
}
function reset(){
  ["psCoins","psGoals","psBest","psDifficulty"].forEach(k=>{try{localStorage.removeItem(k)}catch{}});
  location.reload();
}
function share(){
  const url=location.href;
  if(navigator.share)navigator.share({title:"Penalty Shooter",text:"Try my Penalty Shooter game!",url}).catch(()=>{});
  else navigator.clipboard?.writeText(url).then(()=>message("LINK COPIED","good"));
}

$("playBtn").onclick=start;
$("menuBtn").onclick=menu;
$("nextBtn").onclick=()=>{if(game.state==="roundover"){start()}else nextShot()};
$("restartBtn").onclick=start;
$("statsBtn").onclick=()=>{showScreen("stats");updateHud()};
$("settingsBtn").onclick=()=>showScreen("settings");
$("closeStats").onclick=menu;$("closeSettings").onclick=menu;
$("resetBtn").onclick=reset;$("shareBtn").onclick=share;
document.querySelectorAll("[data-diff]").forEach(b=>b.onclick=()=>setDifficulty(b.dataset.diff));
$("curveLeft").onclick=()=>{game.curve=clamp(game.curve-.18,-1,1);message("CURVE "+Math.round(game.curve*100)+"%","info")};
$("curveRight").onclick=()=>{game.curve=clamp(game.curve+.18,-1,1);message("CURVE +"+Math.round(game.curve*100)+"%","info")};

const shootBtn=$("shootBtn");
shootBtn.addEventListener("pointerdown",chargeStart);
shootBtn.addEventListener("pointerup",chargeEnd);
shootBtn.addEventListener("pointercancel",chargeEnd);
shootBtn.addEventListener("lostpointercapture",()=>{if(game.charging)chargeEnd()});
addEventListener("keydown",e=>{
  if(e.code==="Space"){e.preventDefault();if(!e.repeat)chargeStart(e)}
  if(game.state==="aim"){
    if(e.key==="ArrowLeft")game.aimX=clamp(game.aimX-.06,-1,1);
    if(e.key==="ArrowRight")game.aimX=clamp(game.aimX+.06,-1,1);
    if(e.key==="ArrowUp")game.aimY=clamp(game.aimY-.06,.03,.97);
    if(e.key==="ArrowDown")game.aimY=clamp(game.aimY+.06,.03,.97);
  }
});
addEventListener("keyup",e=>{if(e.code==="Space")chargeEnd(e)});
addEventListener("blur",()=>{game.charging=false;game.drag=false});

canvas.addEventListener("pointerdown",e=>{if(game.state==="aim"){game.drag=true;canvas.setPointerCapture?.(e.pointerId);aim(e.clientX,e.clientY)}});
canvas.addEventListener("pointermove",e=>{if(game.drag)aim(e.clientX,e.clientY)});
canvas.addEventListener("pointerup",()=>game.drag=false);
canvas.addEventListener("pointercancel",()=>game.drag=false);

function rounded(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function player(x,y,s,color,keeper=false,lean=0){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(lean);
  ctx.fillStyle="#071019";ctx.beginPath();ctx.ellipse(0,36,25,7,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#101820";ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-7,10);ctx.lineTo(-10,31);ctx.moveTo(7,10);ctx.lineTo(10,31);ctx.stroke();
  ctx.fillStyle=color;rounded(-19,-12,38,34,8);ctx.fill();
  ctx.fillStyle="#111b24";rounded(-18,16,36,16,4);ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-15,-4);ctx.lineTo(-28,12);ctx.moveTo(15,-4);ctx.lineTo(28,12);ctx.stroke();
  ctx.fillStyle="#b87856";ctx.beginPath();ctx.arc(0,-29,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#20160f";ctx.beginPath();ctx.arc(0,-34,14,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle="#fff";ctx.font="bold 8px Arial";ctx.textAlign="center";ctx.fillText(keeper?"GK":"9",0,7);
  ctx.restore();
}
function ball(x,y,r){
  ctx.save();ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(x,y+r*.7,r*.8,r*.25,0,0,Math.PI*2);ctx.fill();
  const g=ctx.createRadialGradient(x-r*.3,y-r*.4,1,x,y,r);g.addColorStop(0,"#fff");g.addColorStop(.7,"#e2e7e9");g.addColorStop(1,"#87939a");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#424b50";ctx.stroke();
  ctx.fillStyle="#222";ctx.beginPath();ctx.arc(x,y,r*.2,0,Math.PI*2);ctx.fill();ctx.restore();
}
function draw(t){
  const dt=Math.min(.035,(t-game.last)/1000||.016);game.last=t;
  const w=game.w,h=game.h,g=goal(),m=w<700;
  const sky=ctx.createLinearGradient(0,0,0,h*.4);sky.addColorStop(0,"#071522");sky.addColorStop(1,"#2b5361");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.42);
  ctx.fillStyle="#0b1823";ctx.fillRect(0,h*.25,w,h*.12);
  ctx.fillStyle="#16713e";ctx.fillRect(0,h*.37,w,h*.63);
  ctx.fillStyle="#20924d";ctx.fillRect(0,h*.37,w,h*.06);
  ctx.strokeStyle="#ffffff66";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.15,h);ctx.lineTo(w*.3,h*.5);ctx.lineTo(w*.7,h*.5);ctx.lineTo(w*.85,h);ctx.stroke();
  ctx.fillStyle="#ffffff10";ctx.fillRect(g.x,g.y,g.w,g.h);
  ctx.strokeStyle="#fff";ctx.lineWidth=m?5:7;ctx.strokeRect(g.x,g.y,g.w,g.h);
  ctx.strokeStyle="#ffffff30";ctx.lineWidth=1;
  for(let i=1;i<10;i++){let x=g.x+g.w*i/10;ctx.beginPath();ctx.moveTo(x,g.y);ctx.lineTo(x,g.y+g.h);ctx.stroke()}
  for(let i=1;i<6;i++){let y=g.y+g.h*i/6;ctx.beginPath();ctx.moveTo(g.x,y);ctx.lineTo(g.x+g.w,y);ctx.stroke()}

  const d=DIFF[game.difficulty];
  game.keeperTarget=game.ball?game.keeperTarget:0;
  game.keeperX+=((game.keeperTarget-game.keeperX)*Math.min(1,dt*d.speed));
  const kx=w/2+game.keeperX*g.w*.42;
  player(kx,g.y+g.h*.68,m?.72:.95,"#18a15f",true,game.ball?.t?Math.sin(game.ball.t*Math.PI)*game.keeperX*.15:0);

  const px=w/2,py=h*.76;
  let bx=px,by=py,br=m?13:17;
  const tx=w/2+game.aimX*g.w*.43,ty=g.y+game.aimY*g.h;
  if(game.ball){
    game.ball.t+=dt/game.ball.dur;
    const q=clamp(game.ball.t,0,1),e=q*q*(3-2*q);
    const curve=Math.sin(e*Math.PI)*game.ball.curve*g.w*.12;
    bx=px+(tx-px)*e+curve;
    by=py+(ty-py)*e-Math.sin(e*Math.PI)*h*(m?.075:.095);
    br+=(m?9:12)*e;
    if(q>=1)finishShot();
  }
  player(px,h*.68,m?.78:1.05,"#176bd0");
  ball(bx,by,br);

  if(game.state==="aim"){
    ctx.setLineDash([7,6]);ctx.strokeStyle="#ffe04b";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="#ffe04b33";ctx.beginPath();ctx.arc(tx,ty,m?18:24,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#ffe04b";ctx.beginPath();ctx.arc(tx,ty,m?12:17,0,Math.PI*2);ctx.stroke();
  }
  if(game.charging&&game.state==="aim"){
    game.power+=game.chargeDir*dt*.75;
    if(game.power>=1){game.power=1;game.chargeDir=-1}
    if(game.power<=.1){game.power=.1;game.chargeDir=1}
    updateHud();
  }
  game.raf=requestAnimationFrame(draw);
}

setDifficulty(game.difficulty);updateHud();game.last=performance.now();game.raf=requestAnimationFrame(draw);
})();