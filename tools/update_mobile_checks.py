from pathlib import Path
p=Path('tools/mobile_audit.cjs');s=p.read_text()
s=s.replace("await page.locator('#open_offcanvas').click();", "if(await page.locator('#open_offcanvas').count()){await page.locator('#open_offcanvas').click();")
s=s.replace('.mean-nav a[href=', '.offcanvas__menu a[href=')
s=s.replace('results.push({path,width,errors,...report});','}results.push({path,width,errors,...report});')
p.write_text(s)
p=Path('tools/development_check.cjs');p.write_text(p.read_text().replace('.mean-nav a[href=', '.offcanvas__menu a[href='))
