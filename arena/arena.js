(() => {
  const stage=document.querySelector('#arena'),canvas=document.querySelector('#effects'),ctx=canvas.getContext('2d');
  const nodes={left:document.querySelector('#left'),right:document.querySelector('#right')};
  const state={hp:{left:100,right:100},mp:{left:100,right:100},paused:false,sound:true,busy:false,time:60,started:false};
  let particles=[],scene=null,last=0,audio=null;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function fit(){stage.style.zoom=Math.min(innerWidth/1280,innerHeight/720)}
  addEventListener('resize',fit);fit();
  function pose(side,p){nodes[side].querySelector('img').src=`assets/${ARENA_DATA.fighters[side].id}-${p}.png`}
  function bars(){for(const side of ['left','right'])for(const stat of ['hp','mp'])document.querySelector(`#${side}-${stat}`).style.clipPath=`inset(0 ${100-state[stat][side]}% 0 0)`}
  function sfx(type){
    if(!state.sound)return;
    audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();
    const t=audio.currentTime;
    for(let i=0;i<3;i++){
      const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);
      o.type=type==='magic'?'sine':type==='guard'?'triangle':'sawtooth';
      o.frequency.setValueAtTime((type==='magic'?760:type==='guard'?350:160)*(1+i*.21),t+i*.045);
      o.frequency.exponentialRampToValueAtTime(type==='magic'?1200:45,t+.22+i*.045);
      g.gain.setValueAtTime(.0001,t+i*.045);g.gain.exponentialRampToValueAtTime(.045,t+.01+i*.045);g.gain.exponentialRampToValueAtTime(.0001,t+.24+i*.045);o.start(t+i*.045);o.stop(t+.26+i*.045);
    }
  }
  function burst(x,y,color,n=65){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(110,850);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.9),max:.9,size:rand(2,8),color});}}
  function showCallout(name){const el=document.querySelector('#callout');el.src=`assets/${name}.png`;el.alt=name.toUpperCase();el.animate([{opacity:0,transform:'translate(-50%,-50%) scale(1.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.18},{opacity:1,transform:'translate(-50%,-50%) scale(1.05)',offset:.7},{opacity:0,transform:'translate(-50%,-50%) scale(1.2)'}],{duration:900});}
  function action(type){
    if(state.paused||state.busy)return;
    state.busy=true;state.started=true;
    pose('right',type);pose('left',type==='guard'?'magic':'guard');
    scene={type,t:0,hit:false,counter:false};
  }
  function updateScene(dt){
    if(!scene)return;
    scene.t+=dt;const t=scene.t,type=scene.type;
    if(t<.34){const p=Math.sin(Math.min(1,t/.34)*Math.PI/2);nodes.right.style.transform=type==='guard'?`scale(${1+.04*p})`:`translateX(${-95*p}px) rotate(${-5*p}deg)`;}
    if(t>=.34&&!scene.hit){scene.hit=true;sfx(type);burst(type==='guard'?980:370,340,ARENA_DATA.actions[type].color,type==='magic'?110:65);document.querySelector('#flash').animate([{opacity:type==='magic'?.8:.55},{opacity:0}],{duration:260});
      if(type!=='guard'){pose('left','hurt');state.hp.left=Math.max(0,state.hp.left-ARENA_DATA.actions[type].damage);state.mp.right=Math.max(0,state.mp.right-(type==='magic'?20:5));}else state.mp.right=Math.max(0,state.mp.right-15);bars();}
    if(t>.34&&t<.65){const p=Math.sin((t-.34)/.31*Math.PI);nodes.left.style.transform=type==='guard'?'':`translate(${-60*p}px,${-17*p}px) rotate(${-9*p}deg) scale(${1-.06*p},${1+.04*p})`;canvas.style.transform=`translate(${rand(-7,7)}px,${rand(-5,5)}px)`;}
    else canvas.style.transform='';
    if(t>.72&&!scene.counter){scene.counter=true;pose('left','magic');if(type!=='guard')pose('right','hurt');sfx(type==='guard'?'guard':'magic');burst(960,340,type==='guard'?'#73ffc9':'#8dffbc',45);state.hp.right=Math.max(0,state.hp.right-(type==='guard'?2:7));state.mp.left=Math.max(0,state.mp.left-8);bars();}
    if(t>.76&&t<1.02){const p=Math.sin((t-.76)/.26*Math.PI);nodes.right.style.transform=type==='guard'?`scale(${1+.035*p})`:`translate(${44*p}px,${-10*p}px) rotate(${7*p}deg)`;}
    if(t>=1.3){nodes.left.style.transform='';nodes.right.style.transform='';pose('left',ARENA_DATA.fighters.left.initial);pose('right',ARENA_DATA.fighters.right.initial);state.busy=false;scene=null;if(!state.hp.left||!state.hp.right){showCallout('ko');state.started=false;}}
  }
  function draw(dt){
    ctx.clearRect(0,0,1280,720);
    if(scene){const {t,type}=scene;
      if(type==='magic'&&t<.38){const p=Math.min(t/.34,1),x=950-580*p,y=330-Math.sin(p*Math.PI)*80;const g=ctx.createRadialGradient(x,y,0,x,y,95);g.addColorStop(0,'#fff');g.addColorStop(.2,'#e5bfff');g.addColorStop(.5,'#b64effaa');g.addColorStop(1,'#974bff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,95,0,7);ctx.fill();ctx.strokeStyle='#eacbff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,65,t*14,t*14+5);ctx.stroke();}
      if(type==='guard'&&t<1.1){ctx.save();ctx.translate(977,340);ctx.strokeStyle='#b4ffe5';ctx.fillStyle='#4cffb32a';ctx.shadowColor='#66ffd0';ctx.shadowBlur=25;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,0,125+Math.sin(t*12)*5,180,0,0,7);ctx.fill();ctx.stroke();ctx.restore();}
      if((type==='punch'||type==='kick')&&t>.23&&t<.54){ctx.save();ctx.globalAlpha=Math.sin((t-.23)/.31*Math.PI);ctx.strokeStyle=ARENA_DATA.actions[type].color;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=24;ctx.lineWidth=type==='kick'?17:12;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(940,290+i*35);ctx.lineTo(360+i*20,320+i*16);ctx.stroke();}ctx.restore();}
    }
    ctx.save();ctx.globalCompositeOperation='lighter';
    particles=particles.filter(p=>p.life>0);for(const p of particles){if(!state.paused){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;}ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill();}ctx.restore();
  }
  function tick(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;if(!state.paused){updateScene(dt);if(state.started){state.time=Math.max(0,state.time-dt);document.querySelector('#time').textContent=Math.ceil(state.time);if(!state.time)state.started=false;}}draw(dt);requestAnimationFrame(tick);}
  function pause(){state.paused=!state.paused;stage.classList.toggle('is-paused',state.paused);document.querySelector('#paused').hidden=!state.paused;document.querySelector('#pause').setAttribute('aria-pressed',state.paused);document.querySelectorAll('[data-action]').forEach(b=>b.disabled=state.paused);}
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));
  document.querySelector('#pause').onclick=pause;
  document.querySelector('#sound').setAttribute('aria-pressed','true');document.querySelector('#sound').onclick=()=>{state.sound=!state.sound;document.querySelector('#sound').setAttribute('aria-pressed',state.sound);document.querySelector('#sound').setAttribute('aria-label',state.sound?'효과음 끄기':'효과음 켜기');};
  document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen();try{await screen.orientation.lock('landscape')}catch{}}}catch{}};
  document.querySelector('#reset').onclick=()=>{scene=null;particles=[];state.busy=false;state.started=false;state.hp={left:100,right:100};state.mp={left:100,right:100};state.time=60;if(state.paused)pause();for(const side of ['left','right']){nodes[side].style.transform='';pose(side,ARENA_DATA.fighters[side].initial)}canvas.style.transform='';bars();document.querySelector('#time').textContent='60';showCallout('fight');};
  addEventListener('keydown',e=>{const a={a:'punch',s:'kick',d:'magic',f:'guard'}[e.key.toLowerCase()];if(a)action(a);if(e.code==='Space'){e.preventDefault();pause();}});
  window.ArenaPreview={state,action};requestAnimationFrame(tick);setTimeout(()=>showCallout('fight'),350);
})();
