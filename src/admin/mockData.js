// MOCK DATA - All mock data for the admin portal
// Replace with real API calls in production

// Generate consistent dates
const now = new Date();
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
const monthsAgo = (months) => new Date(now.setMonth(now.getMonth() - months)).toISOString();

// MOCK DATA - Users (30 users with realistic data)
export const mockUsers = [
  { id: 1, name: "John Smith", email: "john.smith@email.com", avatar: "JS", plan: "Pro", promptsUsed: 342, joinedDate: daysAgo(120), lastActive: daysAgo(0), status: "Active", tokensUsed: 125000, avgSession: "18m 24s", credits: 850 },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@company.com", avatar: "SJ", plan: "Enterprise", promptsUsed: 1247, joinedDate: daysAgo(200), lastActive: daysAgo(1), status: "Active", tokensUsed: 890000, avgSession: "32m 15s", credits: 5000 },
  { id: 3, name: "Mike Chen", email: "mike.chen@startup.io", avatar: "MC", plan: "Pro", promptsUsed: 89, joinedDate: daysAgo(30), lastActive: daysAgo(2), status: "Active", tokensUsed: 45000, avgSession: "12m 08s", credits: 420 },
  { id: 4, name: "Emily Davis", email: "emily.d@freelance.com", avatar: "ED", plan: "Free", promptsUsed: 48, joinedDate: daysAgo(15), lastActive: daysAgo(0), status: "Active", tokensUsed: 12000, avgSession: "8m 42s", credits: 25 },
  { id: 5, name: "Alex Thompson", email: "alex.t@agency.co", avatar: "AT", plan: "Pro", promptsUsed: 567, joinedDate: daysAgo(180), lastActive: daysAgo(3), status: "Active", tokensUsed: 234000, avgSession: "22m 30s", credits: 320 },
  { id: 6, name: "Lisa Wang", email: "lisa.wang@tech.com", avatar: "LW", plan: "Enterprise", promptsUsed: 2341, joinedDate: daysAgo(300), lastActive: daysAgo(0), status: "Active", tokensUsed: 1500000, avgSession: "45m 12s", credits: 10000 },
  { id: 7, name: "David Brown", email: "david.b@consulting.com", avatar: "DB", plan: "Pro", promptsUsed: 234, joinedDate: daysAgo(90), lastActive: daysAgo(5), status: "Suspended", tokensUsed: 98000, avgSession: "15m 30s", credits: 0 },
  { id: 8, name: "Jennifer Lee", email: "jen.lee@marketing.io", avatar: "JL", plan: "Free", promptsUsed: 23, joinedDate: daysAgo(7), lastActive: daysAgo(1), status: "Active", tokensUsed: 8500, avgSession: "6m 15s", credits: 50 },
  { id: 9, name: "Robert Wilson", email: "rob.wilson@enterprise.com", avatar: "RW", plan: "Enterprise", promptsUsed: 1893, joinedDate: daysAgo(250), lastActive: daysAgo(0), status: "Active", tokensUsed: 1200000, avgSession: "38m 45s", credits: 7500 },
  { id: 10, name: "Amanda Martinez", email: "amanda.m@creative.co", avatar: "AM", plan: "Pro", promptsUsed: 456, joinedDate: daysAgo(100), lastActive: daysAgo(2), status: "Active", tokensUsed: 189000, avgSession: "20m 18s", credits: 650 },
  { id: 11, name: "Chris Taylor", email: "chris.t@dev.io", avatar: "CT", plan: "Free", promptsUsed: 50, joinedDate: daysAgo(10), lastActive: daysAgo(0), status: "Active", tokensUsed: 15000, avgSession: "9m 30s", credits: 30 },
  { id: 12, name: "Michelle Garcia", email: "michelle.g@design.com", avatar: "MG", plan: "Pro", promptsUsed: 678, joinedDate: daysAgo(150), lastActive: daysAgo(1), status: "Active", tokensUsed: 278000, avgSession: "25m 42s", credits: 780 },
  { id: 13, name: "Kevin Anderson", email: "kevin.a@startup.io", avatar: "KA", plan: "Pro", promptsUsed: 289, joinedDate: daysAgo(60), lastActive: daysAgo(4), status: "Active", tokensUsed: 120000, avgSession: "16m 20s", credits: 550 },
  { id: 14, name: "Rachel White", email: "rachel.w@content.co", avatar: "RW", plan: "Free", promptsUsed: 35, joinedDate: daysAgo(5), lastActive: daysAgo(0), status: "Active", tokensUsed: 9800, avgSession: "7m 15s", credits: 45 },
  { id: 15, name: "James Miller", email: "james.m@sales.com", avatar: "JM", plan: "Pro", promptsUsed: 412, joinedDate: daysAgo(130), lastActive: daysAgo(1), status: "Active", tokensUsed: 167000, avgSession: "19m 55s", credits: 390 },
  { id: 16, name: "Sophia Clark", email: "sophia.c@edu.org", avatar: "SC", plan: "Enterprise", promptsUsed: 1567, joinedDate: daysAgo(280), lastActive: daysAgo(0), status: "Active", tokensUsed: 980000, avgSession: "42m 30s", credits: 8500 },
  { id: 17, name: "Daniel Harris", email: "daniel.h@finance.io", avatar: "DH", plan: "Pro", promptsUsed: 523, joinedDate: daysAgo(110), lastActive: daysAgo(2), status: "Active", tokensUsed: 215000, avgSession: "21m 08s", credits: 480 },
  { id: 18, name: "Olivia Moore", email: "olivia.m@hr.com", avatar: "OM", plan: "Free", promptsUsed: 42, joinedDate: daysAgo(8), lastActive: daysAgo(1), status: "Active", tokensUsed: 11000, avgSession: "8m 10s", credits: 35 },
  { id: 19, name: "William Jackson", email: "will.j@legal.co", avatar: "WJ", plan: "Pro", promptsUsed: 367, joinedDate: daysAgo(95), lastActive: daysAgo(0), status: "Active", tokensUsed: 152000, avgSession: "18m 40s", credits: 620 },
  { id: 20, name: "Emma Thomas", email: "emma.t@media.com", avatar: "ET", plan: "Enterprise", promptsUsed: 2089, joinedDate: daysAgo(320), lastActive: daysAgo(0), status: "Active", tokensUsed: 1350000, avgSession: "40m 22s", credits: 9200 },
  { id: 21, name: "Noah Robinson", email: "noah.r@tech.io", avatar: "NR", plan: "Free", promptsUsed: 28, joinedDate: daysAgo(3), lastActive: daysAgo(0), status: "Active", tokensUsed: 7200, avgSession: "5m 45s", credits: 60 },
  { id: 22, name: "Ava Lewis", email: "ava.l@writer.com", avatar: "AL", plan: "Pro", promptsUsed: 789, joinedDate: daysAgo(170), lastActive: daysAgo(1), status: "Active", tokensUsed: 312000, avgSession: "28m 15s", credits: 210 },
  { id: 23, name: "Liam Walker", email: "liam.w@developer.io", avatar: "LW", plan: "Pro", promptsUsed: 445, joinedDate: daysAgo(85), lastActive: daysAgo(3), status: "Banned", tokensUsed: 178000, avgSession: "17m 30s", credits: 0 },
  { id: 24, name: "Mia Hall", email: "mia.h@research.org", avatar: "MH", plan: "Enterprise", promptsUsed: 1234, joinedDate: daysAgo(220), lastActive: daysAgo(0), status: "Active", tokensUsed: 750000, avgSession: "35m 48s", credits: 6800 },
  { id: 25, name: "Ethan Young", email: "ethan.y@product.co", avatar: "EY", plan: "Free", promptsUsed: 45, joinedDate: daysAgo(12), lastActive: daysAgo(2), status: "Active", tokensUsed: 13500, avgSession: "9m 05s", credits: 40 },
  { id: 26, name: "Isabella King", email: "bella.k@brand.com", avatar: "IK", plan: "Pro", promptsUsed: 534, joinedDate: daysAgo(140), lastActive: daysAgo(0), status: "Active", tokensUsed: 220000, avgSession: "23m 12s", credits: 470 },
  { id: 27, name: "Mason Wright", email: "mason.w@data.io", avatar: "MW", plan: "Pro", promptsUsed: 623, joinedDate: daysAgo(160), lastActive: daysAgo(1), status: "Active", tokensUsed: 256000, avgSession: "24m 40s", credits: 380 },
  { id: 28, name: "Charlotte Scott", email: "char.s@events.com", avatar: "CS", plan: "Free", promptsUsed: 38, joinedDate: daysAgo(6), lastActive: daysAgo(0), status: "Active", tokensUsed: 10200, avgSession: "7m 50s", credits: 55 },
  { id: 29, name: "Lucas Green", email: "lucas.g@ops.co", avatar: "LG", plan: "Pro", promptsUsed: 398, joinedDate: daysAgo(105), lastActive: daysAgo(2), status: "Active", tokensUsed: 163000, avgSession: "19m 18s", credits: 590 },
  { id: 30, name: "Harper Adams", email: "harper.a@support.io", avatar: "HA", plan: "Enterprise", promptsUsed: 1678, joinedDate: daysAgo(290), lastActive: daysAgo(0), status: "Active", tokensUsed: 1080000, avgSession: "39m 05s", credits: 7200 },
];

