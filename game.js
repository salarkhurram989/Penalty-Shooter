import * as THREE from 'three';

const root=document.getElementById('game');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x06130d); scene.fog=new THREE.Fog(0x06130d,32,95);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,150); camera.position.set(0,5.2,18); camera.lookAt(0,3,0);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.8)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xb8d7ff,0x18321f,1.9));
const sun=new THREE.DirectionalLight(0xffffff,3.0); sun.position.set(-12,18,12); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mat=(color,rough=.7)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});
const grass=mat(0x176b35,.95), white=mat(0xf5f5ef,.55), dark=mat(0x111722,.5), wood=mat(0x5b371d,.8);
const field=new THREE.Mesh(new THREE.PlaneGeometry(42,75),grass); field.rotation.x=-Math.PI/2; field.position.z=-10; field.receiveShadow=true; scene.add(field);
for(let z=-46;z<27;z+=4){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(42,.16),mat(z%8===0?0x1b743b:0x166633)); stripe.rotation.x=-Math.PI/2; stripe.position.set(0,.012,z); scene.add(stripe)}

// Stadium stands and lights
for(const side of [-1,1]){const stand=new THREE.Mesh(new THREE.BoxGeometry(9,8,52),dark); stand.position.set(side*25,4,-9); scene.add(stand); for(let r=0;r<5;r++){const row=new THREE.Mesh(new THREE.BoxGeometry(8,.55,46),mat(r%2?0x29323e:0x202833)); row.position.set(side*20,1+r*1.25,-8); scene.add(row)}}
for(const x of [-18,18]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,15,12),wood);pole.position.set(x,7,-15);scene.add(pole);const lamp=new THREE.PointLight(0xeef7ff,35,35);lamp.position.set(x,14,-15);scene.add(lamp)}

// Goal at z = 0
const goalW=7.32, goalH=2.44, postR=.09;
const goalMat=white;
function bar(pos,scale){const m=new THREE.Mesh(new THREE.CylinderGeometry(postR,postR,1,12),goalMat);m.position.set(...pos);m.scale.set(scale[0],scale[1],scale[2]);m.rotation.z=Math.PI/2; m.castShadow=true;scene.add(m);return m}
// cylinders: horizontal bars need rotation Z; depth bar uses horizontal X
bar([-goalW/2,goalH/2,0],[1,goalW,1]);bar([goalW/2,goalH/2,0],[1,goalW,1]);
const cross=new THREE.Mesh(new THREE.CylinderGeometry(postR,postR,goalW,12),goalMat);cross.rotation.z=Math.PI/2;cross.position.set(0,goalH,0);scene.add(cross);
for(const x of [-goalW/2,goalW/2]){const p=new THREE.Mesh(new THREE.CylinderGeometry(postR,postR,goalH,12),goalMat);p.position.set(x,goalH/2,0);p.castShadow=true;scene.add(p)}
// net as transparent lines
const netMat=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.22});
for(let y=.3;y<goalH;y+=.42){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-goalW/2,y,-.05),new THREE.Vector3(goalW/2,y,-.05)]);scene.add(new THREE.Line(g,netMat))}
for(let x=-goalW/2;x<=goalW/2;x+=.5){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.05,-.05),new THREE.Vector3(x,goalH,-.05)]);scene.add(new THREE.Line(g,netMat))}

// Ball with a procedural high-contrast panel-like texture.
const tc=document.createElement('canvas');tc.width=512;tc.height=512;const ctx=tc.getContext('2d');ctx.fillStyle='#f7f7f4';ctx.fillRect(0,0,512,512);ctx.fillStyle='#17191b';
for(let i=0;i<18;i++){const a=i*Math.PI*2/18+0.15;const x=256+Math.cos(a)*175,y=256+Math.sin(a)*175;ctx.beginPath();for(let k=0;k<6;k++){const q=k*Math.PI/3-Math.PI/2;ctx.lineTo(x+32*Math.cos(q),y+32*Math.sin(q))}ctx.closePath();ctx.fill()}ctx.strokeStyle='#777';ctx.lineWidth=4;ctx.strokeRect(4,4,504,504);
const ballTex=new THREE.CanvasTexture(tc);ballTex.colorSpace=THREE.SRGBColorSpace;
const ball=new THREE.Mesh(new THREE.SphereGeometry(.33,32,24),new THREE.MeshStandardMaterial({map:ballTex,roughness:.72}));ball.castShadow=true;scene.add(ball);

