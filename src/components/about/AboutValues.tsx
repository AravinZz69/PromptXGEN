import { Lightbulb, Heart, Eye, Trophy, Users, GraduationCap, LucideIcon } from "lucide-react";
import { companyValues } from "@/data/teamData";
import { useInView } from "@/hooks/useInView";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Heart,
  Eye,
  Trophy,
  Users,
  GraduationCap,
};

export const AboutValues = () => {
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we do at PromptForge.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyValues.map((value, index) => (
            <ValueCard key={value.id} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ValueCardProps {
  value: typeof companyValues[0];
  index: number;
}

const ValueCard = ({ value, index }: ValueCardProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
  const Icon = iconMap[value.icon] || Lightbulb;

  // Alternate gradient directions
  const gradients = [
    'from-primary/10 via-transparent to-transparent',
    'from-accent/10 via-transparent to-transparent',
    'from-primary/5 to-accent/5',
  ];
  const gradientClass = gradients[index % gradients.length];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`glass-card rounded-xl p-6 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} pointer-events-none`} />

      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <h3 className="font-display font-semibold text-foreground mb-2">
          {value.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {value.description}
        </p>
      </div>
    </div>
  );
};
