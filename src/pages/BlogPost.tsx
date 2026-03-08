import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";
import { BlogCard, BlogNewsletter } from "@/components/blog";
import { BlogPost as BlogPostType } from "@/data/blogData";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Calendar,
  Share2,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronUp,
  Check,
  Loader2
} from "lucide-react";
import { useInView } from "@/hooks/useInView";

// Transform DB row to BlogPost interface
const transformBlogPost = (row: any): BlogPostType => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  author: {
    name: row.author_name,
    role: row.author_role,
    avatar: row.author_avatar,
  },
  coverImage: row.cover_image,
  readTime: row.read_time,
  publishedAt: row.published_at,
  featured: row.is_featured,
  views: row.views || 0,
});

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch post by slug
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch the post
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) throw error;
        
        const fetchedPost = transformBlogPost(data);
        setPost(fetchedPost);

        // Fetch related posts (same category, exclude current)
        const { data: relatedData } = await supabase
          .from('blogs')
          .select('*')
          .eq('category', data.category)
          .eq('is_published', true)
          .neq('slug', slug)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedPosts((relatedData || []).map(transformBlogPost));
      } catch (err) {
        console.error('Error fetching post:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Generate TOC from content - moved before early return to satisfy hooks rules
  const tocItems = useMemo(() => {
    if (!post) return [];
    const headingRegex = /^##\s+(.+)$/gm;
    const items: { id: string; title: string }[] = [];
    let match;
    while ((match = headingRegex.exec(post.content)) !== null) {
      const title = match[1];
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({ id, title });
    }
    return items;
  }, [post]);

  // Convert markdown to HTML (simplified) - moved before early return
  const contentHtml = useMemo(() => {
    if (!post) return '';
    const html = post.content
      // Convert headers with IDs
      .replace(/^## (.+)$/gm, (_, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}" class="text-2xl font-display font-bold text-foreground mt-8 mb-4 scroll-mt-24">${title}</h2>`;
      })
      // Convert bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Convert paragraphs
      .split('\n\n')
      .map(p => {
        if (p.startsWith('<h2')) return p;
        if (p.trim() === '') return '';
        return `<p class="text-muted-foreground leading-relaxed mb-4">${p}</p>`;
      })
      .join('\n');
    
    return html;
  }, [post]);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(progress);
      setShowBackToTop(scrollTop > 500);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MiniNavbar />
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <MiniNavbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Article not found
          </h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const shareUrl = window.location.href;
  const shareText = post.title;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animated heading component
  const ArticleHeader = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

    return (
      <header 
        ref={ref}
        className={`mb-8 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            {post.views.toLocaleString()} views
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-muted-foreground mb-8">
          {post.excerpt}
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
          />
          <div>
            <p className="font-medium text-foreground">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">{post.author.role}</p>
          </div>
        </div>
      </header>
    );
  };

  // Table of Contents component
  const TableOfContents = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

    if (tocItems.length === 0) return null;

    return (
      <nav
        ref={ref}
        className={`glass-card rounded-xl p-6 sticky top-24 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h3 className="font-display font-semibold text-foreground mb-4">
          Table of Contents
        </h3>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  // Share buttons component
  const ShareButtons = () => {
    const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 py-6 border-t border-b border-border/50 my-8 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="w-4 h-4" />
          Share:
        </span>
        <div className="flex gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-[#1DA1F2] transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-[#0A66C2] transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg bg-card/50 hover:bg-card text-muted-foreground hover:text-primary transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  };

  // Related articles component
  const RelatedArticles = () => {
    const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

    if (relatedPosts.length === 0) return null;

    return (
      <section
        ref={ref}
        className={`section-padding transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">
            Related Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost, index) => (
              <BlogCard key={relatedPost.id} post={relatedPost} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <MiniNavbar />

      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 mt-16 overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Article */}
          <article className="lg:col-span-8">
            <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10">
              <ArticleHeader />

              {/* Content */}
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-card/50 text-muted-foreground rounded-full border border-border/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <ShareButtons />

              {/* Author Bio */}
              <div className="glass-card rounded-xl p-6 mt-6">
                <div className="flex items-start gap-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-border flex-shrink-0"
                  />
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      {post.author.name}
                    </p>
                    <p className="text-sm text-primary mb-2">{post.author.role}</p>
                    <p className="text-sm text-muted-foreground">
                      Expert in AI and prompt engineering with years of experience helping 
                      teams optimize their AI workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      <RelatedArticles />

      {/* Newsletter */}
      <BlogNewsletter />

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all z-40"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
