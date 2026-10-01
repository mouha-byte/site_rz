(() => {
  const halos = [...document.querySelectorAll('.rz-home-halo')];
  const visible = new Set();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => halos.forEach(halo => halo.classList.toggle('is-visible', visible.has(halo) && !document.hidden && !motion.matches));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    update();
  }, {threshold:.05});
  halos.forEach(halo => observer.observe(halo));
  document.addEventListener('visibilitychange', update);
  motion.addEventListener('change', update);
})();
