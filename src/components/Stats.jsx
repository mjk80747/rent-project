import { useRef } from 'react';
import { motion as Motion, useInView } from 'motion/react';
import CountUpModule from 'react-countup';
import { Building2, MapPin, Users, Star } from 'lucide-react';
import { gridContainer, cardItem } from '../animations/variants';
import './Stats.css';

// react-countup ships CommonJS; under rolldown-vite the default import resolves
// to the module namespace object, so unwrap the actual component.
const CountUp = CountUpModule.default || CountUpModule;

const Stats = ({ propertyCount = 0, areaCount = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const items = [
    { icon: Building2, end: Math.max(propertyCount, 2500), suffix: '+', label: 'PGs Listed' },
    { icon: MapPin, end: Math.max(areaCount, 8), suffix: '+', label: 'Localities Covered' },
    { icon: Users, end: 15000, suffix: '+', label: 'Happy Tenants' },
    { icon: Star, end: 4.8, decimals: 1, label: 'Average Rating' },
  ];

  return (
    <section className="stats-section" ref={ref} aria-label="Platform statistics">
      <Motion.div
        className="container stats-grid"
        variants={gridContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const { end, suffix, decimals, label } = item;
          return (
          <Motion.div className="stat-card glass-panel" key={label} variants={cardItem}>
            <div className="stat-icon">
              <Icon size={26} />
            </div>
            <div className="stat-number">
              {inView ? (
                <CountUp end={end} duration={2.2} decimals={decimals || 0} suffix={suffix || ''} separator="," />
              ) : (
                <span>0{suffix || ''}</span>
              )}
            </div>
            <div className="stat-label">{label}</div>
          </Motion.div>
          );
        })}
      </Motion.div>
    </section>
  );
};

export default Stats;
