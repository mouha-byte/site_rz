import {clamp,smooth,ease,activity,spring,rotate,project} from './star-physics.mjs';
import {SERVICES,serviceOpacity,cameraAt,idleReturn} from './journey.mjs?v=d8dea02873';

const root=document.querySelector('#rz-cosmic');
const canvas=root.querySelector('#cosmic-space');
const ctx=canvas.getContext('2d',{alpha:false});
const journey=root.querySelector('#cosmic-journey');
const stage=journey.querySelector('.stage');
const intro=root.querySelector('.intro');
const panels=[...root.querySelectorAll('[data-service]')];
const shade=root.querySelector('.service-shade');
const navigation=root.querySelector('.journey-nav');
const stopButtons=[...root.querySelectorAll('[data-stop]')];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let inView=true;
let leaving=false;
async function enterSite(){
  if(leaving)return;
  leaving=true;
  const veil=document.querySelector('.cosmic-exit');
  try{
    await veil.animate([{opacity:0},{opacity:1}],{duration:380,easing:'ease-out',fill:'forwards'}).finished;
  }catch{}
  try{sessionStorage.setItem('rz-cosmic-arrival',String(Date.now()));}catch{}
  location.replace('/accueil/');
}
function wake(){
  if(!frameId&&inView&&!document.hidden&&!reducedMotion.matches){last=performance.now()/1000;frameId=requestAnimationFrame(draw);}
}
let seed=7281;
const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
let w=innerWidth,h=innerHeight,aspect=1344/752;
let progress=0,target=0,time=0,last=0,frameId=0;
let formationStart=null;
let paused=reducedMotion.matches;
const pointer={x:w/2,y:h/2,tx:w/2,ty:h/2,active:false,strength:0,lastMove:-Infinity};
const view={yaw:0,pitch:0,targetYaw:0,targetPitch:0,dragging:false,pointerId:null,lastX:0,lastY:0,lastInput:-Infinity};
let stars=[],anchors=[];
function selectAnchors(){
  const candidates=stars.filter(star=>!star.background&&!star.orbit),used=new Set();
  anchors=SERVICES.map(service=>{
    let closest,minimum=Infinity;
    for(const star of candidates){
      const distance=Math.hypot((star.u-service.uv[0])*aspect,star.v-service.uv[1]);
      if(distance<minimum&&!used.has(star)){minimum=distance;closest=star;}
    }
    if(closest){used.add(closest);closest.giant=true;closest.bright=true;closest.size=3.8;closest.alpha=1;closest.color=2;}
    return closest||{u:service.uv[0],v:service.uv[1],z:0};
  });
}
function cameraStops(unit){
  return anchors.map((star,index)=>{
    const destinationX=w<=700?w*.5:SERVICES[index].side==='right'?w*.245:w*.755;
    const destinationY=w<=700?h*(h<=730?.2:.24):h*.43;
    const distance=.3,scale=3*unit/distance;
    return {x:(star.u-.5)*aspect-(destinationX-w*.5)/scale,
      y:star.v-.5-(destinationY-h*.375)/scale,z:star.z+distance};
  });
}
function updatePanels(){
  let highest=0,current=-1;
  panels.forEach((panel,index)=>{
    const opacity=serviceOpacity(progress,index),visible=opacity>.01;
    panel.style.opacity=opacity;panel.style.visibility=visible?'visible':'hidden';
    panel.style.transform=`translateY(calc(-50% + ${(1-opacity)*18}px))`;
    if(panel.inert===visible||!panel.hasAttribute('aria-hidden')){
      panel.inert=!visible;panel.setAttribute('aria-hidden',String(!visible));
    }
    if(opacity>highest){highest=opacity;current=index;}
  });
  shade.style.opacity=highest;shade.classList.toggle('left',current>=0&&SERVICES[current].side==='left');
  const visible=progress>.075&&progress<.895;
  navigation.style.opacity=visible?1:0;navigation.style.visibility=visible?'visible':'hidden';navigation.inert=!visible;
  stopButtons.forEach(item=>{
    if(Number(item.dataset.stop)===current)item.setAttribute('aria-current','step');
    else item.removeAttribute('aria-current');
  });
}
stopButtons.forEach(item=>item.addEventListener('click',()=>{
  const stop=SERVICES[Number(item.dataset.stop)];
  if(reducedMotion.matches){panels[Number(item.dataset.stop)].scrollIntoView({behavior:'instant'});return;}
  scrollTo({top:(journey.getBoundingClientRect().top+scrollY)+stop.position*(journey.offsetHeight-h),behavior:reducedMotion.matches?'instant':'smooth'});
}));

