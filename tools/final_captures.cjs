const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({channel:'msedge',headless:true});
await Promise.all([['xm6','https://xm6-scroll.vercel.app/'],['guesto','https://guesto-service.com/']].map(async([name,url])=>{
const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
if(name==='xm6'){await p.waitForFunction(()=>{const e=document.querySelector('#loader');return !e||getComputedStyle(e).opacity==='0'||getComputedStyle(e).display==='none';},{},{timeout:240000});await p.evaluate(()=>scrollTo(0,1400));await p.waitForTimeout(1500);}
else {await p.waitForTimeout(15000);console.log('videos',await p.locator('video').evaluateAll(v=>v.map(e=>({ready:e.readyState,src:e.currentSrc}))));await p.waitForFunction(()=>[...document.querySelectorAll('video')].some(v=>v.readyState>=2),{},{timeout:60000}).catch(()=>{});}
await p.screenshot({path:'.artifacts/'+name+'.png'});console.log(name,'captured');await p.close();
}));await b.close();})();
