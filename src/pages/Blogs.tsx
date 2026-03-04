import { useState, useMemo, useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";
import { BlogHero, BlogFilters, BlogCard, BlogNewsletter } from "@/components/blog";
import { blogPosts, getFeaturedPost, getPostsByCategory, searchPosts, getPopularPosts } from "@/data/blogData";
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const Blogs = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPost = getFeaturedPost();
  const popularPosts = getPopularPosts(4);

  // Filter posts based on category and search
  const filteredPosts = useMemo(() => {
    let posts = getPostsByCategory(selectedCategory);
    
    if (searchQuery.trim()) {
      posts = searchPosts(searchQuery);
      // If we have a search query, filter by category too
      if (selectedCategory !== "All") {
        posts = posts.filter(p => p.category === selectedCategory);
      }
    }
    
    // Remove featured post from regular list
    if (featuredPost) {
      posts = posts.filter(p => p.id !== featuredPost.id);
    }
    
    return posts;
  }, [selectedCategory, searchQuery, featuredPost]);

  // Popular sidebar component
  const PopularSidebar = () => {
    const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
    
    return (
      <div
        ref={ref}
        className={`glass-card rounded-xl p-6 sticky top-24 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Trending Articles</h3>
        </div>
        
        <div className="space-y-4">
          {popularPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-card/50 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-primary bg-primary/10 rounded-full">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/blog"
          className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/50 text-sm text-primary font-medium hover:gap-3 transition-all"
        >
          View all articles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      
      {/* Hero */}
      <BlogHero />
      
      {/* Main Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters */}
        <BlogFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8">
            {/* Featured Post */}
            {featuredPost && selectedCategory === "All" && !searchQuery && (
              <div className="mb-8">
                <BlogCard post={featuredPost} featured />
              </div>
            )}

            {/* Post Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredPosts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-muted-foreground">
                  No articles found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-primary font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <PopularSidebar />
          </aside>
        </div>
      </section>

      {/* Newsletter */}
      <BlogNewsletter />

      <Footer />
    </div>
  );
};

export default Blogs;
