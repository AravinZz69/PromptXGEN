import { companyTimeline } from "@/data/teamData";
import { useInView } from "@/hooks/useInView";

export const AboutTimeline = () => {
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
            Our Journey
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From a weekend hackathon project to a platform trusted by hundreds of 
            thousands of users—here's how we got here.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2" />

          {companyTimeline.map((event, index) => (
            <TimelineEvent key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TimelineEventProps {
  event: typeof companyTimeline[0];
  index: number;
}

const TimelineEvent = ({ event, index }: TimelineEventProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative flex items-center mb-12 last:mb-0 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Year dot */}
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
        <div 
          className={`w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center transition-all duration-500 ${
            isInView ? 'scale-100' : 'scale-0'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Content */}
      <div 
        className={`ml-16 md:ml-0 md:w-1/2 ${
          isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'
        }`}
      >
        <div 
          style={{ transitionDelay: `${index * 150}ms` }}
          className={`glass-card rounded-xl p-6 hover:border-primary/40 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full mb-3">
            {event.year}
          </span>
          <h3 className="font-display font-semibold text-foreground mb-2">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {event.description}
          </p>
        </div>
      </div>
    </div>
  );
};
