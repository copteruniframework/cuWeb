/**
 * Wendet das gespeicherte oder bevorzugte Theme auf den Body der Seite an.
 *
 * Diese selbstaufrufende Funktion liest das Theme aus dem localStorage oder
 * nutzt die Systemeinstellung. Anschließend werden alle anderen Theme-Klassen entfernt
 * und nur das aktuelle Theme gesetzt. Zusätzlich wird das `color-scheme`-Attribut
 * auf dem Body aktualisiert, um Browserkomponenten entsprechend zu stylen.
 *
 * Unterstützte Themes:
 * - 'u-theme-dark'
 * - 'u-theme-light'
 *
 * @function ThemeCollector
 * @returns {void}
 */
(function () {
    'use strict';
    const THEMES = ['u-theme-dark', 'u-theme-light'];
    const body = document.body;

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (_) { }

    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'u-theme-dark' : 'u-theme-light';
    }

    body.classList.remove(...THEMES);
    body.classList.add(savedTheme);
    body.setAttribute('color-scheme', savedTheme === 'u-theme-dark' ? 'dark' : 'light');
})();