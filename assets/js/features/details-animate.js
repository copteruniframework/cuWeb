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

        // --- Unified state and outside-click management ---
        let outsideHandler = null;
        const autoclose = getBool(detail, 'autoclose', false);

        const addOutside = () => {
            if (!autoclose || outsideHandler) return;
            outsideHandler = (e) => {
                if (!detail.open) return;
                const path = e.composedPath ? e.composedPath() : [];
                const inside = path.length
                    ? (path.includes(summary) || path.includes(content))
                    : (summary.contains(e.target) || content.contains(e.target));
                if (inside) return;
                closePanel();
            };
            document.addEventListener('pointerdown', outsideHandler, { capture: true });
        };

        const removeOutside = () => {
            if (!outsideHandler) return;
            document.removeEventListener('pointerdown', outsideHandler, { capture: true });
            outsideHandler = null;
        };

        // --- Animation adapter (GSAP or fallback) ---
        const canAnimate = hasGSAP && wantsAnimation;
        let tl = null;

        const api = {
            open: () => { detail.open = true; },
            close: () => { detail.open = false; }
        };

        if (canAnimate) {
            const gsap = window.gsap;
            gsap.set(content, { height: 0, overflow: 'hidden' });
            gsap.set(childEls, { opacity: 0 });

            tl = gsap.timeline({
                paused: true,
                defaults: { duration: 0.35, ease: 'power2.out' },
                onReverseComplete: () => {
                    detail.open = false;
                    removeOutside();
                }
            });

            tl.set(detail, { attr: { open: '' } }, 0);
            tl.to(content, { height: () => content.scrollHeight });
            tl.set(content, { clearProps: 'height' });
            tl.to(childEls, { opacity: 1, stagger: 0.04, duration: 0.38 }, '-=0.25');

            api.open = () => { tl.invalidate().play(0); addOutside(); };
            api.close = () => { tl.reverse(); };
        }

        // --- Unified open/close helpers ---
        function openPanel() {
            // wichtige Änderung: Flags und Timeout NICHT zurücksetzen,
            // damit Hover→Click-Delay (hoverClickWindowActive) erhalten bleibt
            api.open();
            if (!canAnimate) addOutside();
        }

        function closePanel() {
            // Flags und Timeout hier ebenfalls nicht anfassen; Mouseleave/Click-Handler steuern das explizit
            api.close();
            if (!canAnimate) removeOutside();
        }

        // — External control: allow other scripts to request a graceful close
        detail.addEventListener('details:request-close', (e) => {
            // Prevent bubbling handlers from acting on the same signal
            e.stopPropagation();
            if (detail.open) closePanel();
        });

        // --- Event listeners (deduplicated) ---
        summary.addEventListener('click', (e) => {
            e.preventDefault();
            if (!detail.open) {
                openPanel();
            } else {
                if (hoverActive && hoverClickWindowActive) {
                    addOutside();
                    return;
                }
                closePanel();
            }
        });

        if (hoverEnabled) {
            detail.addEventListener('mouseenter', () => {
                if (!isHoverAllowedForViewport(hoverMinWidth)) return;
                if (detail.open) return;

                hoverActive = true;
                hoverClickWindowActive = true;
                clearHoverClickTimeout();
                hoverClickTimeoutId = setTimeout(() => { hoverClickWindowActive = false; }, hoverDelay);
                openPanel();
            });

            detail.addEventListener('mouseleave', () => {
                if (!hoverActive) return;

                hoverActive = false;
                hoverClickWindowActive = false;
                clearHoverClickTimeout();

                if (detail.open) closePanel();
            });
        }
    });
}