from pathlib import Path
p=Path('developpement/index.html');s=p.read_text(encoding='utf-8')
start=s.index('<section id="realisations">');end=s.index('</div></div></section>',start)
card='''<a class="dev-project dev-project-wide" href="https://dar-ismail-tabarka.vercel.app/" target="_blank" rel="noopener"><div class="dev-shot"><img src="/assets/developpement/dar-ismail.webp" width="1200" height="750" loading="lazy" alt="Aperçu du site Dar Ismail Tabarka avec son décor marin en 3D"></div><div><span class="dev-tag">Web · Expérience 3D · Hôtellerie</span><div class="dev-project-top"><h3>Dar Ismail Tabarka</h3><span aria-hidden="true">↗</span></div><p>Un site hôtelier immersif avec une suite en 3D à explorer, une galerie interactive et un plan du complexe en trois dimensions.</p><span class="dev-project-visit">Découvrir le projet 3D ↗</span></div></a>'''
if 'href="https://dar-ismail-tabarka.vercel.app/"' not in s:s=s[:end]+card+s[end:]
p.write_text(s,encoding='utf-8')
p=Path('tools/development_check.cjs');s=p.read_text().replace('assert.equal(details.cards,6)','assert.equal(details.cards,7)');p.write_text(s)
