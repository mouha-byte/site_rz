from pathlib import Path
import re
p=Path('developpement/index.html')
s=p.read_text(encoding='utf-8')
start=s.index('<section class="dev-hero">')
end=s.index('</section>',start)+len('</section>')
old=s[start:end]
platforms=old[old.index('<div class="dev-platforms">'):].removesuffix('\n</div></section>')
hero='''<section class="dev-hero"><div class="dev-wrap">
<div class="dev-hero-divider" aria-hidden="true"></div>
<h1>Développement web,<br>mobile &amp; desktop</h1>
<p class="dev-intro">Un site qui vous présente. Une boutique qui vend. Une application qui simplifie votre quotidien. Nous créons le produit et les images qui lui donnent vie.</p>
<a class="dev-consultation" href="/contact/"><svg aria-hidden="true" viewBox="0 0 512 512"><path d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zM140 300h116v70.9c0 10.7 13 16.1 20.5 8.5l114.3-114.9c4.7-4.7 4.7-12.2 0-16.9l-114.3-115c-7.6-7.6-20.5-2.2-20.5 8.5V212H140c-6.6 0-12 5.4-12 12v64c0 6.6 5.4 12 12 12z"/></svg><span>Demandez une consultation</span></a>
</div></section>
<section class="dev-overview"><div class="dev-wrap">'''+platforms+'''<div class="dev-actions"><a class="dev-btn" href="#realisations">Voir nos réalisations <span aria-hidden="true">↗</span></a><a class="dev-btn" href="#tarifs">Découvrir les tarifs <span aria-hidden="true">↓</span></a></div></div></section>'''
s=s[:start]+hero+s[end:]
p.write_text(s,encoding='utf-8')
p=Path('assets/developpement.css');s=p.read_text(encoding='utf-8').replace('font-family:Arial,sans-serif','font-family:inherit')
s+='''
/* Match the typography and photographic introduction of the Services page. */
.rz-dev{padding-top:90px}
.rz-dev h1,.rz-dev h2,.rz-dev h3{font-family:inherit;font-weight:400;letter-spacing:-1px}
.rz-dev .dev-hero{position:relative;text-align:center;background:url('/wp-content/uploads/2025/02/pexels-laura-tancredi-7078666-scaled.jpg.webp') center/cover;padding:90px 0;color:#fff;isolation:isolate}
.rz-dev .dev-hero:before{content:"";position:absolute;inset:0;background:url('/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-25-at-23.08.51_44484b38.jpg') center bottom/cover;opacity:.4;mix-blend-mode:multiply;z-index:-1}
.rz-dev .dev-hero .dev-wrap{max-width:960px;min-height:54vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
.rz-dev .dev-hero-divider{width:92px;border-top:4.6px solid #fff;margin:0 auto 30px}
.rz-dev .dev-hero h1{font-size:5rem;line-height:1.1;color:#fff;max-width:960px;margin:0 0 30px;letter-spacing:-1px}
.rz-dev .dev-hero .dev-intro{max-width:760px;font-size:18px;line-height:1.5;font-weight:400;color:#ebebeb;margin:0 auto 55px}
.rz-dev .dev-consultation{display:inline-flex;align-items:center;gap:10px;max-width:100%;border-top:2px solid #e2e2e2;color:#e2e2e2;font-size:1.8rem;line-height:1.8;text-transform:uppercase;letter-spacing:.5px;text-shadow:0 0 10px #0005}
.rz-dev .dev-consultation svg{width:1em;height:1em;fill:currentColor;flex-shrink:0}
.rz-dev .dev-consultation:hover{color:#fff;transform:translateY(3px)}
.rz-dev .dev-overview{padding-bottom:0}.rz-dev .dev-platforms{margin-top:0;border-top:0;padding-top:0}
@media(max-width:1024px){.rz-dev .dev-consultation{font-size:19px}}
@media(max-width:700px){.rz-dev{padding-top:90px}.rz-dev .dev-hero{padding:65px 0}.rz-dev .dev-hero .dev-wrap{min-height:44vh}.rz-dev .dev-hero h1{font-size:2.9rem;line-height:1.1}.rz-dev .dev-hero .dev-intro{font-size:15px;margin-bottom:35px}.rz-dev .dev-consultation{font-size:18px;line-height:1.5;padding-top:10px}.rz-dev .dev-hero:before{opacity:.53}}
'''
p.write_text(s,encoding='utf-8')
