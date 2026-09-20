(()=>{
'use strict';
const $=id=>document.getElementById(id), c=$('gameCanvas'); if(!c)return;
const ctx=c.getContext('2d');
let W=0,H=0,dpr=1,state='menu',mode='shootout',difficulty='medium';
let shots=0,goals=0,score=0,streak=0,level=1,ax=0,ay=.5,power=.22,powerDir=1,charging=false,shot=null,keeperX=0,keeperTarget=0,spin=0,lastFrame=0;
let coins=+(localStorage.psCoins||250),kit=localStorage.psKit||'starter';
const kits={starter:'#176bd0',redkit:'#b52a3b',neonkit:'#22d878'};
const cfg={medium:{save:.62,error:.10};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize,{passive:true});resize();
function show(id){$(id)?.classList.remove('hidden')} function hide(id){$(id)?.classList.add('hidden')}
function txt(id,v){const e=$(id);if(e)e.textContent=v}
function msg(v,cl=''){const e=$('message');if(e){e.textContent=v;e.className='message '+cl}}
function hud(){txt('coins',Math.floor(coins));txt('level',level);txt('statGoals',+(localStorage.psGoals||0));txt('statScore',+(localStorage.psScore||0));txt('statBest',+(localStorage.psBest||0));txt('statStreak',streak);const p=$('powerFill');if(p)p.style.width=(power*100)+'%';const xp=$('xpFill');if(xp)xp.style.width=clamp(20+goals*12,20,100)+'%'}
function goal(){const m=W<650,w=Math.min(W*(m?.9:.72),650),h=Math.min(H*(m?.30:.32),250),l=W/2-w/2,t=m?Math.max(105,H*.16):H*.19;return{l,t,w,h}}
function setDifficulty(){difficulty='medium';localStorage.psDifficulty='medium';updateDifficultyUI();msg('MEDIUM • HARD TO SCORE','info')}
function updateDifficultyUI(){const e=$('difficultyInfo');if(e)e.innerHTML='TOUGH KEEPER • HARD TO SCORE • <strong>NO COINS</strong>';const b=$('mediumKeeper');if(b)b.classList.add('active')}
function resetProgress(){['psDifficulty','psCoins','psOwned','psKit','psShoe','psGoals','psScore','psBest'].forEach(k=>localStorage.removeItem(k));location.reload()}
function openPanel(id){show(id);hud()}
function aimMove(dx,dy){if(state!=='aim')return;ax=clamp(ax+dx,-1,1);ay=clamp(ay+dy,.02,1)}
function beginCharge(){if(state==='aim'){charging=true;msg('POWER: '+Math.round(power*100)+'%','info')}}
function endCharge(){if(!charging||state!=='aim')return;charging=false;msg('POWER: '+Math.round(power*100)+'%','info');shoot()}
function shoot(){shots++;const cf=cfg[difficulty],p=power;const spread=Math.max(.010,(1-p)*.075+.008);let tx=ax+(Math.random()-.5)*spread,ty=ay+(Math.random()-.5)*spread*.75;const miss=Math.abs(tx)>1.05||ty<.01||ty>1.03;const edge=Math.min(1,Math.hypot(tx*.9,(ty-.5)*1.4));let saveChance=clamp(cf.save+(shots-1)*.035-edge*.32,0,.88);if(difficulty==='easy')saveChance=Math.min(saveChance,.38);if(difficulty==='medium')saveChance=Math.max(saveChance,.34);const saved=!miss&&Math.random()<saveChance;keeperTarget=saved?tx+(Math.random()-.5)*cf.error:clamp(tx+(Math.random()-.5)*cf.error*3,-1,1);shot={t:0,dur:.62+.18*(1-p),tx,ty,saved,miss,p};state='flight';msg('SHOT!','info')}
function finish(){if(!shot)return;const s=shot;shot=null;const scored=!s.saved&&!s.miss;state='cooldown';if(scored){goals++;streak++;const pts=100+goals*25+level*20;score+=pts;const reward=35+level*8;coins+=reward;localStorage.psGoals=(+(localStorage.psGoals||0))+1;localStorage.psScore=(+(localStorage.psScore||0))+pts;localStorage.psBest=Math.max(+(localStorage.psBest||0),score);localStorage.psCoins=coins;msg('GOAL! +'+pts+' • +'+reward+' 🪙','good')}else{streak=0;msg(s.saved?'SAVED!':'MISS!','bad')}hud();setTimeout(()=>{if((mode==='shootout'||mode==='tournament')&&shots>=5){const won=goals>=3;result(won?'ROUND WON':'ROUND LOST','Goals: '+goals+' / 5 • Score: '+score,won?'good':'bad')}else result(scored?'GOAL!':s.saved?'SAVED!':'MISS!','Goals: '+goals+(mode==='endless'?'':' / 5')+' • Score: '+score,'info')},420)}
function result(title,body,cl){state='result';hide('controls');show('result');txt('resultTitle',title);txt('resultText',body);msg(title,cl)}
function next(){if((mode==='shootout'||mode==='tournament')&&shots>=5){level++;shots=0;goals=0;streak=0}else if(mode==='challenge'&&shots>=1){level++;shots=0;goals=0;streak=0}hide('result');show('controls');state='aim';ax=0;ay=.5;power=.22;powerDir=1;spin=0;keeperX=0;keeperTarget=0;hud();msg('AIM YOUR SHOT','info')}
function handle(id){switch(id){case'shootoutBtn':case'bottomPlay':case'mediumKeeper':start('shootout');break;case'shootBtn':shoot();break;case'leftBtn':aimMove(-.10,0);break;case'rightBtn':aimMove(.10,0);break;case'upBtn':aimMove(0,-.08);break;case'downBtn':aimMove(0,.08);break;case'spinLeft':spin=clamp(spin-.18,-1,1);break;case'spinRight':spin=clamp(spin+.18,-1,1);break;case'nextBtn':next();break;case'restartBtn':start('shootout');break;case'backMenuBtn':backMenu();break;case'settingsBtn':openPanel('settingsPanel');break;case'resetBtn':resetProgress();break}})();