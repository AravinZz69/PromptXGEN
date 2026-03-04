import { useState, useEffect, useRef } from "react";
import { companyStats } from "@/data/teamData";
import { useInView } from "@/hooks/useInView";

export const AboutStats = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className="section-padding bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {companyStats.map((stat, index) => (
              <StatItem key={stat.id} stat={stat} index={index} isInView={isInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatItemProps {
  stat: typeof companyStats[0];
  index: number;
  isInView: boolean;
}

const StatItem = ({ stat, index, isInView }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const countingDone = useRef(false);
  const targetValue = parseInt(stat.value.replace(/\D/g, ''));

  useEffect(() => {
    if (!isInView || countingDone.current) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = targetValue / steps;
    let currentStep = 0;

    // Add delay based on index
    const delay = index * 200;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        setCount(prev => {
          const next = Math.min(Math.ceil(increment * currentStep), targetValue);
          return next;
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          countingDone.current = true;
        }
      }, stepDuration);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, targetValue, index]);

  // Format the displayed value
  const formatValue = (value: number): string => {
    if (stat.value.includes('M')) {
      return value.toString();
    }
    if (value >= 1000) {
      return value.toLocaleString();
    }
    return value.toString();
  };

  return (
    <div 
      className={`text-center transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
        <span className="gradient-text">
          {formatValue(count)}
          {stat.suffix}
        </span>
      </div>
      <p className="text-muted-foreground">{stat.label}</p>
    </div>
  );
};
