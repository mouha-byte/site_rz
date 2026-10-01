// Initialize the exported theme without waiting for the first mouse movement.
const staticStyles = document.createElement('style');
staticStyles.textContent = 'header{background:#fff!important}header a,header a .menu-text{color:#101747!important}#open_offcanvas img{filter:brightness(0)}footer .footer__logo{width:auto!important;max-width:100%;object-fit:contain}.elementor .e-con.e-grid.e-con-boxed{grid-template-columns:1fr;grid-template-rows:1fr;justify-items:legacy}.static-email-link{overflow-wrap:anywhere}';
document.head.append(staticStyles);
// The offcanvas button already opens the mobile menu; show its generated links.
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = '.offcanvas__menu-wrapper .mean-nav>ul{display:block!important;list-style:none;padding:0;margin:0}.offcanvas__menu-wrapper .meanmenu-reveal{display:none!important}.offcanvas__menu-wrapper .mean-nav>ul>li>a{display:block;color:#fff!important;border-bottom:1px solid #333;padding:20px 32px;font-size:40px;line-height:1.4}.offcanvas__menu-wrapper .mean-nav .menu-text{display:flex;overflow:visible;color:#fff!important}.offcanvas__menu-wrapper .mean-nav .menu-text span{transform:none!important;color:inherit!important}.offcanvas__menu-wrapper .mean-nav a:focus-visible{outline:2px solid #40bfff;outline-offset:-4px}@media(max-width:767px){.offcanvas__menu-wrapper .mean-nav>ul>li>a{font-size:28px!important;line-height:1.4;padding:14px 24px!important}}';
document.head.append(mobileMenuStyles);
document.querySelector('#open_offcanvas')?.setAttribute('aria-label', 'Ouvrir le menu');
document.querySelector('#close_offcanvas')?.setAttribute('aria-label', 'Fermer le menu');
// Use the exported navigation directly on touch layouts, including archive pages.
const touchLayout = window.matchMedia('(max-width:1024px)');
const menuPanel = document.querySelector('.offcanvas__area');
const menuOpen = document.querySelector('#open_offcanvas');
const menuClose = document.querySelector('#close_offcanvas');
function setMobileMenu(open) {
  menuPanel?.classList.toggle('rz-mobile-open', open);
  document.body.classList.toggle('rz-menu-open', open);
  menuOpen?.setAttribute('aria-expanded', String(open));
  if (open) menuClose?.focus();
  else menuOpen?.focus();
}
menuOpen?.setAttribute('aria-expanded', 'false');
for (const [button, open] of [[menuOpen, true], [menuClose, false]]) {
  button?.addEventListener('click', event => {
    if (!touchLayout.matches) return;
    event.preventDefault(); event.stopImmediatePropagation(); setMobileMenu(open);
  }, true);
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuPanel?.classList.contains('rz-mobile-open')) setMobileMenu(false);
});
touchLayout.addEventListener('change', () => setMobileMenu(false));
// Execute exported configuration before its dependent bundles, including from cache.
window.rzThemeReady = (async () => {
  for (const original of document.querySelectorAll('script[type="litespeed/javascript"]')) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = false;
      for (const attribute of original.attributes) {
        if (!['type', 'data-src', 'src'].includes(attribute.name)) script.setAttribute(attribute.name, attribute.value);
      }
      const src = original.getAttribute('data-src') || original.getAttribute('src');
      if (src) {
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Unable to load ${src}`));
      } else script.textContent = original.textContent;
      original.replaceWith(script);
      if (!src) resolve();
    });
  }
  document.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
  window.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
  const phoneLayout = window.matchMedia('(max-width:767px)');
  const galleryImages = new IntersectionObserver(entries => {
    if (!phoneLayout.matches) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      const source = element.getAttribute('data-thumbnail');
      if (!source) continue;
      const preview = new Image();
      preview.onload = () => {
        element.style.backgroundImage = `url("${source}")`;
        element.classList.add('e-gallery-image-loaded');
      };
      preview.src = source;
      galleryImages.unobserve(element);
    }
  }, {rootMargin: '250px'});
  document.querySelectorAll('.e-gallery-image[data-thumbnail]').forEach(element => galleryImages.observe(element));
  const useNativeScroll = () => {
    if (!phoneLayout.matches) return;
    window.ScrollSmoother?.get?.()?.kill();
    window.ScrollTrigger?.refresh?.();
  };
  useNativeScroll();
  phoneLayout.addEventListener('change', useNativeScroll);
})();

// A static site has no WordPress mail endpoint. Open a user-reviewed email draft.
document.querySelectorAll('.static-contact-form').forEach(form => {
  form.action = 'mailto:contact@rzprod.tn';
  form.querySelector('button')?.setAttribute('title', 'Préparer un email dans votre messagerie');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = [...form.querySelectorAll('input:not([type=hidden]), textarea')];
    const body = fields.map(input => `${input.placeholder.replace(' *', '')} : ${input.value}`).join('\n\n');
    const subject = fields.find(input => input.placeholder.startsWith('Sujet'))?.value || 'Demande de contact';
    window.location.href = `mailto:contact@rzprod.tn?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

// Keep the original newsletter form appearance, without claiming a server subscription.
document.querySelectorAll('.mc4wp-form').forEach(form => {
  form.querySelector('input[type="email"]')?.setAttribute('placeholder', 'Votre email');
  form.querySelector('input[type="email"]')?.setAttribute('aria-label', 'Votre adresse email');
  form.querySelector('button')?.setAttribute('title', 'Demander une inscription par email');
  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    const email = form.querySelector('input[type="email"]').value;
    window.location.href = `mailto:contact@rzprod.tn?subject=${encodeURIComponent('Inscription à la newsletter')}&body=${encodeURIComponent('Bonjour, je souhaite recevoir votre newsletter à cette adresse : '+email)}`;
  }, true);
});
