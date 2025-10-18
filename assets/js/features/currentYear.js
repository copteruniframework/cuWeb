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
export function initCurrentYear() {
  const currentYear = String(new Date().getFullYear());
  const nodes = document.querySelectorAll('time[datetime="currentYear"]');
  if (nodes.length === 0) return;

  nodes.forEach(el => {
    el.setAttribute('datetime', currentYear);
    el.textContent = currentYear;
  });
}

