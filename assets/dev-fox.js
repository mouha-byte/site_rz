(() => {
 const rooms=[...document.querySelectorAll('.room')];
 if(!rooms.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let actor,flight,frame=0,current=0,busy=false,docked=false,sequence=0,timer=0,greetingTimer=0;
 let lookX=0,lookY=0,lookFrame=0,head,pupils;
 let speech,speechTimer=0,effects=[];
 const messages=[
  ['Bienvenue ! Je vous accompagne dans les six espaces RZ.', 'Sites web, applications ou expériences immersives : explorons votre projet.'],
  ['Ici, vos clients découvrent votre activité et commandent en ligne.', 'Speranza Pizza et Fleur-TN : touchez Démo pour les explorer.'],
  ['Des applications pour vos clients, vos équipes et le terrain.', 'Guesto accompagne la restauration. Éco-Guide vous emmène sur les sentiers.'],
  ['Changeons de perspective : 360°, 3D et animations au défilement.', 'Explorez un lieu ou révélez les composants d’un produit.'],
  ['Une identité prend vie avec les bons contenus.', 'Photo, vidéo, stratégie et création : donnons du caractère à votre marque.'],
  ['Votre idée mérite une solution adaptée.', 'Découvrez les formules ou parlons ensemble de votre projet.']
 ];
 const stops=rooms.map(room=>{const stop=document.createElement('div');stop.className='fox-stop';stop.setAttribute('aria-hidden','true');room.querySelector('.room-content').append(stop);return stop});
 const actions=['vous salue','code un site web','teste une application','présente un objet 3D','dessine','présente votre projet'];
 const disabled=()=>reduced.matches||document.body.classList.contains('motion-off');
 const blocked=()=>Boolean(document.querySelector('dialog[open]'))||document.body.classList.contains('rz-full-menu-open');
 const transform=p=>`translate(${p.x}px,${p.y}px) scale(${p.scale})`;
 function rail(side){const mobile=innerWidth<=700;const width=mobile?68:84;return {x:side==='left'?12:innerWidth-width-18,y:mobile?98:108,scale:width/260}}
 function target(index){
  if(index!==0||docked)return rail('right');
  const r=stops[0].getBoundingClientRect();return {x:r.left,y:r.top,scale:r.width/260};
 }
 function action(index){actor.dataset.action=String(index);actor.querySelector('button').setAttribute('aria-label',`Le renard RZ ${actions[index]}. Cliquer pour le saluer.`)}
 function state(index){current=index;actor.dataset.room=String(index)}
 function freeze(){
  if(!actor)return;
  const hidden=blocked();actor.classList.toggle('is-hidden',hidden);
  actor.classList.toggle('is-paused',document.hidden||hidden);actor.classList.toggle('is-static',disabled());
  if(speech)speech.style.visibility=hidden?'hidden':'';
  if(document.hidden||hidden){flight?.pause()}else{flight?.play()}
  effects.forEach(effect=>document.hidden||hidden?effect.pause():effect.play());
 }
 function cancel(){
  sequence++;clearTimeout(timer);clearTimeout(speechTimer);if(speech)speech.hidden=true;
  actor.classList.remove('is-speaking');
  effects.forEach(effect=>effect.cancel());effects=[];actor.classList.remove('is-tornado');
  if(flight){const r=actor.getBoundingClientRect();flight.cancel();actor.style.transform=transform({x:r.left,y:r.top,scale:r.width/260});flight=null}
  busy=false;actor.classList.remove('is-walking','is-traveling');
 }
 function wait(ms,token,next){timer=setTimeout(()=>{if(token!==sequence)return;if(document.hidden||blocked()){wait(200,token,next);return}next()},ms)}
 function walk(to,duration,token,done){
  if(token!==sequence)return;
  const r=actor.getBoundingClientRect();const from={x:r.left,y:r.top,scale:r.width/260};
  actor.dataset.facing=to.x<from.x?'left':'right';actor.classList.add('is-walking');actor.style.transform=transform(to);
  flight=actor.animate([{transform:transform(from)},{transform:transform(to)}],{duration:disabled()?0:duration,easing:'cubic-bezier(.35,0,.25,1)'});
  freeze();flight.onfinish=()=>{if(token!==sequence)return;flight=null;actor.classList.remove('is-walking');actor.dataset.facing='right';done()};
 }
 function perform(index){
  if(disabled()){action(index);busy=false;return}
  busy=true;const token=sequence;const second=[0,2,2,3,4,5][index];
  wait(index===0?1300:180,token,()=>walk(rail('left'),1500,token,()=>{
   action(index===4?4:1);
   wait(2300,token,()=>walk(rail('right'),Math.min(2600,innerWidth*1.9),token,()=>{
    action(second);docked=true;
    wait(2400,token,()=>{busy=false;speak(index)});
   }));
  }));
 }
 function place(){
  frame=0;if(!actor||busy)return;
  if(!document.body.classList.contains('house-tour')){
   let best=Infinity;rooms.forEach((r,i)=>{const box=r.getBoundingClientRect();const d=Math.abs(box.top+box.height/2-innerHeight/2);if(d<best){best=d;current=i}});
  }else{const active=rooms.findIndex(r=>r.classList.contains('active'));if(active>=0)current=active}
  state(current);actor.style.transform=transform(target(current));freeze();
 }
 function schedule(){if(!frame&&!busy)frame=requestAnimationFrame(place)}
 function speak(index,part=0){
  if(!speech)return;
  const token=sequence;const text=messages[index][part];
  const rect=actor.getBoundingClientRect();
  speech.hidden=false;speech.style.left=Math.max(10,rect.left-speech.offsetWidth-12)+'px';speech.style.top=Math.max(102,Math.min(innerHeight-145,rect.top+8))+'px';
  speech.querySelector('.fox-announcement').textContent=text;
  const line=speech.querySelector('.speech-line');
  const canvas=document.createElement('canvas');const measure=canvas.getContext('2d');
  measure.font=getComputedStyle(line).font;
  const limit=Math.max(40,line.clientWidth-2);const chunks=[];let chunk='';
  for(const word of text.split(' ')){
   const candidate=chunk?chunk+' '+word:word;
   if(measure.measureText(candidate).width<=limit){chunk=candidate;continue}
   if(chunk)chunks.push(chunk);chunk='';
   for(const letter of word){if(measure.measureText(chunk+letter).width>limit){chunks.push(chunk);chunk=''}chunk+=letter}
  }
  if(chunk)chunks.push(chunk);
  let page=0;
  function show(){
   if(token!==sequence)return;
   if(document.hidden||blocked()){speechTimer=setTimeout(show,180);return}
   line.textContent=chunks[page];
   if(!disabled()){
    line.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:180});
    actor.classList.add('is-speaking');
   }
   speechTimer=setTimeout(()=>{
    if(token!==sequence)return;
    if(document.hidden||blocked()){show();return}
    actor.classList.remove('is-speaking');
    if(page<chunks.length-1){
     if(!disabled())line.animate([{opacity:1},{opacity:0}],{duration:140,fill:'forwards'});
     speechTimer=setTimeout(()=>{line.getAnimations().forEach(a=>a.cancel());line.textContent='';page++;show()},160);
    }else if(part===0)speechTimer=setTimeout(()=>{if(token===sequence)speak(index,1)},900);
   },Math.max(1800,chunks[page].length*60));
  }
  show();
 }
 function move(event){
  if(!actor||!event.detail)return;
  cancel();const {index,duration}=event.detail;const token=sequence;busy=true;docked=true;
  actor.classList.add('is-traveling');
  const r=actor.getBoundingClientRect();const from={x:r.left,y:r.top,scale:r.width/260};
  const width=Math.min(innerWidth*.66,320,innerHeight*.48);
  const center={x:(innerWidth-width)/2,y:Math.max(108,(innerHeight-width*300/260)/2),scale:width/260};
  const to=target(index);actor.dataset.facing='right';actor.style.transform=transform(to);
  const poses=[
   {transform:transform(from),offset:0},
   {transform:transform(center),offset:.18},
   {transform:transform(center),offset:.4},
   {transform:transform(center),offset:.58},
   {transform:transform(center),offset:.84},
   {transform:transform(to),offset:1}
  ];
  const variant=['heart','tornado','moonwalk','hero','magic','dab'][index];actor.dataset.transition=variant;
  const animatePart=(selector,keyframes)=>{const effect=actor.querySelector(selector).animate(keyframes,{duration,easing:'linear',composite:'replace'});effects.push(effect)};
  if(variant==='tornado'){
  actor.classList.add('is-tornado');
  animatePart('.fox-character',[
   {transform:'scaleX(1)',opacity:1,offset:0},{transform:'rotate(-12deg) scaleX(1)',opacity:1,offset:.22},
   {transform:'scaleX(.12) skewY(6deg)',opacity:.7,offset:.3},{transform:'scaleX(-1.1)',opacity:.35,offset:.37},
   {transform:'scaleX(.1)',opacity:.15,offset:.43},{transform:'scaleX(1.1)',opacity:.12,offset:.5},
   {transform:'scaleX(-.1)',opacity:.12,offset:.57},{transform:'scaleX(-1)',opacity:.2,offset:.64},
   {transform:'scaleX(.15)',opacity:.6,offset:.7},{transform:'scaleX(1.08) rotate(8deg)',opacity:1,offset:.77},
   {transform:'scaleX(1)',opacity:1,offset:1}
  ]);
  animatePart('.fox-vortex',[
   {opacity:0,transform:'scale(.25)',offset:0},{opacity:0,transform:'scale(.45)',offset:.23},
   {opacity:1,transform:'scale(1)',offset:.35},{opacity:1,transform:'scale(1.08,.98)',offset:.6},
   {opacity:.85,transform:'scale(.95,1.05)',offset:.68},{opacity:0,transform:'scale(.2,1.15)',offset:.78},
   {opacity:0,transform:'scale(.2)',offset:1}
  ]);
  animatePart('.fox-dust',[
   {opacity:0,transform:'scale(.4)',offset:0},{opacity:0,transform:'scale(.4)',offset:.27},
   {opacity:.8,transform:'scale(1)',offset:.4},{opacity:.4,transform:'scale(1.5)',offset:.64},
   {opacity:0,transform:'scale(1.9)',offset:.85},{opacity:0,offset:1}
  ]);
  }else{
   // Each track shares a timeline: anticipation, action, follow-through, settle.
   const track=(selector,keys)=>animatePart(selector,[{transform:'none',offset:0},{transform:'none',offset:.18},...keys.map(([t,transform])=>({transform,offset:.18+t*.64,easing:'cubic-bezier(.35,0,.3,1)'})),{transform:'none',offset:.84},{transform:'none',offset:1}]);
   const reveal=(selector,keys)=>animatePart(selector,[{opacity:0,offset:0},...keys.map(([t,opacity,transform])=>({offset:.18+t*.64,opacity,transform})),{opacity:0,offset:.85},{opacity:0,offset:1}]);
   track('.fox-tail',[[0,'rotate(0)'],[.15,'rotate(-18deg)'],[.35,'rotate(22deg)'],[.55,'rotate(-12deg)'],[.8,'rotate(9deg)'],[1,'rotate(0)']]);
   if(variant==='moonwalk'){
    track('.fox-character',[[0,'translateX(40px)'],[.12,'translateX(40px) translateY(3px) rotate(-5deg)'],[.32,'translateX(15px) rotate(-7deg)'],[.52,'translateX(-10px) rotate(-7deg)'],[.72,'translateX(-38px) rotate(-7deg)'],[.88,'translateX(-40px) rotate(3deg)'],[1,'translateX(0)']]);
    track('.fox-leg-left',[[0,'none'],[.12,'translateY(-6px) rotate(22deg)'],[.3,'translateX(-10px) rotate(-12deg)'],[.48,'translateY(-6px) rotate(22deg)'],[.66,'translateX(-10px) rotate(-12deg)'],[.84,'translateY(-6px) rotate(22deg)'],[1,'none']]);
    track('.fox-leg-right',[[0,'none'],[.12,'translateX(-10px) rotate(-12deg)'],[.3,'translateY(-6px) rotate(22deg)'],[.48,'translateX(-10px) rotate(-12deg)'],[.66,'translateY(-6px) rotate(22deg)'],[.84,'translateX(-10px) rotate(-12deg)'],[1,'none']]);
    track('.fox-arm-left',[[0,'none'],[.15,'rotate(-35deg)'],[.35,'rotate(18deg)'],[.55,'rotate(-35deg)'],[.75,'rotate(18deg)'],[1,'none']]);
    track('.fox-arm-right',[[0,'none'],[.15,'rotate(18deg)'],[.35,'rotate(-35deg)'],[.55,'rotate(18deg)'],[.75,'rotate(-35deg)'],[1,'none']]);
    track('.fox-head',[[0,'none'],[.2,'rotate(7deg)'],[.45,'rotate(-5deg)'],[.7,'rotate(7deg)'],[1,'none']]);
   }else if(variant==='hero'){
    track('.fox-character',[[0,'none'],[.13,'translateY(9px) scale(1.12,.84)'],[.25,'translateY(-45px) scale(.92,1.1)'],[.42,'translateY(-92px) rotate(-12deg)'],[.56,'translateY(-72px) rotate(-8deg)'],[.73,'translateY(10px) scale(1.15,.8)'],[.86,'translateY(-6px) scale(.97,1.03)'],[1,'none']]);
    track('.fox-arm-right',[[0,'none'],[.13,'rotate(40deg)'],[.27,'rotate(-172deg)'],[.56,'rotate(-165deg)'],[.73,'rotate(-25deg)'],[1,'none']]);
    track('.fox-arm-left',[[0,'none'],[.13,'rotate(-32deg)'],[.3,'rotate(65deg)'],[.56,'rotate(65deg)'],[.73,'rotate(30deg)'],[1,'none']]);
    track('.fox-leg-left',[[0,'none'],[.13,'rotate(22deg)'],[.3,'rotate(-12deg)'],[.56,'rotate(-12deg)'],[.73,'rotate(25deg)'],[1,'none']]);
    track('.fox-leg-right',[[0,'none'],[.13,'rotate(-22deg)'],[.3,'rotate(-38deg)'],[.56,'rotate(-28deg)'],[.73,'rotate(-25deg)'],[1,'none']]);
    animatePart('.fox-shadow',[{opacity:.12,transform:'scale(1)',offset:0},{opacity:.12,transform:'scale(1)',offset:.3},{opacity:.04,transform:'scale(.55)',offset:.46},{opacity:.04,transform:'scale(.6)',offset:.55},{opacity:.2,transform:'scale(1.25)',offset:.65},{opacity:.12,transform:'scale(1)',offset:.82}]);
    reveal('.fox-dust',[[0,0,'scale(.2)'],[.68,0,'scale(.3)'],[.74,.8,'scale(1)'],[1,0,'scale(1.9)']]);
   }else if(variant==='dab'){
    track('.fox-character',[[0,'none'],[.15,'translateX(-18px) translateY(5px) rotate(-5deg)'],[.3,'translateX(18px) translateY(-4px) rotate(5deg)'],[.44,'translateX(-10px) scale(1.04,.96)'],[.57,'rotate(-14deg)'],[.78,'rotate(-14deg)'],[.9,'rotate(5deg)'],[1,'none']]);
    track('.fox-arm-left',[[0,'none'],[.15,'rotate(45deg)'],[.3,'rotate(-40deg)'],[.57,'rotate(132deg)'],[.78,'rotate(132deg)'],[1,'none']]);
    track('.fox-arm-right',[[0,'none'],[.15,'rotate(-40deg)'],[.3,'rotate(45deg)'],[.57,'rotate(-118deg)'],[.78,'rotate(-118deg)'],[1,'none']]);
    track('.fox-head',[[0,'none'],[.3,'rotate(7deg)'],[.57,'rotate(-25deg)'],[.78,'rotate(-25deg)'],[1,'none']]);
    track('.fox-leg-left',[[0,'none'],[.15,'rotate(18deg)'],[.3,'rotate(-14deg)'],[.57,'rotate(15deg)'],[.78,'rotate(15deg)'],[1,'none']]);
    track('.fox-leg-right',[[0,'none'],[.15,'rotate(-14deg)'],[.3,'rotate(18deg)'],[.57,'rotate(-20deg)'],[.78,'rotate(-20deg)'],[1,'none']]);
   }else{
    const magic=variant==='magic';const prop=magic?'.fox-cube':'.fox-heart';
    track('.fox-character',[[0,'none'],[.14,'translateY(5px) scale(1.04,.96)'],[.36,'translateY(-5px) rotate(-4deg)'],[.55,'rotate(5deg)'],[.76,'translateY(4px) scale(1.04,.96)'],[1,'none']]);
    track('.fox-arm-right',[[0,'none'],[.14,'rotate(28deg)'],[.3,'rotate(-90deg)'],[.45,'rotate(-110deg)'],[.62,'rotate(-75deg)'],[.78,'rotate(-25deg)'],[1,'none']]);
    track('.fox-arm-left',[[0,'none'],[.14,'rotate(-25deg)'],[.3,'rotate(70deg)'],[.48,'rotate(95deg)'],[.65,'rotate(60deg)'],[.78,'rotate(35deg)'],[1,'none']]);
    track('.fox-head',[[0,'none'],[.28,'translateY(-4px) rotate(-9deg)'],[.48,'translateY(-6px) rotate(8deg)'],[.7,'rotate(6deg)'],[1,'none']]);
    reveal(prop,[[0,0,'scale(.1)'],[.17,0,'scale(.1)'],[.28,1,'translate(-25px,-25px) scale(.8)'],[.44,1,'translate(-60px,-90px) rotate(150deg) scale(1.15)'],[.6,1,'translate(-95px,-55px) rotate(300deg) scale(1)'],[.76,1,'translate(-70px,5px) rotate(360deg) scale(.8)'],[.94,0,'translate(-65px,12px) scale(.1)']]);
    reveal('.fox-sparks',[[0,0,'scale(.1)'],[.22,0,'scale(.1)'],[.35,1,'scale(.8)'],[.65,.8,'scale(1.2)'],[1,0,'scale(1.6)']]);
   }
  }
  flight=actor.animate(poses,{duration,easing:'ease-in-out'});freeze();
  flight.onfinish=()=>{if(token!==sequence)return;flight=null;effects.forEach(effect=>effect.cancel());effects=[];busy=false;actor.classList.remove('is-traveling','is-tornado');state(index);action(index);speak(index)};
 }
 function layout(){if(!actor)return;cancel();docked=false;place();action(current)}
 function look(event){
  if(!actor||disabled()||document.hidden||blocked())return;
  const r=actor.getBoundingClientRect();
  lookX=Math.max(-1,Math.min(1,(event.clientX-r.left-r.width/2)/Math.max(100,innerWidth*.35)));
  lookY=Math.max(-1,Math.min(1,(event.clientY-r.top-r.height*.35)/Math.max(100,innerHeight*.35)));
  if(!lookFrame)lookFrame=requestAnimationFrame(()=>{lookFrame=0;const facing=actor.dataset.facing==='left'?-1:1;head.style.transform=`rotate(${lookX*5*facing}deg)`;pupils.style.transform=`translate(${lookX*4*facing}px,${lookY*3}px)`});
 }
 function greet(){if(busy||disabled())return;clearTimeout(speechTimer);speak(current);clearTimeout(greetingTimer);actor.classList.remove('is-greeting');requestAnimationFrame(()=>{actor.classList.add('is-greeting');greetingTimer=setTimeout(()=>actor.classList.remove('is-greeting'),2050)})}
 fetch('/assets/dev-fox.svg').then(r=>{if(!r.ok)throw Error('Avatar unavailable');return r.text()}).then(svg=>{
  actor=document.createElement('div');actor.className='dev-fox';
  speech=document.createElement('div');speech.className='fox-speech';speech.hidden=true;
  speech.innerHTML='<strong>Votre guide RZ</strong><span class="speech-line" aria-hidden="true"></span><span class="fox-announcement" role="status"></span><button type="button" aria-label="Fermer le message">×</button>';
  speech.querySelector('button').addEventListener('click',()=>{clearTimeout(speechTimer);speech.hidden=true;actor.classList.remove('is-speaking')});document.body.append(speech);
  const button=document.createElement('button');button.className='fox-touch';button.type='button';button.innerHTML=svg;button.querySelector('svg').setAttribute('aria-hidden','true');actor.append(button);document.body.append(actor);
  head=actor.querySelector('.fox-head');pupils=actor.querySelector('.fox-pupils');document.body.classList.add('has-dev-fox');
  dispatchEvent(new Event('resize'));place();action(current);actor.classList.add('is-ready');perform(current);
  button.addEventListener('click',greet);document.addEventListener('rz:roomtravel',move);document.addEventListener('rz:roomlayout',layout);
  addEventListener('pointermove',look,{passive:true});addEventListener('pointerdown',look,{passive:true});
  addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('resize',schedule);document.addEventListener('visibilitychange',freeze);
  new MutationObserver(freeze).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('dialog').forEach(d=>new MutationObserver(freeze).observe(d,{attributes:true,attributeFilter:['open']}));
  reduced.addEventListener('change',()=>{layout();head.style.transform='';pupils.style.transform='';freeze()});
 }).catch(()=>{stops.forEach(stop=>stop.remove());actor?.remove();document.body.classList.remove('has-dev-fox')});
})();
