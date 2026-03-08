-- =============================================
-- BLOGS, TEAMS & TEMPLATE SEED DATA - Run in Supabase SQL Editor
-- Creates tables and seeds with existing app data
-- =============================================

-- =============================================
-- PART 1: CREATE TABLES
-- =============================================

-- BLOGS TABLE
create table if not exists blogs (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  category text,
  tags text[] default '{}',
  author_name text,
  author_role text,
  author_avatar text,
  cover_image text,
  read_time text,
  published_at date,
  is_featured boolean default false,
  is_published boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEAM MEMBERS TABLE
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  bio text,
  avatar text,
  social_twitter text,
  social_linkedin text,
  social_github text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COMPANY VALUES TABLE
create table if not exists company_values (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- PART 2: RLS POLICIES
-- =============================================

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_values ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "blogs_admin_all" ON blogs;
DROP POLICY IF EXISTS "blogs_public_read" ON blogs;
DROP POLICY IF EXISTS "team_members_admin_all" ON team_members;
DROP POLICY IF EXISTS "team_members_public_read" ON team_members;
DROP POLICY IF EXISTS "company_values_admin_all" ON company_values;
DROP POLICY IF EXISTS "company_values_public_read" ON company_values;

-- Blogs policies
CREATE POLICY "blogs_admin_all" ON blogs
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "blogs_public_read" ON blogs
  FOR SELECT USING (is_published = true);

-- Team members policies
CREATE POLICY "team_members_admin_all" ON team_members
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "team_members_public_read" ON team_members
  FOR SELECT USING (is_active = true);

-- Company values policies
CREATE POLICY "company_values_admin_all" ON company_values
  FOR ALL USING (public.check_is_admin() OR public.check_is_admin_by_profile())
  WITH CHECK (public.check_is_admin() OR public.check_is_admin_by_profile());

CREATE POLICY "company_values_public_read" ON company_values
  FOR SELECT USING (is_active = true);

-- =============================================
-- PART 3: SEED TEAM MEMBERS
-- =============================================

INSERT INTO team_members (name, role, bio, avatar, social_linkedin, social_github, display_order)
VALUES 
  ('Deekshitha', 'Full Stack Developer', 'Talented full-stack developer with expertise in React, Node.js, and cloud technologies. Builds scalable web applications from frontend to backend with modern best practices.', 'https://api.dicebear.com/7.x/initials/svg?seed=Deekshitha&backgroundColor=8b5cf6', 'https://www.linkedin.com/in/deekshitha-bonthu-48878a321', 'https://github.com/deekshu15', 1),
  ('Arvind Kumar', 'Backend Developer', 'Backend specialist with deep expertise in Python, PostgreSQL, and microservices architecture. Designs robust APIs and database systems that power AI applications.', 'https://api.dicebear.com/7.x/initials/svg?seed=ArvindKumar&backgroundColor=6366f1', 'https://www.linkedin.com/in/arvind-kumar-79676031b', 'https://github.com/AravinZz69', 2),
  ('Anuradha', 'AI/ML Engineer', 'Machine learning engineer specializing in NLP and generative AI. Develops and fine-tunes AI models for intelligent prompt optimization and content generation.', 'https://api.dicebear.com/7.x/initials/svg?seed=Anuradha&backgroundColor=ec4899', 'https://www.linkedin.com/in/anuradha-gorle-675b0631b/', 'https://github.com/anu577', 3),
  ('Pujith Sai', 'Frontend Developer', 'Creative frontend developer skilled in React, TypeScript, and UI/UX design. Crafts beautiful, responsive interfaces that deliver exceptional user experiences.', 'https://api.dicebear.com/7.x/initials/svg?seed=PujithSai&backgroundColor=10b981', 'https://www.linkedin.com/in/pujith-sai-cheeday-58078a321/', 'https://github.com/Pujithcheeday', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- PART 4: SEED COMPANY VALUES
-- =============================================

INSERT INTO company_values (title, description, icon, display_order)
VALUES 
  ('Innovation First', 'We push the boundaries of what''s possible with AI, constantly exploring new techniques and approaches to prompt optimization.', 'Lightbulb', 1),
  ('User Obsession', 'Every decision starts with the user. We build tools that solve real problems and make AI genuinely accessible.', 'Heart', 2),
  ('Radical Transparency', 'We share our roadmap, our challenges, and our learnings openly. Trust is built through honesty.', 'Eye', 3),
  ('Quality Over Speed', 'We''d rather ship something great next week than something mediocre today. Excellence is non-negotiable.', 'Trophy', 4),
  ('Collaborative Spirit', 'The best ideas come from diverse perspectives. We foster an environment where everyone''s voice matters.', 'Users', 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- PART 5: SEED BLOGS
-- =============================================

INSERT INTO blogs (slug, title, excerpt, content, category, tags, author_name, author_role, author_avatar, cover_image, read_time, published_at, is_featured, views)
VALUES 
  ('how-to-write-perfect-ai-prompts', 'How to Write Perfect AI Prompts That Actually Work', 'Master the art of prompt engineering with these proven techniques that will transform how you interact with AI models and get consistently better results.', 'The quality of your AI output directly depends on the quality of your input. After analyzing over 100,000 prompts generated through AskJai, we''ve identified the key patterns that separate mediocre prompts from exceptional ones.

## The Foundation: Be Specific and Contextual

The most common mistake users make is being too vague. Instead of asking "Write me an email," provide context: who you''re writing to, the purpose, the tone you want, and any constraints. This single change can improve output quality by 300%.

## Structure Your Prompts Like a Brief

Think of your prompt as a creative brief. Include the role you want the AI to assume, the task at hand, the format you expect, and any examples of what success looks like. This framework, which we call RTFE (Role, Task, Format, Examples), has proven to be incredibly effective.

## Use Chain-of-Thought Reasoning

For complex tasks, don''t ask for the final answer immediately. Ask the AI to think step by step, explain its reasoning, and then arrive at a conclusion. This approach dramatically improves accuracy for reasoning-heavy tasks.

## Iterate and Refine

Your first prompt rarely produces the best result. Use the AI''s output as feedback to refine your prompt. Add clarifications, adjust constraints, and provide examples based on what worked and what didn''t.

## Leverage Templates

Don''t start from scratch every time. Create templates for common tasks and customize them as needed. This not only saves time but ensures consistency across your prompts.

The journey to prompt mastery is ongoing, but these fundamentals will serve you well regardless of which AI model you''re using or what task you''re tackling.', 'Prompt Engineering', ARRAY['AI', 'Prompts', 'Tips', 'Best Practices'], 'Sarah Chen', 'Head of AI Research', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', '5 min read', '2025-02-15', true, 12400),
  
  ('chain-of-thought-prompting-explained', 'Chain-of-Thought Prompting: The Secret to Complex AI Tasks', 'Discover how chain-of-thought prompting can help AI models tackle complex reasoning tasks that simple prompts can''t handle.', 'Chain-of-thought (CoT) prompting is one of the most powerful techniques in the prompt engineer''s toolkit. Instead of asking for a direct answer, you instruct the AI to show its reasoning process step by step.

## Why Chain-of-Thought Works

Large language models are excellent at pattern matching and following instructions, but they can struggle with multi-step reasoning when asked to jump directly to conclusions. By explicitly requesting intermediate steps, you give the model more opportunities to catch errors and stay on track.

## The Basic Pattern

A simple CoT prompt follows this structure: "Let''s think through this step by step. First, [step 1]. Then, [step 2]. Finally, [conclusion]." This explicit breakdown guides the model through the reasoning process.

## When to Use Chain-of-Thought

CoT prompting excels at mathematical problems, logical reasoning, code debugging, complex analysis, and any task requiring multiple steps. It''s particularly valuable when you need to audit the AI''s reasoning or when accuracy is critical.

## Advanced Techniques

Self-consistency involves generating multiple CoT reasoning paths and selecting the most common answer. Tree-of-thought extends CoT by exploring multiple reasoning branches simultaneously. These techniques can further improve accuracy for the most challenging tasks.

Mastering chain-of-thought prompting will dramatically expand what you can accomplish with AI assistance.', 'Prompt Engineering', ARRAY['CoT', 'Reasoning', 'Advanced', 'Techniques'], 'Marcus Johnson', 'Senior AI Engineer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', 'https://images.unsplash.com/photo-1620712943543-bcc3d9d0f4f7?w=800&q=80', '7 min read', '2025-02-10', false, 8920),

  ('few-shot-prompting-guide', 'Few-Shot Prompting: Teaching AI Through Examples', 'Learn how providing examples in your prompts can dramatically improve AI output quality and consistency.', 'Few-shot prompting is a technique where you provide examples of the desired input-output pairs within your prompt. This helps the AI understand exactly what you''re looking for, leading to more consistent and accurate results.

## The Power of Examples

When you show the AI what success looks like, it can pattern-match against your examples. This is especially useful for tasks where the expected format or style might be ambiguous from instructions alone.

## Zero-Shot vs Few-Shot

Zero-shot prompting relies entirely on instructions without examples. Few-shot provides one or more examples. Generally, few-shot produces more consistent results, but requires more effort to craft quality examples.

## Crafting Effective Examples

Your examples should be diverse enough to cover edge cases but similar enough to your actual task. Include both the input and your ideal output. Three to five well-chosen examples typically provide the best balance between quality and prompt length.

Few-shot prompting is particularly powerful when combined with clear instructions and chain-of-thought reasoning for complex tasks.', 'Prompt Engineering', ARRAY['Few-shot', 'Examples', 'Learning', 'Tutorial'], 'Sarah Chen', 'Head of AI Research', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', '6 min read', '2025-02-05', false, 6540),

  ('AskJai-v2-launch', 'Introducing AskJai 2.0: Smarter Prompts, Better Results', 'We''re excited to announce the biggest update to AskJai yet, featuring AI model comparison, collaborative workspaces, and advanced analytics.', 'Today marks a major milestone for AskJai. After months of development and feedback from our amazing community, we''re thrilled to launch AskJai 2.0.

## What''s New

**AI Model Comparison**: Test your prompts across multiple AI models simultaneously. See how GPT-4, Claude, and Gemini respond to the same prompt, and choose the best output for your needs.

**Collaborative Workspaces**: Work with your team in real-time. Share prompts, leave comments, and build a library of templates together. Perfect for agencies and content teams.

**Advanced Analytics**: Understand your prompt performance with detailed analytics. Track success rates, identify patterns, and continuously improve your prompting skills.

## Pricing Updates

We''re introducing a new Team plan at $49/month for up to 5 users. Enterprise customers get priority access to new features and dedicated support.

Thank you to everyone who provided feedback during beta!', 'Product Updates', ARRAY['Launch', 'Features', 'V2', 'Announcement'], 'Alex Rivera', 'CEO & Co-Founder', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', '4 min read', '2025-01-28', false, 15230),

  ('ai-content-marketing-prompts', '50 AI Prompts Every Content Marketer Needs', 'A comprehensive collection of proven prompts for blog posts, social media, email campaigns, and more—ready to use today.', 'Content marketing at scale requires consistent quality and efficiency. Here''s our curated collection of prompts that content marketers use daily.

## Blog Content

**Topic Ideation**: "Generate 10 blog post ideas for [industry] that address common pain points of [audience]. Include estimated search volume potential."

**Outline Creation**: "Create a detailed outline for a 2000-word blog post about [topic]. Include an attention-grabbing intro, 5 main sections with sub-points, and a compelling conclusion with CTA."

## Social Media

**LinkedIn Posts**: "Write a LinkedIn post sharing insights about [topic]. Include a hook, 3 key takeaways, and end with a question to drive engagement."

**Twitter Threads**: "Convert this blog post into a compelling Twitter thread. Start with a hook, include 8-10 tweets with key insights, and end with a CTA."

## Email Marketing

**Subject Lines**: "Generate 10 email subject lines for [campaign type]. A/B test variations focusing on curiosity, urgency, and benefit-driven approaches."

These prompts have been tested across thousands of campaigns. Customize them for your brand voice and specific needs.', 'Use Cases', ARRAY['Marketing', 'Content', 'Templates', 'Social Media'], 'Emily Watson', 'Head of Marketing', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80', '10 min read', '2024-12-10', false, 22100),

  ('ai-coding-assistant-prompts', 'Level Up Your Coding with These AI Prompt Templates', 'From code review to debugging to documentation, these prompts will make you a more effective developer.', 'AI coding assistants have become indispensable tools for developers. But the difference between mediocre and exceptional results comes down to how you prompt them.

## Code Review

**Comprehensive Review**: "Review this code for bugs, security issues, performance problems, and style violations. Prioritize issues by severity and provide specific fix recommendations."

## Debugging

**Error Analysis**: "I''m getting this error: [error message]. Here''s the relevant code: [code]. Explain what''s causing this and provide a fix."

## Code Generation

**Function Implementation**: "Write a [language] function that [description]. Include input validation, error handling, and comprehensive comments."

## Documentation

**Code Documentation**: "Add JSDoc/docstring comments to this code. Include parameter descriptions, return values, examples, and any important notes about behavior."

These prompts work across languages and AI coding tools.', 'Use Cases', ARRAY['Coding', 'Development', 'Debugging', 'Templates'], 'David Park', 'CTO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', '8 min read', '2024-12-05', false, 16780),

  ('prompt-engineering-tutorial-beginners', 'Prompt Engineering 101: A Complete Beginner''s Tutorial', 'New to AI prompts? This step-by-step guide will take you from complete beginner to confident prompt engineer.', 'If you''re just starting with AI tools and feeling overwhelmed, this guide is for you.

## What Is Prompt Engineering?

Prompt engineering is the practice of crafting inputs (prompts) to get desired outputs from AI systems. It''s part art, part science, and entirely learnable.

## Your First Prompt

Start simple. A basic prompt has three elements: context, instruction, and format.

## The CRAFT Framework

**C**ontext: Set the scene. Who is the AI? What''s the situation?
**R**ole: What role should the AI assume? Expert, assistant, critic?
**A**ction: What do you want the AI to do? Be specific.
**F**ormat: How should the output be structured? List, paragraph, code?
**T**one: What voice should it use? Professional, casual, technical?

## Common Mistakes to Avoid

Being too vague, skipping context, and ignoring format specifications.

The best way to learn is by doing. Open AskJai and start experimenting!', 'Tutorials', ARRAY['Beginner', 'Tutorial', 'Basics', 'Getting Started'], 'Emily Watson', 'Head of Marketing', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', '12 min read', '2024-11-28', false, 28540),

  ('prompt-templates-saas-business', 'Building a Prompt Template Library for Your SaaS Business', 'How to create, organize, and maintain a library of prompt templates that scales with your team.', 'A well-organized prompt template library can be a competitive advantage.

## Why Templates Matter

Templates ensure consistency across your team. They capture institutional knowledge. They reduce the time to value for new AI use cases.

## Organizing Your Library

**By Department**: Marketing, Sales, Engineering, Support, HR
**By Use Case**: Content creation, analysis, summarization, generation
**By Skill Level**: Basic, intermediate, advanced

## Template Components

Each template should include: name and description, the prompt itself with placeholder variables, example inputs and outputs, best practices and tips.

## Building the Culture

Templates only work if people use them. Make them easily discoverable. Train your team on how to find and use templates.

Start small, prove value, then expand.', 'Tutorials', ARRAY['Templates', 'Organization', 'Team', 'SaaS'], 'Alex Rivera', 'CEO & Co-Founder', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', 'https://images.unsplash.com/photo-1553877522-43b9f4e5af3f?w=800&q=80', '9 min read', '2024-11-20', false, 7650)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PART 6: SEED TEMPLATES (if table exists)
-- =============================================

-- Insert templates into the templates table
INSERT INTO templates (title, description, category, role, is_pro, is_visible, is_featured)
SELECT * FROM (VALUES
  ('Lesson Plan Generator', 'Create detailed lesson plans with objectives, activities, and assessments', 'K12', 'teacher', false, true, false),
  ('MCQ Generator', 'Generate multiple choice questions for any subject', 'K12', 'teacher', false, true, false),
  ('Worksheet Creator', 'Design practice worksheets with varied question types', 'K12', 'teacher', false, true, false),
  ('Question Paper Builder', 'Create complete question papers with marking scheme', 'K12', 'teacher', false, true, false),
  ('Concept Explainer', 'Get clear explanations of complex topics', 'K12', 'student', false, true, true),
  ('Doubt Clarifier', 'Ask specific questions and get detailed answers', 'K12', 'student', false, true, false),
  ('Technical Notes Generator', 'Create structured technical notes for engineering subjects', 'Engineering', 'student', false, true, false),
  ('Lab Manual Creator', 'Generate lab procedures and safety guidelines', 'Engineering', 'teacher', false, true, false),
  ('Engineering Problem Solver', 'Step-by-step solutions for engineering problems', 'Engineering', 'student', false, true, false),
  ('Code Explainer', 'Understand code with detailed explanations', 'Engineering', 'student', false, true, false),
  ('Clinical Case Study', 'Create medical case studies for learning', 'Medical', 'teacher', true, true, false),
  ('Anatomy Study Guide', 'Comprehensive anatomy revision notes', 'Medical', 'student', false, true, false),
  ('UPSC Essay Writer', 'Generate well-structured essays for UPSC preparation', 'UPSC', 'student', false, true, false),
  ('Current Affairs Summarizer', 'Get concise summaries of current events', 'UPSC', 'student', false, true, false),
  ('Business Case Study', 'Create detailed business case studies', 'Commerce', 'teacher', false, true, false),
  ('Financial Analysis Helper', 'Analyze financial statements and ratios', 'Commerce', 'student', false, true, false),
  ('Art History Notes', 'Generate comprehensive art history study material', 'Arts', 'student', false, true, false),
  ('Creative Writing Prompts', 'Get inspiring prompts for creative writing', 'Arts', 'student', false, true, false),
  ('Research Paper Outline', 'Create structured outlines for research papers', 'Research', 'student', true, true, false),
  ('Literature Review Helper', 'Organize and summarize research literature', 'Research', 'student', false, true, false),
  ('JEE Physics Problem Solver', 'Step-by-step solutions for JEE Main & Advanced physics problems', 'JEE', 'student', false, true, true),
  ('JEE Chemistry Formula Sheet', 'Generate comprehensive formula sheets for organic, inorganic & physical chemistry', 'JEE', 'student', false, true, false),
  ('JEE Maths Concept Builder', 'Master calculus, algebra, and coordinate geometry concepts', 'JEE', 'student', false, true, false),
  ('JEE Previous Year Analysis', 'Analyze previous year questions with detailed solutions', 'JEE', 'student', true, true, false),
  ('NEET Biology Notes Generator', 'Create detailed notes for Botany and Zoology NCERT chapters', 'NEET', 'student', false, true, false),
  ('NEET Chemistry Quick Revision', 'Generate quick revision notes for NEET chemistry', 'NEET', 'student', false, true, false),
  ('NEET Physics Numericals', 'Practice numerical problems with step-by-step solutions', 'NEET', 'student', false, true, false),
  ('GATE CS Question Bank', 'Practice questions for algorithms, OS, DBMS, and networks', 'GATE', 'student', false, true, true),
  ('GATE ECE Concept Notes', 'Detailed notes for signals, circuits, and communication systems', 'GATE', 'student', false, true, false),
  ('Banking Awareness Notes', 'Current affairs and banking knowledge for IBPS, SBI, RBI exams', 'Banking', 'student', false, true, false),
  ('Quantitative Aptitude Solver', 'Quick methods for DI, arithmetic, and number series', 'Banking', 'student', false, true, false),
  ('DSA Problem Solver', 'Solutions for arrays, trees, graphs, DP with code explanations', 'Engineering', 'student', false, true, true),
  ('Machine Learning Concepts', 'Understand ML algorithms, neural networks, and deep learning', 'Engineering', 'student', true, true, false),
  ('CAT VARC Preparation', 'Reading comprehension, para jumbles, and verbal ability', 'CAT', 'student', false, true, false),
  ('CAT Quant Shortcuts', 'Quick calculation methods for CAT quantitative section', 'CAT', 'student', false, true, false),
  ('GD/PI Preparation', 'Group discussion topics and personal interview tips', 'CAT', 'student', true, true, false),
  ('CLAT Legal Reasoning', 'Practice legal reasoning and legal knowledge questions', 'Law', 'student', false, true, false),
  ('NDA Math Solver', 'Mathematics preparation for NDA written exam', 'Defense', 'student', false, true, false),
  ('UGC NET Paper 1', 'Teaching aptitude, research methodology, and reasoning', 'Research', 'student', false, true, false),
  ('Pharmacology Quick Notes', 'Drug classifications, mechanisms, and side effects', 'Medical', 'student', false, true, false),
  ('Pathology Case Studies', 'Disease mechanisms and diagnostic approaches', 'Medical', 'student', true, true, false)
) AS t(title, description, category, role, is_pro, is_visible, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE templates.title = t.title);

-- Grant permissions
GRANT ALL ON blogs TO authenticated;
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON company_values TO authenticated;
GRANT SELECT ON blogs TO anon;
GRANT SELECT ON team_members TO anon;
GRANT SELECT ON company_values TO anon;

-- Verify
SELECT 'Seed Data Loaded!' as status;
SELECT 'blogs' as table_name, count(*) as count FROM blogs
UNION ALL
SELECT 'team_members', count(*) FROM team_members
UNION ALL
SELECT 'company_values', count(*) FROM company_values
UNION ALL
SELECT 'templates', count(*) FROM templates;
