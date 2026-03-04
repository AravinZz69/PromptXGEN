// TEAM DATA - Mock data for About page team members
// 8 team members with diverse roles

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "CEO & Co-Founder",
    bio: "Former ML engineer at Google. Passionate about making AI accessible to everyone. Built the first prompt optimizer that actually works.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com"
    }
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Head of AI Research",
    bio: "PhD in Natural Language Processing from Stanford. Led research teams at OpenAI and Anthropic. Obsessed with prompt optimization algorithms.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com"
    }
  },
  {
    id: 3,
    name: "David Park",
    role: "CTO",
    bio: "15+ years building scalable systems at Meta and Netflix. Architect of PromptForge's distributed infrastructure. Open source enthusiast.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com"
    }
  },
  {
    id: 4,
    name: "Emily Watson",
    role: "Head of Marketing",
    bio: "Growth leader who scaled three startups from $0 to $50M ARR. Believes great products deserve great stories. Recovering prompt addict.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: 5,
    name: "Marcus Johnson",
    role: "Senior AI Engineer",
    bio: "Former research scientist at DeepMind. Specializes in few-shot learning and prompt chain optimization. Author of 12 published papers.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com"
    }
  },
  {
    id: 6,
    name: "Jessica Liu",
    role: "Head of Product",
    bio: "Product leader with experience at Notion and Figma. User obsessed. Turns customer insights into features that delight.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: 7,
    name: "Ryan O'Connor",
    role: "Lead Designer",
    bio: "Design systems expert from Airbnb. Believes AI tools should feel magical, not mechanical. Former game designer turned SaaS enthusiast.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: 8,
    name: "Priya Sharma",
    role: "Head of Customer Success",
    bio: "Built CS teams at Stripe and Datadog. Passionate about turning customers into advocates. Prompt engineering educator on the side.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  }
];

export interface CompanyValue {
  id: number;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export const companyValues: CompanyValue[] = [
  {
    id: 1,
    title: "Innovation First",
    description: "We push the boundaries of what's possible with AI, constantly exploring new techniques and approaches to prompt optimization.",
    icon: "Lightbulb"
  },
  {
    id: 2,
    title: "User Obsession",
    description: "Every decision starts with the user. We build tools that solve real problems and make AI genuinely accessible.",
    icon: "Heart"
  },
  {
    id: 3,
    title: "Radical Transparency",
    description: "We share our roadmap, our challenges, and our learnings openly. Trust is built through honesty.",
    icon: "Eye"
  },
  {
    id: 4,
    title: "Quality Over Speed",
    description: "We'd rather ship something great next week than something mediocre today. Excellence is non-negotiable.",
    icon: "Trophy"
  },
  {
    id: 5,
    title: "Collaborative Spirit",
    description: "The best ideas come from diverse perspectives. We foster an environment where everyone's voice matters.",
    icon: "Users"
  },
  {
    id: 6,
    title: "Continuous Learning",
    description: "AI evolves daily, and so do we. We invest in research, education, and personal growth for our entire team.",
    icon: "GraduationCap"
  }
];

export interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
}

export const companyTimeline: TimelineEvent[] = [
  {
    id: 1,
    year: "2022",
    title: "The Idea Was Born",
    description: "Alex and Sarah met at an AI hackathon and realized prompt engineering was a massive unsolved problem. PromptForge started as a weekend project."
  },
  {
    id: 2,
    year: "2023",
    title: "Seed Funding & Launch",
    description: "Raised $2M seed round led by Sequoia. Launched public beta with 10,000 users in the first month. Hired our core engineering team."
  },
  {
    id: 3,
    year: "2023",
    title: "Product-Market Fit",
    description: "Hit 100,000 users and $1M ARR. Launched enterprise tier. Opened offices in San Francisco and London."
  },
  {
    id: 4,
    year: "2024",
    title: "Series A & Expansion",
    description: "Raised $15M Series A. Team grew to 40 people. Launched API platform and partnered with major AI companies."
  },
  {
    id: 5,
    year: "2025",
    title: "Today & Beyond",
    description: "500,000+ users trust PromptForge. Continuing to innovate with AI agents, multimodal prompts, and the next generation of tools."
  }
];

export interface CompanyStat {
  id: number;
  value: string;
  label: string;
  suffix?: string;
}

export const companyStats: CompanyStat[] = [
  {
    id: 1,
    value: "500000",
    label: "Active Users",
    suffix: "+"
  },
  {
    id: 2,
    value: "10",
    label: "Million Prompts Generated",
    suffix: "M+"
  },
  {
    id: 3,
    value: "40",
    label: "Team Members",
    suffix: ""
  },
  {
    id: 4,
    value: "98",
    label: "Customer Satisfaction",
    suffix: "%"
  }
];

export const getTeamMemberById = (id: number): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

export const getLeadershipTeam = (): TeamMember[] => {
  const leadershipRoles = ["CEO", "CTO", "Head of"];
  return teamMembers.filter(member =>
    leadershipRoles.some(role => member.role.includes(role))
  );
};