const player=new THREE.Mesh(new THREE.CapsuleGeometry(.38,1.25,8,16),mat(0x164a9a));player.position.set(0,.95,7);player.castShadow=true;scene.add(player);
const head=new THREE.Mesh(new THREE.SphereGeometry(.28,20,16),mat(0xd59b73));head.position.set(0,1.95,7);scene.add(head);

let mode='shootout', level=1, score=0, goals=0, shots=0, aiming=true, aimX=0, aimY=.95, spin=0, power=.78, charging=false, chargeDir=1;
let velocity=new THREE.Vector3(), angular=new THREE.Vector3(); let goalkeeper={x:0,y:1.05,z:-.45,vx:0,target:0};
const $=id=>document.getElementById(id); const msg=$('message');
function setMsg(t,c=''){msg.textContent=t;msg.className='message '+c}
function updateHUD(){$('level').textContent=level;$('score').textContent=score;$('goals').textContent=goals;$('shots').textContent=shots;$('powerFill').style.width=(power*100)+'%'}
function difficulty(){return Math.min(.85,.24+(level-1)*.045)}
function resetBall(){ball.position.set(0,.33,6.55);ball.rotation.set(0,0,0);velocity.set(0,0,0);angular.set(0,0,0);aiming=true;power=.78;spin=0;charging=false;goalkeeper.x=0;goalkeeper.y=1.05;goalkeeper.target=(Math.random()*2-1)*goalW*.35;updateHUD()}
function shoot(){if(!aiming)return; aiming=false;shots++;const tx=aimX*goalW*.47;const ty=.35+aimY*(goalH-.35);const target=new THREE.Vector3(tx,ty,-1.0);const d=target.clone().sub(ball.position);const dist=d.length();const speed=11+power*12;velocity.copy(d.normalize().multiplyScalar(speed));velocity.y += power*2.0;angular.set(0,spin*15,spin*11);setMsg('SHOT!','info');updateHUD()}
function keeperSaveChance(){const dx=Math.abs(ball.position.x-goalkeeper.x);const dy=Math.abs(ball.position.y-goalkeeper.y);const reaction=difficulty();return dx < (.45+reaction*.35) && dy < .72 && Math.random()<.82}
function finish(goal){if(goal){goals++;score+=100*level;setMsg('GOAL! +'+100*level,'good')}else{setMsg('SAVED!','bad')}updateHUD();setTimeout(()=>showResult(goal),700)}
function showResult(goal){$('resultTitle').textContent=goal?'GOAL!':'SAVED!';$('resultText').textContent=goal?(mode==='endless'?'Streak continues.':'Next penalty — goalkeeper gets tougher.'):(mode==='endless'?'Try another shot.':'Keep going — accuracy matters.');$('result').classList.remove('hidden');$('nextBtn').textContent=mode==='endless'?'NEXT SHOT':(shots%5===0?'NEXT LEVEL':'NEXT SHOT')}
function next(){ $('result').classList.add('hidden'); if(mode==='shootout'&&shots%5===0)level++; if(mode==='endless')level=1+Math.floor(goals/3);resetBall();setMsg('Drag to aim • release to shoot')}
function start(m){mode=m;level=1;score=0;goals=0;shots=0;$('menu').classList.add('hidden');$('controls').classList.remove('hidden');resetBall();setMsg('Drag to aim • release to shoot')}
$('shootoutBtn').onclick=()=>start('shootout');$('endlessBtn').onclick=()=>start('endless');$('nextBtn').onclick=next;$('restartBtn').onclick=()=>{ $('result').classList.add('hidden');start(mode) };

