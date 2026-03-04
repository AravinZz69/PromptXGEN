import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Users, Lightbulb, Target, Shield, Rocket, Globe, Award, Heart } from "lucide-react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";

const AboutUs = () => {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously innovate to bring cutting-edge AI features that push boundaries.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in building a supportive community of creators and learners.",
    },
    {
      icon: Lightbulb,
      title: "Creativity",
      description: "Empowering human creativity through intelligent tools and seamless AI integration.",
    },
    {
      icon: Shield,
      title: "Trust",
      description: "We prioritize security and privacy in everything we build.",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "2M+", label: "Prompts Generated" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "User Rating" },
  ];

  const team = [
    { name: "Alex Chen", role: "CEO & Founder", bio: "AI researcher with 10+ years experience" },
    { name: "Sarah Miller", role: "CTO", bio: "Former Google ML engineer" },
    { name: "David Kim", role: "Head of Product", bio: "Product leader from OpenAI" },
    { name: "Emma Wilson", role: "Head of Design", bio: "Award-winning UX designer" },
  ];

  const features = [
    { icon: Rocket, text: "Advanced AI-powered prompt generation" },
    { icon: Globe, text: "Seamless integration with multiple AI models" },
    { icon: Users, text: "User-friendly interface designed for everyone" },
    { icon: Shield, text: "Enterprise-grade security and privacy" },
    { icon: Award, text: "Regular updates and new features" },
    { icon: Heart, text: "24/7 dedicated customer support" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Building the Future of{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Interaction
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to make AI accessible to everyone through intuitive tools, 
              powerful features, and a supportive community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="text-center p-6 rounded-2xl bg-gradient-to-b from-muted/30 to-transparent border border-border/50"
            >
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-accent/10 text-accent rounded-full">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Making AI Work for Everyone
            </h2>
            <p className="text-muted-foreground mb-4">
              Founded in 2024, Prompt Genius started with a simple observation: AI tools are powerful, 
              but most people struggle to use them effectively. We set out to change that.
            </p>
            <p className="text-muted-foreground mb-6">
              Our team of AI researchers, engineers, and designers work together to create tools 
              that make prompt engineering intuitive and accessible, regardless of technical background.
            </p>
            <Button asChild size="lg">
              <Link to="/login?mode=signup">Join Our Community →</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-border/50 flex items-center justify-center">
              <Target className="h-24 w-24 text-primary/50" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-xl blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full">
            Our Values
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">What Drives Us</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-b from-muted/30 to-transparent border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-accent/10 text-accent rounded-full">
              Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose Prompt Genius?
            </h2>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{feature.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 border border-border/50" />
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full">
            Our Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">Meet the People Behind Prompt Genius</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-b from-muted/30 to-transparent border border-border/50 hover:border-primary/50 transition-all"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mx-auto mb-4" />
              <h3 className="font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-primary mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 p-8 md:p-16 text-center"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who are already creating better AI prompts with Prompt Genius.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/login?mode=signup">Get Started Free →</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