// MOCK DATA - Generated Prompts (20 prompts)
export const mockPrompts = [
  { id: 1, userEmail: "john.smith@email.com", category: "Coding", model: "GPT-4o", inputTokens: 245, outputTokens: 892, createdAt: daysAgo(0), rating: 5, status: "Completed", input: "Write a Python function to validate email addresses using regex", output: "Here's a comprehensive Python function for email validation..." },
  { id: 2, userEmail: "sarah.j@company.com", category: "Marketing", model: "Claude 3.5 Sonnet", inputTokens: 189, outputTokens: 1456, createdAt: daysAgo(0), rating: 4, status: "Completed", input: "Create a marketing campaign for a new SaaS product launch", output: "# SaaS Product Launch Campaign Strategy..." },
  { id: 3, userEmail: "mike.chen@startup.io", category: "Creative Writing", model: "GPT-4o", inputTokens: 156, outputTokens: 2341, createdAt: daysAgo(1), rating: 5, status: "Completed", input: "Write a short story about AI in 2050", output: "The year was 2050, and the world had transformed..." },
  { id: 4, userEmail: "emily.d@freelance.com", category: "Business", model: "GPT-3.5 Turbo", inputTokens: 312, outputTokens: 1023, createdAt: daysAgo(1), rating: 4, status: "Completed", input: "Draft a business proposal for consulting services", output: "## Professional Consulting Services Proposal..." },
  { id: 5, userEmail: "alex.t@agency.co", category: "Coding", model: "Claude 3.5 Sonnet", inputTokens: 523, outputTokens: 2156, createdAt: daysAgo(1), rating: 5, status: "Completed", input: "Create a React component for infinite scroll", output: "import React, { useState, useEffect, useRef } from 'react'..." },
  { id: 6, userEmail: "lisa.wang@tech.com", category: "Research", model: "GPT-4o", inputTokens: 678, outputTokens: 3421, createdAt: daysAgo(2), rating: 5, status: "Completed", input: "Analyze the impact of quantum computing on cryptography", output: "# Quantum Computing and Cryptography: A Comprehensive Analysis..." },
  { id: 7, userEmail: "david.b@consulting.com", category: "Marketing", model: "GPT-3.5 Turbo", inputTokens: 234, outputTokens: 987, createdAt: daysAgo(2), rating: 3, status: "Flagged", input: "Write social media posts for product promotion", output: "Here are engaging social media posts..." },
  { id: 8, userEmail: "jen.lee@marketing.io", category: "Creative Writing", model: "Claude 3 Haiku", inputTokens: 145, outputTokens: 1567, createdAt: daysAgo(2), rating: 4, status: "Completed", input: "Create a tagline for an eco-friendly brand", output: "Here are several eco-friendly brand taglines..." },
  { id: 9, userEmail: "rob.wilson@enterprise.com", category: "Business", model: "GPT-4o", inputTokens: 456, outputTokens: 2345, createdAt: daysAgo(3), rating: 5, status: "Completed", input: "Generate a comprehensive SWOT analysis template", output: "## SWOT Analysis Framework..." },
  { id: 10, userEmail: "amanda.m@creative.co", category: "Coding", model: "Claude 3.5 Sonnet", inputTokens: 387, outputTokens: 1876, createdAt: daysAgo(3), rating: 4, status: "Completed", input: "Write a TypeScript utility for deep object comparison", output: "export function deepEqual<T>(obj1: T, obj2: T): boolean..." },
  { id: 11, userEmail: "chris.t@dev.io", category: "Coding", model: "GPT-3.5 Turbo", inputTokens: 198, outputTokens: 1234, createdAt: daysAgo(3), rating: 4, status: "Completed", input: "Create a SQL query for user analytics", output: "SELECT user_id, COUNT(*) as total_sessions..." },
  { id: 12, userEmail: "michelle.g@design.com", category: "Creative Writing", model: "GPT-4o", inputTokens: 267, outputTokens: 1923, createdAt: daysAgo(4), rating: 5, status: "Completed", input: "Write product descriptions for minimalist furniture", output: "# Minimalist Furniture Collection..." },
  { id: 13, userEmail: "kevin.a@startup.io", category: "Business", model: "Claude 3.5 Sonnet", inputTokens: 412, outputTokens: 2567, createdAt: daysAgo(4), rating: 4, status: "Completed", input: "Create an investor pitch deck outline", output: "## Investor Pitch Deck Structure..." },
  { id: 14, userEmail: "rachel.w@content.co", category: "Marketing", model: "GPT-3.5 Turbo", inputTokens: 178, outputTokens: 1345, createdAt: daysAgo(4), rating: 4, status: "Completed", input: "Generate email newsletter content ideas", output: "Here are 10 engaging newsletter content ideas..." },
  { id: 15, userEmail: "james.m@sales.com", category: "Business", model: "GPT-4o", inputTokens: 534, outputTokens: 2134, createdAt: daysAgo(5), rating: 5, status: "Completed", input: "Write cold outreach email templates", output: "# Cold Outreach Email Templates..." },
  { id: 16, userEmail: "sophia.c@edu.org", category: "Research", model: "Claude 3.5 Sonnet", inputTokens: 623, outputTokens: 4123, createdAt: daysAgo(5), rating: 5, status: "Completed", input: "Summarize recent advances in neural networks", output: "## Neural Network Advances: 2024-2025..." },
  { id: 17, userEmail: "daniel.h@finance.io", category: "Coding", model: "GPT-4o", inputTokens: 445, outputTokens: 2345, createdAt: daysAgo(5), rating: 4, status: "Completed", input: "Create a Python script for financial data analysis", output: "import pandas as pd\nimport numpy as np..." },
  { id: 18, userEmail: "olivia.m@hr.com", category: "Business", model: "GPT-3.5 Turbo", inputTokens: 287, outputTokens: 1678, createdAt: daysAgo(6), rating: 4, status: "Completed", input: "Draft interview questions for product managers", output: "# Product Manager Interview Questions..." },
  { id: 19, userEmail: "will.j@legal.co", category: "Business", model: "Claude 3.5 Sonnet", inputTokens: 567, outputTokens: 3456, createdAt: daysAgo(6), rating: 5, status: "Completed", input: "Create a privacy policy template", output: "# Privacy Policy Template..." },
  { id: 20, userEmail: "emma.t@media.com", category: "Creative Writing", model: "GPT-4o", inputTokens: 234, outputTokens: 2567, createdAt: daysAgo(6), rating: 5, status: "Completed", input: "Write a script for a 60-second video ad", output: "# 60-Second Video Ad Script..." },
];

