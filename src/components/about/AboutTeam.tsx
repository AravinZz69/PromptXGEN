import { Twitter, Linkedin, Github } from "lucide-react";
import { teamMembers } from "@/data/teamData";
import { useInView } from "@/hooks/useInView";

export const AboutTeam = () => {
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="section-padding bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A diverse group of AI researchers, engineers, designers, and business 
            leaders united by a passion for making AI accessible.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TeamMemberCardProps {
  member: typeof teamMembers[0];
  index: number;
}

const TeamMemberCard = ({ member, index }: TeamMemberCardProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`glass-card rounded-xl p-6 text-center group hover:border-primary/40 transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Avatar */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-all"
        />
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <h3 className="font-display font-semibold text-foreground mb-1">
        {member.name}
      </h3>
      <p className="text-sm text-primary mb-3">{member.role}</p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {member.bio}
      </p>

      {/* Social Links */}
      <div className="flex justify-center gap-3">
        {member.social.twitter && (
          <a
            href={member.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-[#1DA1F2] transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
        )}
        {member.social.linkedin && (
          <a
            href={member.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-[#0A66C2] transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {member.social.github && (
          <a
            href={member.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
