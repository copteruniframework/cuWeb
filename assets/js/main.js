// Slider-Horizontal
document.addEventListener("DOMContentLoaded", () => {
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
});

/**
 * Animiert das Öffnen/Schließen von `<details>`-Elementen mit **GSAP**.
 *
 * Verhalten:
 * - Intercepted `summary`-Klick (per `preventDefault`) für kontrollierte Animation.
 * - Öffnen: animiert das direkt nachfolgende Content-Element (`summary.nextElementSibling`)
 *   von `height: 0, opacity: 0` auf seine natürliche Höhe/Deckkraft.
 * - Schließen: animiert zurück auf `height: 0, opacity: 0` und setzt anschließend `detail.open = false`.
 * - Während einer laufenden Tween wird eine erneute Interaktion blockiert (`gsap.isTweening`).
 * - Optionales **Autoclose**: Mit `data-autoclose="true"` am `<details>` schließt das Element
 *   bei Klicks außerhalb automatisch.
 *
 * Voraussetzungen:
 * - GSAP v3 muss global verfügbar sein (`window.gsap`).
 * - Das animierte Content-Element ist `summary.nextElementSibling`. Stelle sicher,
 *   dass die gewünschte Content-Wrapper-Struktur vorliegt.
 *
 * Zugänglichkeit:
 * - Der native Toggle wird via JS gesteuert; der `open`-State bleibt korrekt gesetzt/zurückgesetzt.
 * - Die `summary`-Interaktion bleibt fokussierbar; Animation ändert nur Präsentation.
 *
 * @returns {void} Kein Rückgabewert.
 *
 * @example
 * <!-- Markup -->
 * <details data-autoclose="true">
 *   <summary>Mehr anzeigen</summary>
 *   <div>
 *     <p>Dein Inhalt …</p>
 *   </div>
 * </details>
 *
 * @example
 * // Initialisierung (Projektstil mit DOMContentLoaded)
 * document.addEventListener('DOMContentLoaded', () => {
 *   if (!window.gsap) return;
 *   initGSAPDetails();
 * });
 *
 * @since 1.0.0
 * @see https://gsap.com/docs/v3/
 */
function initGSAPDetails() {
  document.querySelectorAll('details').forEach(detail => {
    const summary = detail.querySelector('summary');
    const content = summary.nextElementSibling;

    const closeDetails = () => {
      if (!detail.open || gsap.isTweening(content)) return;

      gsap.to(content, {
        height: 0,
        opacity: 0,
        overflow: 'clip',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          detail.open = false;
          gsap.set(content, { clearProps: "all" });
        }
      });
    };

    summary.addEventListener('click', e => {
      e.preventDefault();
      if (gsap.isTweening(content)) return;

      if (!detail.open) {
        detail.open = true;
        gsap.fromTo(content, {
          height: 0,
          opacity: 0,
          overflow: 'clip',
        }, {
          height: content.scrollHeight,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(content, { clearProps: "all" });
          }
        });
      } else {
        closeDetails();
      }
    });

    // AUTOCLOSE HANDLING
    if (detail.dataset.autoclose === "true") {
      document.addEventListener('click', (e) => {
        // Wenn Klick außerhalb des <details>
        if (!detail.contains(e.target)) {
          closeDetails();
        }
      });
    }
  });
}
initGSAPDetails();

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
initCurrentYear();
// GSAP

// hide-show-fab
document.addEventListener('DOMContentLoaded', () => {
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
});

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

// Timer
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