function aimFromPointer(x,y){if(!aiming)return;aimX=THREE.MathUtils.clamp((x/innerWidth-.5)*2,-1,1);aimY=THREE.MathUtils.clamp(1-(y/innerHeight),.05,1);camera.lookAt(aimX*2.2,2.2,-1)}
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(!aiming)return;dragging=true;lastX=e.clientX;lastY=e.clientY;aimFromPointer(e.clientX,e.clientY)});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;aimFromPointer(e.clientX,e.clientY);lastX=e.clientX;lastY=e.clientY});
renderer.domElement.addEventListener('pointerup',()=>{if(dragging){dragging=false;shoot()}});
renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
function press(id,fn){$(id).addEventListener('pointerdown',e=>{e.preventDefault();fn()})}
press('leftBtn',()=>aimX=THREE.MathUtils.clamp(aimX-.12,-1,1));press('rightBtn',()=>aimX=THREE.MathUtils.clamp(aimX+.12,-1,1));press('upBtn',()=>aimY=THREE.MathUtils.clamp(aimY+.12,0,1));press('spinLeft',()=>spin=THREE.MathUtils.clamp(spin-.12,-1,1));press('spinRight',()=>spin=THREE.MathUtils.clamp(spin+.12,-1,1));press('shootBtn',shoot);
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')aimX=THREE.MathUtils.clamp(aimX-.08,-1,1);if(e.key==='ArrowRight'||e.key==='d')aimX=THREE.MathUtils.clamp(aimX+.08,-1,1);if(e.key==='ArrowUp'||e.key==='w')aimY=THREE.MathUtils.clamp(aimY+.08,0,1);if(e.key==='ArrowDown'||e.key==='s')aimY=THREE.MathUtils.clamp(aimY-.08,0,1);if(e.code==='Space')shoot()});

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.033);
 if(charging){power+=chargeDir*dt*.75;if(power>=1){power=1;chargeDir=-1}if(power<=.2){power=.2;chargeDir=1}updateHUD()}
 if(!aiming){
   // Gravity + quadratic-ish drag + Magnus effect from spin.
   const speed=velocity.length();const drag=.035*speed;velocity.multiplyScalar(Math.max(0,1-drag*dt));velocity.y-=9.81*dt;
   const magnus=new THREE.Vector3().crossVectors(angular,velocity).multiplyScalar(.0025);velocity.add(magnus.multiplyScalar(dt));
   ball.position.addScaledVector(velocity,dt);ball.rotation.x+=angular.x*dt;ball.rotation.y+=angular.y*dt;ball.rotation.z+=angular.z*dt;
   if(ball.position.y<.33){ball.position.y=.33;velocity.y*=-.48;velocity.x*=.86;velocity.z*=.86;angular.multiplyScalar(.78)}
   goalkeeper.target=Math.sin((performance.now()/1000)*(.8+difficulty()*1.5))*goalW*.36;goalkeeper.x=THREE.MathUtils.damp(goalkeeper.x,goalkeeper.target,difficulty()*5,dt);goalkeeper.y=1.05+Math.sin(performance.now()/700)*.03;
   // Goal plane collision/result.
   if(ball.position.z<-.2){const inside=Math.abs(ball.position.x)<goalW/2-.08 && ball.position.y>.08 && ball.position.y<goalH-.05;const saved=keeperSaveChance();if(saved){velocity.set(0,3.5,4);setTimeout(()=>finish(false),120)}else finish(inside)}
   if(ball.position.z<-5)finish(false);
 }
 if(aiming){ball.position.y=.33+Math.sin(performance.now()/250)*.025;camera.position.x=THREE.MathUtils.damp(camera.position.x,aimX*1.8,.8,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,4.6+aimY*1.2,.8,dt);camera.lookAt(aimX*1.7,1.6+aimY,-.4)}
 renderer.render(scene,camera)}animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
updateHUD();
