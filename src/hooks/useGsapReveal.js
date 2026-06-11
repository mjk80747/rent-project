import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals an element on scroll using GSAP ScrollTrigger.
 * @param {'left'|'right'|'up'} direction entrance direction
 * @param {object} options { y, distance, delay }
 */
export const useGsapReveal = (direction = 'up', { distance = 80, delay = 0 } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const fromVars = { opacity: 0, willChange: 'transform, opacity' };
    if (direction === 'left') fromVars.x = -distance;
    else if (direction === 'right') fromVars.x = distance;
    else fromVars.y = distance;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        ...fromVars,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, distance, delay]);

  return ref;
};
