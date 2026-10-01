const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});
for(const mobile of [false,true]){
const p=await b.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000}});await p.goto((process.env.SITE_URL||'http://127.0.0.1:8080')+'/portfolio/',{waitUntil:'domcontentloaded'});await p.evaluate(()=>window.rzThemeReady);await p.waitForTimeout(1200);
const gallery=p.locator('.elementor-gallery__container');await p.waitForFunction(()=>document.querySelector('.elementor-gallery__container')?.clientHeight>100,{},{timeout:30000});assert((await gallery.boundingBox()).height>100,'Gallery must have a visible layout');
await p.getByText('Restauration',{exact:true}).click();await p.waitForTimeout(800);assert.equal(await p.locator('.elementor-gallery-title.elementor-item-active').innerText(),'Restauration');
await p.screenshot({path:`.artifacts/gallery-${mobile?'mobile':'desktop'}.png`});
const target=gallery.locator('a.e-gallery-item:not(.e-gallery-item--hidden)').first();await target.click();await p.locator('.elementor-lightbox').waitFor({state:'visible',timeout:15000});assert(await p.locator('.elementor-lightbox').isVisible(),'Photo must open in lightbox');await p.keyboard.press('Escape');console.log('PASS gallery filter and lightbox',mobile?'mobile':'desktop');await p.close();
}await b.close()})().catch(e=>{console.error(e);process.exit(1)});