// MOCK DATA - System Templates (8 templates)
export const mockTemplates = [
  { id: 1, name: "Code Review Assistant", category: "Coding", description: "Analyzes code for bugs, security issues, and best practices", timesUsed: 12453, lastEdited: daysAgo(5), variables: ["code", "language", "focus_areas"], template: "Review the following {language} code for {focus_areas}:\n\n{code}" },
  { id: 2, name: "Marketing Copy Generator", category: "Marketing", description: "Creates compelling marketing copy for products and services", timesUsed: 8934, lastEdited: daysAgo(10), variables: ["product", "audience", "tone"], template: "Write marketing copy for {product} targeting {audience} with a {tone} tone." },
  { id: 3, name: "Blog Post Outline", category: "Creative Writing", description: "Generates structured outlines for blog posts", timesUsed: 7623, lastEdited: daysAgo(3), variables: ["topic", "word_count", "keywords"], template: "Create a detailed blog post outline about {topic}, targeting {word_count} words, incorporating these keywords: {keywords}" },
  { id: 4, name: "Business Proposal", category: "Business", description: "Drafts professional business proposals", timesUsed: 5432, lastEdited: daysAgo(15), variables: ["service", "client", "timeline", "budget"], template: "Draft a business proposal for {service} for {client}, with {timeline} timeline and {budget} budget." },
  { id: 5, name: "API Documentation", category: "Coding", description: "Generates comprehensive API documentation", timesUsed: 4567, lastEdited: daysAgo(8), variables: ["endpoint", "method", "parameters"], template: "Generate API documentation for {method} {endpoint} with parameters: {parameters}" },
  { id: 6, name: "Email Sequence", category: "Marketing", description: "Creates automated email marketing sequences", timesUsed: 6234, lastEdited: daysAgo(12), variables: ["product", "sequence_length", "goal"], template: "Create a {sequence_length}-email sequence for {product} with the goal of {goal}." },
  { id: 7, name: "Research Summary", category: "Research", description: "Summarizes complex research papers and studies", timesUsed: 3456, lastEdited: daysAgo(7), variables: ["topic", "detail_level", "audience"], template: "Summarize research on {topic} at {detail_level} detail for {audience}." },
  { id: 8, name: "Product Description", category: "Marketing", description: "Writes engaging product descriptions for e-commerce", timesUsed: 9876, lastEdited: daysAgo(2), variables: ["product", "features", "benefits"], template: "Write a product description for {product} highlighting {features} and {benefits}." },
];

// MOCK DATA - Revenue data (12 months)
export const mockRevenueData = [
  { month: "Apr 2025", mrr: 32400, target: 30000, newMrr: 4200, churnedMrr: 800, subscriptions: 2180 },
  { month: "May 2025", mrr: 34800, target: 33000, newMrr: 3800, churnedMrr: 1400, subscriptions: 2340 },
  { month: "Jun 2025", mrr: 36200, target: 35000, newMrr: 3200, churnedMrr: 1800, subscriptions: 2450 },
  { month: "Jul 2025", mrr: 38100, target: 37000, newMrr: 4500, churnedMrr: 2600, subscriptions: 2580 },
  { month: "Aug 2025", mrr: 39800, target: 39000, newMrr: 3400, churnedMrr: 1700, subscriptions: 2690 },
  { month: "Sep 2025", mrr: 41500, target: 41000, newMrr: 4100, churnedMrr: 2400, subscriptions: 2810 },
  { month: "Oct 2025", mrr: 42900, target: 43000, newMrr: 3200, churnedMrr: 1800, subscriptions: 2920 },
  { month: "Nov 2025", mrr: 44200, target: 44000, newMrr: 3800, churnedMrr: 2500, subscriptions: 3010 },
  { month: "Dec 2025", mrr: 45100, target: 45000, newMrr: 2900, churnedMrr: 2000, subscriptions: 3050 },
  { month: "Jan 2026", mrr: 46300, target: 46000, newMrr: 3500, churnedMrr: 2300, subscriptions: 3120 },
  { month: "Feb 2026", mrr: 47500, target: 47000, newMrr: 3800, churnedMrr: 2600, subscriptions: 3180 },
  { month: "Mar 2026", mrr: 48290, target: 48000, newMrr: 3200, churnedMrr: 2410, subscriptions: 3241 },
];

