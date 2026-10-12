(() => {
  const stage=document.querySelector('#arena'),canvas=document.querySelector('#effects'),ctx=canvas.getContext('2d');
  const nodes={left:document.querySelector('#left'),right:document.querySelector('#right')};
  const engine=new ArenaEngine(),state=engine.state;
  const tell=document.querySelector('#tell'),choice=document.querySelector('#choice'),startButton=document.querySelector('#start');
  let particles=[],scene=null,last=0,audio=null,sound=true,hiddenPause=false,calloutAnimation=null;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function fit(){stage.style.zoom=Math.min(innerWidth/1280,innerHeight/720)}
  addEventListener('resize',fit);fit();
  function pose(side,p){nodes[side].querySelector('img').src=`assets/${ARENA_DATA.fighters[side].id}-${p}.png`}
  function bars(){for(const side of ['left','right'])for(const stat of ['hp','mp'])document.querySelector(`#${side}-${stat}`).style.clipPath=`inset(0 ${100-engine.state[stat][side]}% 0 0)`}
  function audioReady(){if(!sound)return;audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}
  function sfx(type){
    if(!sound||!audio)return;
    const t=audio.currentTime;
    for(let i=0;i<3;i++){
      const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);
      o.type=type==='magic'?'sine':type==='guard'?'triangle':'sawtooth';
      o.frequency.setValueAtTime((type==='magic'?760:type==='guard'?350:160)*(1+i*.21),t+i*.045);
      o.frequency.exponentialRampToValueAtTime(type==='magic'?1200:45,t+.22+i*.045);
      g.gain.setValueAtTime(.0001,t+i*.045);g.gain.exponentialRampToValueAtTime(.04,t+.01+i*.045);g.gain.exponentialRampToValueAtTime(.0001,t+.24+i*.045);o.start(t+i*.045);o.stop(t+.26+i*.045);
    }
  }
  function burst(x,y,color,n=65){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(110,850);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.85),max:.85,size:rand(2,8),color});}}
  function showCallout(name){const el=document.querySelector('#callout');el.src=`assets/${name}.png`;el.alt=name.toUpperCase();calloutAnimation?.cancel();calloutAnimation=el.animate([{opacity:0,transform:'translate(-50%,-50%) scale(1.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.18},{opacity:1,transform:'translate(-50%,-50%) scale(1.05)',offset:.7},{opacity:0,transform:'translate(-50%,-50%) scale(1.2)'}],{duration:1000});}
  function controls(){const s=engine.state;for(const b of document.querySelectorAll('[data-action]'))b.disabled=s.paused||s.phase!=='telegraph'||(b.dataset.action==='guard'&&s.mp.right<20);}
  function action(type){audioReady();if(engine.choose(type))events();}
  function events(){
    for(const e of engine.drain()){
      const s=engine.state;
      if(e.type==='phase'){
        stage.dataset.phase=e.phase;
        if(e.phase==='wait'){tell.hidden=true;choice.hidden=true;scene=null;for(const side of ['left','right']){nodes[side].style.transform='';pose(side,'idle');}}
      }else if(e.type==='start'){startButton.hidden=true;showCallout('fight');}
      else if(e.type==='telegraph'){
        pose('left',e.enemy);tell.querySelector('img').src=`assets/${e.enemy}.png`;
        tell.querySelector('img').alt={punch:'상대 주먹',kick:'상대 발차기',magic:'상대 마법'}[e.enemy];tell.hidden=false;
      }else if(e.type==='reveal'){
        tell.hidden=true;choice.hidden=!e.choice;
        if(e.choice){choice.src=`assets/${e.choice}.png`;pose('right',e.choice);}else pose('right','idle');
        const attacker=e.outcome==='win'?'right':'left';
        scene={t:0,type:e.outcome==='guard'?'guard':attacker==='right'?e.choice:e.enemy,
          attacker,outcome:e.outcome,impact:false};
      }else if(e.type==='impact'){
        bars();scene.impact=true;
        const x=e.outcome==='win'?350:e.outcome==='draw'?640:955;
        burst(x,335,ARENA_DATA.actions[scene.type].color,e.outcome==='guard'?42:85);
        sfx(scene.type);
        if(e.outcome==='win')pose('left','hurt');
        else if(e.outcome==='lose')pose('right','hurt');
        else if(e.outcome==='draw'){pose('left','guard');pose('right','guard');}
        document.querySelector('#flash').animate([{opacity:e.outcome==='guard'?.22:.55},{opacity:0}],{duration:180});
      }else if(e.type==='finish'){
        tell.hidden=true;choice.hidden=true;scene=null;
        for(const side of ['left','right'])nodes[side].style.transform='';
        pose('right',e.result==='lose'?'hurt':'idle');pose('left',e.result==='win'?'hurt':'idle');
        showCallout(e.result==='win'?'win':'ko');startButton.classList.add('again');startButton.hidden=false;
      }
    }
    controls();
  }
  function updateScene(dt){
    if(!scene)return;
    scene.t+=dt;const {t,type,attacker,outcome}=scene;
    const defender=attacker==='right'?'left':'right',sign=attacker==='right'?-1:1;
    if(t<.28){const p=Math.sin(Math.min(1,t/.28)*Math.PI/2);nodes[attacker].style.transform=outcome==='guard'?'':`translate(${sign*70*p}px,${-10*p}px) rotate(${sign*4*p}deg)`;}
    if(t>=.28&&t<.58){const p=Math.sin((t-.28)/.3*Math.PI);
      if(outcome==='guard')nodes.right.style.transform=`scale(${1+.025*p})`;
      else if(outcome==='draw'){nodes.left.style.transform=`translateX(${-25*p}px)`;nodes.right.style.transform=`translateX(${25*p}px)`;}
      else nodes[defender].style.transform=`translate(${-sign*42*p}px,${-12*p}px) rotate(${-sign*4*p}deg) scale(${1-.045*p},${1+.03*p})`;
      canvas.style.transform=`translate(${rand(-5,5)}px,${rand(-4,4)}px)`;
    }else canvas.style.transform='';
    if(t>.7){nodes.left.style.transform='';nodes.right.style.transform='';}
  }
  function draw(dt){
    ctx.clearRect(0,0,1280,720);
    if(scene){const {t,type,attacker,outcome}=scene,from=attacker==='right'?970:320,to=attacker==='right'?350:955;
      if(type==='magic'&&t<.33){const p=Math.min(t/.28,1),x=from+(to-from)*p,y=330-Math.sin(p*Math.PI)*60;const g=ctx.createRadialGradient(x,y,0,x,y,95);g.addColorStop(0,'#fff');g.addColorStop(.2,'#e5bfff');g.addColorStop(.5,'#b64effaa');g.addColorStop(1,'#974bff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,95,0,7);ctx.fill();ctx.strokeStyle='#eacbff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,65,t*14,t*14+5);ctx.stroke();}
      if(outcome==='guard'&&t<.95){ctx.save();ctx.translate(977,340);ctx.strokeStyle='#b4ffe5';ctx.fillStyle='#4cffb32a';ctx.shadowColor='#66ffd0';ctx.shadowBlur=25;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,0,125+Math.sin(t*12)*5,180,0,0,7);ctx.fill();ctx.stroke();ctx.restore();}
      if((type==='punch'||type==='kick')&&t>.16&&t<.46){ctx.save();ctx.globalAlpha=Math.sin((t-.16)/.3*Math.PI);ctx.strokeStyle=ARENA_DATA.actions[type].color;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=24;ctx.lineWidth=type==='kick'?17:12;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(from,290+i*35);ctx.lineTo(to,320+i*16);ctx.stroke();}ctx.restore();}
    }
    ctx.save();ctx.globalCompositeOperation='lighter';
    particles=particles.filter(p=>p.life>0);for(const p of particles){if(!engine.state.paused){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;}ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill();}ctx.restore();
  }
  function tick(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;
    if(!engine.state.paused&&!document.hidden){updateScene(dt);engine.step(dt);events();}
    const s=engine.state;document.querySelector('#time').textContent=Math.ceil(s.time);
    if(s.phase==='telegraph')document.querySelector('#deadline').style.strokeDashoffset=283*Math.min(1,s.elapsed/s.responseWindow);
    draw(dt);requestAnimationFrame(tick);
  }
  function pause(){engine.state.paused=!engine.state.paused;stage.classList.toggle('is-paused',engine.state.paused);document.querySelector('#paused').hidden=!engine.state.paused;document.querySelector('#pause').setAttribute('aria-pressed',engine.state.paused);if(engine.state.paused)calloutAnimation?.pause();else calloutAnimation?.play();controls();}
  function reset(){engine.reset();scene=null;particles=[];canvas.style.transform='';calloutAnimation?.cancel();stage.classList.remove('is-paused');stage.dataset.phase='ready';document.querySelector('#paused').hidden=true;document.querySelector('#pause').setAttribute('aria-pressed','false');tell.hidden=true;choice.hidden=true;for(const side of ['left','right']){nodes[side].style.transform='';pose(side,'idle');}bars();document.querySelector('#time').textContent='60';startButton.classList.remove('again');startButton.hidden=false;controls();}
  startButton.onclick=()=>{audioReady();if(engine.state.phase==='finished')reset();engine.start();events();};
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));
  document.querySelector('#pause').onclick=pause;
  document.querySelector('#sound').setAttribute('aria-pressed','true');document.querySelector('#sound').onclick=()=>{sound=!sound;document.querySelector('#sound').setAttribute('aria-pressed',sound);document.querySelector('#sound').setAttribute('aria-label',sound?'효과음 끄기':'효과음 켜기');if(sound)audioReady();};
  document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen();try{await screen.orientation.lock('landscape')}catch{}}}catch{}};
  document.querySelector('#reset').onclick=reset;
  addEventListener('keydown',e=>{if(e.repeat)return;const a={a:'punch',s:'kick',d:'magic',f:'guard'}[e.key.toLowerCase()];if(a){e.preventDefault();action(a);}if(e.code==='Space'){e.preventDefault();if(engine.state.phase==='ready')startButton.click();else pause();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenPause=!engine.state.paused;if(hiddenPause)pause();}else if(hiddenPause){hiddenPause=false;if(engine.state.paused)pause();}});
  const preloads=[];for(const id of ['elf','darkelf'])for(const p of ['idle','punch','kick','magic','guard','hurt']){const im=new Image();im.src=`assets/${id}-${p}.png`;preloads.push(im);}
  window.ArenaPreview={get state(){return engine.state},engine,action};stage.dataset.phase='ready';controls();requestAnimationFrame(tick);
})();
