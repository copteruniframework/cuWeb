export function initDetailsAnimate() {
    const HOVER_CLICK_DELAY = 750;

    const parseOpenOnHoverConfig = (value = '') => {
        const [enabledRaw = 'false', breakpointRaw] = value
            .split('|')
            .map(part => part.trim().toLowerCase());

        const enabled = enabledRaw === 'true';
        const breakpoint = breakpointRaw ? parseInt(breakpointRaw, 10) : null;

        return { enabled, breakpoint };
    };

    const isHoverAllowedForViewport = (breakpoint) => {
        if (breakpoint == null) return true;
        return window.innerWidth > breakpoint;
    };

    document.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const content = summary?.nextElementSibling;
        if (!content) return;

        const childEls = [...content.children];

        const hoverConfig = parseOpenOnHoverConfig(detail.dataset.openOnHover);
        let hoverActive = false;
        let hoverClickWindowActive = false;
        let hoverClickTimeoutId;

        const clearHoverClickTimeout = () => {
            if (hoverClickTimeoutId) {
                clearTimeout(hoverClickTimeoutId);
                hoverClickTimeoutId = null;
            }
        };

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
            }
        });
        tl.set(detail, { attr: { open: '' } }, 0);

        tl.to(content, {
            height: 'auto',
        });

        tl.to(childEls, {
            opacity: 1,
            stagger: 0.04,
            duration: 0.38,
        }, '-=0.25');

        let outsideHandler;
        if (detail.dataset.autoclose === 'true') {
            outsideHandler = (e) => {
                if (!detail.open) return;
                if (!content.contains(e.target) && !summary.contains(e.target)) {
                    tl.reverse();
                    document.removeEventListener('click', outsideHandler);
                }
            };
        }

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

        if (hoverConfig.enabled) {
            detail.addEventListener('mouseenter', () => {
                if (!isHoverAllowedForViewport(hoverConfig.breakpoint)) return;
                if (detail.open) return;

                hoverActive = true;
                hoverClickWindowActive = true;
                clearHoverClickTimeout();
                hoverClickTimeoutId = setTimeout(() => {
                    hoverClickWindowActive = false;
                }, HOVER_CLICK_DELAY);
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
    });
}