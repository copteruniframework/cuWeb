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