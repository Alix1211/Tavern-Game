"""Rebuild the 14 original DSP sound effects. Requires numpy, scipy and ffmpeg.
Provided voices/BGM and the mixed special cue are separate source assets.
"""
import numpy as np
from scipy.io.wavfile import write
from scipy.signal import butter,sosfilt
from pathlib import Path
import subprocess
R=44100; rng=np.random.default_rng(71012); out=Path(__file__).resolve().parents[1]/'assets/audio';out.mkdir(parents=True,exist_ok=True)
def tone(f,d=.25,amp=.35,decay=9):
 t=np.arange(int(R*d))/R;return amp*np.sin(2*np.pi*f*t)*np.exp(-decay*t)*np.minimum(t/.006,1)
def sweep(a,b,d,amp=.35):
 t=np.arange(int(R*d))/R;return amp*np.sin(2*np.pi*(a*t+(b-a)*t*t/(2*d)))*np.sin(np.pi*t/d)**1.5
def noise(d,amp=.3,f=3000):
 t=np.arange(int(R*d))/R;n=sosfilt(butter(2,f,fs=R,output='sos'),rng.uniform(-1,1,len(t)));return amp*n*np.exp(-7*t)*np.minimum(t/.005,1)
def mix(parts,d):
 a=np.zeros(int(R*d));
 for at,v in parts:
  i=int(at*R);a[i:min(len(a),i+len(v))]+=v[:max(0,min(len(v),len(a)-i))]
 return a
def save(name,a):
 a=a/max(1,np.max(np.abs(a))*1.1);p=Path('/tmp')/(name+'.wav');write(p,R,(a*30000).astype(np.int16));subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-codec:a','libmp3lame','-b:a','96k',str(out/('sfx-'+name+'.mp3'))],check=True)
save('bell',mix([(0,tone(1568,.55,.22,8)),(0,tone(2352,.5,.12,10)),(.15,tone(2093,.5,.2,8))],.8))
save('door',mix([(0,noise(.18,.9,900)),(.06,sweep(140,280,.32,.18)),(.38,noise(.1,.55,1500)),(.42,tone(1760,.55,.15,7)),(.42,tone(2640,.55,.08,9))],1.05))
save('glass',mix([(0,noise(.04,.6,6000)),(0,tone(2900,.55,.2,10)),(.02,tone(4100,.5,.08,13)),(.18,tone(3400,.35,.1,12))],.7))
save('plate',mix([(0,noise(.07,.5,4500)),(0,tone(890,.3,.2,15)),(.11,tone(1270,.3,.16,16)),(.22,noise(.05,.25,4000))],.55))
save('mug',mix([(0,noise(.12,.7,1700)),(0,tone(340,.32,.3,14)),(.08,tone(690,.4,.14,15))],.6))
save('coins',mix([(i*.07,tone(1700+i%3*390,.3,.11,13)+tone(2700+i%4*200,.3,.065,17)) for i in range(10)],1.1))
save('fanfare',mix([(i*.12,tone(f,.5,.17,5)+tone(f*1.5,.5,.06,7)) for i,f in enumerate([523,659,784,1047])],1.1))
save('fail',mix([(0,sweep(480,130,.6,.3)),(.58,noise(.08,.45,1300)),(.65,tone(110,.3,.3,13))],1))
save('whip',mix([(0,noise(.3,.7,8000)*np.linspace(.1,2,int(R*.3))),(.25,noise(.06,.9,6000)),(.28,tone(160,.15,.25,30))],.5))
save('impact',mix([(0,noise(.1,.8,2500)),(0,sweep(160,60,.18,.5)),(.15,sweep(500,850,.25,.2))],.55))
save('curtain',mix([(0,noise(.85,.3,2500)*np.linspace(.1,3,int(R*.85))),(.12,sweep(250,180,.55,.07)),(.8,noise(.1,.3,1200))],1))
save('heart',mix([(0,sweep(450,950,.3,.2)),(.18,tone(1318,.45,.15,8)),(.32,tone(1760,.4,.12,9))],.8))
save('grumble',mix([(0,sweep(130,95,.23,.22)),(.24,sweep(115,90,.27,.25)),(.52,sweep(140,100,.25,.22))],.9))
save('closing',mix([(i*.18,tone(f,.65,.16,5)+tone(f*.5,.65,.07,7)) for i,f in enumerate([784,659,523,392,523])],1.65))
print('14 original synthesized SFX produced')
