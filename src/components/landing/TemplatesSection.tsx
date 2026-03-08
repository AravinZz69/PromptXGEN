import { motion } from "framer-motion";
import { Code, PenTool, Mail, TrendingUp, MessageCircle, Search } from "lucide-react";

const templates = [
  { icon: PenTool, category: "Writing", title: "Blog Post Generator", description: "Create engaging long-form blog content with SEO optimization" },
  { icon: Code, category: "Coding", title: "Code Review Assistant", description: "Get detailed code reviews with improvement suggestions" },
  { icon: Mail, category: "Email", title: "Cold Email Crafter", description: "Write personalized outreach emails that convert" },
  { icon: TrendingUp, category: "Marketing", title: "Ad Copy Generator", description: "Create high-converting ad copy for any platform" },
  { icon: MessageCircle, category: "Social", title: "Tweet Thread Builder", description: "Build viral tweet threads from any topic or idea" },
  { icon: Search, category: "SEO", title: "Meta Description Writer", description: "Generate optimized meta descriptions that rank" },
];

const TemplatesSection = () => {
  return (
    <section id="templates" className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-2 block">Templates</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready-Made <span className="gradient-text">Prompt Templates</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Jump-start your workflow with curated templates across every category.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-6 group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <t.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t.category}
                </span>
              </div>
              <h3 className="font-display text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                {t.title}
              </h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
