import { useGsapReveal } from '../hooks/useGsapReveal';

/**
 * Wraps children and reveals them on scroll via GSAP ScrollTrigger.
 * Use `direction` to alternate left/right/up entrances.
 */
const RevealOnScroll = ({ direction = 'up', delay = 0, className, style, children }) => {
  const ref = useGsapReveal(direction, { delay });
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default RevealOnScroll;
