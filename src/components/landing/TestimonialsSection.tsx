import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Marketer",
    text: "AskJai cut my prompt writing time by 80%. The advanced prompts are incredibly well-structured.",
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Full-Stack Developer",
    text: "The code review templates are a game-changer. I use it daily for better AI pair-programming sessions.",
    avatar: "MR",
  },
  {
    name: "Aisha Patel",
    role: "Startup Founder",
    text: "From ad copy to investor emails — this tool handles everything. The credit system is very fair too.",
    avatar: "AP",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-2 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
