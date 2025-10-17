// Slider-Horizontal
export function initHorizontalSlider() {
  const debounce = (fn, delay = 100) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  document.querySelectorAll('.horizontal_slider_container').forEach(slider => {
    const wrapper = slider.querySelector('[data-slider="content"]');
    const btnRight = slider.querySelector('[data-slider="btn-right"]');
    const btnLeft = slider.querySelector('[data-slider="btn-left"]');
    const buttonGroup = slider.querySelector('.button_group_wrapper');
    const wrapRightMain = btnRight?.closest('.button_main_wrap');
    const wrapLeftMain = btnLeft?.closest('.button_main_wrap');

    const getItems = () =>
      wrapper.querySelectorAll('[data-slider="item"]').length
        ? Array.from(wrapper.querySelectorAll('[data-slider="item"]'))
        : Array.from(wrapper.children);

    const scrollToItem = (index) => {
      const items = getItems();
      if (index < 0 || index >= items.length) return;
      items[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest' // ← verhindert vertikales Scrollen
      });
    };


    const getCenteredIndex = () => {
      const items = getItems();
      const centerX = wrapper.getBoundingClientRect().left + wrapper.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - centerX);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      return closest;
    };

    const scrollToNext = () => scrollToItem(getCenteredIndex() + 1);
    const scrollToPrevious = () => scrollToItem(getCenteredIndex() - 1);

    const updateButtons = () => {
      const scrollLeft = wrapper.scrollLeft;
      const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;

      const atStart = scrollLeft <= 0;
      const atEnd = scrollLeft >= maxScrollLeft - 1;
      const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth;

      if (!hasOverflow) {
        buttonGroup?.style.setProperty('display', 'none');
        wrapLeftMain?.style.setProperty('display', 'none');
        wrapRightMain?.style.setProperty('display', 'none');
        return;
      }

      buttonGroup?.style.setProperty('display', 'flex');
      wrapLeftMain?.style.setProperty('display', atStart ? 'none' : 'flex');
      wrapRightMain?.style.setProperty('display', atEnd ? 'none' : 'flex');
    };

    // Events
    btnRight?.addEventListener('click', scrollToNext);
    btnLeft?.addEventListener('click', scrollToPrevious);
    wrapper?.addEventListener('scroll', debounce(updateButtons));
    window.addEventListener('resize', debounce(updateButtons, 150));

    setTimeout(updateButtons, 200); // Initialer Delay für Layout-Stabilität
  });
}