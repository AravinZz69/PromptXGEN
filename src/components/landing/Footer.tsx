import { useState, useEffect } from "react";
import { Sparkles, Twitter, Linkedin, Github, Instagram, Youtube } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Types for CMS footer config
interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  url: string;
  visible: boolean;
}

interface FooterConfig {
  footerLogoUrl: string;
  footerTagline: string;
  social: {
    twitter: SocialLink;
    linkedin: SocialLink;
    github: SocialLink;
    instagram: SocialLink;
    youtube: SocialLink;
  };
  columns: FooterColumn[];
  copyrightText: string;
  showNewsletter: boolean;
  newsletterPlaceholder: string;
}

// Default values
const DEFAULT_FOOTER: FooterConfig = {
  footerLogoUrl: '',
  footerTagline: 'AI prompt engineering, simplified.',
  social: {
    twitter: { url: '', visible: false },
    linkedin: { url: '', visible: false },
    github: { url: '', visible: false },
    instagram: { url: '', visible: false },
    youtube: { url: '', visible: false },
  },
  columns: [
    {
      id: '1',
      title: 'Product',
      links: [
        { id: '1-1', label: 'Features', url: '#features' },
        { id: '1-2', label: 'Pricing', url: '#pricing' },
        { id: '1-3', label: 'Templates', url: '#templates' },
      ],
    },
    {
      id: '2',
      title: 'Company',
      links: [
        { id: '2-1', label: 'About', url: '/about' },
        { id: '2-2', label: 'Blog', url: '/blogs' },
        { id: '2-3', label: 'Contact', url: '/contact' },
      ],
    },
    {
      id: '3',
      title: 'Legal',
      links: [
        { id: '3-1', label: 'Privacy', url: '/terms?tab=privacy' },
        { id: '3-2', label: 'Terms', url: '/terms' },
      ],
    },
  ],
  copyrightText: `© ${new Date().getFullYear()} AskJai. All rights reserved.`,
  showNewsletter: false,
  newsletterPlaceholder: 'Enter your email',
};

// Social icon mapping
const SocialIcons: Record<string, React.FC<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  youtube: Youtube,
};

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER);

  useEffect(() => {
    const fetchFooter = async () => {
      const { data, error } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'footer')
        .maybeSingle();

      if (!error && data?.data) {
        setConfig({ ...DEFAULT_FOOTER, ...data.data });
      }
    };
    fetchFooter();
  }, []);

  // Handle hash links for smooth scrolling
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url.startsWith('#')) {
      e.preventDefault();
      if (location.pathname === '/') {
        const element = document.querySelector(url);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/' + url);
      }
    }
  };

  // Get active social links
  const activeSocials = Object.entries(config.social).filter(
    ([_, value]) => value.visible && value.url
  );

  return (
    <footer className="border-t border-border/50 section-padding py-12">
      <div className="container mx-auto">
        <div className={`grid grid-cols-2 md:grid-cols-${config.columns.length + 1} gap-8 mb-8`}>
          {/* Logo and tagline column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {config.footerLogoUrl ? (
                <img src={config.footerLogoUrl} alt="Logo" className="h-7 w-7 rounded-lg" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
              <span className="font-display text-lg font-bold">AskJai</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {config.footerTagline}
            </p>
            {/* Social icons */}
            {activeSocials.length > 0 && (
              <div className="flex gap-3">
                {activeSocials.map(([key, value]) => {
                  const Icon = SocialIcons[key];
                  return Icon ? (
                    <a
                      key={key}
                      href={value.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Dynamic columns from CMS */}
          {config.columns.map((column) => (
            <div key={column.id}>
              <h4 className="font-display text-sm font-semibold mb-3">{column.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.id}>
                    {link.url.startsWith('/') ? (
                      <Link
                        to={link.url}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.url}
                        onClick={(e) => handleLinkClick(e, link.url)}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          {config.copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
