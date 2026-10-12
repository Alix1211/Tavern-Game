(function(root){
'use strict';
const host=document.createElement('div');host.id='special-effect';host.setAttribute('aria-live','polite');document.getElementById('game').append(host);let current=null,wasActive=false;function lock(active){if(wasActive===active)return;wasActive=active;for(const el of document.getElementById('game').children)if(el!==host)el.inert=active;}
function draw(game){const e=game.specialEffect;if(!e){host.hidden=true;current=null;lock(false);return;}host.hidden=false;lock(true);
if(current!==e){current=e;host.innerHTML=`<section class="special-theatre" role="status"><h2>${root.TavernData.STAFF[e.staffId].name} · ${e.title}</h2><p class="special-line"></p><div class="curtain-stage"><div class="curtain-sheet"></div><div class="special-hearts">${[0,1,2,3,4].map(i=>`<img src="assets/icon-service.png" alt="" style="--i:${i}">`).join('')}</div></div><div class="special-reward"><img src="assets/comic-goldcoin.png" alt="">이용 금액 +${e.revenue}G · 체력 −${e.energy}</div><small>커튼 안은 상상에 맡깁니다 · 계산은 퇴장할 때!</small><button class="secondary" id="special-pause">일시정지</button></section>`;host.querySelector('#special-pause').onclick=()=>{game.manualPaused=!game.manualPaused;};host.querySelector('.special-line').textContent=e.line;host.querySelector('.curtain-sheet').style.backgroundImage=`url("assets/${e.curtain}")`;}
host.querySelector('#special-pause').textContent=game.manualPaused?'계속하기':'일시정지';const x=e.elapsed,frame=x<.75?Math.min(5,Math.floor(x/.15)):x>2.85?Math.max(0,5-Math.floor((x-2.85)/.15)):5;
host.querySelector('.curtain-sheet').style.backgroundPosition=`${-frame*384}px 0`;host.querySelector('.special-hearts').classList.toggle('rising',x>=.75&&x<2.85);host.querySelector('.special-reward').classList.toggle('visible',x>=1.5);
}
root.TavernEffects={draw};host.hidden=true;
})(window);
