(function(root,factory){
  const Engine=factory();
  if(typeof module==='object'&&module.exports)module.exports=Engine;
  else root.ArenaEngine=Engine;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const attacks=['punch','kick','magic'];
  const counter={punch:'kick',kick:'magic',magic:'punch'};
  return class ArenaEngine{
    constructor(random=Math.random){this.random=random;this.events=[];this.reset();}
    reset(){
      this.events=[];
      this.state={hp:{left:100,right:100},mp:{left:100,right:100},phase:'ready',elapsed:0,
        time:60,paused:false,enemy:null,choice:null,outcome:null,combo:0,rounds:0,
        responseWindow:1,result:null};
    }
    emit(type,extra={}){this.events.push({type,...extra});}
    drain(){return this.events.splice(0);}
    phase(name){this.state.phase=name;this.state.elapsed=0;this.emit('phase',{phase:name});}
    start(){if(this.state.phase!=='ready')return false;this.phase('wait');this.emit('start');return true;}
    choose(choice){
      const s=this.state;
      if(s.paused||s.phase!=='telegraph'||!['punch','kick','magic','guard'].includes(choice))return false;
      if(choice==='guard'&&s.mp.right<20)return false;
      s.choice=choice;this.resolve();return true;
    }
    resolve(){
      const s=this.state,c=s.choice;
      s.outcome=c==='guard'?'guard':c===counter[s.enemy]?'win':c===s.enemy?'draw':'lose';
      this.phase('resolve');this.emit('reveal',{enemy:s.enemy,choice:c,outcome:s.outcome});
    }
    impact(){
      const s=this.state;
      if(s.outcome==='win'){
        s.hp.left=Math.max(0,s.hp.left-(s.choice==='magic'?18:16));
        s.mp.right=Math.min(100,s.mp.right+10);s.combo++;
      }else if(s.outcome==='guard'){
        s.hp.right=Math.max(0,s.hp.right-3);s.mp.right-=20;s.combo=0;
      }else if(s.outcome==='draw'){
        s.hp.left=Math.max(0,s.hp.left-2);s.hp.right=Math.max(0,s.hp.right-2);
        s.mp.right=Math.min(100,s.mp.right+4);s.combo=0;
      }else{
        s.hp.right=Math.max(0,s.hp.right-(s.enemy==='punch'?16:14));
        s.mp.right=Math.min(100,s.mp.right+2);s.combo=0;
      }
      s.rounds++;s.responseWindow=Math.max(.65,1-s.combo*.04);
      this.phase('recovery');this.emit('impact',{enemy:s.enemy,choice:s.choice,outcome:s.outcome});
    }
    finish(){
      const s=this.state;s.result=s.hp.left===s.hp.right?'draw':s.hp.right>s.hp.left?'win':'lose';
      this.phase('finished');this.emit('finish',{result:s.result});
    }
    step(dt){
      const s=this.state;
      if(s.paused||s.phase==='ready'||s.phase==='finished')return;
      s.elapsed+=dt;s.time=Math.max(0,s.time-dt);
      if(s.phase==='wait'&&s.elapsed>=1.15){
        if(!s.time){this.finish();return;}
        s.enemy=attacks[Math.min(2,Math.floor(this.random()*3))];s.choice=null;s.outcome=null;
        this.phase('telegraph');this.emit('telegraph',{enemy:s.enemy});
      }else if(s.phase==='telegraph'&&s.elapsed>=s.responseWindow){s.choice=null;this.resolve();}
      else if(s.phase==='resolve'&&s.elapsed>=.28)this.impact();
      else if(s.phase==='recovery'&&s.elapsed>=.95){
        if(!s.hp.left||!s.hp.right||!s.time)this.finish();else this.phase('wait');
      }
    }
  };
});
