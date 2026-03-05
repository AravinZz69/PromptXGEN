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
    name: "Deekshitha",
    role: "Full Stack Developer",
    bio: "Talented full-stack developer with expertise in React, Node.js, and cloud technologies. Builds scalable web applications from frontend to backend with modern best practices.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Deekshitha&backgroundColor=8b5cf6",
    social: {
      linkedin: "https://www.linkedin.com/in/deekshitha-bonthu-48878a321",
      github: "https://github.com/deekshu15"
    }
  },
  {
    id: 2,
    name: "Arvind Kumar",
    role: "Backend Developer",
    bio: "Backend specialist with deep expertise in Python, PostgreSQL, and microservices architecture. Designs robust APIs and database systems that power AI applications.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ArvindKumar&backgroundColor=6366f1",
    social: {
      linkedin: "https://www.linkedin.com/in/arvind-kumar-79676031b",
      github: "https://github.com/AravinZz69"
    }
  },
  {
    id: 3,
    name: "Anuradha",
    role: "AI/ML Engineer",
    bio: "Machine learning engineer specializing in NLP and generative AI. Develops and fine-tunes AI models for intelligent prompt optimization and content generation.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Anuradha&backgroundColor=ec4899",
    social: {
      linkedin: "https://www.linkedin.com/in/anuradha-gorle-675b0631b/",
      github: "https://github.com/anu577"
    }
  },
  {
    id: 4,
    name: "Pujith Sai",
    role: "Frontend Developer",
    bio: "Creative frontend developer skilled in React, TypeScript, and UI/UX design. Crafts beautiful, responsive interfaces that deliver exceptional user experiences.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PujithSai&backgroundColor=10b981",
    social: {
      linkedin: "https://www.linkedin.com/in/pujith-sai-cheeday-58078a321/",
      github: "https://github.com/Pujithcheeday"
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
