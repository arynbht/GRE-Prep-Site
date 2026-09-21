/**
 * Scroll reveal, Subtle tier.
 *
 * Matches the GSAP snippet the design system returned — 350ms, small y offset,
 * fade-led, triggered at `top 90%` — without the dependency. GSAP plus
 * ScrollTrigger is roughly 50KB gzipped, which is more than three times the
 * whole motion budget for a fade-up.
 *
 * Two safety properties the naive version misses:
 *   1. The hiding CSS is gated behind `js-reveal` on <html>, added here. If
 *      this module never runs, nothing is ever hidden, so content cannot be
 *      stranded invisible.
 *   2. Reduced motion short-circuits before anything is hidden at all.
 */

const REVEALED = 'data-revealed';

export function initReveal(): () => void {
  if (typeof window === 'undefined') return () => {};

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // No IntersectionObserver, or the user asked for less motion: show everything
  // in its final state and never add the hiding class.
  if (reduced || !('IntersectionObserver' in window)) {
    root.classList.remove('js-reveal');
    document.querySelectorAll('.reveal').forEach((el) => el.setAttribute(REVEALED, 'true'));
    return () => {};
  }

  root.classList.add('js-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute(REVEALED, 'true');
        // Reveal once. Re-animating on scroll-back is the kind of motion that
        // reads as a defect rather than a flourish.
        observer.unobserve(entry.target);
      }
    },
    // `top 90%` in ScrollTrigger terms: fire when the element's top passes 90%
    // of the viewport height.
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );

  function scan() {
    document.querySelectorAll<HTMLElement>('.reveal:not([' + REVEALED + '])').forEach((el) => observer.observe(el));
  }

  scan();

  // Route changes swap content without a reload, so re-scan on mutation.
  const mutations = new MutationObserver(() => scan());
  mutations.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutations.disconnect();
    root.classList.remove('js-reveal');
  };
}

/** Stagger helper: 45ms per item, capped so a long list never crawls. */
export function revealDelay(index: number, step = 45, max = 270): React.CSSProperties {
  return { ['--reveal-delay' as string]: Math.min(index * step, max) + 'ms' };
}
