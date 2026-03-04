import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, Clock, ArrowRight, Tag, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Tutorial", "Advanced", "Guide", "Insights", "News"];

  const featuredArticles = [
    {
      id: 1,
      title: "Mastering AI Prompts: A Complete Guide",
      description: "Learn the fundamental techniques for crafting effective AI prompts that deliver consistent results.",
      image: "/blog/featured-1.jpg",
      category: "Guide",
      author: "Alex Chen",
      date: "Feb 28, 2026",
      readTime: "8 min read",
      featured: true,
    },
    {
      id: 2,
      title: "Advanced Prompt Engineering Techniques",
      description: "Take your prompt skills to the next level with advanced strategies used by professionals.",
      image: "/blog/featured-2.jpg",
      category: "Advanced",
      author: "Sarah Miller",
      date: "Feb 25, 2026",
      readTime: "12 min read",
      featured: true,
    },
  ];

  const articles = [
    {
      id: 3,
      title: "Getting Started with Prompt Genius",
      description: "A beginner's guide to using our platform effectively.",
      category: "Tutorial",
      author: "David Kim",
      date: "Feb 22, 2026",
      readTime: "5 min read",
    },
    {
      id: 4,
      title: "The Future of AI-Assisted Writing",
      description: "Exploring trends and predictions for AI in content creation.",
      category: "Insights",
      author: "Emma Wilson",
      date: "Feb 20, 2026",
      readTime: "7 min read",
    },
    {
      id: 5,
      title: "Prompt Templates for Marketing",
      description: "Ready-to-use templates for your marketing campaigns.",
      category: "Guide",
      author: "Alex Chen",
      date: "Feb 18, 2026",
      readTime: "6 min read",
    },
    {
      id: 6,
      title: "Understanding AI Model Differences",
      description: "How to optimize prompts for different AI models.",
      category: "Advanced",
      author: "Sarah Miller",
      date: "Feb 15, 2026",
      readTime: "10 min read",
    },
    {
      id: 7,
      title: "New Features: March 2026 Update",
      description: "Discover the latest features and improvements.",
      category: "News",
      author: "Team",
      date: "Feb 12, 2026",
      readTime: "4 min read",
    },
    {
      id: 8,
      title: "Creative Writing with AI",
      description: "Tips for using AI to enhance your creative writing.",
      category: "Tutorial",
      author: "Emma Wilson",
      date: "Feb 10, 2026",
      readTime: "8 min read",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <BookOpen className="inline h-4 w-4 mr-2" />
              Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Insights &{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tutorials
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Stay updated with the latest tips, tutorials, and insights on AI prompt engineering and creative workflows.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      {selectedCategory === "All" && searchQuery === "" && (
        <section className="container mx-auto px-4 py-12">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold mb-8"
          >
            Featured Articles
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-muted/30 to-transparent border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {article.category}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{article.date}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold mb-8"
        >
          {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-gradient-to-b from-muted/30 to-transparent border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">
                  {article.category}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {article.readTime}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{article.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 p-8 md:p-12 text-center"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Subscribe to our newsletter for the latest articles, tutorials, and AI insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:border-primary focus:outline-none"
              />
              <Button size="lg">Subscribe</Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Blogs;
