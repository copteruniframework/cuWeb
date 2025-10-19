import {initHorizontalSlider} from './features/horizontal-slider.js';
import {initDetailsAnimate} from './features/details-animate.js';
import {initCurrentYear} from './features/currentYear.js';
import {initFABScrollShow} from './features/fab-scroll.js';
import {initGlobalNav} from './features/global-nav.js';
import {initGlobalNavMenu} from './features/global-nav.js';
import {initGlobalNavHideOnScroll} from './features/global-nav.js';
import {initTimer} from './features/timer.js';
import { initThemeToggle } from './features/theme-toggle.js';

(function () {
  const init = () => {
    initThemeToggle();
    initCurrentYear();
    initDetailsAnimate();
    initHorizontalSlider();
    initFABScrollShow();
    initTimer();
    initGlobalNavMenu();
    initGlobalNavHideOnScroll();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init(); // DOM schon fertig -> direkt starten
  }
})();











