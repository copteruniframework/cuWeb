export function initFABScrollShow() {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.fab-section-center-bottom').forEach((fabEl) => {
    const parent = fabEl.parentElement;

    if (parent) {
      // Ausgangszustand: versteckt
      gsap.set(fabEl, { autoAlpha: 0 });

      // ScrollTrigger mit reversiblem Verhalten
      gsap.to(fabEl, {
        autoAlpha: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top+=150px bottom',
          toggleActions: 'play none none reverse'
        }
      });
    }
  });
}