// MOCK DATA - Support Tickets (15 tickets)
export const mockTickets = [
  { id: 1, subject: "Cannot generate prompts - API error", user: "john.smith@email.com", priority: "Critical", status: "Open", created: daysAgo(0), assignee: "Support Team", messages: [
    { sender: "user", text: "I'm getting an API error every time I try to generate a prompt. Error code: 500.", timestamp: daysAgo(0) },
    { sender: "admin", text: "Hi John, sorry for the inconvenience. Can you please share which model you're using?", timestamp: daysAgo(0) },
    { sender: "user", text: "I'm using GPT-4o. It was working fine yesterday.", timestamp: daysAgo(0) },
  ]},
  { id: 2, subject: "Billing issue - double charged", user: "sarah.j@company.com", priority: "High", status: "In Progress", created: daysAgo(1), assignee: "Billing Team", messages: [
    { sender: "user", text: "I was charged twice for my Pro subscription this month.", timestamp: daysAgo(1) },
    { sender: "admin", text: "We're investigating this issue. We'll process a refund within 3-5 business days.", timestamp: daysAgo(1) },
  ]},
  { id: 3, subject: "Feature request - export to PDF", user: "mike.chen@startup.io", priority: "Low", status: "Open", created: daysAgo(2), assignee: null, messages: [
    { sender: "user", text: "Would love to be able to export my prompt history to PDF format.", timestamp: daysAgo(2) },
  ]},
  { id: 4, subject: "Account access issues", user: "emily.d@freelance.com", priority: "High", status: "Resolved", created: daysAgo(3), assignee: "Support Team", messages: [
    { sender: "user", text: "Can't log into my account after password reset.", timestamp: daysAgo(3) },
    { sender: "admin", text: "Password reset link has been resent. Please check your spam folder.", timestamp: daysAgo(3) },
    { sender: "user", text: "Found it, thanks! Working now.", timestamp: daysAgo(2) },
  ]},
  { id: 5, subject: "Slow response times", user: "alex.t@agency.co", priority: "Medium", status: "In Progress", created: daysAgo(2), assignee: "Tech Team", messages: [
    { sender: "user", text: "Prompts are taking 30+ seconds to generate. Is this normal?", timestamp: daysAgo(2) },
    { sender: "admin", text: "We're experiencing higher than normal load. Our team is working on scaling.", timestamp: daysAgo(2) },
  ]},
  { id: 6, subject: "Enterprise plan questions", user: "lisa.wang@tech.com", priority: "Medium", status: "Open", created: daysAgo(1), assignee: "Sales Team", messages: [
    { sender: "user", text: "Interested in Enterprise plan for our team of 50. Need custom pricing.", timestamp: daysAgo(1) },
  ]},
  { id: 7, subject: "Template not working correctly", user: "david.b@consulting.com", priority: "Medium", status: "Closed", created: daysAgo(5), assignee: "Support Team", messages: [
    { sender: "user", text: "The Code Review template gives generic responses.", timestamp: daysAgo(5) },
    { sender: "admin", text: "This has been fixed in our latest update. Please try again.", timestamp: daysAgo(4) },
    { sender: "user", text: "Works perfectly now!", timestamp: daysAgo(4) },
  ]},
  { id: 8, subject: "Request for API access", user: "rob.wilson@enterprise.com", priority: "Low", status: "Open", created: daysAgo(0), assignee: null, messages: [
    { sender: "user", text: "Our Enterprise plan should include API access. How do I get my keys?", timestamp: daysAgo(0) },
  ]},
  { id: 9, subject: "Mobile app crashing", user: "amanda.m@creative.co", priority: "High", status: "In Progress", created: daysAgo(1), assignee: "Mobile Team", messages: [
    { sender: "user", text: "iOS app crashes when I try to view history.", timestamp: daysAgo(1) },
    { sender: "admin", text: "We've identified the issue. A fix will be in the next app update.", timestamp: daysAgo(0) },
  ]},
  { id: 10, subject: "Refund request", user: "chris.t@dev.io", priority: "Medium", status: "Resolved", created: daysAgo(4), assignee: "Billing Team", messages: [
    { sender: "user", text: "I accidentally upgraded to Pro. Can I get a refund?", timestamp: daysAgo(4) },
    { sender: "admin", text: "Refund processed. It will appear in 3-5 business days.", timestamp: daysAgo(3) },
  ]},
  { id: 11, subject: "Cannot upload files", user: "michelle.g@design.com", priority: "High", status: "Open", created: daysAgo(0), assignee: "Tech Team", messages: [
    { sender: "user", text: "File upload feature shows error for all file types.", timestamp: daysAgo(0) },
  ]},
  { id: 12, subject: "Prompt quality concerns", user: "kevin.a@startup.io", priority: "Low", status: "Closed", created: daysAgo(7), assignee: "Product Team", messages: [
    { sender: "user", text: "GPT-3.5 responses are too generic compared to before.", timestamp: daysAgo(7) },
    { sender: "admin", text: "We've adjusted our prompt engineering. Please try again.", timestamp: daysAgo(6) },
  ]},
  { id: 13, subject: "Team seats not showing", user: "sophia.c@edu.org", priority: "Critical", status: "In Progress", created: daysAgo(0), assignee: "Support Team", messages: [
    { sender: "user", text: "I added 5 team members but they can't access the account.", timestamp: daysAgo(0) },
    { sender: "admin", text: "Looking into this urgently.", timestamp: daysAgo(0) },
  ]},
  { id: 14, subject: "Usage data not accurate", user: "daniel.h@finance.io", priority: "Medium", status: "Open", created: daysAgo(2), assignee: null, messages: [
    { sender: "user", text: "Dashboard shows 200 prompts but I've only used about 50.", timestamp: daysAgo(2) },
  ]},
  { id: 15, subject: "Downgrade plan request", user: "olivia.m@hr.com", priority: "Low", status: "Resolved", created: daysAgo(6), assignee: "Billing Team", messages: [
    { sender: "user", text: "How do I downgrade from Pro to Free?", timestamp: daysAgo(6) },
    { sender: "admin", text: "You can downgrade in Settings > Billing. Your Pro features will remain until the end of the billing cycle.", timestamp: daysAgo(5) },
  ]},
];

