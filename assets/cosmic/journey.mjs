import {smooth} from "./star-physics.mjs";
export const SERVICES=[
  {
    "id": "developpement-web",
    "title": "Développement web",
    "label": "Création de sites web",
    "uv": [
      0.36,
      0.32
    ],
    "items": [
      "Sites vitrines pour présenter vos services.",
      "E-commerce pour vos ventes en ligne.",
      "Landing pages pour vos campagnes.",
      "Blogs et portfolios professionnels."
    ],
    "position": 0.14,
    "side": "right"
  },
  {
    "id": "production-audiovisuelle",
    "title": "Production audiovisuelle",
    "label": "Production & montage vidéo",
    "uv": [
      0.64,
      0.38
    ],
    "items": [
      "Spots publicitaires pour la TV et les réseaux sociaux.",
      "Montage vidéo et création de reels captivants.",
      "Couverture événementielle professionnelle.",
      "Vidéos corporate pour les entreprises."
    ],
    "position": 0.275,
    "side": "left"
  },
  {
    "id": "motion-design",
    "title": "Motion design",
    "label": "Donner du mouvement aux idées",
    "uv": [
      0.36,
      0.64
    ],
    "items": [
      "Animation 2D.",
      "Vidéos explicatives dynamiques.",
      "Créations originales pour captiver votre audience.",
      "Contenu animé pour les réseaux sociaux."
    ],
    "position": 0.41000000000000003,
    "side": "right"
  },
  {
    "id": "design-graphique",
    "title": "Design graphique",
    "label": "Une identité qui vous ressemble",
    "uv": [
      0.64,
      0.19
    ],
    "items": [
      "Chartes graphiques personnalisées.",
      "Affiches publicitaires modernes.",
      "Contenu social media adapté à votre audience.",
      "Flyers, banderoles et cartes de visite."
    ],
    "position": 0.545,
    "side": "left"
  },
  {
    "id": "campagnes-publicitaires",
    "title": "Campagnes publicitaires",
    "label": "Faire rayonner votre marque",
    "uv": [
      0.47,
      0.77
    ],
    "items": [
      "Création et gestion de campagnes publicitaires.",
      "Optimisation des publicités pour maximiser le retour sur investissement.",
      "Analyse des résultats.",
      "Ajustements en temps réel."
    ],
    "position": 0.68,
    "side": "right"
  },
  {
    "id": "social-media",
    "title": "Social media management",
    "label": "Créer le lien avec votre communauté",
    "uv": [
      0.66,
      0.51
    ],
    "items": [
      "Création et gestion de comptes Facebook, Instagram, LinkedIn et plus.",
      "Planification de contenu engageant.",
      "Animation des communautés.",
      "Rapports d’analyse."
    ],
    "position": 0.8150000000000001,
    "side": "left"
  }
];

const mix=(a,b,t)=>a+(b-a)*t;
function blend(a,b,t,lift=0){t=smooth(t);return {x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t)+Math.sin(Math.PI*t)**2*lift};}
export function serviceOpacity(progress,index){const center=SERVICES[index].position;return smooth((progress-(center-.048))/.025)*(1-smooth((progress-(center+.03))/.028));}
export function cameraAt(progress,stops){
  const start={x:0,y:0,z:3};
  if(progress<=.045)return start;
  if(progress<SERVICES[0].position-.03)return blend(start,stops[0],(progress-.045)/(SERVICES[0].position-.03-.045));
  for(let i=0;i<stops.length;i++){
    const end=SERVICES[i].position+.03;
    if(progress<=end)return stops[i];
    if(i<stops.length-1){const next=SERVICES[i+1].position-.03;if(progress<next)return blend(stops[i],stops[i+1],(progress-end)/(next-end),.85);}
  }
  const end=stops.at(-1),t=smooth((progress-.86)/.14);
  return {x:end.x,y:end.y,z:end.z-t*.24};
}
export function idleReturn(lastInput,now){return now-lastInput>.35;}
