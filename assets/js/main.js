(function () {
  const init = () => {
    initCurrentYear();
    initGSAPDetails();
    initHorizontalSlider();
    initFABScrollShow();
    initCUSlider();
    initTimer();
    initGlobalNav();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init(); // DOM schon fertig -> direkt starten
  }
})();

// Slider-Horizontal

function initHorizontalSlider() {
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

function initGSAPDetails() {
  document.querySelectorAll('details').forEach(detail => {
    const summary = detail.querySelector('summary');
    const content = summary?.nextElementSibling;
    if (!content) return;

    const childEls = [...content.children];

    gsap.set(content, {
      height: 0,
      overflow: 'hidden',
    });

    gsap.set(childEls, {
      opacity: 0,
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.35, ease: 'power2.out' },
      onReverseComplete: () => {
        detail.open = false;
      }
    });
    tl.set(detail, { attr: { open: '' } }, 0);

    tl.to(content, {
      height: 'auto',
    });

    tl.to(childEls, {
      opacity: 1,
      stagger: 0.04,
      duration: 0.38,
    }, '-=0.25');

    let outsideHandler;
    if (detail.dataset.autoclose === 'true') {
      outsideHandler = (e) => {
        if (!detail.open) return;
        if (!content.contains(e.target) && !summary.contains(e.target)) {
          tl.reverse();
          document.removeEventListener('click', outsideHandler);
        }
      };
    }

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (!detail.open) {
        tl.invalidate().play(0);
        if (outsideHandler) document.addEventListener('click', outsideHandler);
      } else {
        tl.reverse();
      }
    });

    if (detail.dataset.openOnHover === 'true') {
      detail.addEventListener('mouseenter', () => {
        if (!detail.open) {
          tl.invalidate().play(0);
        }
      });

      detail.addEventListener('mouseleave', () => {
        if (detail.open) {
          tl.reverse();
        }
      });
    }

  });
}

/**
 * Setzt das **aktuelle Jahr** in alle `<time>`-Elemente mit `datetime="currentYear"`.
 *
 * - Aktualisiert **sichtbaren Text** (`textContent`) und das **`datetime`-Attribut** (ISO-Jahr).
 * - Nützlich für Footer-Copyrights, damit keine jährliche manuelle Pflege nötig ist.
 *
 * @returns {void} Gibt keinen Wert zurück.
 *
 * @example
 * // HTML:
 * // <small class="u-display-block u-text-align-center">
 * //   <span>Copyright © </span>
 * //   <time datetime="currentYear"></time>
 * //   <span> Copteruni GmbH, alle Rechte vorbehalten.</span>
 * // </small>
 *
 * // JavaScript:
 * initCurrentYear();
 *
 * @example
 * // Als ES-Module nach DOM-Ladung:
 * document.addEventListener('DOMContentLoaded', () => {
 *   initCurrentYear();
 * });
 *
 * @since 1.0.0
 * @see https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-time-element
 */
function initCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('time[datetime="currentYear"]').forEach(el => {
    el.dateTime = currentYear;
    el.textContent = currentYear;
  });
}

