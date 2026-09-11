(()=>{'use strict';
const base=document.getElementById('gameCanvas');if(!base)return;
const fx=document.createElement('canvas');fx.id='graphicsFX';fx.setAttribute('aria-hidden','true');document.body.insertBefore(fx,document.getElementById('hud'));
const c=fx.getContext('2d');let W=0,H=0,dpr=1;
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);fx.width=W*dpr;fx.height=H*dpr;fx.style.width=W+'px';fx.style.height=H+'px';c.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize,{passive:true});resize();
function goal(){const mobile=W<650,w=Math.min(W*(mobile?.88:.74),620),h=Math.min(H*(mobile?.30:.31),245);return{l:W/2-w/2,t:mobile?Math.max(112,H*.16):H*.20,w,h}}
function draw(now){c.clearRect(0,0,W,H);const q=goal();
 // subtle stadium/pitch atmosphere
 const pitchTop=H*.34;
 const g=c.createLinearGradient(0,pitchTop,0,H);g.addColorStop(0,'rgba(8,76,40,.08)');g.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=g;c.fillRect(0,pitchTop,W,H-pitchTop);
 c.globalAlpha=.055;
 for(let i=0;i<12;i++){c.fillStyle=i%2?'#fff':'#000';c.fillRect(0,pitchTop+i*(H-pitchTop)/12,W,(H-pitchTop)/12)}
 c.globalAlpha=1;
 // penalty-area perspective accents
 c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=2;c.beginPath();c.moveTo(W*.08,H);c.lineTo(W*.22,pitchTop);c.moveTo(W*.92,H);c.lineTo(W*.78,pitchTop);c.stroke();
 // goal glow and deeper net lines
 c.save();c.shadowBlur=18;c.shadowColor='rgba(255,255,255,.24)';c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2;c.strokeRect(q.l,q.t,q.w,q.h);c.restore();
 c.globalAlpha=.11;c.strokeStyle='#fff';c.lineWidth=1;
 for(let i=1;i<10;i++){const x=q.l+q.w*i/10;c.beginPath();c.moveTo(x,q.t);c.lineTo(x,q.t+q.h);c.stroke()}
 for(let i=1;i<7;i++){const y=q.t+q.h*i/7;c.beginPath();c.moveTo(q.l,y);c.lineTo(q.l+q.w,y);c.stroke()}
 c.globalAlpha=1;
 // soft stadium lights at the top
 const light=c.createRadialGradient(W*.18,0,2,W*.18,0,W*.28);light.addColorStop(0,'rgba(255,255,255,.12)');light.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=light;c.fillRect(0,0,W,H*.42);
 const light2=c.createRadialGradient(W*.82,0,2,W*.82,0,W*.28);light2.addColorStop(0,'rgba(255,255,255,.12)');light2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=light2;c.fillRect(0,0,W,H*.42);
 // cinematic vignette
 const v=c.createRadialGradient(W/2,H*.48,Math.min(W,H)*.25,W/2,H*.48,Math.max(W,H)*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.72,'rgba(0,0,0,.05)');v.addColorStop(1,'rgba(0,0,0,.30)');c.fillStyle=v;c.fillRect(0,0,W,H);
 requestAnimationFrame(draw)}
requestAnimationFrame(draw);
})();
