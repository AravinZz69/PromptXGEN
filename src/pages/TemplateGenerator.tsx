import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Loader2, Copy, Download, Check } from 'lucide-react';
import { addToHistory } from '@/lib/historyService';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { recordCreditUsage } from '@/utils/creditGuard';

// Template configurations with form fields
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string | number;
}

interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: FormField[];
}

const templateConfigs: TemplateConfig[] = [
  {
    id: '1',
    title: 'Lesson Plan Generator',
    description: 'Create detailed lesson plans with objectives, activities, and assessments',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Mathematics, Science', required: true },
      { id: 'topic', label: 'Topic/Chapter', type: 'text', placeholder: 'e.g., Algebra, Photosynthesis', required: true },
      { id: 'gradeLevel', label: 'Grade Level', type: 'text', placeholder: 'e.g., Class 9', required: true },
      { id: 'objectives', label: 'Learning Objectives', type: 'textarea', placeholder: 'What should students learn?' },
    ],
  },
  {
    id: '2',
    title: 'MCQ Generator',
    description: 'Generate multiple choice questions with options, correct answers, and explanations',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Science, Social Studies', required: true },
      { id: 'topic', label: 'Topic/Chapter', type: 'text', placeholder: 'e.g., Cell Structure, Indian Freedom Movement', required: true },
      { id: 'gradeLevel', label: 'Grade Level', type: 'text', placeholder: 'e.g., Class 9', required: true },
      { id: 'numQuestions', label: 'Number of Questions', type: 'number', placeholder: '10', defaultValue: 10 },
      { id: 'difficulty', label: 'Difficulty Level', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Mixed'] },
      { id: 'includeExplanations', label: 'Include Explanations', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: '3',
    title: 'Worksheet Creator',
    description: 'Design practice worksheets with varied question types',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Mathematics', required: true },
      { id: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Fractions', required: true },
      { id: 'gradeLevel', label: 'Grade Level', type: 'text', placeholder: 'e.g., Class 5', required: true },
      { id: 'questionTypes', label: 'Question Types', type: 'select', options: ['Fill in blanks', 'Match the following', 'Short answer', 'Mixed'] },
      { id: 'numQuestions', label: 'Number of Questions', type: 'number', defaultValue: 15 },
    ],
  },
  {
    id: '4',
    title: 'Question Paper Builder',
    description: 'Create complete question papers with marking scheme',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Physics', required: true },
      { id: 'gradeLevel', label: 'Grade/Class', type: 'text', placeholder: 'e.g., Class 12', required: true },
      { id: 'totalMarks', label: 'Total Marks', type: 'number', defaultValue: 100 },
      { id: 'duration', label: 'Duration (hours)', type: 'number', defaultValue: 3 },
      { id: 'sections', label: 'Include Sections', type: 'select', options: ['Yes (A, B, C, D)', 'No'] },
      { id: 'chapters', label: 'Chapters to Cover', type: 'textarea', placeholder: 'List chapters to include' },
    ],
  },
  {
    id: '5',
    title: 'Concept Explainer',
    description: 'Get clear explanations of complex topics',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Physics', required: true },
      { id: 'concept', label: 'Concept/Topic', type: 'text', placeholder: 'e.g., Newton\'s Laws of Motion', required: true },
      { id: 'gradeLevel', label: 'Grade Level', type: 'text', placeholder: 'e.g., Class 11' },
      { id: 'depth', label: 'Explanation Depth', type: 'select', options: ['Basic Overview', 'Detailed', 'Advanced with Examples'] },
      { id: 'includeExamples', label: 'Include Real-life Examples', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: '6',
    title: 'Doubt Clarifier',
    description: 'Ask specific questions and get detailed answers',
    category: 'K12',
    fields: [
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Chemistry', required: true },
      { id: 'doubt', label: 'Your Question/Doubt', type: 'textarea', placeholder: 'Describe your doubt in detail...', required: true },
      { id: 'context', label: 'Context (optional)', type: 'text', placeholder: 'e.g., Class 10 NCERT Chapter 2' },
      { id: 'detailLevel', label: 'Answer Detail Level', type: 'select', options: ['Brief', 'Detailed', 'Step-by-step'] },
    ],
  },
  // JEE Templates
  {
    id: '23',
    title: 'JEE Physics Problem Solver',
    description: 'Step-by-step solutions for JEE Main & Advanced physics problems',
    category: 'JEE',
    fields: [
      { id: 'topic', label: 'Topic', type: 'select', options: ['Mechanics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Thermodynamics', 'Waves'] },
      { id: 'problem', label: 'Problem Statement', type: 'textarea', placeholder: 'Enter the physics problem...', required: true },
      { id: 'difficulty', label: 'Difficulty Level', type: 'select', options: ['JEE Mains Level', 'JEE Advanced Level'] },
      { id: 'showSteps', label: 'Show Detailed Steps', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: '24',
    title: 'JEE Chemistry Formula Sheet',
    description: 'Generate comprehensive formula sheets for organic, inorganic & physical chemistry',
    category: 'JEE',
    fields: [
      { id: 'branch', label: 'Chemistry Branch', type: 'select', options: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'All'] },
      { id: 'topics', label: 'Specific Topics', type: 'textarea', placeholder: 'e.g., Electrochemistry, Coordination Compounds' },
      { id: 'includeReactions', label: 'Include Reactions', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  // NEET Templates
  {
    id: '28',
    title: 'NEET Biology Notes Generator',
    description: 'Create detailed notes for Botany and Zoology NCERT chapters',
    category: 'NEET',
    fields: [
      { id: 'subject', label: 'Subject', type: 'select', options: ['Botany', 'Zoology', 'Both'], required: true },
      { id: 'chapter', label: 'Chapter Name', type: 'text', placeholder: 'e.g., Cell: The Unit of Life', required: true },
      { id: 'noteType', label: 'Note Type', type: 'select', options: ['Detailed Notes', 'Quick Revision', 'Important Points Only'] },
      { id: 'includeDiagrams', label: 'Include Diagram Descriptions', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  // UPSC Templates
  {
    id: '13',
    title: 'UPSC Essay Writer',
    description: 'Generate well-structured essays for UPSC preparation',
    category: 'UPSC',
    fields: [
      { id: 'topic', label: 'Essay Topic', type: 'text', placeholder: 'Enter the essay topic...', required: true },
      { id: 'wordLimit', label: 'Word Limit', type: 'select', options: ['1000 words', '1500 words', '2000 words', '2500 words'] },
      { id: 'perspective', label: 'Perspective', type: 'select', options: ['Balanced', 'In Favor', 'Against'] },
      { id: 'includeQuotes', label: 'Include Quotes/Examples', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: '14',
    title: 'Current Affairs Summarizer',
    description: 'Get concise summaries of current events',
    category: 'UPSC',
    fields: [
      { id: 'topic', label: 'Topic/Event', type: 'text', placeholder: 'e.g., Union Budget 2026', required: true },
      { id: 'category', label: 'Category', type: 'select', options: ['National', 'International', 'Economy', 'Environment', 'Science & Tech', 'Sports'] },
      { id: 'format', label: 'Summary Format', type: 'select', options: ['Point-wise', 'Paragraph', 'Q&A Format'] },
      { id: 'prelims', label: 'Include Prelims Relevance', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  // GATE Templates
  {
    id: '32',
    title: 'GATE CS Question Bank',
    description: 'Practice questions for algorithms, OS, DBMS, and networks',
    category: 'GATE',
    fields: [
      { id: 'subject', label: 'Subject', type: 'select', options: ['Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Theory of Computation', 'Digital Logic'], required: true },
      { id: 'topic', label: 'Specific Topic', type: 'text', placeholder: 'e.g., Deadlock, Sorting Algorithms' },
      { id: 'numQuestions', label: 'Number of Questions', type: 'number', defaultValue: 10 },
      { id: 'questionType', label: 'Question Type', type: 'select', options: ['MCQ', 'Numerical', 'Mixed'] },
    ],
  },
  // Banking Templates
  {
    id: '36',
    title: 'Banking Awareness Notes',
    description: 'Current affairs and banking knowledge for IBPS, SBI, RBI exams',
    category: 'Banking',
    fields: [
      { id: 'exam', label: 'Target Exam', type: 'select', options: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk', 'RBI Grade B', 'General'], required: true },
      { id: 'topic', label: 'Topic', type: 'select', options: ['Banking Terms', 'RBI Policies', 'Financial Institutions', 'Government Schemes', 'Current Affairs'] },
      { id: 'format', label: 'Format', type: 'select', options: ['Notes', 'One-liners', 'Q&A'] },
    ],
  },
  // Engineering Templates
  {
    id: '7',
    title: 'Technical Notes Generator',
    description: 'Create structured technical notes for engineering subjects',
    category: 'Engineering',
    fields: [
      { id: 'branch', label: 'Engineering Branch', type: 'select', options: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'], required: true },
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Data Structures', required: true },
      { id: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Binary Trees' },
      { id: 'noteType', label: 'Note Type', type: 'select', options: ['Detailed', 'Summary', 'Exam-focused'] },
    ],
  },
  {
    id: '10',
    title: 'Code Explainer',
    description: 'Understand code with detailed explanations',
    category: 'Engineering',
    fields: [
      { id: 'language', label: 'Programming Language', type: 'select', options: ['Python', 'Java', 'C++', 'JavaScript', 'C', 'Other'], required: true },
      { id: 'code', label: 'Paste Your Code', type: 'textarea', placeholder: 'Paste the code you want explained...', required: true },
      { id: 'depth', label: 'Explanation Depth', type: 'select', options: ['Line by line', 'Block by block', 'Overall logic'] },
    ],
  },
  // Research Templates
  {
    id: '19',
    title: 'Research Paper Outline',
    description: 'Create structured outlines for research papers',
    category: 'Research',
    fields: [
      { id: 'title', label: 'Paper Title', type: 'text', placeholder: 'Enter your research paper title', required: true },
      { id: 'field', label: 'Research Field', type: 'text', placeholder: 'e.g., Machine Learning, Environmental Science' },
      { id: 'type', label: 'Paper Type', type: 'select', options: ['Review Paper', 'Research Article', 'Case Study', 'Thesis Chapter'] },
      { id: 'sections', label: 'Number of Main Sections', type: 'number', defaultValue: 5 },
    ],
  },
];

// Default template for unknown IDs
const defaultTemplate: TemplateConfig = {
  id: 'default',
  title: 'Content Generator',
  description: 'Generate content based on your requirements',
  category: 'General',
  fields: [
    { id: 'topic', label: 'Topic', type: 'text', placeholder: 'Enter your topic', required: true },
    { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe what you need...' },
    { id: 'format', label: 'Output Format', type: 'select', options: ['Detailed', 'Summary', 'Point-wise'] },
  ],
};

const TemplateGenerator = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { credits, hasCredits, refetch: refetchCredits } = useCredits();
  
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get user info
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Find template config
  const template = templateConfigs.find(t => t.id === templateId) || defaultTemplate;

  // Initialize form with default values
  useEffect(() => {
    const defaults: Record<string, string | number> = {};
    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });
    setFormData(defaults);
  }, [templateId]);

  const handleInputChange = (fieldId: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Build prompt based on template and form data
  const buildPrompt = (template: TemplateConfig, data: Record<string, string | number>): string => {
    const fieldValues = template.fields
      .map(field => `${field.label}: ${data[field.id] || 'Not specified'}`)
      .join('\n');

    const promptTemplates: Record<string, string> = {
      '1': `You are an expert educator. Create a detailed lesson plan based on the following:
${fieldValues}

Generate a comprehensive lesson plan including:
1. Learning Objectives (3-5 clear objectives)
2. Materials Required
3. Introduction/Hook (5-10 minutes)
4. Main Content with activities (detailed breakdown)
5. Assessment strategies
6. Differentiation for different learners
7. Homework/Extension activities

Format it professionally with markdown headings.`,

      '2': `You are an expert teacher creating MCQ questions. Based on the following:
${fieldValues}

Generate ${data.numQuestions || 10} multiple choice questions with:
- 4 options each (A, B, C, D)
- Clear correct answer marked
${data.includeExplanations === 'Yes' ? '- Detailed explanation for each answer' : ''}
- Varying difficulty as specified

Format each question clearly with markdown.`,

      '3': `You are an expert educator creating worksheets. Based on the following:
${fieldValues}

Create a practice worksheet with:
- Clear instructions
- ${data.numQuestions || 15} questions of type: ${data.questionTypes || 'Mixed'}
- Answer key at the end
- Proper formatting for printing`,

      '4': `You are an expert examiner. Create a complete question paper based on:
${fieldValues}

Include:
- Header with school name placeholder, date, time
- Clear instructions for students
- Multiple sections with different question types
- Marks distribution for each question
- Marking scheme at the end`,

      '5': `You are an expert teacher explaining concepts. Based on:
${fieldValues}

Provide a clear explanation including:
- Simple definition
- Key concepts and principles
- Step-by-step breakdown
${data.includeExamples === 'Yes' ? '- Real-life examples and applications' : ''}
- Common misconceptions to avoid
- Summary points

Make it engaging and easy to understand for the specified grade level.`,

      '6': `You are a helpful tutor. The student has a doubt:
${fieldValues}

Provide:
- Direct answer to the question
- Step-by-step explanation
- Related concepts to understand
- Practice tips

Answer at ${data.detailLevel || 'Detailed'} level.`,

      '23': `You are a JEE Physics expert. Solve this problem:
${fieldValues}

Provide:
${data.showSteps === 'Yes' ? `- Complete step-by-step solution
- All formulas used with explanations
- Diagrams description if needed
- Units and dimensional analysis` : '- Direct solution with key steps'}
- Final answer clearly marked
- Tips for similar problems`,

      '24': `You are a JEE Chemistry expert. Create a formula sheet for:
${fieldValues}

Include:
- All important formulas organized by topic
${data.includeReactions === 'Yes' ? '- Key chemical reactions with conditions' : ''}
- Memory tips and tricks
- Important constants
- Common mistakes to avoid`,

      '28': `You are a NEET Biology expert. Create detailed notes for:
${fieldValues}

Include:
- Chapter summary
- Key definitions and terms
- Important diagrams and their explanations
- NCERT-based points
- Previous year question topics
- Quick revision points`,

      '13': `You are a UPSC expert essay writer. Write an essay on:
${fieldValues}

Structure:
- Engaging introduction
- Multiple dimensions (social, economic, political, environmental)
- Current examples and data
${data.includeQuotes === 'Yes' ? '- Relevant quotes from thinkers/leaders' : ''}
- Balanced perspective
- Strong conclusion with way forward

Word limit: ${data.wordLimit || '1500 words'}`,

      '32': `You are a GATE CS expert. Generate practice questions for:
${fieldValues}

Create ${data.numQuestions || 10} ${data.questionType || 'Mixed'} questions with:
- GATE-level difficulty
- Previous year pattern
- Detailed solutions
- Time estimates for each`,

      '10': `You are an expert programmer. Explain this code:
${fieldValues}

Provide:
- Overall purpose of the code
- ${data.depth || 'Line by line'} explanation
- Time and space complexity
- Potential improvements
- Edge cases to consider`,
    };

    return promptTemplates[template.id] || `You are an expert in ${template.category}. Based on the following inputs:
${fieldValues}

Generate high-quality content for: ${template.title}
${template.description}

Provide comprehensive, well-formatted output with markdown formatting.`;
  };

  const handleGenerate = async () => {
    // Check if user has credits before generating
    if (!hasCredits || (credits && credits.remainingCredits <= 0)) {
      toast({
        title: "No Credits Available",
        description: "You have run out of credits. Please upgrade your plan to continue generating content.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    
    try {
      const userInputs = buildPrompt(template, formData);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert prompt engineer specializing in educational prompts. Your job is to generate a ready-to-use prompt that students can copy and paste directly into any AI assistant (ChatGPT, Claude, Gemini, etc.) to get high-quality educational content.

IMPORTANT RULES:
1. Generate ONLY the prompt text - no explanations, no "Here's your prompt:", no quotes around it
2. The prompt should be comprehensive and include all the user's requirements
3. Make it detailed enough that any LLM will understand exactly what to generate
4. Include specific instructions about format, depth, and style
5. Start directly with "You are..." or "Act as..." 
6. The prompt should be self-contained and ready to copy-paste`
            },
            {
              role: 'user',
              content: `Generate a prompt for: ${template.title}

User's Requirements:
${userInputs}

Create a comprehensive, detailed prompt that a student can paste into any AI to get exactly what they need. The prompt should be specific to Indian education system when applicable.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'No content generated';
      setGeneratedContent(content);
      
      // Save to history
      addToHistory({
        type: 'template',
        templateId: template.id,
        templateName: template.title,
        category: template.category,
        input: formData,
        output: content,
      });

      // Deduct credits after successful generation
      try {
        await recordCreditUsage(
          'llama-3.3-70b-versatile',
          buildPrompt(template, formData),
          content,
          `Template generation (${template.title})`
        );
        // Refresh credits display
        refetchCredits();
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGeneratedContent('Error generating prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}_prompt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole="Free Plan"
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
          else if (id === 'analytics') navigate('/analytics');
          else if (id === 'profile') navigate('/profile');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="bg-card border border-border rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">{template.title}</h1>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/templates')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to templates
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {template.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-foreground">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {field.type === 'text' && (
                        <Input
                          id={field.id}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-background"
                        />
                      )}

                      {field.type === 'textarea' && (
                        <Textarea
                          id={field.id}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-background min-h-[100px]"
                        />
                      )}

                      {field.type === 'number' && (
                        <Input
                          id={field.id}
                          type="number"
                          placeholder={field.placeholder}
                          value={formData[field.id] || field.defaultValue || ''}
                          onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || 0)}
                          className="bg-background"
                        />
                      )}

                      {field.type === 'select' && field.options && (
                        <Select
                          value={formData[field.id]?.toString() || ''}
                          onValueChange={(value) => handleInputChange(field.id, value)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white gap-2 h-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Prompt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Prompt
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column - Generated Prompt */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Generated Prompt</h2>
                    <p className="text-xs text-muted-foreground mt-1">Copy and paste into ChatGPT, Claude, or any AI</p>
                  </div>
                  {generatedContent && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-1"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Prompt'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadContent}
                        className="gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-background/50 rounded-xl p-4 overflow-auto min-h-[400px]">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground">Generating your prompt...</p>
                    </div>
                  ) : generatedContent ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
                        {generatedContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      <p className="text-primary font-medium mb-1">Fill in the form and click Generate</p>
                      <p className="text-sm text-muted-foreground">Your AI prompt will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TemplateGenerator;
