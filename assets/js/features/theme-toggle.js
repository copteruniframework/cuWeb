document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const THEMES = ['u-theme-dark', 'u-theme-light'];
    const body = document.body;
    const toggleBtn = document.getElementById('methemetoggle');

    if (!toggleBtn) {
        console.warn('Toggle-Button mit ID "methemetoggle" nicht gefunden.');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = body.classList.contains('u-theme-dark');
        const newTheme = isDark ? 'u-theme-light' : 'u-theme-dark';

        body.classList.remove(...THEMES);
        body.classList.add(newTheme);

        // globales Attribut setzen
        body.setAttribute(
            'color-scheme',
            newTheme === 'u-theme-dark' ? 'dark' : 'light'
        );

        try {
            localStorage.setItem('theme', newTheme);
        } catch (_) { }
    });
});