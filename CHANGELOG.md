# Changelog

All notable changes to MyDailyBread will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Personalization using user's first name throughout app (2025-01-09)
- Admin section for manual user creation at `/admin` (2025-01-09)
  - Form to create users with email, password, name, phone
  - Option to pre-load Fort Worth Bible Plan with all lessons
  - User list view showing all registered users
  - API endpoint `/api/admin/create-user`
- User profile fields to database schema (2025-01-09)
  - `first_name`, `last_name`, `phone_number`, `avatar_url`, `bio`
  - `updated_at` column with auto-update trigger
  - Migration to backfill existing auth users
- Welcome onboarding modal for first-time users (2025-01-06)
  - 5-step interactive guide
  - Features overview
  - Persisted via localStorage
- Lesson sharing architecture for Fort Worth plan (2025-01-06)
  - Shared lessons across users to avoid regeneration
  - Individual progress tracking per user
- Mobile-responsive lesson pages (2025-01-06)
  - Fixed overlapping navigation buttons
  - Improved text readability (sans-serif medium weight)
  - Responsive padding and spacing
- Background pattern rotation (90° clockwise) (2025-01-06)

### Changed
- Dashboard header now shows "Welcome back, [First Name]" instead of email
- Welcome modal uses actual first name with graceful fallback
- Improved mobile layout for story pages with better text legibility
- Button text changed from "Import Plan" to "Add to My Reading Plans"

### Fixed
- Production plan page redirect issue caused by vercel.json rewrite rule (2025-01-06)
- Migration trigger conflict - added DROP IF EXISTS (2025-01-09)
- Mobile layout issues with overlapping elements (2025-01-06)

## [0.1.0] - 2025-01-06

### Added
- Initial schema setup
- Plans and plan items tables
- Lessons with AI-generated content (triptych, story, quiz)
- Progress tracking
- Fort Worth Bible Church 2025 reading plan
- User authentication via Supabase
- Dashboard with progress overview
- Reading plan creation
- Lesson generation via OpenAI API
- Quiz functionality
- Shareable lesson links
- Row Level Security policies

### Infrastructure
- Next.js 16 with App Router
- Turbopack for development
- Supabase for database and authentication
- Tailwind CSS for styling
- OpenAI API for AI content generation
- Vercel deployment

---

## Version History Summary

### Database Migrations
- `20250106_initial_schema.sql` - Initial database setup
- `20250107_add_category_to_plan_items.sql` - Added category field
- `20250108_add_passage_text_to_lessons.sql` - Added passage text storage
- `20250109_add_user_profile_fields.sql` - User profile fields
- `20250109_backfill_existing_users.sql` - Sync auth users to public.users

### Key Features Timeline
1. **Week 1 (Jan 6)**: Core platform, plans, lessons, AI generation
2. **Week 2 (Jan 9)**: User profiles, admin panel, personalization, mobile improvements

---

## Breaking Changes

### [0.1.0] → [Unreleased]
- Dashboard component now requires `profile` prop in addition to `user`
- WelcomeModal component signature changed: added `firstName` prop
- Users table schema updated: new columns require migration
- `vercel.json` rewrite rules removed (breaking for deployments with custom rewrites)

---

## Security Updates

### 2025-01-09
- Added admin user creation endpoint (basic auth check only - proper RBAC pending)
- Service role key required for admin operations

---

## Known Issues

### Current
- Admin panel has basic authentication only (no role-based access control)
- Middleware deprecation warning (Next.js 16 wants "proxy" instead of "middleware")

### In Progress
- None

---

## Upcoming Features

### Planned
- Profile settings page for users to edit their own information
- Role-based admin access control
- Email notifications for overdue lessons
- Progress statistics and insights
- Custom reading plan builder with AI assistance
- Social features (share progress, study groups)
- Mobile app (React Native)

---

## Credits

Built with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
