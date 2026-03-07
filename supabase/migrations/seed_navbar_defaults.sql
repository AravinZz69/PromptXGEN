-- Seed navbar with current frontend defaults if not exists
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'navbar',
  '{
    "logoUrl": "",
    "siteName": "AskJai",
    "tagline": "AI Prompt Generator",
    "navLinks": [
      {"id": "1", "label": "Features", "url": "#features", "isExternal": false, "isVisible": true},
      {"id": "2", "label": "How It Works", "url": "#how-it-works", "isExternal": false, "isVisible": true},
      {"id": "3", "label": "Templates", "url": "#templates", "isExternal": false, "isVisible": true},
      {"id": "4", "label": "Pricing", "url": "#pricing", "isExternal": false, "isVisible": true}
    ],
    "ctaText": "Get Started",
    "ctaUrl": "/auth?mode=signup",
    "ctaVisible": true,
    "ctaStyle": "primary",
    "stickyNavbar": true,
    "transparentOnHero": true
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed footer with defaults if not exists
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'footer',
  '{
    "footerLogoUrl": "",
    "footerTagline": "AI prompt engineering, simplified.",
    "social": {
      "twitter": {"url": "", "visible": false},
      "linkedin": {"url": "", "visible": false},
      "github": {"url": "", "visible": false},
      "instagram": {"url": "", "visible": false},
      "youtube": {"url": "", "visible": false}
    },
    "columns": [
      {"id": "1", "title": "Product", "links": [
        {"id": "1-1", "label": "Features", "url": "#features"},
        {"id": "1-2", "label": "Pricing", "url": "#pricing"},
        {"id": "1-3", "label": "Templates", "url": "#templates"}
      ]},
      {"id": "2", "title": "Company", "links": [
        {"id": "2-1", "label": "About", "url": "/about"},
        {"id": "2-2", "label": "Blog", "url": "/blogs"},
        {"id": "2-3", "label": "Contact", "url": "/contact"}
      ]},
      {"id": "3", "title": "Legal", "links": [
        {"id": "3-1", "label": "Privacy", "url": "/terms?tab=privacy"},
        {"id": "3-2", "label": "Terms", "url": "/terms"}
      ]}
    ],
    "copyrightText": "© 2026 AskJai. All rights reserved.",
    "showNewsletter": false,
    "newsletterPlaceholder": "Enter your email"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed hero with defaults if not exists
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'hero',
  '{
    "badge": "✨ AI-Powered Prompt Engineering",
    "headline": "Generate Perfect Prompts in Seconds",
    "subHeadline": "Transform your ideas into powerful AI prompts with our intelligent generator. Get better results from ChatGPT, Claude, and other AI models.",
    "cta1Label": "Start Generating",
    "cta1Url": "/prompt-generator",
    "cta2Label": "View Templates",
    "cta2Url": "#templates"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;

-- Seed theme with defaults if not exists
INSERT INTO cms_config (section, data, updated_at)
VALUES (
  'theme',
  '{
    "primaryColor": "#6366f1",
    "secondaryColor": "#a855f7",
    "accentColor": "#06b6d4",
    "backgroundColor": "#030712",
    "surfaceColor": "#111827",
    "textColor": "#f9fafb",
    "mutedTextColor": "#9ca3af",
    "borderColor": "#1f2937",
    "borderRadius": "0.75rem",
    "fontFamily": "Inter"
  }'::jsonb,
  NOW()
)
ON CONFLICT (section) DO NOTHING;
