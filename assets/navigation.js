(() => {
  const style = document.createElement('style');
  style.textContent = '.rz-page-transition{position:fixed;inset:0;z-index:2147483647;background:#101747;color:#fff;display:grid;place-items:center;font:clamp(36px,7vw,90px) Georgia,serif;pointer-events:all}.rz-page-transition span{padding:24px;text-align:center}';
  document.head.append(style);
  // One stylesheet defines the first transition and every following transition.
  if (!document.querySelector('#rz-page-motion')) {
    const motion = document.createElement('link');
    motion.id = 'rz-page-motion';
    motion.rel = 'stylesheet';
    motion.href = '/assets/page-motion.css';
    document.head.append(motion);
  }
  // Use the same click transition even when a destination does not opt into native transitions.
  try {
    const entry=JSON.parse(sessionStorage.getItem('rz-nav-arrival')||'null');
    sessionStorage.removeItem('rz-nav-arrival');
    if(entry&&entry.path===location.pathname&&Date.now()-entry.at<15000&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const cover=document.createElement('div');cover.className='rz-page-transition';cover.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.textContent=entry.label;cover.append(text);document.body.append(cover);
      cover.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.08)'}],{duration:300,easing:'ease-out',fill:'forwards'}).finished.finally(()=>cover.remove());
    }
  }catch{}
  let leaving = false;
  function reset() { leaving = false; document.querySelector('.rz-page-transition')?.remove(); }
  document.addEventListener('click', async event => {
    const link = event.target.closest('header a, .offcanvas__area a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:','https:'].includes(url.protocol) || url.pathname === location.pathname) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-off')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (leaving) return;
    leaving = true;
    const veil = document.createElement('div');
    veil.className = 'rz-page-transition'; veil.setAttribute('aria-hidden','true');
    const label = document.createElement('span');
    label.textContent = link.textContent.trim() || 'Accueil'; veil.append(label);
    document.body.append(veil);
    try{sessionStorage.setItem('rz-nav-arrival',JSON.stringify({path:url.pathname,at:Date.now(),label:label.textContent}))}catch{}
    try {
      await veil.animate([{transform:'scale(.16)',opacity:0,offset:0},{transform:'scale(.3)',opacity:1,offset:.16},{transform:'scale(1.01)',opacity:1,offset:.76},{transform:'scale(1)',opacity:1,offset:1}], {duration:420,easing:'ease-out',fill:'forwards'}).finished;
    } finally { location.assign(url.href); }
  }, true);
  addEventListener('pageshow', reset);
})();
