from pathlib import Path
import re
p=Path('developpement/index.html');s=p.read_text(encoding='utf-8')
s=s.replace('Trois formules pour un catalogue ou une boutique d’électroménager et de mobilier.', 'Trois formules : votre site complet, une expérience immersive ou une visite à 360°.')
offers='''<div class="dev-prices">
<article class="dev-price"><span class="dev-tag">01 / Votre site</span><h3>Site complet avec vos photos</h3><div class="dev-amount">1 500 <span>DT</span></div><p>Vos images, notre savoir-faire.</p><ul><li>Site complet pour présenter votre activité et vos services</li><li>Intégration des photos fournies par vos soins</li><li>Présentation de vos réalisations et de vos offres</li><li>Contact par formulaire et WhatsApp</li><li>Affichage adapté au mobile, à la tablette et à l’ordinateur</li></ul><a class="dev-btn" href="mailto:contact@rzprod.tn?subject=Site%20complet%20avec%20mes%20photos">Créons votre site ↗</a></article>
<article class="dev-price"><span class="dev-tag">02 / Immersion</span><h3>Site immersif + photo &amp; vidéo</h3><div class="dev-amount">3 000 <span>DT</span></div><p>Une présentation qui prend vie.</p><ul><li>Tout le site complet de la formule 1</li><li>Photos et vidéos réalisées par RZ Prod</li><li>Une version immersive au design futuriste</li><li>Animation vidéo image par image au défilement</li><li>Back-office pour gérer vos contenus</li></ul><a class="dev-btn" href="mailto:contact@rzprod.tn?subject=Site%20immersif%20photo%20video%20et%20back-office">Créons votre expérience ↗</a></article>
<article class="dev-price featured"><span class="dev-tag">03 / L’expérience complète</span><h3>Site immersif + visite 360°</h3><div class="dev-amount">4 500 <span>DT</span></div><p>Votre univers, sous tous les angles.</p><ul><li>Tout le site immersif de la formule 2</li><li>Photos et vidéos réalisées par RZ Prod</li><li>Animation vidéo au défilement</li><li>Visite virtuelle à 360° avec navigation dans vos espaces</li><li>Back-office pour gérer vos contenus</li></ul><a class="dev-btn primary" href="mailto:contact@rzprod.tn?subject=Site%20immersif%20360%20et%20back-office">Passons à la visite 360° ↗</a></article>
</div>'''
s=re.sub(r'<div class="dev-prices">.*?</article>\s*</div>',lambda _:offers,s,count=1,flags=re.S)
s=s.replace('français, anglais et arabe, adaptation mobile, textes, recherche et filtres, gestion autonome du catalogue, WhatsApp et chatbot.', 'français, anglais et arabe, adaptation mobile, rédaction des textes et contact WhatsApp.')
s=s.replace('Site de présentation, 360°, animation au scroll, mobile ou desktop','Applications mobile, logiciels desktop et besoins spécifiques')
s=s.replace('Tarifs correspondant au périmètre catalogue et boutique ci-dessus. Conditions et fiscalité précisées dans votre devis.', 'Le périmètre, le volume de contenus photo et vidéo, le délai et les conditions fiscales sont précisés dans votre devis.')
p.write_text(s,encoding='utf-8')
assert s.count('<article class="dev-price')==3
assert 'Catalogue vitrine' not in s
print('Three offers updated.')
