from pathlib import Path
p=Path('tools/mobile_audit.cjs');s=p.read_text()
s=s.replace("await page.evaluate(()=>window.rzThemeReady);", "if(['/project/event-photoshoot-2/','/project/event-photoshoot-3/','/project/event-photoshoot-4/','/project/photo-culinaire2/','/project/product-photoshoot/','/project/product-photoshoot-2/','/project/test/'].includes(path)){await page.waitForURL('**/portfolio/');await page.waitForLoadState('domcontentloaded');}await page.evaluate(()=>window.rzThemeReady);")
s=s.replace('await page.waitForTimeout(250);','await page.waitForTimeout(700);')
p.write_text(s)
