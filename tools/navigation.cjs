const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 await p.goto('http://127.0.0.1:8080/');
 await p.waitForTimeout(1800);
 console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('header a, header button')].map(e=>({text:e.innerText,tag:e.outerHTML.slice(0,500),color:getComputedStyle(e).color,display:getComputedStyle(e).display,rect:e.getBoundingClientRect().toJSON()}))),null,2));
 await p.setViewportSize({width:390,height:844});
 console.log('BUTTONS',JSON.stringify(await p.locator('button').evaluateAll(es=>es.map(e=>({text:e.innerText,html:e.outerHTML.slice(0,300)})))));
 await p.locator('#open_offcanvas').click();
 await p.waitForTimeout(800);
 await p.screenshot({path:'.artifacts/mobile-menu.png'});
 console.log('MOBILE MENU', await p.locator('#close_offcanvas').isVisible());
 await p.locator('#close_offcanvas').click();
 console.log('CLOSED');
 await b.close();
})();
