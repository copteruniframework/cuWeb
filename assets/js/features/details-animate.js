export function initDetailsAnimate() {
    const HOVER_CLICK_DELAY = 750;
    const hasGSAP = typeof window !== 'undefined' && !!window.gsap;

    const isHoverAllowedForViewport = (breakpoint) => {
        if (breakpoint == null) return true;
        return window.innerWidth > breakpoint;
    };

    const getBool = (el, attr, defaultValue) => {
        if (!el.dataset) return defaultValue;
        const val = el.dataset[attr];
        if (val === undefined) return defaultValue;
        return val === 'true';
    };

    const getInt = (el, attr, defaultValue) => {
        if (!el.dataset) return defaultValue;
        const val = el.dataset[attr];
        if (val === undefined || val === '') return defaultValue;
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? defaultValue : n;
    };

    document.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const content = summary?.nextElementSibling;
        if (!content) return;

        const childEls = [...content.children];

        const hoverEnabled = getBool(detail, 'hover', false);
        const hoverMinWidth = getInt(detail, 'hoverMinWidth', null);
        const hoverDelay = getInt(detail, 'hoverDelay', HOVER_CLICK_DELAY);
        const wantsAnimation = getBool(detail, 'animate', true);

        let hoverActive = false;
        let hoverClickWindowActive = false;
        let hoverClickTimeoutId;

        const clearHoverClickTimeout = () => {
            if (hoverClickTimeoutId) {
                clearTimeout(hoverClickTimeoutId);
                hoverClickTimeoutId = null;
            }
        };

        let requestClose = () => { detail.open = false; };

        let outsideHandler;
        if (getBool(detail, 'autoclose', false)) {
            outsideHandler = (e) => {
                if (!detail.open) return;
                const pathContains = e.composedPath ? (p => p.includes(content) || p.includes(summary))(e.composedPath()) : (content.contains(e.target) || summary.contains(e.target));
                if (!pathContains) {
                    requestClose();
                    document.removeEventListener('click', outsideHandler);
                }
            };
        }

        const canAnimate = hasGSAP && wantsAnimation;
        if (canAnimate) {
            // --- GSAP-Variante mit Animation ---
            const gsap = window.gsap;

            gsap.set(content, {
                height: 0,
                overflow: 'hidden',
            });

            gsap.set(childEls, {
                opacity: 0,
            });

            const tl = gsap.timeline({
                paused: true,
                defaults: { duration: 0.35, ease: 'power2.out' },
                onReverseComplete: () => {
                    detail.open = false;
                    if (outsideHandler) document.removeEventListener('click', outsideHandler);
                }
            });

            requestClose = () => {
                tl.reverse();
            };

            tl.set(detail, { attr: { open: '' } }, 0);

            tl.to(content, {
                height: 'auto',
            });

            tl.to(childEls, {
                opacity: 1,
                stagger: 0.04,
                duration: 0.38,
            }, '-=0.25');

            summary.addEventListener('click', (e) => {
                e.preventDefault();

                if (!detail.open) {
                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();
                    tl.invalidate().play(0);
                    if (outsideHandler) document.addEventListener('click', outsideHandler);
                } else {
                    if (hoverActive && hoverClickWindowActive) {
                        hoverActive = false;
                        hoverClickWindowActive = false;
                        clearHoverClickTimeout();
                        if (outsideHandler) document.addEventListener('click', outsideHandler);
                        return;
                    }

                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();
                    tl.reverse();
                }
            });

            if (hoverEnabled) {
                detail.addEventListener('mouseenter', () => {
                    if (!isHoverAllowedForViewport(hoverMinWidth)) return;
                    if (detail.open) return;

                    hoverActive = true;
                    hoverClickWindowActive = true;
                    clearHoverClickTimeout();
                    hoverClickTimeoutId = setTimeout(() => {
                        hoverClickWindowActive = false;
                    }, hoverDelay);
                    tl.invalidate().play(0);
                });

                detail.addEventListener('mouseleave', () => {
                    if (!hoverActive) return;

                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();

                    if (detail.open) {
                        tl.reverse();
                    }
                });
            }
        } else {
            // --- Fallback ohne GSAP: funktional ohne Animation ---
            // Startzustand: keine forcierten Styles; wir steuern nur das `open`-Attribut

            summary.addEventListener('click', (e) => {
                e.preventDefault();

                if (!detail.open) {
                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();
                    detail.open = true;
                    if (outsideHandler) document.addEventListener('click', outsideHandler);
                } else {
                    if (hoverActive && hoverClickWindowActive) {
                        hoverActive = false;
                        hoverClickWindowActive = false;
                        clearHoverClickTimeout();
                        if (outsideHandler) document.addEventListener('click', outsideHandler);
                        return;
                    }

                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();
                    detail.open = false;
                }
            });

            if (hoverEnabled) {
                detail.addEventListener('mouseenter', () => {
                    if (!isHoverAllowedForViewport(hoverMinWidth)) return;
                    if (detail.open) return;

                    hoverActive = true;
                    hoverClickWindowActive = true;
                    clearHoverClickTimeout();
                    hoverClickTimeoutId = setTimeout(() => {
                        hoverClickWindowActive = false;
                    }, hoverDelay);
                    detail.open = true;
                });

                detail.addEventListener('mouseleave', () => {
                    if (!hoverActive) return;

                    hoverActive = false;
                    hoverClickWindowActive = false;
                    clearHoverClickTimeout();

                    if (detail.open) {
                        detail.open = false;
                    }
                });
            }
        }
    });
}