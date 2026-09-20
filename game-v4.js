(()=>{
'use strict';
const $=id=>document.getElementById(id), c=$('gameCanvas'); if(!c)return;
const ctx=c.getContext('2d');
let W=0,H=0,dpr=1,state='menu',mode='shootout',difficulty=localStorage.psDifficulty||'medium';
let shots=0,goals=0,score=0,streak=0,level=1,ax=0,ay=.5,power=.22,charging=false,shot=null,keeperX=0,keeperTarget=0,spin=0;
let coins=+(localStorage.psCoins||250),kit=localStorage.psKit||'starter';
const kits={starter:'#176bd0',redkit:'#b52a3b',neonkit:'#22d878'};
const cfg={easy:{save:.10,error:.34},medium:{save:.27,error:.22},hard:{save:.45,error:.13}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize,{passive:true});resize();
function show(id){$(id)?.classList.remove('hidden')} function hide(id){$(id)?.classList.add('hidden')}
function txt(id,v){const e=$(id);if(e)e.textContent=v}
function msg(v,cl=''){const e=$('message');if(e){e.textContent=v;e.className='message '+cl}}
function hud(){txt('coins',Math.floor(coins));txt('level',level);txt('statGoals',+(localStorage.psGoals||0));txt('statScore',+(localStorage.psScore||0));txt('statBest',+(localStorage.psBest||0));txt('statStreak',streak);const p=$('powerFill');if(p)p.style.width=(power*100)+'%';const xp=$('xpFill');if(xp)xp.style.width=clamp(20+goals*12,20,100)+'%'}
function goal(){const m=W<650,w=Math.min(W*(m?.9:.72),650),h=Math.min(H*(m?.30:.32),250),l=W/2-w/2,t=m?Math.max(105,H*.16):H*.19;return{l,t,w,h}}
function setDifficulty(d){difficulty=d;localStorage.psDifficulty=d;updateDifficultyUI();msg(d.toUpperCase()+' KEEPER SELECTED','info')}
function updateDifficultyUI(){['easy','medium','hard'].forEach(d=>$(d+'Keeper')?.classList.toggle('active',d===difficulty));const e=$('difficultyInfo');if(e)e.innerHTML=difficulty.toUpperCase()+' • '+(difficulty==='easy'?'forgiving reactions':difficulty==='medium'?'balanced reactions':'fast reactions')+' • <strong>NO COINS</strong>'}
function start(m='shootout'){mode=m;shots=0;goals=0;score=0;streak=0;level=1;ax=0;ay=.5;power=.22;charging=false;shot=null;keeperX=0;keeperTarget=0;spin=0;state='aim';hide('menu');hide('result');hide('store');hide('statsPanel');hide('skillsPanel');hide('settingsPanel');show('controls');msg('DRAG ON THE GOAL • HOLD SHOOT','info');hud()}
function backMenu(){state='menu';hide('controls');hide('result');show('menu');updateDifficultyUI();msg('Choose keeper difficulty')}
function resetProgress(){localStorage.clear();location.reload()}
function openPanel(id){show(id);hud()}
function aimMove(dx,dy){if(state!=='aim')return;ax=clamp(ax+dx,-1,1);ay=clamp(ay+dy,.02,1)}
function beginCharge(){if(state==='aim')charging=true}
function endCharge(){if(!charging||state!=='aim')return;charging=false;shoot()}
function shoot(){shots++;const cf=cfg[difficulty],p=power;
 const spread=Math.max(.010,(1-p)*.075+.008);let tx=ax+(Math.random()-.5)*spread,ty=ay+(Math.random()-.5)*spread*.75;
 const miss=Math.abs(tx)>1.05||ty<.01||ty>1.03;const edge=Math.min(1,Math.hypot(tx*.9,(ty-.5)*1.4));
 let saveChance=clamp(cf.save+(shots-1)*.012-edge*.25,0,.85);if(difficulty==='easy')saveChance=Math.min(saveChance,.25);if(difficulty==='hard')saveChance=Math.max(saveChance,.25);
 const saved=!miss&&Math.random()<saveChance;keeperTarget=saved?tx+(Math.random()-.5)*cf.error:clamp(tx+(Math.random()-.5)*cf.error*3,-1,1);
 shot={t:0,dur:.62+.18*(1-p),tx,ty,saved,miss,p};state='flight';msg('SHOT!','info')}
function finish(){if(!shot)return;const s=shot;shot=null;const scored=!s.saved&&!s.miss;state='cooldown';
 if(scored){goals++;streak++;const pts=100+goals*25+level*20;score+=pts;const reward=35+level*8;coins+=reward;localStorage.psGoals=(+(localStorage.psGoals||0))+1;localStorage.psScore=(+(localStorage.psScore||0))+pts;localStorage.psBest=Math.max(+(localStorage.psBest||0),score);localStorage.psCoins=coins;msg('GOAL! +'+pts+' • +'+reward+' 🪙','good')}
 else{streak=0;msg(s.saved?'SAVED!':'MISS!','bad')}
 hud();setTimeout(()=>{if((mode==='shootout'||mode==='tournament')&&shots>=5){const won=goals>=3;result(won?'ROUND WON':'ROUND LOST','Goals: '+goals+' / 5 • Score: '+score,won?'good':'bad')}else result(scored?'GOAL!':s.saved?'SAVED!':'MISS!','Goals: '+goals+(mode==='endless'?'':' / 5')+' • Score: '+score,'info')},420)}
function result(title,body,cl){state='result';hide('controls');show('result');txt('resultTitle',title);txt('resultText',body);msg(title,cl)}
function next(){if((mode==='shootout'||mode==='tournament')&&shots>=5){level++;shots=0;goals=0;streak=0}else if(mode==='challenge'){level++;shots=0;goals=0;streak=0}hide('result');show('controls');state='aim';ax=0;ay=.5;power=.22;spin=0;keeperX=0;keeperTarget=0;hud();msg('AIM YOUR SHOT','info')}
function handle(id){switch(id){case'shootoutBtn':case'bottomPlay':start('shootout');break;case'tournamentBtn':start('tournament');break;case'challengeBtn':start('challenge');break;case'easyKeeper':setDifficulty('easy');break;case'mediumKeeper':setDifficulty('medium');break;case'hardKeeper':setDifficulty('hard');break;case'shootBtn':beginCharge();break;case'leftBtn':aimMove(-.10,0);break;case'rightBtn':aimMove(.10,0);break;case'upBtn':aimMove(0,-.08);break;case'downBtn':aimMove(0,.08);break;case'spinLeft':spin=clamp(spin-.18,-1,1);break;case'spinRight':spin=clamp(spin+.18,-1,1);break;case'nextBtn':next();break;case'restartBtn':start(mode);break;case'backMenuBtn':backMenu();break;case'statsBtn':openPanel('statsPanel');break;case'bottomRank':openPanel('statsPanel');break;case'skillsBtn':openPanel('skillsPanel');break;case'storeBtn':openPanel('store');renderStore();break;case'settingsBtn':openPanel('settingsPanel');break;case'resetBtn':resetProgress();break}}
document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('button');if(!b||b.disabled)return;if(b.dataset.close){hide(b.dataset.close);return}if(b.id&&b.id!=='shootBtn')handle(b.id)},{passive:false});
$('shootBtn')?.addEventListener('pointerdown',e=>{e.preventDefault();beginCharge()},{passive:false});$('shootBtn')?.addEventListener('pointerup',e=>{e.preventDefault();endCharge()},{passive:false});$('shootBtn')?.addEventListener('pointercancel',endCharge);
addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat)beginCharge();if(e.key==='ArrowLeft')aimMove(-.06,0);if(e.key==='ArrowRight')aimMove(.06,0);if(e.key==='ArrowUp')aimMove(0,-.06);if(e.key==='ArrowDown')aimMove(0,.06)});addEventListener('keyup',e=>{if(e.code==='Space')endCharge()});
let dragging=false;function setAim(clientX,clientY){if(state!=='aim')return;const r=c.getBoundingClientRect(),g=goal(),x=clientX-r.left,y=clientY-r.top;if(x<g.l-80||x>g.l+g.w+80||y<g.t-80||y>g.t+g.h+80)return;ax=clamp((x-g.l-g.w/2)/(g.w/2),-1,1);ay=clamp((y-g.t)/g.h,.02,1)}
c.addEventListener('pointerdown',e=>{if(state!=='aim')return;dragging=true;c.setPointerCapture?.(e.pointerId);setAim(e.clientX,e.clientY)},{passive:true});c.addEventListener('pointermove',e=>{if(dragging)setAim(e.clientX,e.clientY)},{passive:true});addEventListener('pointerup',()=>dragging=false,{passive:true});addEventListener('pointercancel',()=>dragging=false,{passive:true});
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function shadow(x,y,rx,ry,a=.25){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawPlayer(x,y,s,col,keeper=false,lean=0){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(lean);shadow(0,36,24,6,.35);
 ctx.lineCap='round';ctx.lineWidth=8;ctx.strokeStyle='#17202a';ctx.beginPath();ctx.moveTo(-7,10);ctx.lineTo(-10,32);ctx.moveTo(7,10);ctx.lineTo(10,32);ctx.stroke();
 ctx.fillStyle='#101820';rr(-18,29,14,7,3);ctx.fill();rr(4,29,14,7,3);ctx.fill();
 const body=ctx.createLinearGradient(-20,-14,20,20);body.addColorStop(0,col);body.addColorStop(.55,col);body.addColorStop(1,'#0b2539');ctx.fillStyle=body;rr(-18,-12,36,34,8);ctx.fill();
 ctx.fillStyle='#101923';rr(-18,17,36,15,4);ctx.fill();
 ctx.strokeStyle=col;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-15,-5);ctx.lineTo(-27,12);ctx.moveTo(15,-5);ctx.lineTo(27,12);ctx.stroke();
 ctx.fillStyle='#b97855';ctx.fillRect(-5,-19,10,9);ctx.beginPath();ctx.arc(0,-31,14,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#241914';ctx.beginPath();ctx.arc(0,-36,14,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-13,-38,26,6);
 ctx.fillStyle='#17110e';ctx.beginPath();ctx.arc(-5,-31,1.4,0,Math.PI*2);ctx.arc(5,-31,1.4,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#6b3f31';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-28,4,0,Math.PI);ctx.stroke();
 ctx.fillStyle='#fff';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText(keeper?'GK':'9',0,7);ctx.restore()}
function drawBall(x,y,r){ctx.save();shadow(x,y+r*.8,r*.85,r*.25,.18);const g=ctx.createRadialGradient(x-r*.35,y-r*.45,r*.1,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.65,'#e4e9ec');g.addColorStop(1,'#8f9ba2');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#4b565c';ctx.lineWidth=Math.max(1,r*.07);ctx.stroke();ctx.fillStyle='#252b30';ctx.beginPath();ctx.arc(x,y,r*.21,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++){const a=i*Math.PI*2/5+performance.now()/500;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.18,y+Math.sin(a)*r*.18);ctx.lineTo(x+Math.cos(a)*r*.76,y+Math.sin(a)*r*.76);ctx.stroke()}ctx.restore()}
function draw(){const g=goal(),m=W<650;ctx.clearRect(0,0,W,H);
 const sky=ctx.createLinearGradient(0,0,0,H*.45);sky.addColorStop(0,'#06101b');sky.addColorStop(1,'#21455b');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.45);
 ctx.fillStyle='#0a1823';ctx.fillRect(0,H*.23,W,H*.14);for(let i=0;i<90;i++){const x=(i*97)%W,y=H*.245+(i*31)%(H*.105);ctx.fillStyle=i%3?'#173041':'#294556';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill()}
 const grass=ctx.createLinearGradient(0,H*.35,0,H);grass.addColorStop(0,'#23814a');grass.addColorStop(1,'#0a3b22');ctx.fillStyle=grass;ctx.fillRect(0,H*.35,W,H*.65);
 ctx.strokeStyle='rgba(255,255,255,.30)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.16,H);ctx.lineTo(W*.31,H*.49);ctx.lineTo(W*.69,H*.49);ctx.lineTo(W*.84,H);ctx.stroke();
 ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(g.l,g.t,g.w,g.h);ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=3;for(let i=0;i<=10;i++){let x=g.l+g.w*i/10;ctx.beginPath();ctx.moveTo(x,g.t);ctx.lineTo(x,g.t+g.h);ctx.stroke()}for(let i=1;i<7;i++){let y=g.t+g.h*i/7;ctx.beginPath();ctx.moveTo(g.l,y);ctx.lineTo(g.l+g.w,y);ctx.stroke()}ctx.strokeStyle='#f6f8fa';ctx.lineWidth=m?5:7;ctx.strokeRect(g.l,g.t,g.w,g.h);
 const keeperProgress=shot?clamp(shot.t/shot.dur,0,1):0;keeperX+=(keeperTarget-keeperX)*(1-Math.pow(.0008,1/60));const kx=W/2+keeperX*g.w*.42;drawPlayer(kx,g.t+g.h*.70,m?.88:1.0,'#15945e',true,shot?Math.sin(keeperProgress*Math.PI)*clamp(keeperTarget,-1,1)*.18:0);
 const px=W/2,py=H*.76;let bx=px,by=py,br=m?14:18,tx=W/2+ax*g.w*.43,ty=g.t+ay*g.h;
 if(shot){const q=clamp(shot.t/shot.dur,0,1),e=q*q*(3-2*q),curve=Math.sin(e*Math.PI)*spin*g.w*.10;tx=W/2+shot.tx*g.w*.43;ty=g.t+shot.ty*g.h;bx=px+(tx-px)*e+curve;by=py+(ty-py)*e-Math.sin(e*Math.PI)*H*(m?.07:.09);br+=(m?9:11)*e}
 drawPlayer(px,H*.68,m?.90:1.12,kits[kit]||kits.starter,false,0);drawBall(bx,by,br);
 if(state==='aim'){ctx.strokeStyle='#ffe44d';ctx.lineWidth=m?2:3;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,228,77,.14)';ctx.beginPath();ctx.arc(tx,ty,m?20:25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffe44d';ctx.beginPath();ctx.arc(tx,ty,(m?14:18)+Math.sin(performance.now()/120)*3,0,Math.PI*2);ctx.stroke()}
 if(charging){power+=.010*powerDir;if(power>=1||power<=.12)powerDir*=-1;hud()}
 if(shot){shot.t+=1/60;if(shot.t>=shot.dur)finish()}
 requestAnimationFrame(draw)}
function renderStore(){const box=$('shopGrid');if(!box)return;box.innerHTML='';[['starter','Starter Kit',0],['redkit','Crimson Kit',180],['neonkit','Neon Pro',320]].forEach(([id,name,cost])=>{const b=document.createElement('button');b.type='button';b.className='buyBtn';b.textContent=kit===id?'EQUIPPED':(cost?'🪙 '+cost:'EQUIP FREE');b.onclick=()=>{if(cost&&coins<cost){msg('NOT ENOUGH COINS','bad');return}if(cost&&kit!==id)coins-=cost;kit=id;localStorage.psKit=kit;localStorage.psCoins=coins;renderStore();hud()};box.appendChild(b)})}
updateDifficultyUI();hud();requestAnimationFrame(draw);
})();
