(() => {
  const dialog = document.querySelector('#demo-dialog');
  const screen = dialog.querySelector('.demo-dialog-screen');
  const subtitle = dialog.querySelector('.demo-dialog-bar div > span');
  const previews = [...document.querySelectorAll('.demo-preview')];
  const hoverPointer = matchMedia('(hover:hover) and (pointer:fine)');
  let active=null,hoverTimer=0,hoverCard=null,dismissedCard=null;
  function cancelHover(){clearTimeout(hoverTimer);hoverTimer=0;hoverCard=null}
  function clearScreen(){screen.replaceChildren()}
  function showInteractive(){
    clearScreen();subtitle.textContent='Site interactif';
    const frame=document.createElement('iframe');frame.className='demo-frame';
    frame.title='Démo interactive : '+active.dataset.demoName;
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=active.dataset.demoUrl;screen.append(frame);
  }
  function open(preview) {
    if (document.querySelector('dialog[open]') || document.body.classList.contains('is-room-traveling')) return;
    cancelHover(); active = preview;
    dialog.querySelector('#demo-dialog-title').textContent = preview.dataset.demoName;
    dialog.querySelector('.demo-open-site').href = preview.dataset.demoUrl;
    dialog.showModal(); showInteractive();
  }
  previews.forEach(preview => {
    preview.querySelector('.demo-start').addEventListener('click', () => open(preview));
    preview.querySelector('.demo-expand').hidden = true;
    if (!preview.closest('#realisations')) return;
    const card = preview.closest('.exhibit');
    card.addEventListener('pointermove', event => {
      if (!hoverPointer.matches || event.pointerType!=='mouse' || (!event.movementX&&!event.movementY)) return;
      if (card===dismissedCard || card===hoverCard || card.closest('[inert]') || document.body.classList.contains('is-room-traveling') || document.querySelector('dialog[open]')) return;
      cancelHover();hoverCard=card;
      hoverTimer=setTimeout(()=>{hoverCard=null;if(card.matches(':hover')&&!card.closest('[inert]'))open(preview)},350);
    });
    card.addEventListener('pointerleave',()=>{if(hoverCard===card)cancelHover();if(dismissedCard===card)dismissedCard=null});
  });
  dialog.querySelector('.demo-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    if(dialog.open)return;
    const preview=active;clearScreen();active=null;
    if(preview){
      dismissedCard=preview.closest('.exhibit');preview.querySelector('.demo-start').focus({preventScroll:true});
      requestAnimationFrame(()=>{if(!dismissedCard?.matches(':hover'))dismissedCard=null});
    }
  });
  addEventListener('wheel',cancelHover,{passive:true,capture:true});
  document.addEventListener('rz:roomtravel',cancelHover);
})();
