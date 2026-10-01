(() => {
  const root=document.documentElement;
  if(!root.classList.contains('rz-cosmic-arrival'))return;
  async function reveal(){
    await Promise.race([Promise.resolve(window.rzThemeReady).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2500))]);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      root.classList.add('rz-cosmic-revealed');
      setTimeout(()=>root.classList.remove('rz-cosmic-arrival','rz-cosmic-revealed'),850);
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();
})();