function initFABScrollShow() {
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

function initCUSlider() {
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

function initTimer() {
  document.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll('[data-cu-counter="timer"]');

    els.forEach((el, i) => {
      const storageKey = `cu-timer-${i}`;
      const text = el.textContent.trim();
      const [mm, ss] = text.split(':').map(Number);
      const startSeconds = mm * 60 + ss;

      let endTime = localStorage.getItem(storageKey);

      if (!endTime) {
        endTime = Date.now() + startSeconds * 1000;
        localStorage.setItem(storageKey, endTime);
      } else {
        endTime = parseInt(endTime, 10);
      }

      const update = () => {
        const remaining = Math.floor((endTime - Date.now()) / 1000);

        if (remaining <= 0) {
          clearInterval(interval);
          el.textContent = "00:00";
          localStorage.removeItem(storageKey);
          return;
        }

        const m = String(Math.floor(remaining / 60)).padStart(2, '0');
        const s = String(remaining % 60).padStart(2, '0');
        el.textContent = `${m}:${s}`;
      };

      // gleich einmal initial aktualisieren (aber noch hidden lassen)
      update();

      const interval = setInterval(update, 1000);

      // Sichtbar machen erst nach der ersten Sekunde
      setTimeout(() => {
        el.style.visibility = "visible";
      }, 1000);
    });
  });
}
/**
 * Initialisiert die globale Navigation mit responsivem Verhalten.
 * - Bei kleinen Bildschirmen (max-width: 1024px) wird das Menü in einen mobilen Stil umgewandelt.
 * - Ein Button toggelt das Menü mit einer Animation (GSAP).
 * - Scrollen wird beim geöffneten Menü gesperrt.
 * - Das Menü kann mit Escape oder durch erneutes Klicken auf den Button geschlossen werden.
 *
 * Voraussetzungen:
 * - GSAP v3 muss global verfügbar sein (`window.gsap`).
 * - HTML-Struktur:
 *   ```html
 *   <nav class="g_nav">
 *     <button id="g_nav_btn_mobile_menu" aria-expanded="false">Menu</button>
 *     <div class="g_nav_menu">
 *       <a class="g_nav_item" href="#">Item 1</a>
 *       <a class="g_nav_item" href="#">Item 2</a>
 *       ...
 *     </div>
 *   </nav>
 *   ```
 *
 * Zugänglichkeit:
 * - Der Button hat ein `aria-expanded`-Attribut, das den Zustand des Menüs widerspiegelt.
 * - Das Menü bleibt im DOM und wird nur visuell umpositioniert.
 *
 * @returns {void} Kein Rückgabewert.
 *
 * @example
 * // Initialisierung (Projektstil mit DOMContentLoaded)
 * document.addEventListener('DOMContentLoaded', () => {
 *   if (!window.gsap) return;
 *   initGlobalNav();
 * });
 *
 * @since 1.0.0
 * @see https://gsap.com/docs/v3/
 */
function initGlobalNav() {
  const nav = document.querySelector('.g_nav');
  const btn = document.getElementById('g_nav_btn_mobile_menu');
  const menu = document.querySelector('.g_nav_menu');
  const items = menu.querySelectorAll('.g_nav_item');

  // Ursprungsort merken (Platzhalter vor dem Menü einfügen)
  const placeholder = document.createComment('g_nav_menu:placeholder');
  menu.parentNode.insertBefore(placeholder, menu);

  // --- simpler Scroll-Lock via Klasse auf <body> ---
  const lockScroll = () => document.body.classList.add('u-overflow-hidden');
  const unlockScroll = () => document.body.classList.remove('u-overflow-hidden');

  const mm = gsap.matchMedia();

  mm.add('(max-width: 1040px)', () => {
    const moveAfterButton = () => nav.insertAdjacentElement('beforeend', menu);
    const restoreOriginal = () => placeholder.parentNode.insertBefore(menu, placeholder);
    menu.removeAttribute('open');

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.30, ease: 'power2.out', immediateRender: false },
      onStart() {
        lockScroll();
        moveAfterButton();
        menu.setAttribute('open', '');
        btn.setAttribute('aria-expanded', 'true');
      },
      onReverseComplete() {
        unlockScroll();
        gsap.set(menu, { clearProps: 'all' });
        gsap.set(items, { clearProps: 'all' });
        menu.removeAttribute('open');
        btn.setAttribute('aria-expanded', 'false');
        restoreOriginal();
      }
    });

    tl.set(menu, { display: 'block' }, 0)
      .fromTo(menu, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0)
      .set(items, { y: -30, opacity: 0 }, 0)
      .to(items, { y: 0, opacity: 1, stagger: 0.04, duration: 0.3 }, '-=0.2');

    const onClick = () => {
      if (tl.isActive()) return;
      (tl.reversed() || tl.progress() === 0) ? tl.play() : tl.reverse();
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && tl.progress() > 0 && !tl.reversed()) tl.reverse();
    };

    btn.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      unlockScroll(); // falls noch aktiv
      btn.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      tl.kill();
      gsap.set(menu, { clearProps: 'all' });
      gsap.set(items, { clearProps: 'all' });
      menu.removeAttribute('open');
      btn.setAttribute('aria-expanded', 'false');
      restoreOriginal();
    };
  });
}
