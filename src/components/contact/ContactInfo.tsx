import { Mail, Phone, MapPin, Clock, Twitter, Linkedin, Github, MessageCircle } from "lucide-react";
import { contactInfo } from "@/data/faqData";
import { useInView } from "@/hooks/useInView";

export const ContactInfo = () => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

  const infoItems = [
    {
      icon: Mail,
      label: "Email",
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone.replace(/\D/g, '')}`,
    },
    {
      icon: MapPin,
      label: "Address",
      value: `${contactInfo.address.street}\n${contactInfo.address.city}, ${contactInfo.address.state} ${contactInfo.address.zip}`,
      href: `https://maps.google.com/?q=${encodeURIComponent(`${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.state}`)}`,
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: contactInfo.hours,
      href: null,
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: contactInfo.socials.twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { icon: Linkedin, href: contactInfo.socials.linkedin, label: "LinkedIn", color: "hover:text-[#0A66C2]" },
    { icon: Github, href: contactInfo.socials.github, label: "GitHub", color: "hover:text-foreground" },
    { icon: MessageCircle, href: contactInfo.socials.discord, label: "Discord", color: "hover:text-[#5865F2]" },
  ];

  return (
    <div
      ref={ref}
      className={`space-y-6 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Contact Info Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          Contact Information
        </h2>

        <div className="space-y-5">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            const Content = (
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-foreground whitespace-pre-line">{item.value}</p>
                </div>
              </div>
            );

            return item.href ? (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                {Content}
              </a>
            ) : (
              <div key={index}>{Content}</div>
            );
          })}
        </div>
      </div>

      {/* Social Links Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          Follow Us
        </h2>

        <div className="flex gap-3">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground ${social.color} hover:border-primary/40 transition-all`}
                aria-label={social.label}
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Stay connected for updates, tips, and community discussions.
        </p>
      </div>

      {/* Quick Response Note */}
      <div className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Quick Response:</span> We typically respond 
          to all inquiries within 24-48 hours during business days.
        </p>
      </div>
    </div>
  );
};
