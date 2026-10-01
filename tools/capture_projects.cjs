const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 for(const [name,url] of [['ecoguide','https://smsa-ecoguide.com/'],['guesto','https://guesto-service.com/'],['speranza','https://speranza-pizza.fr/'],['fleur','https://fleur-tn.vercel.app/'],['xm6','https://xm6-scroll.vercel.app/']]){
 try {
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForTimeout(7000);
  if(name==='xm6') {await p.waitForTimeout(45000); await p.evaluate(()=>scrollTo(0,600));await p.waitForTimeout(2000);}
  console.log(name,(await p.locator('body').innerText()).slice(0,2500));
  await p.screenshot({path:'.artifacts/'+name+'.png'});
  fs.writeFileSync('.artifacts/'+name+'.html',await p.content());
 }catch(e){console.log(name,e.message);}
 }
 await b.close();
})();
