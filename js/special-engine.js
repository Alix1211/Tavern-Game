(function(root){
'use strict';
const S=typeof module!=='undefined'?require('./special-data.js'):root.TavernSpecial;
const D=typeof module!=='undefined'?require('./data.js'):root.TavernData;
const {Game}=typeof module!=='undefined'?require('./growth-engine.js'):root.TavernEngine;
const P=Game.prototype,base={reset:P.resetShift,spawn:P.spawn,menu:P.chooseMenu,step:P.step,checkout:P.checkout,settle:P.settle,snapshot:P.snapshot,restore:P.restore};
P.resetShift=function(){base.reset.call(this);this.totalRevenue=this.totalRevenue??0;this.regulars=this.regulars??[];this.specialCount=0;this.specialRevenue=0;this.specialEffect=null;};
P.tavernRank=function(){const earned=this.totalRevenue||0;return [...S.ranks].reverse().find(r=>earned>=r.revenue)||S.ranks[0];};
P.spawn=function(){const ok=base.spawn.call(this);if(ok){const g=this.guest(this.waitingId);g.servedMenus=0;g.specialUsed=false;g.regular=false;
if(this.day>1&&g.id%4===0&&this.regulars.length){const record=this.regulars[Math.floor(g.id/4)%this.regulars.length];g.sprite=record.sprite;g.name=D.GUEST_NAMES[g.sprite];g.favorite=record.staffId;g.regular=true;g.desired={...record.desired};}}
return ok;};
P.chooseMenu=function(id){const c=this.activeRequest(),r=base.menu.call(this,id);if(r.ok&&c)c.g.servedMenus=(c.g.servedMenus||0)+1;return r;};
P.specialQuote=function(courseId,ctx=this.activeRequest()){
const c=S.courses.find(x=>x.id===courseId);if(!ctx||!c)return {ok:false,reason:'서비스 요청이 없습니다.'};const {g,s,r}=ctx,q=S.tiers[c.stage-1],matches=this.matches(g,s).filter(x=>x.match).length;
let reason='';
if(r.type!=='service')reason='서비스 요청에서 선택하세요.';
else if(this.specialEffect)reason='현재 코스가 진행 중입니다.';
else if(c.staffId!==s.id||s.tendency!==c.tendency)reason='이 직원의 발현 성향과 맞지 않습니다.';
else if(g.specialUsed)reason='이번 방문에서 이미 이용했습니다.';
else if(!(g.extended||(g.regular&&s.id===g.favorite&&(g.servedMenus||0)>=1)))reason='연장 1회 후 가능 · 지명 단골은 메뉴 1회 후 가능';
else if(!g.desired||g.desired.tendency!==s.tendency)reason='손님의 원하는 성향과 맞지 않습니다.';
else if(matches<q.matches)reason=`궁합 ${matches}/3 · ${q.matches}개 이상 일치 필요`;
else if(s.level<q.level)reason=`직원 Lv.${q.level} 필요 · 현재 Lv.${s.level}`;
else if(s.stats[g.need]<q.ability||s.stats.charisma<q.charisma)reason=`${D.NEEDS.find(n=>n.id===g.need).name} ${q.ability} / 품격 ${q.charisma} 필요`;
else if(s.energy<c.energy)reason=`체력 ${c.energy} 필요 · 현재 ${Math.floor(s.energy)}`;
return {...c,tier:q,matches,ok:!reason,reason};
};
P.specialOptions=function(ctx=this.activeRequest()){if(!ctx)return [];return S.courses.filter(c=>c.staffId===ctx.s.id&&c.tendency===ctx.s.tendency).map(c=>this.specialQuote(c.id,ctx));};
P.chooseSpecial=function(id){const ctx=this.activeRequest(),q=this.specialQuote(id,ctx);if(!q.ok)return {ok:false,reason:q.reason};const {g,s,t}=ctx;
g.specialUsed=true;g.bill+=q.revenue;s.energy-=q.energy;s.stats[g.need]=Math.min(100,s.stats[g.need]+q.gain);s.affinity=Math.min(100,s.affinity+q.stage);this.addXP(s,6*q.stage);s.served++;g.satisfaction=Math.min(100,g.satisfaction+5+q.stage*3);this.specialCount++;this.specialRevenue+=q.revenue;
this.finishRequest(g,5);this.specialEffect={elapsed:0,duration:3.6,courseId:id,staffId:s.id,guestId:g.id,tableId:t.id,stage:q.stage,revenue:q.revenue,energy:q.energy,line:q.line,title:q.title,curtain:this.tavernRank().curtain};this.emit('specialStart',{...this.specialEffect});return {ok:true,...q};};
const paused=Object.getOwnPropertyDescriptor(P,'paused').get;
Object.defineProperty(P,'paused',{get(){return !!this.specialEffect||paused.call(this)},configurable:true});
P.step=function(dt){if(this.specialEffect){if(!this.manualPaused){this.specialEffect.elapsed+=Math.max(0,Math.min(dt,1));if(this.specialEffect.elapsed>=this.specialEffect.duration){const e=this.specialEffect;this.specialEffect=null;this.emit('specialComplete',e);}}return;}base.step.call(this,dt);};
P.checkout=function(g,automatic=false){const s=this.staff[this.tables[g.tableId]?.staffId??g.lastStaffId],ok=base.checkout.call(this,g,automatic);if(ok&&s&&g.satisfaction>=70){const record={sprite:g.sprite,staffId:s.id,desired:{...g.desired}};const at=this.regulars.findIndex(r=>r.sprite===g.sprite);if(at<0)this.regulars.push(record);else this.regulars[at]=record;this.regulars=this.regulars.slice(-30);}return ok;};
P.settle=function(){if(this.result)return this.result;const old=this.tavernRank().rank,r=base.settle.call(this);this.totalRevenue+=r.sales;r.specialCount=this.specialCount;r.specialRevenue=this.specialRevenue;r.tavernRank=this.tavernRank().rank;if(r.tavernRank>old)this.emit('rankUp',{rank:r.tavernRank});return r;};
const addXP=P.addXP;P.addXP=function(s,n){const old=s.level,r=addXP.call(this,s,n);if(s.level>old)this.emit('levelUp',{staffId:s.id,level:s.level});return r;};
P.snapshot=function(){const v=base.snapshot.call(this);v.hospitality={totalRevenue:this.totalRevenue,regulars:JSON.parse(JSON.stringify(this.regulars))};return v;};
P.restore=function(v){const h=v?.hospitality;if(h&&(!Number.isFinite(h.totalRevenue)||h.totalRevenue<0||!Array.isArray(h.regulars)||h.regulars.length>30||h.regulars.some(r=>!Number.isInteger(r.sprite)||r.sprite<0||r.sprite>=30||!Number.isInteger(r.staffId)||!D.STAFF[r.staffId]||!['S','M'].includes(r.desired?.tendency)||!D.STAFF.some(s=>s.appearance===r.desired.appearance)||!D.STAFF.some(s=>s.temperament===r.desired.temperament))))return false;
const ok=base.restore.call(this,v);if(ok){this.totalRevenue=h?.totalRevenue??0;this.regulars=JSON.parse(JSON.stringify(h?.regulars||[]));}return ok;};
// Prevent keyboard, direct API or stale modal actions during the curtain sequence.
for(const name of ['canSeatGuest','canPlaceStaff','unassignStaff','openGuest','openRequest','openBook','tableAction']){const old=P[name];P[name]=function(...args){if(this.specialEffect)return false;return old.apply(this,args);};}
const activeRequest=P.activeRequest;P.activeRequest=function(){return this.specialEffect?null:activeRequest.call(this);};
const reveal=P.revealTendency;P.revealTendency=function(id,t){const ok=reveal.call(this,id,t);if(ok)this.emit('revealTendency',{staffId:id,tendency:t});return ok;};
root.TavernEngine={Game};if(typeof module!=='undefined')module.exports={Game};
})(typeof window!=='undefined'?window:globalThis);
