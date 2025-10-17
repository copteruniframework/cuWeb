export function initCUSlider() {
  document.querySelectorAll('[data-cu-slider="content"]').forEach(contentEl => {
    const items = Array.from(contentEl.children).filter(el => el.nodeType === 1);
    if (!items.length) return;

    // Buttons im gemeinsamen Wrapper (gleicher <div>-Container)
    let wrapper = contentEl.parentElement;
    const hasButtons = el => !!el?.querySelector('[data-cu-slider="btnLeft"], [data-cu-slider="btnRight"]');
    if (wrapper && !hasButtons(wrapper) && wrapper.parentElement && hasButtons(wrapper.parentElement)) {
      wrapper = wrapper.parentElement;
    }

    const btnLeft = wrapper?.querySelector('[data-cu-slider="btnLeft"]') || null;
    const btnRight = wrapper?.querySelector('[data-cu-slider="btnRight"]') || null;
    if (!btnLeft && !btnRight) return;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const currentIndex = () => {
      const centerX = contentEl.scrollLeft + contentEl.clientWidth / 2;
      let best = 0, dist = Infinity;
      items.forEach((it, i) => {
        const c = it.offsetLeft + it.offsetWidth / 2;
        const d = Math.abs(c - centerX);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };

    const goTo = (i) => {
      i = clamp(i, 0, items.length - 1);
      items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      requestAnimationFrame(updateButtons);
      setTimeout(updateButtons, 180);
    };

    const updateButtons = () => {
      const i = currentIndex();
      if (btnLeft) btnLeft.toggleAttribute('disabled', i <= 0);
      if (btnRight) btnRight.toggleAttribute('disabled', i >= items.length - 1);
    };

    btnLeft?.addEventListener('click', e => { e.preventDefault(); goTo(currentIndex() - 1); });
    btnRight?.addEventListener('click', e => { e.preventDefault(); goTo(currentIndex() + 1); });

    contentEl.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();
  });
}