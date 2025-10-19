import { toggleBodyOverflow } from "../utils/dom";
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
export function initGlobalNav() {
  const nav = document.querySelector('.g_nav');
  const btn = document.getElementById('g_nav_btn_mobile_menu');
  const icon = btn.querySelector('use');
  const menu = document.querySelector('.g_nav_menu');
  const items = menu.querySelectorAll('.g_nav_item');

  // Ursprungsort merken (Platzhalter vor dem Menü einfügen)
  const placeholder = document.createComment('g_nav_menu:placeholder');
  menu.parentNode.insertBefore(placeholder, menu);

  const mm = gsap.matchMedia();

  mm.add('(max-width: 1040px)', () => {
    const moveAfterButton = () => nav.insertAdjacentElement('beforeend', menu);
    const restoreOriginal = () => placeholder.parentNode.insertBefore(menu, placeholder);
    menu.removeAttribute('open');

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.30, ease: 'power2.out', immediateRender: false },
      onStart() {
        toggleBodyOverflow();
        moveAfterButton();
        menu.setAttribute('open', '');
        btn.setAttribute('aria-expanded', 'true');
        icon.setAttribute('href', '#icon-x-lg');
      },
      onReverseComplete() {
        toggleBodyOverflow();
        gsap.set(menu, { clearProps: 'all' });
        gsap.set(items, { clearProps: 'all' });
        menu.removeAttribute('open');
        btn.setAttribute('aria-expanded', 'false');
        icon.setAttribute('href', '#icon-menu');
        restoreOriginal();
      }
    });

    tl.set(menu, { display: 'block' }, 0)
      .fromTo(icon, { opacity: 0 }, { opacity: 1 }, 0)
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
      toggleBodyOverflow();
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

export function initGlobalNavMenu() {
  const toggleInput = document.getElementById('g_nav_menu_toggle');
  const toggleLabel = document.querySelector('label[for="g_nav_menu_toggle"]');
  const icon = toggleLabel.querySelector('use');

  // Guard: GSAP
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap;

  const setAria = (isOpen) => {
    toggleLabel.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    toggleLabel.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const setIcon = (isOpen) => {
    icon.setAttribute('href', isOpen ? '#icon-x-lg' : '#icon-menu');
  };

  const animateMenu = (isOpen) => {
    if (!hasGSAP) return;
    gsap.to(document.querySelector('.g_nav_menu'), isOpen
      ? {
        display: 'block',
        height: `calc(100vh - var(--global-nav--height))`,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      }
      : {
        display: 'none',
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      }
    );
  };

  const sync = () => {
    const isOpen = !!toggleInput.checked;
    setAria(isOpen);
    setIcon(isOpen);
    animateMenu(isOpen);
  };

  if (hasGSAP) {
    // Mark JS as active for progressive enhancement
    document.documentElement.classList.add('js-nav');
    gsap.matchMedia().add('(max-width: 1040px)', () => {
      gsap.set(document.querySelector('.g_nav_menu'), { height: 0, opacity: 0, display: 'none' });
      sync();
      toggleInput.addEventListener('change', sync);
    });
  }
}

export function initGlobalNavHideOnScroll() {
  const nav = document.querySelector(".g_nav");
  let lastState = "shown"; // "shown" | "hidden"
  const TOP_LOCK = 50;   // px: Bereich ab Seitenanfang, in dem Nav immer sichtbar ist
  const SPEED_MIN = 350; // min. Geschwindigkeit, um kleine Wackler zu ignorieren

  // Helfer, um Animationen zu entkoppeln und zu überschreiben
  const showNav = () => {
    if (lastState === "shown") return;
    gsap.to(nav, { yPercent: 0, duration: 0.25, ease: "power2.out", overwrite: true });
    lastState = "shown";
  };
  const hideNav = () => {
    if (lastState === "hidden") return;
    gsap.to(nav, { yPercent: -100, duration: 0.25, ease: "power2.out", overwrite: true });
    lastState = "hidden";
  };

  // ScrollTrigger zur Richtungs-Erkennung
  ScrollTrigger.create({
    start: 0,                  // ab Seitenanfang aktiv
    end: document.body.scrollHeight, // bis Seitenende
    onUpdate(self) {
      // Am Seitenanfang: Nav immer sichtbar. Position hat Vorrang vor Geschwindigkeit.
      if (self.scroll() <= TOP_LOCK) {
        showNav();
        return;
      }

      // Kleine Scroll-Ruckler ignorieren
      if (Math.abs(self.getVelocity()) < SPEED_MIN) return;

      // self.direction: 1 = nach unten, -1 = nach oben
      if (self.direction === 1) hideNav();
      else showNav();
    }
  });

  // Bei Refresh/Resizes Top-Regel erneut anwenden
  ScrollTrigger.addEventListener('refresh', () => {
    if (window.scrollY <= TOP_LOCK) showNav();
  });

  // Initialzustand: Am Top immer einblenden
  if (window.scrollY <= TOP_LOCK) showNav();
  else hideNav();
}