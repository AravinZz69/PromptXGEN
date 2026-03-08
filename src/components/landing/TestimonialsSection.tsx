import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Marketer",
    text: "AskJai cut my prompt writing time by 80%. The advanced prompts are incredibly well-structured.",
    avatar: "SC",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Full-Stack Developer",
    text: "The code review templates are a game-changer. I use it daily for better AI pair-programming sessions.",
    avatar: "MR",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Startup Founder",
    text: "From ad copy to investor emails — this tool handles everything. The credit system is very fair too.",
    avatar: "AP",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
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
          <p className="text-muted-foreground max-w-lg mx-auto mt-4">
            See what our users say about their experience with AskJai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
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
