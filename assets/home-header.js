(() => {
  const header = document.querySelector('.header__area-3');
  const panel = document.querySelector('#rz-full-menu');
  const open = document.querySelector('#open_offcanvas');
  const close = document.querySelector('#close_offcanvas');
  header.querySelectorAll('.menu-anim > li > a').forEach(link => {
    const text = link.textContent;
    link.setAttribute('aria-label', text);
    const row = document.createElement('div'); row.className = 'menu-text'; row.setAttribute('aria-hidden','true');
    [...text].forEach(char => { const span = document.createElement('span');span.textContent = char;if(char === ' ')span.style.width='0.33em';row.append(span); });
    link.replaceChildren(row);
  });
  const sticky = () => header.classList.toggle('sticky-3', scrollY > 20);
  addEventListener('scroll', sticky, {passive:true}); sticky();
  function setOpen(value) {
    panel.inert = !value;panel.setAttribute('aria-hidden',String(!value));
    panel.classList.toggle('is-open',value);document.body.classList.toggle('rz-full-menu-open',value);
    open.setAttribute('aria-expanded',String(value));
    (value ? close : open).focus();
  }
  open.addEventListener('click',()=>setOpen(true));close.addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',event=>{
    if(!panel.classList.contains('is-open'))return;
    if(event.key==='Escape')setOpen(false);
    if(event.key==='Tab'){
      const items=[...panel.querySelectorAll('a[href],button')].filter(e=>e.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
})();
