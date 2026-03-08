import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Sidebar from "@/components/ui/sidebar-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCredits } from "@/hooks/useCredits";
import {
  Search,
  Grid3X3,
  List,
  Star,
  GraduationCap,
  Users,
  Crown,
  Bookmark,
  Loader2,
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  role: "teacher" | "student";
  isFavorite?: boolean;
  isPro?: boolean;
  isHighlighted?: boolean;
}

// Transform DB row to Template interface
const transformTemplate = (row: any): Template => ({
  id: row.id?.toString() || row.title?.replace(/\s+/g, '-').toLowerCase(),
  title: row.title || row.name,
  description: row.description,
  category: row.category,
  role: (row.role === 'teacher' || row.target_audience === 'Teacher') ? 'teacher' : 'student',
  isPro: row.is_pro,
  isHighlighted: row.is_featured || row.is_highlighted || false,
  isFavorite: false,
});

const categories = [
  "All Categories",
  "K-12",
  "Intermediate",
  "Engineering",
  "JEE",
  "NEET",
  "GATE",
  "Medical",
  "UPSC",
  "Banking",
  "CAT",
  "Law",
  "Defense",
  "Commerce",
  "Arts",
  "Research",
];

const Templates = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { credits } = useCredits();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch templates from Supabase
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('is_visible', true)
          .order('usage_count', { ascending: false });

        if (error) throw error;
        setTemplates((data || []).map(transformTemplate));
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRole, setSelectedRole] = useState<"all" | "teacher" | "student">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Check if navigating from bookmarks sidebar
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('bookmarks') === 'true') {
      setShowBookmarksOnly(true);
    }
  }, [location.search]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('templateBookmarks');
    if (savedBookmarks) {
      setBookmarkedIds(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('templateBookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent template click
    setBookmarkedIds(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Get user initials
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const currentPlan = credits?.planType === 'pro' ? 'Pro' : credits?.planType === 'enterprise' ? 'Enterprise' : 'Free';

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Bookmarks filter
      if (showBookmarksOnly && !bookmarkedIds.includes(template.id)) {
        return false;
      }

      // Search filter
      const matchesSearch =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const categoryMap: Record<string, string> = {
        "All Categories": "",
        "K-12": "K12",
        "Intermediate": "Intermediate",
        "Engineering": "Engineering",
        "JEE": "JEE",
        "NEET": "NEET",
        "GATE": "GATE",
        "Medical": "Medical",
        "UPSC": "UPSC",
        "Banking": "Banking",
        "CAT": "CAT",
        "Law": "Law",
        "Defense": "Defense",
        "Commerce": "Commerce",
        "Arts": "Arts",
        "Research": "Research",
      };
      const matchesCategory =
        selectedCategory === "All Categories" ||
        template.category === categoryMap[selectedCategory];

      // Role filter
      const matchesRole = selectedRole === "all" || template.role === selectedRole;

      return matchesSearch && matchesCategory && matchesRole;
    });
  }, [templates, searchQuery, selectedCategory, selectedRole, showBookmarksOnly, bookmarkedIds]);

  const handleTemplateClick = (template: Template) => {
    // Navigate to template generator page
    navigate(`/template/${template.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole={`${currentPlan} Plan`}
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === "dashboard") navigate("/dashboard");
          else if (id === "generate") navigate("/generate");
          else if (id === "generative-ai") navigate("/generative-ai");
          else if (id === "templates") { navigate("/templates"); setShowBookmarksOnly(false); }
          else if (id === "bookmarks") { navigate("/templates?bookmarks=true"); setShowBookmarksOnly(true); }
          else if (id === "history") navigate("/history");
          else if (id === "analytics") navigate("/analytics");
          else if (id === "profile") navigate("/profile");
          else if (id === "settings") navigate("/settings");
          else if (id === "upgrade") navigate("/upgrade");
        }}
        onLogout={() => {
          signOut();
          navigate("/");
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>

                {/* Role Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={selectedRole === "all" && !showBookmarksOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedRole("all"); setShowBookmarksOnly(false); }}
                    className={selectedRole === "all" && !showBookmarksOnly ? "bg-primary" : ""}
                  >
                    All Roles
                  </Button>
                  <Button
                    variant={selectedRole === "teacher" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedRole("teacher"); setShowBookmarksOnly(false); }}
                    className={selectedRole === "teacher" ? "bg-primary" : ""}
                  >
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Teacher
                  </Button>
                  <Button
                    variant={selectedRole === "student" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedRole("student"); setShowBookmarksOnly(false); }}
                    className={selectedRole === "student" ? "bg-primary" : ""}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Student
                  </Button>

                  {/* Bookmarks Filter */}
                  <Button
                    variant={showBookmarksOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                    className={showBookmarksOnly ? "bg-yellow-500 hover:bg-yellow-600" : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"}
                  >
                    <Bookmark className={`h-4 w-4 mr-1 ${showBookmarksOnly ? "fill-current" : ""}`} />
                    Bookmarks ({bookmarkedIds.length})
                  </Button>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-1 ml-4 border border-border rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${viewMode === "grid" ? "bg-muted" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${viewMode === "list" ? "bg-muted" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Templates Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredTemplates.length} templates
            </p>

            {/* Templates Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleTemplateClick(template)}
                  className={`bg-card border border-border rounded-xl p-5 cursor-pointer 
                    hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200
                    ${viewMode === "list" ? "flex items-center justify-between" : ""}`}
                >
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`font-semibold ${
                          template.isHighlighted ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {template.title}
                      </h3>
                      <button
                        onClick={(e) => toggleBookmark(template.id, e)}
                        className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-yellow-500/10 transition-colors"
                        title={bookmarkedIds.includes(template.id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Star 
                          className={`h-4 w-4 transition-all ${
                            bookmarkedIds.includes(template.id) 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-muted-foreground hover:text-yellow-500"
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-foreground">
                        {template.category}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1
                          ${
                            template.role === "teacher"
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}
                      >
                        {template.role === "teacher" ? (
                          <GraduationCap className="h-3 w-3" />
                        ) : (
                          <Users className="h-3 w-3" />
                        )}
                        {template.role}
                      </span>
                      {template.isPro && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Pro
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                {showBookmarksOnly ? (
                  <>
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No bookmarked templates yet.</p>
                    <p className="text-sm text-muted-foreground mb-4">Click the star icon on any template to bookmark it.</p>
                    <Button
                      variant="outline"
                      onClick={() => setShowBookmarksOnly(false)}
                    >
                      Browse All Templates
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">No templates found matching your criteria.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All Categories");
                        setSelectedRole("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Templates;