// Individually rendered stellar cores and broad, low-opacity photographic halos.
const palette=[[143,195,255],[193,225,255],[246,247,255],[255,226,198],[255,190,132]];
const sprites=palette.map(rgb=>{
  const sprite=document.createElement('canvas');sprite.width=sprite.height=96;
  const brush=sprite.getContext('2d');
  const glow=brush.createRadialGradient(48,48,0,48,48,48);
  glow.addColorStop(0,'rgba(255,255,255,1)');
  glow.addColorStop(.035,'rgba(255,255,255,1)');
  glow.addColorStop(.085,`rgba(${rgb},.96)`);
  glow.addColorStop(.18,`rgba(${rgb},.35)`);
  glow.addColorStop(.4,`rgba(${rgb},.065)`);
  glow.addColorStop(1,`rgba(${rgb},0)`);
  brush.fillStyle=glow;brush.fillRect(0,0,96,96);return sprite;
});

function particle(u,v,size,color,alpha,background=false,orbit=false) {
  const rank=random(),depth=random();
  // Most stars are small points. A few bright stars carry much larger, softer halos.
  const giant=!background && !orbit && rank>.978;
  const bright=giant || rank>.86;
  const visualSize=giant?2.4+random()*2.2:bright?1.25+random()*1.3:.3+random()*.9;
  return {u,v,color,background,orbit,depth,giant,bright,
    size:visualSize*(background?.65:1),
    alpha:giant?1:bright?.9:clamp(alpha*(.44+random()*.5),.16,.8),
    phase:random()*Math.PI*2,speed:.18+random()*.21,
    // A volumetric monogram, with stars on both faces and throughout its depth.
    z:(depth-.5)*.25,dx:0,dy:0,vx:0,vy:0};
}
const background=Array.from({length:760},()=>particle(random(),random(),1,random()<.12?4:random()<.45?0:2,.14+random()*.24,true));
const orbits=Array.from({length:180},()=>particle(random(),random(),.5,random()<.18?4:1,.25,false,true));
stars=[...background,...orbits];selectAnchors();
fetch(new URL('./star-map.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Star map unavailable');return r.json();}).then(map=>{
  aspect=map.aspect;
  const logoStars=map.stars.map(values=>Object.assign(particle(...values),{
    scatterX:random()-.5,scatterY:random()-.5,scatterZ:(random()-.5)*.8
  }));
  stars=[...background,...orbits,...logoStars];formationStart=time;selectAnchors();
  wake();
}).catch(()=>{
  const logo=new Image();
  logo.onload=()=>{
    const mask=document.createElement('canvas');mask.width=mask.height=700;
    const source=mask.getContext('2d',{willReadFrequently:true});source.drawImage(logo,0,0,700,700);
    const {data}=source.getImageData(0,0,700,700),recovered=[];
    for(let y=100;y<610;y+=5)for(let x=130;x<580;x+=5){const i=(y*700+x)*4;
      if(data[i+3]>100&&data[i+2]>100&&data[i+2]>data[i]*1.15&&random()<.65)
        recovered.push(particle(.5+(x/700-.5)/aspect,y/700,1,1,.7));}
    stars=[...background,...orbits,...recovered];formationStart=time-4;selectAnchors();wake();
  };logo.src=new URL('./logo.png',import.meta.url).href;
});