// MOCK DATA - Audit Logs (25 entries)
export const mockAuditLogs = [
  { id: 1, timestamp: daysAgo(0), user: "admin@askjai.com", action: "login", description: "Admin logged in to dashboard", ip: "192.168.1.1", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0", location: "New York, US", requestId: "req_abc123", metadata: { browser: "Chrome 120", os: "Windows 11" }},
  { id: 2, timestamp: daysAgo(0), user: "admin@askjai.com", action: "user_updated", description: "Suspended user david.b@consulting.com for policy violation", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_def456", metadata: { targetUser: "david.b@consulting.com", reason: "Policy violation" }},
  { id: 3, timestamp: daysAgo(0), user: "admin@askjai.com", action: "settings_updated", description: "Enabled feature flag: New Editor UI", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_ghi789", metadata: { flag: "new_editor_ui", previousValue: false, newValue: true }},
  { id: 4, timestamp: daysAgo(0), user: "john.smith@email.com", action: "subscription_changed", description: "Upgraded plan from Free to Pro", ip: "73.45.123.89", userAgent: "Mozilla/5.0 Safari/605.1.15", location: "Los Angeles, US", requestId: "req_jkl012", metadata: { from: "Free", to: "Pro", amount: "$19.99" }},
  { id: 5, timestamp: daysAgo(0), user: "unknown@hacker.com", action: "login", description: "Failed login attempt - account blocked after 5 attempts", ip: "182.34.56.78", userAgent: "curl/7.79.1", location: "Unknown", requestId: "req_mno345", status: "failed", metadata: { attempts: 5, blocked: true }},
  { id: 6, timestamp: daysAgo(1), user: "admin@askjai.com", action: "admin_action", description: "Deleted template: Code Review v1", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_pqr678", metadata: { templateId: 15 }},
  { id: 7, timestamp: daysAgo(1), user: "sarah.j@company.com", action: "settings_updated", description: "Changed account password", ip: "45.67.89.12", userAgent: "Mozilla/5.0 Firefox/121.0", location: "Chicago, US", requestId: "req_stu901", metadata: {}},
  { id: 8, timestamp: daysAgo(1), user: "admin@askjai.com", action: "admin_action", description: "Created coupon code SAVE20 (20% off, max 100 uses)", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_vwx234", metadata: { coupon: "SAVE20", discount: "20%", maxUses: 100 }},
  { id: 9, timestamp: daysAgo(1), user: "mike.chen@startup.io", action: "user_created", description: "New user registered (Free plan, organic source)", ip: "98.76.54.32", userAgent: "Mozilla/5.0 Safari/605.1.15", location: "San Francisco, US", requestId: "req_yza567", metadata: { plan: "Free", source: "organic" }},
  { id: 10, timestamp: daysAgo(2), user: "admin@askjai.com", action: "api_key_rotated", description: "Rotated API key for OpenAI integration", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_bcd890", metadata: { provider: "OpenAI" }},
  { id: 11, timestamp: daysAgo(2), user: "System", action: "admin_action", description: "Scheduled backup completed successfully (2.4GB, 12m)", ip: null, userAgent: null, location: "AWS us-east-1", requestId: "req_efg123", metadata: { size: "2.4GB", duration: "12m" }},
  { id: 12, timestamp: daysAgo(2), user: "emily.d@freelance.com", action: "prompt_generated", description: "Flagged prompt #2341 for inappropriate content", ip: "67.89.12.34", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "Austin, US", requestId: "req_hij456", metadata: { promptId: 2341, reason: "Inappropriate content" }},
  { id: 13, timestamp: daysAgo(3), user: "admin@askjai.com", action: "user_deleted", description: "Permanently banned user liam.w@developer.io for terms violation", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_klm789", metadata: { targetUser: "liam.w@developer.io", reason: "Terms violation", permanent: true }},
  { id: 14, timestamp: daysAgo(3), user: "alex.t@agency.co", action: "settings_updated", description: "Enabled two-factor authentication", ip: "23.45.67.89", userAgent: "Mozilla/5.0 Firefox/121.0", location: "Seattle, US", requestId: "req_nop012", metadata: { twoFactorEnabled: true }},
  { id: 15, timestamp: daysAgo(3), user: "admin@askjai.com", action: "admin_action", description: "Updated rate limit for Free tier (50 → 30 requests/day)", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_qrs345", metadata: { from: 50, to: 30, unit: "requests/day" }},
  { id: 16, timestamp: daysAgo(4), user: "lisa.wang@tech.com", action: "subscription_changed", description: "Upgraded from Pro to Enterprise ($99.99)", ip: "89.12.34.56", userAgent: "Mozilla/5.0 Safari/605.1.15", location: "Boston, US", requestId: "req_tuv678", metadata: { from: "Pro", to: "Enterprise", amount: "$99.99" }},
  { id: 17, timestamp: daysAgo(4), user: "System", action: "admin_action", description: "High CPU alert on API Server 2 (95% for 5m)", ip: null, userAgent: null, location: "AWS us-east-1", requestId: "req_wxy901", metadata: { cpu: "95%", duration: "5m", server: "API Server 2" }},
  { id: 18, timestamp: daysAgo(4), user: "admin@askjai.com", action: "user_created", description: "Invited new admin: newadmin@askjai.com (Moderator role)", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_zab234", metadata: { email: "newadmin@askjai.com", role: "Moderator" }},
  { id: 19, timestamp: daysAgo(5), user: "rob.wilson@enterprise.com", action: "admin_action", description: "Exported prompt history (1893 records as CSV)", ip: "34.56.78.90", userAgent: "Mozilla/5.0 Edge/120.0.0.0", location: "Denver, US", requestId: "req_cde567", metadata: { format: "CSV", records: 1893 }},
  { id: 20, timestamp: daysAgo(5), user: "System", action: "payment_failed", description: "Payment failed for amanda.m@creative.co - Card declined ($19.99)", ip: null, userAgent: null, location: null, requestId: "req_fgh890", metadata: { user: "amanda.m@creative.co", reason: "Card declined", amount: "$19.99" }},
  { id: 21, timestamp: daysAgo(5), user: "admin@askjai.com", action: "admin_action", description: "Created new template: Research Summary (Research category)", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_ijk123", metadata: { template: "Research Summary", category: "Research" }},
  { id: 22, timestamp: daysAgo(6), user: "System", action: "settings_updated", description: "SSL certificate renewed for *.AskJai.com (valid until 2027-03-04)", ip: null, userAgent: null, location: "Cloudflare", requestId: "req_lmn456", metadata: { domain: "*.AskJai.com", validUntil: "2027-03-04" }},
  { id: 23, timestamp: daysAgo(6), user: "chris.t@dev.io", action: "user_updated", description: "Requested account deletion (pending review)", ip: "56.78.90.12", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "Miami, US", requestId: "req_opq789", metadata: { status: "pending" }},
  { id: 24, timestamp: daysAgo(7), user: "admin@askjai.com", action: "settings_updated", description: "Enabled maintenance mode (2h for database upgrade)", ip: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120.0.0.0", location: "New York, US", requestId: "req_rst012", metadata: { duration: "2h", reason: "Database upgrade" }},
  { id: 25, timestamp: daysAgo(7), user: "System", action: "admin_action", description: "DDoS attack mitigated on API Gateway (50K req/s blocked)", ip: null, userAgent: null, location: "Cloudflare", requestId: "req_uvw345", metadata: { requests: "50K/s", blocked: true }},
];

// MOCK DATA - Sent Notifications (10 notifications)
export const mockNotifications = [
  { id: 1, title: "New Feature: AI Model Comparison", message: "We're excited to announce our new AI Model Comparison feature! Now you can compare outputs from multiple AI models side-by-side to find the best results for your prompts.", audience: "all", channels: ["email", "in-app"], status: "Sent", sentAt: daysAgo(1), recipients: 12480, openRate: 42.3 },
  { id: 2, title: "Scheduled Maintenance Notice", message: "Our platform will undergo scheduled maintenance on March 15th from 2:00 AM to 4:00 AM UTC. During this time, some features may be temporarily unavailable.", audience: "all", channels: ["email"], status: "Sent", sentAt: daysAgo(3), recipients: 12480, openRate: 38.7 },
  { id: 3, title: "Pro Plan: 20% Off This Week", message: "Upgrade to Pro and save 20% this week only! Get unlimited prompts, priority support, and access to all premium templates.", audience: "free", channels: ["email"], status: "Sent", sentAt: daysAgo(5), recipients: 5616, openRate: 28.5 },
  { id: 4, title: "Enterprise Features Update", message: "New enterprise features are now available including SSO integration, advanced analytics dashboard, and dedicated support channels.", audience: "enterprise", channels: ["in-app"], status: "Sent", sentAt: daysAgo(7), recipients: 2496, openRate: 65.2 },
  { id: 5, title: "Tips: Getting More from AI", message: "Discover how to write better prompts and get more accurate results from our AI models with these expert tips.", audience: "pro", channels: ["email", "in-app"], status: "Sent", sentAt: daysAgo(10), recipients: 4368, openRate: 45.8 },
  { id: 6, title: "Weekly Product Update", message: "Check out what's new this week: improved code generation, faster response times, and 5 new templates.", audience: "all", channels: ["email"], status: "Scheduled", scheduledFor: daysAgo(-2), recipients: 0, openRate: 0 },
  { id: 7, title: "New Templates Available", message: "We've added 10 new templates including Marketing Campaign Generator, API Documentation Writer, and more.", audience: "pro", channels: ["in-app"], status: "Sent", sentAt: daysAgo(18), recipients: 4200, openRate: 52.4 },
  { id: 8, title: "Security Update Required", message: "Important: Please update your password and enable two-factor authentication to keep your account secure.", audience: "all", channels: ["email", "in-app", "push"], status: "Sent", sentAt: daysAgo(21), recipients: 11500, openRate: 48.9 },
  { id: 9, title: "Feedback Survey", message: "Help us improve! Take our 2-minute survey and get 50 bonus credits for your account.", audience: "enterprise", channels: ["email"], status: "Draft", sentAt: null, recipients: 0, openRate: 0 },
  { id: 10, title: "Welcome to AskJai!", message: "Thanks for joining AskJai! Get started with our quick tutorial and create your first AI-powered prompt.", audience: "all", channels: ["email"], status: "Sent", sentAt: daysAgo(30), recipients: 890, openRate: 72.1 },
];

// MOCK DATA - Billing Transactions (20 records)
export const mockTransactions = [
  { id: 1, user: "john.smith@email.com", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(120), nextBilling: "Apr 4, 2026" },
  { id: 2, user: "sarah.j@company.com", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(200), nextBilling: "Apr 10, 2026" },
  { id: 3, user: "mike.chen@startup.io", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(30), nextBilling: "Apr 3, 2026" },
  { id: 4, user: "alex.t@agency.co", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(180), nextBilling: "Apr 1, 2026" },
  { id: 5, user: "lisa.wang@tech.com", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(300), nextBilling: "Mar 28, 2026" },
  { id: 6, user: "david.b@consulting.com", plan: "Pro", amount: 19.99, status: "Cancelled", started: daysAgo(90), nextBilling: "-" },
  { id: 7, user: "rob.wilson@enterprise.com", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(250), nextBilling: "Apr 5, 2026" },
  { id: 8, user: "amanda.m@creative.co", plan: "Pro", amount: 19.99, status: "Past Due", started: daysAgo(100), nextBilling: "Overdue" },
  { id: 9, user: "michelle.g@design.com", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(150), nextBilling: "Apr 8, 2026" },
  { id: 10, user: "kevin.a@startup.io", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(60), nextBilling: "Apr 2, 2026" },
  { id: 11, user: "james.m@sales.com", plan: "Pro", amount: 19.99, status: "Trialing", started: daysAgo(7), nextBilling: "Mar 11, 2026" },
  { id: 12, user: "sophia.c@edu.org", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(280), nextBilling: "Apr 15, 2026" },
  { id: 13, user: "daniel.h@finance.io", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(110), nextBilling: "Apr 6, 2026" },
  { id: 14, user: "will.j@legal.co", plan: "Pro", amount: 19.99, status: "Cancelled", started: daysAgo(95), nextBilling: "-" },
  { id: 15, user: "emma.t@media.com", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(320), nextBilling: "Mar 25, 2026" },
  { id: 16, user: "ava.l@writer.com", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(170), nextBilling: "Apr 12, 2026" },
  { id: 17, user: "mia.h@research.org", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(220), nextBilling: "Apr 18, 2026" },
  { id: 18, user: "isabella.k@brand.com", plan: "Pro", amount: 19.99, status: "Active", started: daysAgo(140), nextBilling: "Apr 9, 2026" },
  { id: 19, user: "mason.w@data.io", plan: "Pro", amount: 19.99, status: "Past Due", started: daysAgo(160), nextBilling: "Overdue" },
  { id: 20, user: "harper.a@support.io", plan: "Enterprise", amount: 99.99, status: "Active", started: daysAgo(290), nextBilling: "Mar 30, 2026" },
];

// MOCK DATA - Cohort Retention Data (6 months)
export const mockCohortData = [
  { cohort: "Oct 2025", users: 1850, day1: 82, day7: 65, day14: 52, day30: 41, revenuePerUser: 8.45 },
  { cohort: "Nov 2025", users: 2100, day1: 85, day7: 68, day14: 55, day30: 44, revenuePerUser: 9.12 },
  { cohort: "Dec 2025", users: 1920, day1: 80, day7: 62, day14: 48, day30: 38, revenuePerUser: 7.89 },
  { cohort: "Jan 2026", users: 2340, day1: 88, day7: 72, day14: 58, day30: 46, revenuePerUser: 10.23 },
  { cohort: "Feb 2026", users: 2560, day1: 86, day7: 70, day14: 56, day30: 45, revenuePerUser: 9.87 },
  { cohort: "Mar 2026", users: 1710, day1: 84, day7: 67, day14: 54, day30: 43, revenuePerUser: 9.34 },
];

// MOCK DATA - Chart Data (time-series for all charts)
export const mockChartData = {
  // Daily prompts for 30 days
  promptsDaily: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    prompts: Math.floor(2000 + Math.random() * 1500 + i * 50),
  })),
  
  // Weekly signups for 8 weeks
  signupsWeekly: [
    { week: "W1", signups: 280 },
    { week: "W2", signups: 320 },
    { week: "W3", signups: 290 },
    { week: "W4", signups: 340 },
    { week: "W5", signups: 380 },
    { week: "W6", signups: 420 },
    { week: "W7", signups: 390 },
    { week: "W8", signups: 450 },
  ],
  
  // Subscription breakdown
  subscriptionBreakdown: [
    { name: "Free", value: 45, color: "#6B7280" },
    { name: "Pro", value: 35, color: "#6366F1" },
    { name: "Enterprise", value: 20, color: "#10B981" },
  ],
  
  // Top countries
  topCountries: [
    { country: "United States", users: 4200, share: 33.7 },
    { country: "United Kingdom", users: 1890, share: 15.1 },
    { country: "Germany", users: 1340, share: 10.7 },
    { country: "India", users: 1120, share: 9.0 },
    { country: "Canada", users: 890, share: 7.1 },
  ],
  
  // Token consumption daily
  tokenConsumption: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inputTokens: Math.floor(15000000 + Math.random() * 5000000),
    outputTokens: Math.floor(25000000 + Math.random() * 8000000),
  })),
  
  // Conversion rates weekly
  conversionRates: [
    { week: "W1", freeToPro: 4.2, proToEnterprise: 2.1 },
    { week: "W2", freeToPro: 4.5, proToEnterprise: 2.3 },
    { week: "W3", freeToPro: 4.1, proToEnterprise: 1.9 },
    { week: "W4", freeToPro: 4.8, proToEnterprise: 2.5 },
    { week: "W5", freeToPro: 5.2, proToEnterprise: 2.8 },
    { week: "W6", freeToPro: 5.0, proToEnterprise: 2.6 },
    { week: "W7", freeToPro: 5.4, proToEnterprise: 3.0 },
    { week: "W8", freeToPro: 5.6, proToEnterprise: 3.2 },
  ],
  
  // Error rate and latency daily
  errorLatency: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    errorRate: Math.random() * 1.5 + 0.3,
    p95Latency: Math.floor(280 + Math.random() * 120),
  })),
  
  // Prompt categories
  promptCategories: [
    { category: "Coding", percentage: 34 },
    { category: "Marketing", percentage: 22 },
    { category: "Creative Writing", percentage: 18 },
    { category: "Business", percentage: 14 },
    { category: "Research", percentage: 8 },
    { category: "Other", percentage: 4 },
  ],
  
  // Revenue by plan
  revenueByPlan: [
    { plan: "Free", revenue: 0 },
    { plan: "Pro", revenue: 32000 },
    { plan: "Enterprise", revenue: 16290 },
  ],
  
  // Funnel data
  funnelData: [
    { stage: "Visited", value: 50000, conversion: 100 },
    { stage: "Registered", value: 12480, conversion: 25.0 },
    { stage: "First Prompt", value: 9100, conversion: 72.9 },
    { stage: "Upgraded", value: 3241, conversion: 35.6 },
    { stage: "Retained (30d)", value: 2204, conversion: 68.0 },
  ],
};

// MOCK DATA - AI Models (6 models)
export const mockAIModels = [
  { id: 1, name: "GPT-4o", provider: "OpenAI", enabled: true, plans: ["Pro", "Enterprise"], inputCost: 2.50, outputCost: 10.00, tokensUsed: 245000000, estimatedCost: 2850, avgLatency: 1240, isDefault: true, apiKey: "sk-proj-abc123...xyz789", maxTokens: 128000, requestsToday: 4523 },
  { id: 2, name: "GPT-3.5 Turbo", provider: "OpenAI", enabled: true, plans: ["Free", "Pro", "Enterprise"], inputCost: 0.50, outputCost: 1.50, tokensUsed: 412000000, estimatedCost: 824, avgLatency: 380, isDefault: false, apiKey: "sk-proj-def456...uvw321", maxTokens: 16384, requestsToday: 8912 },
  { id: 3, name: "Claude 3.5 Sonnet", provider: "Anthropic", enabled: true, plans: ["Pro", "Enterprise"], inputCost: 3.00, outputCost: 15.00, tokensUsed: 189000000, estimatedCost: 3402, avgLatency: 980, isDefault: false, apiKey: "sk-ant-api03...secret", maxTokens: 200000, requestsToday: 2341 },
  { id: 4, name: "Claude 3 Haiku", provider: "Anthropic", enabled: true, plans: ["Free", "Pro", "Enterprise"], inputCost: 0.25, outputCost: 1.25, tokensUsed: 156000000, estimatedCost: 234, avgLatency: 290, isDefault: false, apiKey: "sk-ant-api03...haiku1", maxTokens: 200000, requestsToday: 3876 },
  { id: 5, name: "Gemini 1.5 Pro", provider: "Google", enabled: false, plans: ["Enterprise"], inputCost: 1.25, outputCost: 5.00, tokensUsed: 45000000, estimatedCost: 281, avgLatency: 720, isDefault: false, apiKey: "AIzaSy...gemini", maxTokens: 1000000, requestsToday: 0 },
  { id: 6, name: "Llama 3.1", provider: "Self-Hosted", enabled: true, plans: ["Enterprise"], inputCost: 0.10, outputCost: 0.30, tokensUsed: 78000000, estimatedCost: 31, avgLatency: 450, isDefault: false, apiKey: "local-api-key-12345", maxTokens: 128000, requestsToday: 1234 },
];

// MOCK DATA - Feature Flags (initial state)
export const mockFeatureFlags = [
  // Core Features
  { id: 1, name: "Maintenance Mode", key: "maintenance_mode", description: "Puts site in read-only mode", enabled: false, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(30), enabledForPlans: [] },
  { id: 2, name: "New Signups", key: "new_signups_enabled", description: "Allow new user registrations", enabled: true, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(60), enabledForPlans: [] },
  { id: 3, name: "Free Tier", key: "free_tier_enabled", description: "Allow free plan signups", enabled: true, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(90), enabledForPlans: [] },
  { id: 4, name: "Email Verification", key: "email_verification_required", description: "Require email verification for new accounts", enabled: true, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(120), enabledForPlans: [] },
  { id: 5, name: "Prompt History", key: "prompt_history", description: "Save and view prompt history", enabled: true, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(180), enabledForPlans: [] },
  { id: 6, name: "Prompt Sharing", key: "prompt_sharing", description: "Share prompts with other users", enabled: true, section: "Core Features", rolloutPercentage: 100, createdAt: daysAgo(45), enabledForPlans: ['Pro', 'Enterprise'] },
  
  // Experimental
  { id: 7, name: "New Editor UI", key: "new_editor_ui", description: "New prompt editor interface", enabled: false, section: "Experimental", rolloutPercentage: 10, createdAt: daysAgo(2), enabledForPlans: ['Enterprise'] },
  { id: 8, name: "Voice Input", key: "voice_input", description: "Voice input for prompts", enabled: false, section: "Experimental", rolloutPercentage: 0, createdAt: daysAgo(7), enabledForPlans: [] },
  { id: 9, name: "Collaborative Prompts", key: "collaborative_prompts", description: "Real-time collaborative editing", enabled: false, section: "Experimental", rolloutPercentage: 5, createdAt: daysAgo(10), enabledForPlans: ['Enterprise'] },
  { id: 10, name: "AI Model Comparison", key: "ai_model_comparison", description: "Compare outputs from multiple models", enabled: true, section: "Experimental", rolloutPercentage: 50, createdAt: daysAgo(1), enabledForPlans: ['Pro', 'Enterprise'] },
  { id: 11, name: "File Upload in Prompts", key: "file_upload_prompts", description: "Allow file uploads in prompts", enabled: true, section: "Experimental", rolloutPercentage: 100, createdAt: daysAgo(15), enabledForPlans: ['Pro', 'Enterprise'] },
  
  // A/B Tests
  { id: 12, name: "New Pricing Page", key: "new_pricing_page", description: "Redesigned pricing page with better conversion", enabled: true, section: "A/B Tests", rolloutPercentage: 50, createdAt: daysAgo(5), enabledForPlans: [] },
  { id: 13, name: "Onboarding Flow V2", key: "onboarding_v2", description: "New user onboarding experience", enabled: true, section: "A/B Tests", rolloutPercentage: 30, createdAt: daysAgo(14), enabledForPlans: [] },
  { id: 14, name: "Dark Mode Default", key: "dark_mode_default", description: "Set dark mode as default for new users", enabled: false, section: "A/B Tests", rolloutPercentage: 25, createdAt: daysAgo(3), enabledForPlans: [] },
];

// MOCK DATA - Failed Payments
export const mockFailedPayments = [
  { id: 1, user: "amanda.m@creative.co", amount: 19.99, reason: "Card declined", attempts: 3, lastTry: daysAgo(1) },
  { id: 2, user: "mason.w@data.io", amount: 19.99, reason: "Insufficient funds", attempts: 2, lastTry: daysAgo(2) },
  { id: 3, user: "test.user@gmail.com", amount: 19.99, reason: "Card expired", attempts: 1, lastTry: daysAgo(0) },
  { id: 4, user: "old.member@yahoo.com", amount: 99.99, reason: "Bank rejected", attempts: 4, lastTry: daysAgo(3) },
];

// MOCK DATA - Coupons
export const mockCoupons = [
  { id: 1, code: "SAVE20", discount: "20%", uses: 45, maxUses: 100, expiry: "Apr 30, 2026", status: "Active" },
  { id: 2, code: "WELCOME10", discount: "10%", uses: 234, maxUses: 500, expiry: "Dec 31, 2026", status: "Active" },
  { id: 3, code: "ENTERPRISE50", discount: "50%", uses: 12, maxUses: 20, expiry: "Mar 31, 2026", status: "Active" },
  { id: 4, code: "FLASH30", discount: "30%", uses: 100, maxUses: 100, expiry: "Feb 28, 2026", status: "Expired" },
];

// MOCK DATA - API Keys
export const mockAPIKeys = [
  { id: 1, provider: "OpenAI", keyPreview: "sk-...8x4F", created: daysAgo(90), lastUsed: daysAgo(0), status: "Active" },
  { id: 2, provider: "Anthropic", keyPreview: "sk-ant-...9k2L", created: daysAgo(60), lastUsed: daysAgo(0), status: "Active" },
  { id: 3, provider: "Google", keyPreview: "AIza...Yx7P", created: daysAgo(30), lastUsed: daysAgo(5), status: "Active" },
];

// MOCK DATA - Rate Limits
export const mockRateLimits = [
  { plan: "Free", requestsPerMin: 5, requestsPerDay: 50, tokensPerMonth: 100000 },
  { plan: "Pro", requestsPerMin: 30, requestsPerDay: 500, tokensPerMonth: 2000000 },
  { plan: "Enterprise", requestsPerMin: 100, requestsPerDay: 5000, tokensPerMonth: 20000000 },
];

// MOCK DATA - Admin Team
export const mockAdminTeam = [
  { id: 1, name: "Super Admin", email: "admin@askjai.com", role: "Super Admin", lastLogin: daysAgo(0), status: "Active" },
];

// MOCK DATA - Webhooks
export const mockWebhooks = [
  { id: 1, event: "user.created", url: "https://api.example.com/webhook/users", status: "Active", lastTriggered: daysAgo(0) },
  { id: 2, event: "subscription.updated", url: "https://api.example.com/webhook/billing", status: "Active", lastTriggered: daysAgo(1) },
];

// MOCK DATA - Activity Feed
export const mockActivityFeed = [
  { id: 1, type: "upgrade", user: "john.smith@email.com", action: "upgraded to Pro", time: "2 minutes ago", icon: "upgrade" },
  { id: 2, type: "signup", user: "new.user@gmail.com", action: "signed up from India", time: "5 minutes ago", icon: "signup" },
  { id: 3, type: "prompt", user: "sarah.j@company.com", action: "generated 50th prompt today", time: "8 minutes ago", icon: "prompt" },
  { id: 4, type: "payment", user: "mike.chen@startup.io", action: "payment successful - $19.99", time: "12 minutes ago", icon: "payment" },
  { id: 5, type: "support", user: "emily.d@freelance.com", action: "submitted support ticket", time: "15 minutes ago", icon: "support" },
  { id: 6, type: "signup", user: "random.user@outlook.com", action: "signed up from Germany", time: "18 minutes ago", icon: "signup" },
  { id: 7, type: "upgrade", user: "alex.t@agency.co", action: "upgraded to Enterprise", time: "22 minutes ago", icon: "upgrade" },
  { id: 8, type: "prompt", user: "lisa.wang@tech.com", action: "used Code Review template", time: "25 minutes ago", icon: "prompt" },
  { id: 9, type: "downgrade", user: "old.customer@email.com", action: "downgraded to Free", time: "30 minutes ago", icon: "downgrade" },
  { id: 10, type: "payment", user: "david.b@consulting.com", action: "payment failed - retrying", time: "35 minutes ago", icon: "payment" },
];

// MOCK DATA - System Alerts
export const mockSystemAlerts = [
  { id: 1, severity: "warning", message: "API latency spike detected - P95 at 1.8s", timestamp: "10 minutes ago", dismissed: false },
  { id: 2, severity: "error", message: "3 failed payment retries in the last hour", timestamp: "25 minutes ago", dismissed: false },
  { id: 3, severity: "info", message: "New Claude 3.5 model available for integration", timestamp: "1 hour ago", dismissed: false },
  { id: 4, severity: "warning", message: "Storage usage at 78% capacity", timestamp: "2 hours ago", dismissed: false },
  { id: 5, severity: "error", message: "Rate limit exceeded for user batch operation", timestamp: "3 hours ago", dismissed: false },
];

// MOCK DATA - Canned Responses for Support
export const mockCannedResponses = [
  { id: 1, title: "Thank You", text: "Thank you for reaching out to AskJai support. We've received your ticket and will respond within 24 hours." },
  { id: 2, title: "Billing Issue", text: "We apologize for the billing inconvenience. Our team is investigating this issue and will process any necessary refunds within 3-5 business days." },
  { id: 3, title: "Technical Support", text: "Thank you for reporting this issue. Our technical team is looking into it. In the meantime, please try clearing your browser cache and cookies, then attempt the action again." },
];

// MOCK DATA - Top Prompt Templates for Analytics
export const mockTopTemplates = [
  { rank: 1, name: "Code Review Assistant", timesUsed: 12453, avgRating: 4.8, category: "Coding", trend: "up" },
  { rank: 2, name: "Product Description", timesUsed: 9876, avgRating: 4.6, category: "Marketing", trend: "up" },
  { rank: 3, name: "Marketing Copy Generator", timesUsed: 8934, avgRating: 4.5, category: "Marketing", trend: "stable" },
  { rank: 4, name: "Blog Post Outline", timesUsed: 7623, avgRating: 4.7, category: "Creative Writing", trend: "up" },
  { rank: 5, name: "Email Sequence", timesUsed: 6234, avgRating: 4.4, category: "Marketing", trend: "down" },
  { rank: 6, name: "Business Proposal", timesUsed: 5432, avgRating: 4.6, category: "Business", trend: "stable" },
  { rank: 7, name: "API Documentation", timesUsed: 4567, avgRating: 4.3, category: "Coding", trend: "up" },
  { rank: 8, name: "Research Summary", timesUsed: 3456, avgRating: 4.5, category: "Research", trend: "up" },
  { rank: 9, name: "Social Media Posts", timesUsed: 2890, avgRating: 4.2, category: "Marketing", trend: "down" },
  { rank: 10, name: "Interview Questions", timesUsed: 2345, avgRating: 4.4, category: "Business", trend: "stable" },
];
