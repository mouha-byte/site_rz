const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const results=[];
  const base=process.env.SITE_URL || 'http://127.0.0.1:8080';
  for (const mobile of [false,true]) {
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:1});
    if(process.env.FIRST_PARTY_ONLY==='1') await page.route('**/*',route=>{
      const url=route.request().url();
      return url.startsWith(base+'/')||url.startsWith('data:')?route.continue():route.abort();
    });
    let errors=[], failed=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
    for(const path of ['/', '/a-propos/', '/nos-service/', '/portfolio/', '/contact/', '/service/production-audiovisuelle/', '/project/event-photoshoot/']) {
      errors=[];failed=[];
      const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForTimeout(2200);
      await page.mouse.move(160,200);
      await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});
      await page.waitForTimeout(700);
      const details=await page.evaluate(()=>({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(x=>x.getAttribute('src')&&!x.src.startsWith('data:')&&x.complete&&x.naturalWidth===0).map(x=>x.src),text:document.body.innerText.slice(0,220)}));
      results.push({url:base+path,status:response.status(),path,mobile,errors:[...new Set(errors)],failed,details});
      console.log(`${mobile?'mobile':'desktop'} ${path}: HTTP ${response.status()}, ${errors.length} errors, ${failed.length} failed responses, ${details.brokenImages.length} broken images`);
      if(path==='/'||path==='/contact/') await page.screenshot({path:'.artifacts/'+(path==='/'?'home':'contact')+(mobile?'-mobile':'-desktop')+'.png',fullPage:false});
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync('.artifacts/browser-check.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
