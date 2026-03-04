import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Sidebar from "@/components/ui/sidebar-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Grid3X3,
  List,
  Star,
  GraduationCap,
  Users,
  Crown,
  Bookmark,
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

const templates: Template[] = [
  {
    id: "1",
    title: "Lesson Plan Generator",
    description: "Create detailed lesson plans with objectives, activities, and...",
    category: "K12",
    role: "teacher",
    isFavorite: true,
  },
  {
    id: "2",
    title: "MCQ Generator",
    description: "Generate multiple choice questions for any subject",
    category: "K12",
    role: "teacher",
    isFavorite: true,
  },
  {
    id: "3",
    title: "Worksheet Creator",
    description: "Design practice worksheets with varied question types",
    category: "K12",
    role: "teacher",
  },
  {
    id: "4",
    title: "Question Paper Builder",
    description: "Create complete question papers with marking scheme",
    category: "K12",
    role: "teacher",
  },
  {
    id: "5",
    title: "Concept Explainer",
    description: "Get clear explanations of complex topics",
    category: "K12",
    role: "student",
    isFavorite: true,
    isHighlighted: true,
  },
  {
    id: "6",
    title: "Doubt Clarifier",
    description: "Ask specific questions and get detailed answers",
    category: "K12",
    role: "student",
  },
  {
    id: "7",
    title: "Technical Notes Generator",
    description: "Create structured technical notes for engineering subjects",
    category: "Engineering",
    role: "student",
  },
  {
    id: "8",
    title: "Lab Manual Creator",
    description: "Generate lab procedures and safety guidelines",
    category: "Engineering",
    role: "teacher",
  },
  {
    id: "9",
    title: "Engineering Problem Solver",
    description: "Step-by-step solutions for engineering problems",
    category: "Engineering",
    role: "student",
  },
  {
    id: "10",
    title: "Code Explainer",
    description: "Understand code with detailed explanations",
    category: "Engineering",
    role: "student",
  },
  {
    id: "11",
    title: "Clinical Case Study",
    description: "Create medical case studies for learning",
    category: "Medical",
    role: "teacher",
    isPro: true,
  },
  {
    id: "12",
    title: "Anatomy Study Guide",
    description: "Comprehensive anatomy revision notes",
    category: "Medical",
    role: "student",
  },
  {
    id: "13",
    title: "UPSC Essay Writer",
    description: "Generate well-structured essays for UPSC preparation",
    category: "UPSC",
    role: "student",
  },
  {
    id: "14",
    title: "Current Affairs Summarizer",
    description: "Get concise summaries of current events",
    category: "UPSC",
    role: "student",
  },
  {
    id: "15",
    title: "Business Case Study",
    description: "Create detailed business case studies",
    category: "Commerce",
    role: "teacher",
  },
  {
    id: "16",
    title: "Financial Analysis Helper",
    description: "Analyze financial statements and ratios",
    category: "Commerce",
    role: "student",
  },
  {
    id: "17",
    title: "Art History Notes",
    description: "Generate comprehensive art history study material",
    category: "Arts",
    role: "student",
  },
  {
    id: "18",
    title: "Creative Writing Prompts",
    description: "Get inspiring prompts for creative writing",
    category: "Arts",
    role: "student",
  },
  {
    id: "19",
    title: "Research Paper Outline",
    description: "Create structured outlines for research papers",
    category: "Research",
    role: "student",
    isPro: true,
  },
  {
    id: "20",
    title: "Literature Review Helper",
    description: "Organize and summarize research literature",
    category: "Research",
    role: "student",
  },
  {
    id: "21",
    title: "Intermediate Math Solver",
    description: "Step-by-step solutions for intermediate math problems",
    category: "Intermediate",
    role: "student",
  },
  {
    id: "22",
    title: "Science Lab Report",
    description: "Generate structured lab reports for science experiments",
    category: "Intermediate",
    role: "student",
  },
  // JEE Templates
  {
    id: "23",
    title: "JEE Physics Problem Solver",
    description: "Step-by-step solutions for JEE Main & Advanced physics problems",
    category: "JEE",
    role: "student",
    isFavorite: true,
    isHighlighted: true,
  },
  {
    id: "24",
    title: "JEE Chemistry Formula Sheet",
    description: "Generate comprehensive formula sheets for organic, inorganic & physical chemistry",
    category: "JEE",
    role: "student",
  },
  {
    id: "25",
    title: "JEE Maths Concept Builder",
    description: "Master calculus, algebra, and coordinate geometry concepts",
    category: "JEE",
    role: "student",
  },
  {
    id: "26",
    title: "JEE Previous Year Analysis",
    description: "Analyze previous year questions with detailed solutions",
    category: "JEE",
    role: "student",
    isPro: true,
  },
  {
    id: "27",
    title: "JEE Mock Test Generator",
    description: "Create timed mock tests matching JEE pattern",
    category: "JEE",
    role: "teacher",
  },
  // NEET Templates
  {
    id: "28",
    title: "NEET Biology Notes Generator",
    description: "Create detailed notes for Botany and Zoology NCERT chapters",
    category: "NEET",
    role: "student",
    isFavorite: true,
  },
  {
    id: "29",
    title: "NEET Chemistry Quick Revision",
    description: "Generate quick revision notes for NEET chemistry",
    category: "NEET",
    role: "student",
  },
  {
    id: "30",
    title: "NEET Physics Numericals",
    description: "Practice numerical problems with step-by-step solutions",
    category: "NEET",
    role: "student",
  },
  {
    id: "31",
    title: "NEET Diagram Explainer",
    description: "Understand biological diagrams and their labeling",
    category: "NEET",
    role: "student",
  },
  // GATE Templates
  {
    id: "32",
    title: "GATE CS Question Bank",
    description: "Practice questions for algorithms, OS, DBMS, and networks",
    category: "GATE",
    role: "student",
    isHighlighted: true,
  },
  {
    id: "33",
    title: "GATE ECE Concept Notes",
    description: "Detailed notes for signals, circuits, and communication systems",
    category: "GATE",
    role: "student",
  },
  {
    id: "34",
    title: "GATE Mechanical Solver",
    description: "Solutions for thermodynamics, fluid mechanics, and machine design",
    category: "GATE",
    role: "student",
  },
  {
    id: "35",
    title: "GATE Aptitude Booster",
    description: "Practice general aptitude and engineering mathematics",
    category: "GATE",
    role: "student",
  },
  // Banking & SSC Templates
  {
    id: "36",
    title: "Banking Awareness Notes",
    description: "Current affairs and banking knowledge for IBPS, SBI, RBI exams",
    category: "Banking",
    role: "student",
  },
  {
    id: "37",
    title: "Quantitative Aptitude Solver",
    description: "Quick methods for DI, arithmetic, and number series",
    category: "Banking",
    role: "student",
    isFavorite: true,
  },
  {
    id: "38",
    title: "English Grammar & Vocabulary",
    description: "Improve grammar, vocabulary, and comprehension skills",
    category: "Banking",
    role: "student",
  },
  {
    id: "39",
    title: "SSC CGL Preparation Guide",
    description: "Complete preparation strategy and study material for SSC CGL",
    category: "Banking",
    role: "student",
  },
  {
    id: "40",
    title: "Reasoning Ability Trainer",
    description: "Master puzzles, syllogisms, and logical reasoning",
    category: "Banking",
    role: "student",
  },
  // More UPSC Templates
  {
    id: "41",
    title: "UPSC Prelims MCQ Generator",
    description: "Practice MCQs for history, polity, geography, and economy",
    category: "UPSC",
    role: "student",
  },
  {
    id: "42",
    title: "UPSC Mains Answer Writing",
    description: "Learn structured answer writing with model answers",
    category: "UPSC",
    role: "student",
    isPro: true,
  },
  {
    id: "43",
    title: "Indian Polity Explainer",
    description: "Understand constitution, governance, and political system",
    category: "UPSC",
    role: "student",
    isFavorite: true,
  },
  {
    id: "44",
    title: "Geography Map Revision",
    description: "Learn Indian and world geography with map-based questions",
    category: "UPSC",
    role: "student",
  },
  // Engineering Specific Templates
  {
    id: "45",
    title: "DSA Problem Solver",
    description: "Solutions for arrays, trees, graphs, DP with code explanations",
    category: "Engineering",
    role: "student",
    isFavorite: true,
    isHighlighted: true,
  },
  {
    id: "46",
    title: "Circuit Analysis Helper",
    description: "Solve KVL, KCL, Thevenin, Norton circuit problems",
    category: "Engineering",
    role: "student",
  },
  {
    id: "47",
    title: "Thermodynamics Calculator",
    description: "Solve heat transfer, entropy, and energy balance problems",
    category: "Engineering",
    role: "student",
  },
  {
    id: "48",
    title: "Machine Learning Concepts",
    description: "Understand ML algorithms, neural networks, and deep learning",
    category: "Engineering",
    role: "student",
    isPro: true,
  },
  {
    id: "49",
    title: "DBMS Query Generator",
    description: "Write SQL queries, normalization, and ER diagrams",
    category: "Engineering",
    role: "student",
  },
  {
    id: "50",
    title: "Computer Networks Notes",
    description: "OSI model, TCP/IP, routing protocols explained",
    category: "Engineering",
    role: "student",
  },
  {
    id: "51",
    title: "Operating Systems Concepts",
    description: "Process scheduling, memory management, deadlocks explained",
    category: "Engineering",
    role: "student",
  },
  {
    id: "52",
    title: "Digital Electronics Solver",
    description: "Boolean algebra, K-maps, flip-flops, and counters",
    category: "Engineering",
    role: "student",
  },
  {
    id: "53",
    title: "Signals & Systems Helper",
    description: "Fourier, Laplace, Z-transforms with solved examples",
    category: "Engineering",
    role: "student",
  },
  {
    id: "54",
    title: "Control Systems Designer",
    description: "Transfer functions, Bode plots, stability analysis",
    category: "Engineering",
    role: "student",
  },
  {
    id: "55",
    title: "Compiler Design Notes",
    description: "Lexical analysis, parsing, code generation explained",
    category: "Engineering",
    role: "student",
  },
  {
    id: "56",
    title: "Software Engineering Guide",
    description: "SDLC, design patterns, testing methodologies",
    category: "Engineering",
    role: "student",
  },
  // CAT/MBA Templates
  {
    id: "57",
    title: "CAT VARC Preparation",
    description: "Reading comprehension, para jumbles, and verbal ability",
    category: "CAT",
    role: "student",
  },
  {
    id: "58",
    title: "CAT Quant Shortcuts",
    description: "Quick calculation methods for CAT quantitative section",
    category: "CAT",
    role: "student",
    isFavorite: true,
  },
  {
    id: "59",
    title: "CAT DILR Strategies",
    description: "Data interpretation and logical reasoning techniques",
    category: "CAT",
    role: "student",
  },
  {
    id: "60",
    title: "GD/PI Preparation",
    description: "Group discussion topics and personal interview tips",
    category: "CAT",
    role: "student",
    isPro: true,
  },
  // State PSC Templates
  {
    id: "61",
    title: "State History & Culture",
    description: "State-wise history, culture, and heritage notes",
    category: "UPSC",
    role: "student",
  },
  {
    id: "62",
    title: "Indian Economy Notes",
    description: "Budget, policies, and economic surveys explained",
    category: "UPSC",
    role: "student",
  },
  // Law Entrance
  {
    id: "63",
    title: "CLAT Legal Reasoning",
    description: "Practice legal reasoning and legal knowledge questions",
    category: "Law",
    role: "student",
  },
  {
    id: "64",
    title: "CLAT GK Capsule",
    description: "Current affairs and static GK for law entrance",
    category: "Law",
    role: "student",
  },
  // Defense Exams
  {
    id: "65",
    title: "NDA Math Solver",
    description: "Mathematics preparation for NDA written exam",
    category: "Defense",
    role: "student",
  },
  {
    id: "66",
    title: "CDS GK & English",
    description: "General knowledge and English for CDS examination",
    category: "Defense",
    role: "student",
  },
  // Teaching Exams
  {
    id: "67",
    title: "UGC NET Paper 1",
    description: "Teaching aptitude, research methodology, and reasoning",
    category: "Research",
    role: "student",
  },
  {
    id: "68",
    title: "CTET Pedagogy Notes",
    description: "Child development and pedagogy for teaching exams",
    category: "K12",
    role: "teacher",
  },
  // More Medical Templates
  {
    id: "69",
    title: "Pharmacology Quick Notes",
    description: "Drug classifications, mechanisms, and side effects",
    category: "Medical",
    role: "student",
  },
  {
    id: "70",
    title: "Pathology Case Studies",
    description: "Disease mechanisms and diagnostic approaches",
    category: "Medical",
    role: "student",
    isPro: true,
  },
  {
    id: "71",
    title: "Biochemistry Pathways",
    description: "Metabolic pathways and enzyme mechanisms explained",
    category: "Medical",
    role: "student",
  },
  {
    id: "72",
    title: "Microbiology Flashcards",
    description: "Bacteria, viruses, and fungi identification guide",
    category: "Medical",
    role: "student",
  },
];

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
  }, [searchQuery, selectedCategory, selectedRole, showBookmarksOnly, bookmarkedIds]);

  const handleTemplateClick = (template: Template) => {
    // Navigate to template generator page
    navigate(`/template/${template.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole="Free Plan"
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === "dashboard") navigate("/dashboard");
          else if (id === "generate") navigate("/generate");
          else if (id === "generative-ai") navigate("/generative-ai");
          else if (id === "templates") { navigate("/templates"); setShowBookmarksOnly(false); }
          else if (id === "bookmarks") { navigate("/templates?bookmarks=true"); setShowBookmarksOnly(true); }
          else if (id === "history") navigate("/history");
          else if (id === "settings") navigate("/settings");
          else if (id === "upgrade") navigate("/upgrade");
          else if (id === "analytics") navigate("/analytics");
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
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1">
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
