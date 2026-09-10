(()=>{
'use strict';
// Safety net for mobile browsers: make menu buttons activate even when pointer/click events are intercepted.
const ids=['shootoutBtn','tournamentBtn','challengeBtn','easyKeeper','mediumKeeper','hardKeeper','skillsBtn','statsBtn','storeBtn','settingsBtn','bottomPlay','bottomRank','shootBtn','leftBtn','rightBtn','upBtn','downBtn','spinLeft','spinRight','nextBtn','restartBtn','backMenuBtn','resetBtn'];
const fire=e=>{
 const b=e.target.closest?.('button');
 if(!b||!ids.includes(b.id)||b.disabled)return;
 if(e.type==='pointerdown'||e.type==='touchstart'){
   if(b.dataset.mobileFired==='1')return;
   b.dataset.mobileFired='1';
   setTimeout(()=>delete b.dataset.mobileFired,260);
   b.click();
 }
};
document.addEventListener('pointerdown',fire,true);
document.addEventListener('touchstart',fire,{capture:true,passive:false});
})();
