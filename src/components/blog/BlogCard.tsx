import { Link } from "react-router-dom";
import { Clock, Eye, ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { useInView } from "@/hooks/useInView";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  index?: number;
}

export const BlogCard = ({ post, featured = false, index = 0 }: BlogCardProps) => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.1, triggerOnce: true });

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (featured) {
    return (
      <article
        ref={ref}
        className={`group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/40 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent md:bg-gradient-to-r" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                Featured
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
              <Link to={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            <p className="text-muted-foreground mb-6 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`group glass-card rounded-xl overflow-hidden transition-all duration-500 hover:border-primary/40 hover:-translate-y-1 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>

        <h3 className="text-lg font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">{post.author.name}</span>
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
          >
            Read
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};
