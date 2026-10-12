const assert=require('node:assert/strict');
const Engine=require('../arena-engine.js');
const counters={punch:'kick',kick:'magic',magic:'punch'};
function tell(e){e.start();e.step(1.15);assert.equal(e.state.phase,'telegraph');}
for(const [i,enemy] of ['punch','kick','magic'].entries()){
 const e=new Engine(()=>i/3+.01);tell(e);assert.equal(e.state.enemy,enemy);assert(e.choose(counters[enemy]));assert.equal(e.choose('guard'),false);e.step(.28);assert.equal(e.state.hp.right,100);assert(e.state.hp.left<100);const once=e.state.hp.left;e.step(.1);assert.equal(e.state.hp.left,once);e.step(1);assert.equal(e.state.phase,'wait');
}
const miss=new Engine(()=>0);tell(miss);miss.step(1);assert.equal(miss.state.outcome,'lose');miss.step(.28);assert.equal(miss.state.hp.right,84);
const wrong=new Engine(()=>0);tell(wrong);wrong.choose('magic');wrong.step(.28);assert.equal(wrong.state.hp.right,84);assert.equal(wrong.state.hp.left,100);
const draw=new Engine(()=>0);tell(draw);draw.choose('punch');draw.step(.28);assert.equal(draw.state.hp.left,98);assert.equal(draw.state.hp.right,98);
const guard=new Engine(()=>0);tell(guard);guard.choose('guard');guard.step(.28);assert.equal(guard.state.hp.right,97);assert.equal(guard.state.mp.right,80);assert.equal(guard.state.hp.left,100);
const low=new Engine(()=>0);tell(low);low.state.mp.right=19;assert.equal(low.choose('guard'),false);assert.equal(low.state.phase,'telegraph');assert(low.choose('kick'));
const paused=new Engine(()=>0);tell(paused);paused.state.paused=true;const before=JSON.stringify(paused.state);paused.step(10);assert.equal(paused.choose('kick'),false);assert.equal(JSON.stringify(paused.state),before);
const win=new Engine(()=>0);win.start();for(let i=0;i<7;i++){win.step(1.15);win.choose('kick');win.step(.28);win.step(.95);}assert.equal(win.state.result,'win');assert.equal(win.state.hp.left,0);const end=JSON.stringify(win.state);win.step(30);assert.equal(JSON.stringify(win.state),end);win.reset();assert.equal(win.state.phase,'ready');assert.equal(win.state.hp.left,100);
const lose=new Engine(()=>0);lose.start();while(lose.state.phase!=='finished'){lose.step(1.15);lose.step(1);lose.step(.28);lose.step(.95);}assert.equal(lose.state.result,'lose');
const timeout=new Engine(()=>0);timeout.start();timeout.state.time=.2;timeout.step(1.15);assert.equal(timeout.state.result,'draw');
console.log('PASS: all counters, miss, wrong, draw, guard MP, one choice, one damage application, pause, win/loss/time limit, reset');
