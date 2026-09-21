from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
main='''<main class="rz-dev" id="contenu">
<section class="dev-hero"><div class="dev-wrap">
<p class="dev-kicker">RZ Prod / Développement digital</p>
<h1>Votre idée.<br><span>Web, mobile & desktop.</span></h1>
<p class="dev-intro">Un site qui vous présente. Une boutique qui vend. Une application qui simplifie votre quotidien. Nous créons le produit et les images qui lui donnent vie.</p>
<div class="dev-actions"><a class="dev-btn primary" href="#realisations">Voir nos réalisations <span aria-hidden="true">↗</span></a><a class="dev-btn" href="#tarifs">Découvrir les tarifs <span aria-hidden="true">↓</span></a></div>
<div class="dev-platforms"><div><h2>01 / Web</h2><p>Sites de présentation, boutiques en ligne et plateformes avec espace de gestion.</p></div><div><h2>02 / Mobile</h2><p>Applications Android et iOS, parcours clients et outils pour vos équipes sur le terrain.</p></div><div><h2>03 / Desktop</h2><p>Logiciels métier sur mesure : caisse, gestion, suivi et connexion à vos services.</p></div></div>
</div></section>
<section id="realisations"><div class="dev-wrap"><div class="dev-heading"><div><p class="dev-kicker">Du concret, déjà en ligne</p><h2>Nos réalisations.</h2></div><p>Du commerce de proximité aux plateformes métier, découvrez nos projets en situation.</p></div><div class="dev-projects">
PROJECTS
</div></div></section>
<section class="dev-immersive" id="experiences"><div class="dev-wrap"><div class="dev-heading"><div><p class="dev-kicker">Une autre façon de présenter</p><h2>Faites vivre l’expérience.</h2></div><p>Deux démonstrations à explorer : une visite immersive et une mise en scène pilotée par le défilement.</p></div><div class="dev-projects">
<a class="dev-project" href="https://djerba-pearl.vercel.app/" target="_blank" rel="noopener"><div class="dev-shot"><img src="/assets/developpement/djerba.webp" width="1000" height="625" loading="lazy" alt="Aperçu du site Mas des Oliviers avec sa visite virtuelle 360 degrés"></div><span class="dev-tag">Démonstration / Visite 360°</span><div class="dev-project-top"><h3>Ouvrez les portes de votre lieu.</h3><span aria-hidden="true">↗</span></div><p>Hôtel, maison d’hôtes, showroom : une visite interactive pour se déplacer dans vos espaces, avant de venir sur place.</p></a>
<a class="dev-project" href="https://xm6-scroll.vercel.app/" target="_blank" rel="noopener"><div class="dev-shot"><img src="/assets/developpement/xm6.webp" width="1000" height="625" loading="lazy" alt="Anatomie d’un GT : aperçu du concept animé image par image au défilement"></div><span class="dev-tag">Concept / Animation au scroll</span><div class="dev-project-top"><h3>Chaque scroll raconte la suite.</h3><span aria-hidden="true">↗</span></div><p>Une séquence vidéo rejouée image par image au fil du défilement. Le visiteur contrôle le rythme, avance et revient dans l’animation.</p><p class="dev-mini">Exercice de design non officiel, sans affiliation aux marques représentées.</p></a>
</div></div></section>
<section id="tarifs"><div class="dev-wrap"><div class="dev-heading"><div><p class="dev-kicker">Des offres lisibles, en dinars tunisiens</p><h2>Un site à votre mesure.</h2></div><p>Trois formules pour un catalogue ou une boutique d’électroménager et de mobilier.</p></div>
<div class="dev-prices">
<article class="dev-price"><span class="dev-tag">01 / Présenter</span><h3>Catalogue vitrine</h3><div class="dev-amount">1 500 <span>DT</span></div><p>Délai prévu : 10 jours</p><ul><li>Catalogue organisé par univers et catégories</li><li>Fiches produits, caractéristiques et prix</li><li>Demandes par WhatsApp ou formulaire</li><li>Photos fournies par vos soins</li></ul><a class="dev-btn" href="mailto:contact@rzprod.tn?subject=Projet%20catalogue%20vitrine">Parlons de votre catalogue ↗</a></article>
<article class="dev-price"><span class="dev-tag">02 / Vendre</span><h3>Boutique en ligne</h3><div class="dev-amount">3 000 <span>DT</span></div><p>Délai prévu : 3 semaines</p><ul><li>Tout le catalogue vitrine</li><li>Panier et commande en ligne</li><li>Livraison ou retrait en magasin</li><li>Paiement à la livraison ou en magasin</li><li>Commandes par email et dans votre espace de gestion</li></ul><a class="dev-btn" href="mailto:contact@rzprod.tn?subject=Projet%20boutique%20en%20ligne">Lançons votre boutique ↗</a></article>
<article class="dev-price featured"><span class="dev-tag">03 / Recommandé</span><h3>Boutique + shooting studio</h3><div class="dev-amount">4 500 <span>DT</span></div><p>Délai prévu : 4 semaines</p><ul><li>Toute la boutique en ligne</li><li>Jusqu’à 100 produits photographiés</li><li>Photos sur fond blanc, détourées et harmonisées</li><li>Une vidéo de présentation du magasin</li></ul><a class="dev-btn primary" href="mailto:contact@rzprod.tn?subject=Boutique%20et%20shooting%20studio">Créons le site et les images ↗</a></article>
</div>
<p class="dev-included"><strong>Dans les trois formules :</strong> français, anglais et arabe, adaptation mobile, textes, recherche et filtres, gestion autonome du catalogue, WhatsApp et chatbot. Domaine et hébergement la première année, référencement local, prise en main et un mois de corrections inclus.</p>
<div class="dev-custom"><div><h3>Site de présentation, 360°, animation au scroll, mobile ou desktop</h3><p>Une réalisation adaptée à votre activité, vos contenus et vos fonctionnalités. Nous précisons ensemble le périmètre, le délai et le budget en DT.</p></div><strong>Sur devis</strong></div>
<p class="dev-mini">Tarifs correspondant au périmètre catalogue et boutique ci-dessus. Conditions et fiscalité précisées dans votre devis. Règlement : 50 % à la commande, 50 % à la livraison.</p>
</div></section>
<section><div class="dev-wrap dev-cta"><div><p class="dev-kicker">Le développement et l’image, ensemble</p><h2>Parlons de ce que vous voulez créer.</h2><p>Votre activité, votre idée, vos besoins : on commence simplement.</p></div><a class="dev-btn primary" href="/contact/">Parler de mon projet <span aria-hidden="true">↗</span></a></div></section>
</main>'''
projects=[('ecoguide','Éco-Guide','https://smsa-ecoguide.com/','Web · Android / iOS · Géolocalisation','Site, espace de gestion, applications mobiles, outil de traçage et API géospatiale pour la SMSA Trésors du Mont Blanc à Nefza.'),('guesto','Guesto','https://guesto-service.com/','Web · Caisse · Application Android','Une solution pour la restauration : site, gestion de caisse, application client sans téléchargement et application serveur Android.'),('speranza','Speranza Pizza','https://speranza-pizza.fr/','Commande en ligne · Gestion','Un site de commande pour une enseigne française, avec espace de gestion et impression automatique des commandes en magasin.'),('fleur','Fleur-TN','https://fleur-tn.vercel.app/','E-commerce · Français / Arabe','Catalogue, panier, commandes et livraison. Une boutique avec contact WhatsApp et suivi de commande par SMS.')]
cards=[]
for image,name,url,tags,desc in projects:
 cards.append(f'<a class="dev-project" href="{url}" target="_blank" rel="noopener"><div class="dev-shot"><img src="/assets/developpement/{image}.webp" width="1000" height="625" loading="lazy" alt="Capture du site {name}"></div><span class="dev-tag">{tags}</span><div class="dev-project-top"><h3>{name}</h3><span aria-hidden="true">↗</span></div><p>{desc}</p></a>')