function updateScroll(){target=clamp((scrollY-(journey.getBoundingClientRect().top+scrollY))/Math.max(1,journey.offsetHeight-h));wake();}
function resize(){
  if(reducedMotion.matches){updateScroll();return;}
  w=stage.clientWidth||innerWidth;h=stage.clientHeight||innerHeight;const ratio=Math.min(devicePixelRatio||1,w<=700?1.5:2);
  const width=Math.round(w*ratio),height=Math.round(h*ratio);
  if(canvas.width!==width||canvas.height!==height){
    canvas.width=width;canvas.height=height;ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  updateScroll();}
resize();addEventListener('resize',resize);visualViewport?.addEventListener('resize',resize);
addEventListener('scroll',updateScroll,{passive:true});

addEventListener('pointermove',event=>{
  if(!inView||paused||!root.contains(event.target))return;
  const now=performance.now()/1000;
  const moved=Math.hypot(event.clientX-pointer.tx,event.clientY-pointer.ty)>.4;
  if(!pointer.active){pointer.x=event.clientX;pointer.y=event.clientY;}
  if(moved)pointer.lastMove=now;
  pointer.tx=event.clientX;pointer.ty=event.clientY;pointer.active=true;
  if(view.dragging&&event.pointerId===view.pointerId&&progress<.065){
    view.lastInput=now;
    view.targetYaw+=(event.clientX-view.lastX)*.008;
    view.targetPitch=clamp(view.targetPitch+(event.clientY-view.lastY)*.006,-1.25,1.25);
    view.lastX=event.clientX;view.lastY=event.clientY;
  }
  wake();
},{passive:true});
canvas.addEventListener('pointerdown',event=>{
  if(paused||event.button!==0||progress>.065)return;
  view.dragging=true;view.pointerId=event.pointerId;view.lastX=event.clientX;view.lastY=event.clientY;
  view.lastInput=performance.now()/1000;pointer.lastMove=-Infinity;
  canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');
});
function release(event){
  if(view.pointerId!==null && (!event||event.pointerId===view.pointerId)){
    if(canvas.hasPointerCapture(view.pointerId))canvas.releasePointerCapture(view.pointerId);
    view.dragging=false;view.pointerId=null;canvas.classList.remove('dragging');
    view.lastInput=performance.now()/1000-.35;
  }
  if(event?.pointerType==='touch')pointer.active=false;
}
addEventListener('pointerup',release,{passive:true});
addEventListener('pointercancel',event=>{release(event);pointer.active=false;});
canvas.addEventListener('lostpointercapture',()=>{view.dragging=false;canvas.classList.remove('dragging');});
document.documentElement.addEventListener('pointerleave',()=>{pointer.active=false;});
addEventListener('blur',()=>{release();pointer.active=false;});
canvas.addEventListener('keydown',event=>{
  if(paused||progress>.065)return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
  event.preventDefault();view.lastInput=performance.now()/1000;
  if(event.key==='Home'){view.targetYaw=0;view.targetPitch=0;}
  if(event.key==='ArrowLeft')view.targetYaw-=.18;
  if(event.key==='ArrowRight')view.targetYaw+=.18;
  if(event.key==='ArrowUp')view.targetPitch=clamp(view.targetPitch-.12,-1.25,1.25);
  if(event.key==='ArrowDown')view.targetPitch=clamp(view.targetPitch+.12,-1.25,1.25);
});
function syncMotion(){
  root.classList.toggle('reduced-motion',reducedMotion.matches);
  if(reducedMotion.matches){
    cancelAnimationFrame(frameId);frameId=0;
    intro.inert=false;
    panels.forEach(panel=>{panel.inert=false;panel.removeAttribute('aria-hidden');});
  }else{updateScroll();wake();}
}
reducedMotion.addEventListener('change',event=>{paused=event.matches;syncMotion();});syncMotion();

function draw(nowMs){
  frameId=0;
  if(!inView||document.hidden||reducedMotion.matches)return;
  const now=nowMs/1000,dt=Math.min(now-last||1/60,.04);last=now;
  if(!paused){
    time+=dt;pointer.x+=(pointer.tx-pointer.x)*ease(14,dt);pointer.y+=(pointer.ty-pointer.y)*ease(14,dt);
    const desired=view.dragging?0:activity(pointer.lastMove,now,pointer.active);
    pointer.strength+=(desired-pointer.strength)*ease(desired>pointer.strength?12:5,dt);
  }
  // Stillness restores the front view, including when the mouse button remains held.
  const returning=idleReturn(view.lastInput,now);
  if(returning){const turns=Math.round(view.targetYaw/(Math.PI*2))*Math.PI*2;view.targetYaw-=turns;view.yaw-=turns;view.targetYaw*=1-ease(4.8,dt);view.targetPitch*=1-ease(4.8,dt);}
  const rotationEase=returning?10:view.dragging?14:5;
  view.yaw+=(view.targetYaw-view.yaw)*ease(rotationEase,dt);
  view.pitch+=(view.targetPitch-view.pitch)*ease(rotationEase,dt);
  progress+=(target-progress)*ease(9,dt);
  const fade=1-smooth((progress-.9)/.085),fog=smooth((progress-.865)/.13);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#010307';ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='lighter';
  const hero=1-smooth(progress/.08);
  // Leave room around the mobile logo, including its glow and gentle rotation.
  // Blend back to the supplied service camera as the visitor scrolls.
  const journeyUnit=Math.min(w*1.42/aspect,h*.72);
  const gutter=clamp(w*.06,20,32);
  const heroFit=w<=700
    ? Math.min((w-gutter*2)/.9,(h-gutter*2)/.94)
    : Math.min(w*1.3/.8,h*.95/.82);
  const heroUnit=heroFit*.8;
  const unit=journeyUnit+(heroUnit-journeyUnit)*hero;
  const camera=cameraAt(progress,cameraStops(unit));
  const centerY=h*(.375+.125*hero);
  const radius=clamp(Math.min(w,h)*.078,34,68);
  const parallaxX=(pointer.x/w-.5)*2*pointer.strength,parallaxY=(pointer.y/h-.5)*2*pointer.strength;
  const yaw=(view.yaw+Math.sin(time*.09)*.06)*hero,pitch=(view.pitch+Math.sin(time*.075)*.035)*hero;
  if(fade>.001)for(const star of stars){
    let x,y,z;
    if(star.background){
      const angle=time*(.005+star.depth*.006),bx=(star.u-.5)*w/unit*1.75,by=(star.v-.5)*h/unit*1.75;
      x=bx*Math.cos(angle)-by*Math.sin(angle);y=bx*Math.sin(angle)+by*Math.cos(angle);z=(star.depth-.5)*1.5-1;
    }else if(star.orbit){
      const angle=star.phase+time*(.07+star.depth*.035),radius=.48+star.depth*.19;
      x=Math.cos(angle)*radius;y=Math.sin(angle)*radius*.3;z=Math.sin(angle)*radius*.62;
    }else{
      // Small continuous elliptical orbits give the entire volume a living, galactic flow.
      const angle=time*star.speed+star.phase,radius=.004+star.depth*.007;
      x=(star.u-.5)*aspect+Math.cos(angle)*radius;
      y=star.v-.5+Math.sin(angle)*radius*.8;
      z=star.z+Math.sin(angle*.7)*.013;
      if(formationStart!==null&&star.scatterX!==undefined){
        // Start throughout the screen, then converge into the original logo volume.
        const assembled=Math.max(smooth((time-formationStart-.25-star.depth*.2)/1.65),smooth(progress/.06));
        const loose=1-assembled;
        x=x*assembled+star.scatterX*(w/unit)*1.8*loose;
        y=y*assembled+star.scatterY*(h/unit)*1.35*loose;
        z=z*assembled+star.scatterZ*loose;
      }
    }
    const point=rotate(x,y,z,yaw*(star.background?.13:1),pitch*(star.background?.13:1));
    const screen=project(point[0]-camera.x,point[1]-camera.y,point[2],camera.z,unit,w*.5,star.background?h*.5:centerY);
    if(!screen)continue;
    if(!paused){
      const mx=screen.x-pointer.x,my=screen.y-pointer.y,distance=Math.hypot(mx,my);
      const influence=(1-smooth(distance/radius))*pointer.strength,angle=distance>.01?Math.atan2(my,mx):star.phase;
      const force=(28+star.depth*18)*influence;
      spring(star,parallaxX*(2+star.depth*4)+Math.cos(angle)*force,parallaxY*(2+star.depth*3)+Math.sin(angle)*force,dt);
    }
    const sx=screen.x+star.dx,sy=screen.y+star.dy;
    const size=star.size*clamp(unit/700,.65,1.35)*clamp(Math.pow(screen.depth,.65),.45,6);
    const diameter=size*15;
    if(sx<-diameter||sx>w+diameter||sy<-diameter||sy>h+diameter)continue;
    const pulse=.86+.14*Math.sin(time*(.45+star.depth*.55)+star.phase);
    ctx.globalAlpha=fade*star.alpha*pulse;
    ctx.drawImage(sprites[star.color],sx-diameter/2,sy-diameter/2,diameter,diameter);
    // Small stars still have sharp luminous cores; the few giants get an extended halo.
    if(star.bright){
      if(star.giant){ctx.globalAlpha=fade*.24*pulse;ctx.drawImage(sprites[star.color],sx-diameter,sy-diameter,diameter*2,diameter*2);}
      ctx.globalAlpha=fade*(.8+.2*pulse);ctx.fillStyle='#f6fcff';ctx.beginPath();
      ctx.arc(sx,sy,Math.max(.42,size*.23),0,Math.PI*2);ctx.fill();
    }
  }
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(fog>0){for(let i=0;i<7;i++){
    const x=w*(.5+.45*Math.sin(i*2.4+time*.018)),y=h*(.5+.45*Math.cos(i*1.7+time*.022));
    const cloud=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*(.4+fog*.45));
    cloud.addColorStop(0,`rgba(255,255,255,${fog*.48})`);cloud.addColorStop(.45,`rgba(238,245,250,${fog*.3})`);cloud.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=cloud;ctx.fillRect(0,0,w,h);
  }ctx.fillStyle=`rgba(255,255,255,${smooth((progress-.925)/.07)})`;ctx.fillRect(0,0,w,h);}
  intro.style.opacity=1-smooth(progress/.065);
  intro.inert=progress>.06;
  updatePanels();
  if(progress>=.996&&target>=.996){enterSite();return;}
  if(!leaving&&(!paused||Math.abs(target-progress)>.0001))frameId=requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);frameId=0;wake();});
new IntersectionObserver(entries=>{
  inView=entries[0].isIntersecting;
  if(!inView){cancelAnimationFrame(frameId);frameId=0;release();pointer.active=false;}
  else wake();
}).observe(journey);
root.classList.remove('is-unavailable');root.classList.add('is-ready');
resize();
wake();
