const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const path of ['portfolio','nos-service','a-propos','contact'])for(const [kind,port]of [['original',8082],['current',8080]]){
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:'+port+'/')&&!r.request().url().includes('.mp4')?r.continue():r.request().resourceType()==='script'?r.fulfill({contentType:'application/javascript',body:''}):r.abort());
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/${path}/`,{waitUntil:'domcontentloaded',timeout:60000});
  await p.evaluate(()=>window.rzThemeReady);
  await p.waitForTimeout(1500);
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}});
  await p.waitForTimeout(1000);
  if(await p.locator('footer').count())await p.locator('footer').first().screenshot({path:`.artifacts/${path}-${kind}-footer.png`});
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(1200);
  await p.screenshot({path:`.artifacts/${path}-${kind}.png`,fullPage:true});
  const boxes=await p.locator('[data-id],footer').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{id:e.dataset.id||'footer',tag:e.tagName,classes:e.className,x:r.x,y:r.y,width:r.width,height:r.height,color:s.color,background:s.backgroundColor,font:s.fontFamily,size:s.fontSize,display:s.display,text:e.innerText.slice(0,90)}}));
  results.push({path,kind,boxes,errors});console.log(path,kind,'height',await p.evaluate(()=>document.body.scrollHeight),'errors',errors);
  await p.close();
 }
 fs.writeFileSync('.artifacts/compare.json',JSON.stringify(results,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