main=main.replace('PROJECTS',''.join(cards))
source=(root/'a-propos/index.html').read_text(encoding='utf-8')
source=re.sub(r'<main>.*?</main>',lambda m:main,source,flags=re.S)
source=re.sub(r'<script type="application/ld\+json".*?</script>','',source,flags=re.S)
source=re.sub(r'<title>.*?</title>','<title>Développement web, mobile &amp; desktop — RZ Prod</title>',source)
source=re.sub(r'<meta (?:name="(?:description|twitter:[^"]+)"|property="(?:og:[^"]+|article:[^"]+)")[^>]*>','',source)
source=source.replace('<link rel="canonical" href="/a-propos/">','<link rel="canonical" href="https://site-rz.vercel.app/developpement/"><meta name="description" content="RZ Prod développe vos sites web, boutiques, applications mobiles et logiciels desktop. Découvrez nos réalisations, expériences 360° et tarifs en DT."><meta property="og:title" content="Web, mobile &amp; desktop — RZ Prod"><meta property="og:description" content="Nos réalisations, expériences immersives et offres en DT."><meta property="og:image" content="https://site-rz.vercel.app/assets/developpement/guesto.webp"><meta property="og:url" content="https://site-rz.vercel.app/developpement/">')
source=source.replace('</head>','<link rel="stylesheet" href="/assets/developpement.css"></head>')
source=source.replace('current-menu-item','').replace('current_page_item','').replace('menu-item-10140 active','menu-item-10140')
dest=root/'developpement/index.html';dest.parent.mkdir(exist_ok=True);dest.write_text(source,encoding='utf-8')
# Add the page beside Services in existing desktop, mobile and footer menus.
for p in root.rglob('*.html'):
 if any(x in {'.git','.vercel','.artifacts','tools','wp-content','wp-includes','node_modules'} for x in p.relative_to(root).parts):continue
 s=p.read_text(encoding='utf-8')
 if 'href="/developpement/"' not in s:
  s=re.sub(r'(<li\b[^>]*>\s*<a\b[^>]*href="/nos-service/"[^>]*>.*?</a>\s*</li>)',r'\1<li class="menu-item menu-item-development"><a href="/developpement/" title="Développement">Développement</a></li>',s,flags=re.S)
 if p==dest:s=s.replace('href="/developpement/" title=', 'href="/developpement/" aria-current="page" title=')
 p.write_text(s,encoding='utf-8')
sitemap=root/'page-sitemap.xml';s=sitemap.read_text(encoding='utf-8')
if '/developpement/' not in s:sitemap.write_text(s.replace('</urlset>','<url><loc>https://site-rz.vercel.app/developpement/</loc></url>\n</urlset>'),encoding='utf-8')
print('Page and navigation updated.')
