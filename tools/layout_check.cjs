const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
const b=await chromium.launch({channel:'msedge',headless:true});const results=[];
for(const mobile of [false,true])for(const path of ['portfolio','nos-service','a-propos','contact']){
 const p=await b.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000}});
 await p.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8080/')&&!r.request().url().includes('.mp4')?r.continue():r.request().resourceType()==='script'?r.fulfill({contentType:'application/javascript',body:''}):r.abort());
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8080/'+path+'/',{waitUntil:'domcontentloaded'});
 await p.mouse.move(180,200);await p.evaluate(()=>window.rzThemeReady);await p.waitForTimeout(1500);
 const prefix=`.artifacts/fixed-${path}-${mobile?'mobile':'desktop'}`;
 await p.screenshot({path:prefix+'-top.png'});
 const sections=await p.locator('.elementor > .elementor-element').evaluateAll(es=>es.map(e=>({id:e.dataset.id,top:e.getBoundingClientRect().top+scrollY})).filter(e=>e.top>800));
 for(let i=0;i<Math.min(sections.length,4);i++){
  await p.evaluate(y=>window.scrollTo(0,y),sections[i].top);await p.waitForTimeout(800);
  if(!mobile)await p.screenshot({path:prefix+'-section'+i+'.png'});
 }
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(1200);
 await p.screenshot({path:prefix+'-bottom.png'});
 const footer=await p.locator('footer').evaluate(e=>({newsletter:!!e.querySelector('.mc4wp-form input[type=email]'),logo:[...e.querySelectorAll('.footer__logo')].map(i=>({width:i.clientWidth,height:i.clientHeight}))}));
 if(path==='portfolio'){
  const tabs=p.locator('[role="tab"]');console.log('gallery tabs',await tabs.count());
 }
 results.push({path,mobile,errors,footer});console.log(path,mobile,errors,footer);await p.close();
}fs.writeFileSync('.artifacts/layout-check.json',JSON.stringify(results,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
