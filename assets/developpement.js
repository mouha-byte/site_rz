(() => {
  const rooms = [...document.querySelectorAll('.room')];
  const house = document.querySelector('#house');
  const scene = house.querySelector('.scene');
  const toggle = document.querySelector('#motion-toggle');
  const dialog = document.querySelector('#offers-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer:fine) and (min-width:701px)');
  // Real DOM components remain intact throughout the choreography.
  const components = rooms.map(room => [...room.querySelectorAll(
    '.copy > *:not(.hero-services), .hero-services > a, .exhibit > .picture, .exhibit > .caption, .project-details > p, .project-features > li, .rz-hero-art, .atelier-art > *, .price-art > div'
  )].map((element, index) => {
    element.classList.add('motion-component');
    return {element, index, offset:(index%5)*.035, x:0, y:0};
  }));
  let direction = 1, routeFrom = 0, routeTo = 0;
  const smooth = value => { const t=Math.max(0,Math.min(1,value)); return t*t*(3-2*t); };
  function measureComponents() {
    components.flat().forEach(({element})=>{
      for(const property of ['translate','rotate','scale'])element.style.removeProperty(property);
    });
    components.flat().forEach(piece=>{
      const rect=piece.element.getBoundingClientRect();
      piece.x=rect.left+rect.width/2-innerWidth*.5;
      piece.y=rect.top+rect.height/2-innerHeight*.53;
    });
  }
  let motionOff = false;
  let immersive = false;
  let current = 0;
  let traveling = false;
  let destinationIndex = 0;
  let travelFrame = 0;
  let renderFrame = 0;
  let lookFrame = 0;
  const step = () => innerHeight * 1.25;
  const blocked = () => Boolean(document.querySelector('dialog[open]')) || document.body.classList.contains('rz-full-menu-open');
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));

  function render() {
    renderFrame = 0;
    if (!immersive) return;
    const progress = clamp(scrollY / step(), 0, rooms.length - 1);
    current = Math.round(progress);
    rooms.forEach((room,index) => {
      const distance = index - progress;
      const visible = Math.abs(distance) < 1.05;
      room.style.visibility = visible ? 'visible' : 'hidden';
      room.style.transform = 'translateZ(0)';
      room.style.opacity = visible ? '1' : '0';
      room.style.zIndex = String(index === current ? 2 : 1);
      const separation = Math.min(1, Math.abs(distance));
      for(const decoration of room.querySelectorAll('.architecture,.view-options')){
        decoration.style.opacity = String(Math.max(0, 1-separation*2));
        decoration.style.transform = `scale(${1+separation*1.5})`;
      }
      const outgoing = distance*direction<=0;
      const shell = outgoing ? 1-smooth(separation/.42) : smooth((1-separation-.55)/.45);
      room.style.setProperty('--assembly-shell',String(shell));
      if (visible) components[index].forEach(piece => {
        let x,y,scale,rotation,opacity;
        if(outgoing){
          const exit=smooth((separation-piece.offset)/(.55-piece.offset));
          const zoom=1+exit*1.9;
          const spin=direction*exit*.22;
          x=(piece.x*Math.cos(spin)-piece.y*Math.sin(spin))*zoom-piece.x;
          y=(piece.x*Math.sin(spin)+piece.y*Math.cos(spin))*zoom-piece.y;
          scale=zoom;rotation=spin*180/Math.PI;
          opacity=1-smooth((exit-.12)/.88);
        }else{
          const gather=smooth((1-separation-.25-piece.offset)/(.75-piece.offset));
          const loose=1-gather;
          const angle=piece.index*2.39996+direction*loose*1.8;
          const radius=.25+(piece.index%4)*.13;
          x=(Math.cos(angle)*innerWidth*radius-piece.x)*loose;
          y=(Math.sin(angle)*innerHeight*radius*.65-piece.y)*loose;
          scale=.48+.52*gather;
          rotation=direction*Math.sin(angle)*loose*18;
          opacity=smooth(gather/.4);
        }
        piece.element.style.translate = `${x}px ${y}px`;
        piece.element.style.rotate = `${rotation}deg`;
        piece.element.style.scale = String(scale);
        piece.element.style.opacity = String(opacity);
        piece.element.style.willChange = traveling ? 'transform, opacity' : 'auto';
      });
      else components[index].forEach(({element}) => { element.style.willChange = 'auto'; });
      const active = index === current;
      if (room.classList.contains('active') !== active || !room.hasAttribute('aria-hidden')) {
        room.inert = !active;
        room.setAttribute('aria-hidden', String(!active));
        room.classList.toggle('active', active);
      }
    });
  }
  function queueRender() {
    if (immersive && !traveling && !renderFrame) renderFrame = requestAnimationFrame(render);
  }
  function travelTo(index, interrupt = false) {
    if ((traveling && !interrupt) || blocked()) return;
    index = clamp(index, 0, rooms.length - 1);
    if (!immersive) {
      rooms[index].scrollIntoView({behavior:'instant',block:'start'});
      current = index;
      return;
    }
    if (Math.abs(scrollY - index * step()) < 1 && !traveling) return;
    const progress=scrollY/step();
    if(!traveling){measureComponents();}
    if(!traveling || index<Math.min(routeFrom,routeTo) || index>Math.max(routeFrom,routeTo)){
      direction=Math.sign(index-progress)||1;routeFrom=Math.round(progress);routeTo=index;
    }
    cancelAnimationFrame(travelFrame);
    cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    traveling = true;
    document.body.classList.add('is-room-traveling');
    destinationIndex = index;
    const start = scrollY;
    const destination = index * step();
    const began = performance.now();
    const duration = document.body.classList.contains('has-dev-fox') ? 1800 : clamp(Math.abs(destination-start)/step()*950,160,950);
    document.dispatchEvent(new CustomEvent('rz:roomtravel', {detail:{index,duration}}));
    render();
    function advance(now) {
      const t = Math.min(1, (now - began) / duration);
      const eased = t*t*(3-2*t);
      scrollTo({top:start + (destination-start)*eased,behavior:'instant'});
      render();
      if (t < 1) travelFrame = requestAnimationFrame(advance);
      else {
        travelFrame = 0;
        traveling = false;
        document.body.classList.remove('is-room-traveling');
        current = index;
        render();
        history.replaceState(null,'','#'+rooms[index].id);
      }
    }
    travelFrame = requestAnimationFrame(advance);
  }
  function configure() {
    const index = immersive ? current : Math.max(0, rooms.findIndex(room => room.getBoundingClientRect().bottom > innerHeight*.5));
    cancelAnimationFrame(travelFrame);
    cancelAnimationFrame(renderFrame);
    cancelAnimationFrame(lookFrame);
    travelFrame = renderFrame = lookFrame = 0;
    traveling = false;
    document.body.classList.remove('is-room-traveling');
    immersive = !motionOff && !reduced.matches;
    document.body.classList.toggle('house-tour', immersive);
    document.body.classList.toggle('motion-off', !immersive);
    toggle.setAttribute('aria-pressed',String(!immersive));
    toggle.textContent = reduced.matches ? 'Animations réduites' : immersive ? 'Vue sans mouvement' : 'Activer la visite immersive';
    toggle.disabled = reduced.matches;
    scene.style.removeProperty('--look-x');
    scene.style.removeProperty('--look-y');
    if (immersive) {
      house.style.height = ((rooms.length - 1)*step() + innerHeight) + 'px';
      scrollTo({top:index*step(),behavior:'instant'});
      measureComponents();
      render();
    } else {
      house.style.removeProperty('height');
      rooms.forEach(room => {
        for (const property of ['transform','opacity','visibility','will-change','z-index']) room.style.removeProperty(property);
        room.querySelectorAll('.architecture,.view-options').forEach(decoration=>{
          decoration.style.removeProperty('opacity');decoration.style.removeProperty('transform');
        });
        room.inert = false;
        room.removeAttribute('aria-hidden');
        room.classList.remove('active');
        room.style.removeProperty('--assembly-shell');
      });
      components.flat().forEach(({element}) => {
        for (const property of ['translate','rotate','scale','opacity','will-change']) element.style.removeProperty(property);
      });
      rooms[index].scrollIntoView({behavior:'instant',block:'start'});
    }
    document.dispatchEvent(new CustomEvent('rz:roomlayout', {detail:{index}}));
  }
  function canLeave(direction) {
    const room = rooms[current];
    return direction > 0 ? room.scrollTop + room.clientHeight >= room.scrollHeight - 3 : room.scrollTop <= 3;
  }
  let lastWheel = -Infinity;
  let gestureUsed = false;
  let wheelDirection = 0;
  let lastMagnitude = 0;
  addEventListener('wheel',event => {
    if (!immersive || blocked() || event.ctrlKey || event.deltaY === 0 || Math.abs(event.deltaX)>Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    const direction = Math.sign(event.deltaY);
    const delta = event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    const magnitude = Math.abs(delta);
    const gap = now-lastWheel;
    const deliberate = magnitude >= 4;
    const reversed = deliberate && wheelDirection !== 0 && direction !== wheelDirection;
    // A new mouse-wheel step or a fresh trackpad push can follow a completed
    // transition without waiting for all momentum events to go silent.
    const freshPush = magnitude >= 8 && magnitude > lastMagnitude*1.7;
    const wheelStep = magnitude >= 48 && gap > 60;
    if (reversed || (!traveling && (gap>280 || freshPush || wheelStep))) gestureUsed = false;
    lastWheel = now;
    lastMagnitude = magnitude;
    if (!deliberate) return;
    wheelDirection = direction;
    if (traveling) {
      if (reversed) {
        gestureUsed = true;
        travelTo(destinationIndex+direction, true);
      }
      return;
    }
    if (gestureUsed) return;
    if (!canLeave(direction)) {
      rooms[current].scrollTop += delta;
      return;
    }
    gestureUsed = true;
    travelTo(current+direction);
  },{passive:false});

  let touch = null;
  addEventListener('touchstart',event => {
    if (!immersive || blocked() || traveling || event.touches.length!==1 || event.target.closest('button,input,select,textarea')) {touch=null;return;}
    const p=event.touches[0];
    touch={x:p.clientX,y:p.clientY,index:current,forward:canLeave(1),back:canLeave(-1),next:null};
  },{passive:true});
  addEventListener('touchmove',event => {
    if (!touch || blocked() || event.touches.length!==1) return;
    const p=event.touches[0];
    const dy=touch.y-p.clientY;
    if (Math.abs(dy)<4 || Math.abs(dy)<Math.abs(touch.x-p.clientX)) return;
    const allowed=dy>0?touch.forward:touch.back;
    if (!allowed) return;
    event.preventDefault();
    touch.next=Math.abs(dy)>45?touch.index+Math.sign(dy):null;
  },{passive:false});
  addEventListener('touchend',()=>{const next=touch?.next;touch=null;if(next!=null)travelTo(next);});
  addEventListener('touchcancel',()=>{touch=null;});
  addEventListener('keydown',event => {
    if (!immersive || blocked() || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('a,button,input,select,textarea,[contenteditable]')) return;
    let direction=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):['ArrowUp','PageUp'].includes(event.key)?-1:0;
    if (!direction && !['Home','End'].includes(event.key)) return;
    event.preventDefault();
    if(event.repeat||traveling)return;
    if(event.key==='Home'){travelTo(0);return;}
    if(event.key==='End'){travelTo(rooms.length-1);return;}
    if(!canLeave(direction)){rooms[current].scrollTop+=direction*innerHeight*.6;return;}
    travelTo(current+direction);
  });
  let pointerX=0,pointerY=0;
  addEventListener('pointermove',event=>{
    if(!immersive||!finePointer.matches||blocked()||event.target.closest('.demo-preview'))return;
    pointerX=(event.clientX/innerWidth-.5)*1.2;
    pointerY=(.5-event.clientY/innerHeight)*.8;
    if(!lookFrame)lookFrame=requestAnimationFrame(()=>{
      lookFrame=0;scene.style.setProperty('--look-x',pointerX+'deg');scene.style.setProperty('--look-y',pointerY+'deg');
    });
  },{passive:true});
  document.querySelectorAll('[data-go]').forEach(link=>link.addEventListener('click',event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const index=Number(link.dataset.go);
    if(!rooms[index])return;
    event.preventDefault();travelTo(index);
  }));
  toggle.addEventListener('click',()=>{motionOff=!motionOff;configure();});
  reduced.addEventListener('change',configure);
  addEventListener('resize',configure);
  addEventListener('scroll',queueRender,{passive:true});
  addEventListener('hashchange',()=>{const index=rooms.findIndex(room=>'#'+room.id===location.hash);if(index>=0)travelTo(index);});
  const logoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-visible',entry.isIntersecting)));
  document.querySelectorAll('.rz-hero-art').forEach(logo=>logoObserver.observe(logo));
  document.querySelector('#show-offers').addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  configure();
  const initial=rooms.findIndex(room=>'#'+room.id===location.hash);
  if(initial>=0&&immersive){scrollTo({top:initial*step(),behavior:'instant'});render();}
})();
