/**
 * Initialisiert Countdown-Timer für alle Elemente mit data-cu-counter="timer".
 *
 * Funktionsweise:
 * - Liest Startzeit im Format mm:ss aus dem Elementtext.
 * - Berechnet das Endzeitpunkt basierend auf aktueller Zeit.
 * - Speichert Endzeit im localStorage, um Fortführung bei Seitenreload zu ermöglichen.
 * - Aktualisiert jede Sekunde die verbleibende Zeit.
 * - Setzt Timer auf 00:00 und entfernt Storage-Eintrag, wenn Zeit abgelaufen.
 *
 * Anzeige:
 * - Timer bleibt zunächst unsichtbar und wird nach der ersten Aktualisierung sichtbar geschaltet.
 *
 * @function initTimer
 * @returns {void}
 * @example
 * // Timer initialisieren
 * initTimer();
 */
export function initTimer() {
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
}