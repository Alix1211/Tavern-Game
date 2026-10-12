const assert=require('node:assert/strict');const Engine=require('../arena-auto-engine');
function rng(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}}
let wins={left:0,right:0,draw:0},specials=0,criticals=0;
for(let seed=1;seed<=160;seed++){
 const e=new Engine(rng(seed));e.start();let t=0,lastHP={left:100,right:100};
 while(e.state.phase!=='finished'&&t<110){e.step(.04);t+=.04;for(const event of e.drain()){if(event.type==='prepare'){assert.equal(e.state.hp.left,lastHP.left);assert.equal(e.state.hp.right,lastHP.right);if(event.special)specials++;if(event.critical)criticals++;}if(event.type==='hit')lastHP={...e.state.hp};}for(const side of ['left','right']){assert(e.state.hp[side]>=0&&e.state.hp[side]<=100);assert(e.state.mp[side]>=0&&e.state.mp[side]<=100);}}
 assert.equal(e.state.phase,'finished');wins[e.state.winner||'draw']++;
 const after=JSON.stringify(e.state);e.step(20);assert.equal(JSON.stringify(e.state),after);
}
assert(wins.left>10&&wins.right>10);assert(specials>50);assert(criticals>50);
const p=new Engine(rng(40));p.start();p.step(.7);p.state.paused=true;let frozen=JSON.stringify(p.state);p.step(100);assert.equal(JSON.stringify(p.state),frozen);p.reset();assert.equal(p.state.phase,'ready');assert.equal(p.state.hp.left,100);
const d1=new Engine(rng(71)),d2=new Engine(rng(71));d1.start();d2.start();for(let i=0;i<1000;i++){d1.step(.04);d2.step(.04);}assert.deepEqual(d1.state,d2.state);
console.log('PASS 160 seeded automatic battles; both sides win; specials/criticals; HP/MP bounds; damage only on hit; pause/reset/deterministic simulation',wins,{specials,criticals});
