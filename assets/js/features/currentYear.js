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
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('time[datetime="currentYear"]').forEach(el => {
    el.dateTime = currentYear;
    el.textContent = currentYear;
  });
}

