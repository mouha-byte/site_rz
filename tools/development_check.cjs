const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const base=process.env.SITE_URL||'http://127.0.0.1:8080';
for(const width of [1440,390]){const p=await b.newPage({viewport:{width,height:900}});let errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('**/*',r=>r.request().url().startsWith(base)||r.request().url().startsWith('data:')?r.continue():r.abort());
assert.equal((await p.goto(base+'/developpement/',{waitUntil:'domcontentloaded'})).status(),200);await p.evaluate(()=>window.rzThemeReady);await p.waitForTimeout(1000);
await p.screenshot({path:`.artifacts/development-${width}-top.png`});
await p.locator('a[href="#tarifs"]').click();await p.waitForTimeout(1200);console.log('tarifs position',await p.locator('#tarifs').evaluate(e=>e.getBoundingClientRect().top));
for(const sel of ['#realisations','#experiences','#tarifs','footer']){await p.locator(sel).scrollIntoViewIfNeeded();await p.waitForTimeout(500);await p.screenshot({path:`.artifacts/development-${width}-${sel.replace('#','')}.png`});}
const details=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),cards:document.querySelectorAll('.dev-project').length,nav:document.querySelectorAll('a[href="/developpement/"]').length}));
console.log(width,{errors,...details});assert(!details.overflow);assert.equal(details.broken.length,0);assert.equal(details.cards,7);assert.equal(errors.length,0);
if(width===390){await p.evaluate(()=>scrollTo(0,0));await p.locator('#open_offcanvas').click();await p.waitForTimeout(700);await p.screenshot({path:'.artifacts/development-menu.png'});assert(await p.locator('.offcanvas__menu a[href="/developpement/"]').isVisible());await p.locator('#close_offcanvas').click();}
await p.close();}await b.close();})();
