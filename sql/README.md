# AskJai — SQL Queries

All SQL queries used in this project are organized here for easy reference and deployment.

## Folder Structure

```
sql/
├── 01_schema.sql              # Base database schema (tables, enums, indexes, triggers)
├── 02_admin.sql               # Admin tables, functions, RLS policies
├── 03_cms.sql                 # CMS tables, blog, templates, storage, seed data
├── 04_users.sql               # User-related tables, notifications, chat, analytics
├── 05_update_system.sql       # App update/version tracking system
├── 06_payments_auth.sql       # Payment gateways, transactions, auth config
├── README.md                  # This file
```

## Execution Order

Run the SQL files **in order** (01 → 06) in the Supabase SQL Editor:

1. **01_schema.sql** — Creates base tables: `profiles`, `user_profiles`, `user_credits`, `admin_users`, `credit_transactions`, `prompt_history`, `analytics_events`, `system_settings`. Also sets up enums, RLS policies, indexes, functions, triggers, storage bucket, and the new user signup handler.

2. **02_admin.sql** — Creates admin-specific tables: `support_tickets`, `audit_logs`, `feature_flags`, `admin_notifications`, `notification_templates`, `subscriptions`, `prompt_templates`, `ai_models`. Includes admin credit functions, user listing functions, and RLS policies.

3. **03_cms.sql** — Creates CMS tables: `cms_config`, `blog_posts`, `blogs`, `team_members`, `company_values`, `templates`. Includes storage bucket for CMS media, analytics views, and seed data for navbar, footer, hero, theme, team, and templates.

4. **04_users.sql** — Extends user profiles with additional columns. Creates `user_analytics`, `user_notifications`, `chat_conversations` tables. Includes contact form/support ticket policies.

5. **05_update_system.sql** — Creates `app_meta` and `update_inbox` tables for the app update/version tracking system.

6. **06_payments_auth.sql** — Adds `permissions` column to `admin_users`. Creates `payment_gateways`, `payment_transactions`, `auth_config` tables with RLS policies, indexes, and seed data for default payment gateways.

## Complete Table List

| Table | Script | Purpose |
|-------|--------|---------|
| `profiles` | 01 | Main user profiles linked to auth.users |
| `user_profiles` | 01 | Extended user profile data |
| `user_credits` | 01 | User credit balances |
| `admin_users` | 01, 06 | Admin roles & permissions |
| `credit_transactions` | 01 | Credit usage/topup logs |
| `prompt_history` | 01 | AI prompt generation history |
| `analytics_events` | 01, 03 | Event tracking |
| `system_settings` | 01 | Key-value system config |
| `support_tickets` | 02 | User support tickets |
| `audit_logs` | 02 | Admin action audit trail |
| `feature_flags` | 02 | Feature toggle system |
| `admin_notifications` | 02 | Admin-sent notifications |
| `notification_templates` | 02 | Reusable notification templates |
| `subscriptions` | 02 | User subscriptions |
| `prompt_templates` | 02 | Reusable prompt templates |
| `ai_models` | 02 | AI model configurations |
| `cms_config` | 03 | CMS section configs (JSON) |
| `blog_posts` | 03 | Blog posts (admin editor) |
| `blogs` | 03 | Blog posts (public-facing) |
| `team_members` | 03 | Team member profiles |
| `company_values` | 03 | Company values for About page |
| `templates` | 03 | Prompt templates catalog |
| `user_analytics` | 04 | Per-user usage statistics |
| `user_notifications` | 04 | Notifications delivered to users |
| `chat_conversations` | 04 | AI chat history |
| `app_meta` | 05 | App version/install info |
| `update_inbox` | 05 | Update notifications |
| `payment_gateways` | 06 | Payment provider configs |
| `payment_transactions` | 06 | Payment records |
| `auth_config` | 06 | Auth provider settings |

## Notes

- All files use `CREATE TABLE IF NOT EXISTS` and `DROP POLICY IF EXISTS` for safe re-runs
- The admin email `admin@promptforge.com` is auto-granted the `owner` role on signup
- Edge Functions are located in `supabase/functions/` (not SQL)
- Storage buckets: `avatars` (01), `cms-media` (03)
