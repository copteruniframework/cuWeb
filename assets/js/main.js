import "../css/global-nav.css";
import "../css/style.css";
import "../css/table.css";
import "../css/toggle.css";

import {
  initGlobalNav, // nur lassen, wenn du es wirklich aufrufst
  initGlobalNavMenu,
  initGlobalNavHideOnScroll,
} from "./features/global-nav.js";
import { initHorizontalSlider } from "./features/horizontal-slider.js";
import { initDetailsAnimate } from "./features/details-animate.js";
import { initCurrentYear } from "./features/currentYear.js";
import { initFABScrollShow } from "./features/fab-scroll.js";
import { initTimer } from "./features/timer.js";
import { initThemeToggle } from "./features/theme-toggle.js";
import { cuListSort } from "./features/cu-list-sort.js";

function init() {
  initThemeToggle();
  initCurrentYear();
  initDetailsAnimate();
  initHorizontalSlider();
  initFABScrollShow();
  initTimer();
  initGlobalNavMenu();
  initGlobalNavHideOnScroll();
  // initGlobalNav(); // ausführen, falls benötigt
  cuListSort();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}