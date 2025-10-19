import {initHorizontalSlider} from './features/horizontal-slider.js';
import {initDetailsAnimate} from './features/details-animate.js';
import {initCurrentYear} from './features/currentYear.js';
import {initFABScrollShow} from './features/fab-scroll.js';
import {initGlobalNav} from './features/global-nav.js';
import {initGlobalNavMenu} from './features/global-nav.js';
import {initTimer} from './features/timer.js';

(function () {
  const init = () => {
    initCurrentYear();
    initDetailsAnimate();
    initHorizontalSlider();
    initFABScrollShow();
    initTimer();
    initGlobalNavMenu();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init(); // DOM schon fertig -> direkt starten
  }
})();











