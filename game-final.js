(()=>{'use strict';
const $=id=>document.getElementById(id), canvas=$('gameCanvas');
if(!canvas)return;
const ctx=canvas.getContext('2d'); if(!ctx)return;
let W=0,H=0,state='menu',difficulty=localStorage.getItem('psDifficulty')||'medium',mode='shootout';
let shots=0,goals=0,score=0,streak=0,level=1,power=.2,powerDir=1,ax=0,ay=.55,shot=null,keeperX=0,keeperTarget=0;
let coins=Number(localStorage.getItem('psCoins')||250),kit=localStorage.getItem('psKit')||'starter';
const cfg={easy:{save:.12,error:.38,speed:.10},medium:{save:.34,error:.22,speed:.23},hard:{save:.58,error:.10,speed:.42}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=W*d;canvas.height=H*d;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize,{passive:true});resize();
function show(id){$(id)?.classList.remove('hidden')} function hide(id){$(id)?.classList.add('hidden')}
function text(id,v){const e=$(id);if(e)e.textContent=v}
function message(t,c=''){const e=$('message');if(e){e.textContent=t;e.className='message '+c}}
function goal(){const mobile=W<650,w=Math.min(W*(mobile?.88:.74),620),h=Math.min(H*(mobile?.30:.31),245);return{l:W/2-w/2,t:mobile?Math.max(112,H*.16):H*.20,w,h}}
function hud(){text('coins',Math.floor(coins));text('level',level);text('statGoals',Number(localStorage.getItem('psGoals')||0));text('statScore',Number(localStorage.getItem('psScore')||0));text('statBest',Number(localStorage.getItem('psBest')||0));text('statStreak',streak);const p=$('powerFill');if(p)p.style.width=(power*100)+'%'}
function updateDifficultyUI(){['easy','medium','hard'].forEach(d=>$(d+'Keeper')?.classList.toggle('active',d===difficulty));const e=$('difficultyInfo');if(e)e.innerHTML=difficulty.toUpperCase()+' • '+(difficulty==='easy'?'slow reactions':difficulty==='medium'?'balanced reactions':'fast, accurate reactions')+' • <strong>NO COINS</strong>'}
function startGame(selectedMode){mode=selectedMode||'shootout';shots=0;goals=0;score=0;streak=0;level=1;state='aim';ax=0;ay=.55;power=.2;powerDir=1;shot=null;keeperX=0;keeperTarget=0;hide('menu');hide('result');hide('store');hide('statsPanel');hide('skillsPanel');hide('settingsPanel');show('controls');message(difficulty.toUpperCase()+' KEEPER • NO COINS','info');hud()}
function backMenu(){state='menu';hide('controls');hide('result');show('menu');updateDifficultyUI();message('Choose keeper difficulty')}
function setDifficulty(d){difficulty=d;localStorage.setItem('psDifficulty',d);updateDifficultyUI();message(d.toUpperCase()+' KEEPER SELECTED • NO COINS','info')}
function openPanel(id){show(id)}
function aimMove(dx,dy){if(state!=='aim')return;ax=clamp(ax+dx,-1,1);ay=clamp(ay+dy,.02,1)}
function shoot(){if(state!=='aim')return;shots++;const c=cfg[difficulty],p=power,spread=Math.max(.012,(1-p)*.08+.01);const tx=clamp(ax+(Math.random()-.5)*spread,-1.12,1.12),ty=clamp(ay+(Math.random()-.5)*spread*.8,.02,1.08);const edge=Math.min(1,Math.hypot(tx*.9,(ty-.5)*1.3));let chance=clamp(c.save+(shots-1)*.018-edge*.30,.02,.92);if(difficulty==='easy')chance=Math.min(chance,.35);if(difficulty==='medium')chance=Math.min(chance,.68);if(difficulty==='hard')chance=Math.max(chance,.28);const saved=Math.random()<chance;keeperTarget=saved?tx+(Math.random()-.5)*c.error:clamp(tx+(Math.random()-.5)*c.error*3,-1,1);shot={t:0,dur:.62+.20*(1-p),tx,ty,saved,miss:Math.abs(tx)>1.03||ty<.02||ty>1.03};state='flight';message('SHOT!','info')}
function finishShot(){if(!shot)return;const s=shot;shot=null;const scored=!s.saved&&!s.miss;if(scored){goals++;streak++;score+=100+goals*25;const oldGoals=Number(localStorage.getItem('psGoals')||0),oldScore=Number(localStorage.getItem('psScore')||0),oldBest=Number(localStorage.getItem('psBest')||0);localStorage.setItem('psGoals',oldGoals+1);localStorage.setItem('psScore',oldScore+score);localStorage.setItem('psBest',Math.max(oldBest,score));message('GOAL!','good')}else{streak=0;message(s.saved?'SAVED!':'MISS!','bad')}hud();setTimeout(()=>{state='result';hide('controls');show('result');text('resultTitle',scored?'GOAL!':s.saved?'SAVED!':'MISS!');text('resultText','Goals: '+goals+(mode==='shootout'||mode==='tournament'?' / 5':'')+' • Score: '+score+' • '+difficulty.toUpperCase()+' KEEPER • NO COINS')},350)}
function nextShot(){state='aim';ax=0;ay=.55;power=.2;powerDir=1;shot=null;keeperX=0;keeperTarget=0;hide('result');show('controls');message('AIM YOUR SHOT','info');hud()}
function resetProgress(){['psCoins','psOwned','psKit','psShoe','psBest','psGoals','psScore'].forEach(k=>localStorage.removeItem(k));location.reload()}
function handle(id){switch(id){case'shootoutBtn':case'bottomPlay':startGame('shootout');break;case'tournamentBtn':startGame('tournament');break;case'challengeBtn':startGame('challenge');break;case'easyKeeper':setDifficulty('easy');break;case'mediumKeeper':setDifficulty('medium');break;case'hardKeeper':setDifficulty('hard');break;case'shootBtn':shoot();break;case'leftBtn':aimMove(-.11,0);break;case'rightBtn':aimMove(.11,0);break;case'upBtn':aimMove(0,-.09);break;case'downBtn':aimMove(0,.09);break;case'spinLeft':aimMove(-.06,0);break;case'spinRight':aimMove(.06,0);break;case'nextBtn':nextShot();break;case'restartBtn':startGame(mode);break;case'backMenuBtn':backMenu();break;case'statsBtn':openPanel('statsPanel');break;case'bottomRank':openPanel('statsPanel');break;case'skillsBtn':openPanel('skillsPanel');break;case'storeBtn':openPanel('store');renderStore();break;case'settingsBtn':openPanel('settingsPanel');break;case'resetBtn':resetProgress();break}}
document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b||b.disabled)return;if(b.dataset.close){hide(b.dataset.close);return}if(b.id)handle(b.id)},false);
document.addEventListener('touchend',e=>{const b=e.target.closest?.('button');if(!b||b.disabled||b.dataset.touchFired)return;b.dataset.touchFired='1';setTimeout(()=>delete b.dataset.touchFired,500)}, {passive:true});
function renderStore(){const box=$('shopGrid');if(!box)return;box.innerHTML='';[['starter','Starter Kit',0],['redkit','Crimson Kit',180],['neonkit','Neon Pro',320]].forEach(([id,name,cost])=>{const b=document.createElement('button');b.type='button';b.className='buyBtn';b.textContent=id===kit?'EQUIPPED':'🪙 '+cost;b.addEventListener('click',()=>{if(cost&&coins<cost){message('Not enough coins','bad');return}if(cost&&id!==kit)coins-=cost;kit=id;localStorage.setItem('psKit',kit);localStorage.setItem('psCoins',coins);renderStore();hud()});box.appendChild(b)})}
let dragging=false;
canvas.addEventListener('pointerdown',e=>{if(state!=='aim')return;dragging=true;canvas.setPointerCapture?.(e.pointerId);setAim(e.clientX,e.clientY);e.preventDefault()},{passive:false});canvas.addEventListener('pointermove',e=>{if(dragging)setAim(e.clientX,e.clientY)},{passive:false});addEventListener('pointerup',()=>dragging=false,{passive:true});
function setAim(x,y){const r=canvas.getBoundingClientRect(),q=goal();x-=r.left;y-=r.top;if(x<q.l-90||x>q.l+q.w+90||y<q.t-90||y>q.t+q.h+90)return;ax=clamp((x-q.l-q.w/2)/(q.w/2),-1,1);ay=clamp((y-q.t)/q.h,.02,1)}
function roundedRect(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function shadowEllipse(x,y,rx,ry,a=.22){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawPlayer(x,y,s,kitColor,keeper=false,lean=0){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(lean);
  shadowEllipse(0,31,22,5,.30);
  // legs
  ctx.lineCap='round';ctx.lineWidth=8;ctx.strokeStyle=keeper?'#d9e0e6':'#17202a';ctx.beginPath();ctx.moveTo(-7,8);ctx.lineTo(-10,27);ctx.moveTo(7,8);ctx.lineTo(10,27);ctx.stroke();
  // boots
  ctx.fillStyle='#111820';roundedRect(-17,24,13,6,3);ctx.fill();roundedRect(4,24,13,6,3);ctx.fill();
  // torso with subtle fabric shading
  const grad=ctx.createLinearGradient(-18,-12,18,18);grad.addColorStop(0,kitColor);grad.addColorStop(.55,kitColor);grad.addColorStop(1,'#0d2438');ctx.fillStyle=grad;roundedRect(-17,-10,34,29,7);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,17);ctx.stroke();
  // shorts
  ctx.fillStyle='#101923';roundedRect(-17,14,34,13,4);ctx.fill();
  // arms
  ctx.lineWidth=7;ctx.lineCap='round';ctx.strokeStyle=kitColor;ctx.beginPath();ctx.moveTo(-14,-4);ctx.lineTo(-25,10);ctx.moveTo(14,-4);ctx.lineTo(25,10);ctx.stroke();
  // neck
  ctx.fillStyle='#b87552';ctx.fillRect(-5,-16,10,8);
  // head + ears
  ctx.fillStyle='#b97855';ctx.beginPath();ctx.arc(0,-27,13,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(-13,-27,3,0,Math.PI*2);ctx.arc(13,-27,3,0,Math.PI*2);ctx.fill();
  // hair
  ctx.fillStyle='#241914';ctx.beginPath();ctx.arc(0,-32,13,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-12,-34,24,6);
  // face
  ctx.fillStyle='#1b1411';ctx.beginPath();ctx.arc(-5,-28,1.3,0,Math.PI*2);ctx.arc(5,-28,1.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#6b3f31';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-25,4,0,Math.PI);ctx.stroke();
  // shirt badge/number detail
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText(keeper?'GK':'9',0,5);
  ctx.restore();
}
function drawBall(x,y,r){ctx.save();shadowEllipse(x,y+r*.8,r*.85,r*.25,.20);const g=ctx.createRadialGradient(x-r*.35,y-r*.45,r*.1,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.55,'#e8edf0');g.addColorStop(1,'#9da8af');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#4e5960';ctx.lineWidth=Math.max(1,r*.07);ctx.stroke();ctx.fillStyle='#252b30';ctx.beginPath();ctx.arc(x,y,r*.22,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++){const a=i*Math.PI*2/5+.2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.18,y+Math.sin(a)*r*.18);ctx.lineTo(x+Math.cos(a)*r*.75,y+Math.sin(a)*r*.75);ctx.stroke()}ctx.restore()}
function draw(){
 const q=goal(),mobile=W<650;
 // stadium sky and pitch
 const sky=ctx.createLinearGradient(0,0,0,H*.42);sky.addColorStop(0,'#07111e');sky.addColorStop(1,'#16344a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.44);
 for(let i=0;i<9;i++){const lx=W*(i+.5)/9;const glow=ctx.createRadialGradient(lx,H*.10,2,lx,H*.10,mobile?65:95);glow.addColorStop(0,'rgba(255,255,235,.20)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(lx-110,0,220,H*.28)}
 // distant crowd
 ctx.fillStyle='#0a1722';ctx.fillRect(0,H*.24,W,H*.14);for(let i=0;i<100;i++){const cx=(i*83)%W,cy=H*.25+(i*37)%(H*.11);ctx.fillStyle=i%3?'#142735':'#20394a';ctx.beginPath();ctx.arc(cx,cy,2.2,0,Math.PI*2);ctx.fill()}
 // grass perspective
 const grass=ctx.createLinearGradient(0,H*.34,0,H);grass.addColorStop(0,'#1c743d');grass.addColorStop(1,'#0b3f25');ctx.fillStyle=grass;ctx.fillRect(0,H*.34,W,H*.66);
 for(let i=0;i<12;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.018)':'rgba(0,0,0,.025)';ctx.fillRect(0,H*.34+i*(H*.66/12),W,H*.66/12)}
 // penalty-box lines
 ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.18,H*.98);ctx.lineTo(W*.30,H*.49);ctx.lineTo(W*.70,H*.49);ctx.lineTo(W*.82,H*.98);ctx.stroke();ctx.beginPath();ctx.moveTo(W*.35,H*.98);ctx.lineTo(W*.39,H*.64);ctx.lineTo(W*.61,H*.64);ctx.lineTo(W*.65,H*.98);ctx.stroke();
 // goal depth + frame
 ctx.fillStyle='rgba(255,255,255,.045)';ctx.fillRect(q.l,q.t,q.w,q.h);
 ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=3;for(let i=0;i<11;i++){const x=q.l+q.w*i/10;ctx.beginPath();ctx.moveTo(x,q.t);ctx.lineTo(x,q.t+q.h);ctx.stroke()}for(let i=1;i<7;i++){const yy=q.t+q.h*i/7;ctx.beginPath();ctx.moveTo(q.l,yy);ctx.lineTo(q.l+q.w,yy);ctx.stroke()}
 ctx.strokeStyle='#f4f7f8';ctx.lineWidth=mobile?5:7;ctx.strokeRect(q.l,q.t,q.w,q.h);ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=3;ctx.strokeRect(q.l+7,q.t+7,q.w-14,q.h-14);
 let px=W/2,py=H*.77,bx=px,by=py,br=mobile?14:18;
 if(shot){const e=clamp(shot.t/shot.dur,0,1),s=e*e*(3-2*e),tx=W/2+shot.tx*q.w*.43,ty=q.t+shot.ty*q.h;bx=px+(tx-px)*s;by=py+(ty-py)*s-Math.sin(s*Math.PI)*H*.06;br+=8*s;keeperX+=(keeperTarget-keeperX)*cfg[difficulty].speed}
 const kx=W/2+keeperX*q.w*.45;
 drawPlayer(kx,q.t+q.h*.69,Math.max(.72,Math.min(1.0,q.w/470)),difficulty==='hard'?'#d52b3b':difficulty==='medium'?'#1676c5':'#15945e',true,keeperX*.18);
 const playerColor=kit==='redkit'?'#b52a3b':kit==='neonkit'?'#22d878':'#176bd0';drawPlayer(px,H*.69,Math.max(.82,Math.min(1.08,q.w/430)),playerColor,false,0);
 drawBall(bx,by,br);
 if(state==='aim'){const tx=W/2+ax*q.w*.43,ty=q.t+ay*q.h;ctx.strokeStyle='#ffe52d';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,229,45,.12)';ctx.beginPath();ctx.arc(tx,ty,25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffe52d';ctx.beginPath();ctx.arc(tx,ty,19+Math.sin(Date.now()/130)*3,0,Math.PI*2);ctx.stroke()}
 // subtle vignette
 const v=ctx.createRadialGradient(W/2,H*.55,Math.min(W,H)*.25,W/2,H*.55,Math.max(W,H)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.30)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
let last=performance.now();function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(state==='aim'){power+=powerDir*dt*.9;if(power>=1){power=1;powerDir=-1}if(power<=.08){power=.08;powerDir=1}hud()}if(state==='flight'&&shot){shot.t+=dt;if(shot.t>=shot.dur)finishShot()}draw();requestAnimationFrame(loop)}
updateDifficultyUI();hud();requestAnimationFrame(loop);window.PenaltyShooter={start:startGame,menu:backMenu,shoot,chooseDifficulty:setDifficulty};
})();