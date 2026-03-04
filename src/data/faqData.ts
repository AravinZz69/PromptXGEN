// FAQ DATA - Mock data for Contact page FAQ accordion
// 8 FAQ items covering common questions

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "What is PromptForge and how does it work?",
    answer: "PromptForge is an AI-powered prompt engineering platform that helps you create, optimize, and manage prompts for any AI model. Simply describe what you want to achieve, select your target AI model and use case, and our optimization engine generates highly effective prompts tailored to your needs. You can also save, organize, and iterate on prompts over time.",
    category: "General"
  },
  {
    id: 2,
    question: "Which AI models does PromptForge support?",
    answer: "PromptForge works with all major AI models including GPT-4, GPT-3.5, Claude (all versions), Gemini, LLaMA, Mistral, and many more. Our prompt optimization adapts to each model's unique characteristics and capabilities. We continuously add support for new models as they're released.",
    category: "General"
  },
  {
    id: 3,
    question: "How is pricing calculated?",
    answer: "We offer flexible pricing based on usage. The Free tier includes 50 prompt generations per month. Pro ($19/month) includes 500 generations plus advanced features like prompt history and analytics. Team ($49/month) adds collaboration features for up to 5 users. Enterprise pricing is custom based on your needs. All plans include access to our full template library.",
    category: "Pricing"
  },
  {
    id: 4,
    question: "Can I try PromptForge before purchasing?",
    answer: "Absolutely! We offer a generous free tier with 50 prompt generations per month—no credit card required. This gives you plenty of room to explore our features and see the quality of our prompt optimization. Pro and Team plans also come with a 14-day money-back guarantee.",
    category: "Pricing"
  },
  {
    id: 5,
    question: "Is my data secure and private?",
    answer: "Security is our top priority. We use enterprise-grade encryption for all data at rest and in transit. Your prompts and outputs are never used to train AI models or shared with third parties. We're SOC 2 Type II compliant and offer additional security features for Enterprise customers including SSO, audit logs, and data residency options.",
    category: "Security"
  },
  {
    id: 6,
    question: "Do you offer an API for developers?",
    answer: "Yes! Our API is available for Pro and Enterprise customers. You can generate optimized prompts programmatically and integrate PromptForge into your existing workflows, applications, or CI/CD pipelines. We provide SDKs for Python, JavaScript, and Go, along with comprehensive documentation and code examples.",
    category: "Technical"
  },
  {
    id: 7,
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your account settings—no need to contact support. When you cancel, you'll retain access to Pro features until the end of your billing period. Your saved prompts and history remain accessible even on the free tier. We also offer subscription pausing for up to 3 months.",
    category: "Billing"
  },
  {
    id: 8,
    question: "What kind of support do you offer?",
    answer: "All users have access to our comprehensive documentation, video tutorials, and community forum. Pro users get priority email support with 24-hour response times. Team and Enterprise customers receive dedicated support channels, onboarding assistance, and optional training sessions. Enterprise plans include a dedicated customer success manager.",
    category: "Support"
  }
];

export const faqCategories = [
  "All",
  "General",
  "Pricing",
  "Security",
  "Technical",
  "Billing",
  "Support"
];

export const getFAQByCategory = (category: string): FAQItem[] => {
  if (category === "All") return faqItems;
  return faqItems.filter(item => item.category === category);
};

export const searchFAQ = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return faqItems.filter(
    item =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
  );
};

// Contact information for the Contact page
export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  hours: string;
  socials: {
    twitter: string;
    linkedin: string;
    github: string;
    discord: string;
  };
}

export const contactInfo: ContactInfo = {
  email: "hello@promptforge.ai",
  phone: "+1 (555) 123-4567",
  address: {
    street: "548 Market Street, Suite 12345",
    city: "San Francisco",
    state: "CA",
    zip: "94104",
    country: "United States"
  },
  hours: "Monday - Friday: 9AM - 6PM PST",
  socials: {
    twitter: "https://twitter.com/promptforge",
    linkedin: "https://linkedin.com/company/promptforge",
    github: "https://github.com/promptforge",
    discord: "https://discord.gg/promptforge"
  }
};

// Contact form subjects/types
export interface ContactType {
  id: string;
  label: string;
  description: string;
}

export const contactTypes: ContactType[] = [
  {
    id: "general",
    label: "General Inquiry",
    description: "Questions about PromptForge or our services"
  },
  {
    id: "sales",
    label: "Sales & Enterprise",
    description: "Pricing, demos, or custom enterprise solutions"
  },
  {
    id: "support",
    label: "Technical Support",
    description: "Help with using PromptForge or troubleshooting issues"
  },
  {
    id: "partnership",
    label: "Partnerships",
    description: "Business development and partnership opportunities"
  },
  {
    id: "feedback",
    label: "Feedback & Suggestions",
    description: "Share ideas or suggestions for improving PromptForge"
  },
  {
    id: "press",
    label: "Press & Media",
    description: "Media inquiries, interviews, and press resources"
  }
];
