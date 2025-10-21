/**
 * Initialisiert den Theme-Umschalter für die Webseite.
 *
 * Diese Funktion sucht nach einem Button mit der ID `tgl-theme` und bindet
 * ein Klick-Event daran. Beim Klick wird das globale Farbschema der Seite
 * (hell oder dunkel) umgeschaltet, die entsprechende CSS-Klasse auf den
 * `<body>` angewendet, das `color-scheme`-Attribut gesetzt und das Ergebnis
 * im `localStorage` gespeichert.
 *
 * Funktionsweise:
 * - Unterstützte Themes: 'u-theme-dark', 'u-theme-light'
 * - Der aktuelle Zustand wird durch Vorhandensein der CSS-Klasse auf `<body>` bestimmt.
 * - Die Auswahl bleibt über Seitenaufrufe hinweg durch Speicherung im localStorage bestehen.
 *
 * @function initThemeToggle
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 * @example
 * // In der Initialisierung der Seite:
 * initThemeToggle();
 */
export function initThemeToggle() {
    'use strict';

    const THEMES = ['u-theme-dark', 'u-theme-light'];
    const root = document.documentElement;
    const toggleBtn = document.getElementById('tgl-theme');

    if (!toggleBtn) {
        console.warn('Toggle-Button mit ID "tgl-theme" nicht gefunden.');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = root.classList.contains('u-theme-dark');
        const newTheme = isDark ? 'u-theme-light' : 'u-theme-dark';

        root.classList.remove(...THEMES);
        root.classList.add(newTheme);

        // globales Attribut setzen
        root.setAttribute(
            'color-scheme',
            newTheme === 'u-theme-dark' ? 'dark' : 'light'
        );

        try {
            localStorage.setItem('theme', newTheme);
        } catch (_) { }
    });
}