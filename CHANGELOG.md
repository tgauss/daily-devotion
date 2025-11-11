# Changelog

All notable changes to My Daily Bread will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Authentication & Onboarding Enhancement** (2025-01-14)
  - Google OAuth Sign-In: One-click authentication via Google accounts
  - Referral tracking system: Users get unique referral codes and links
  - Referral stats dashboard: View total and recent (30-day) referral counts
  - Email/password signup with automatic referral attribution
  - OAuth callback handler with referral parameter support
  - Google Sign-In button component with branded UI
  - Database migration `20250114_auth_enhancements.sql`:
    - `referred_by_user_id` and `referral_code` columns in users table
    - `email_notifications` and `email_frequency` user preferences
    - `sent_to_email` and `sent_at` tracking for plan invitations
    - `get_referral_stats()` database function
    - Auto-generate unique referral codes for all users
  - Email helper utilities (`lib/email/helpers.ts`) with HTML templates
  - Email templates for plan invites and lesson reminders
  - Comprehensive OAuth setup guide (`AUTH_SETUP.md`)
  - ReferralStats component showing shareable link and statistics
  - Updated middleware with explicit public route management
  - Sign out functionality (via DashboardHeader)
- **Flexible Scheduling System** (2025-11-10)
  - Self-guided plans: Users can choose custom start dates when joining public plans
  - Synchronized plans: Group studies where everyone follows same calendar dates
  - Enrollment-based architecture preventing plan duplication (99% storage reduction)
  - Custom start date picker modal with journey preview
  - Effective date calculations based on enrollment + schedule mode
  - Schedule utilities library (`lib/utils/schedule.ts`) for date calculations
- **Public Plan Library Improvements** (2025-11-10)
  - Date display with context: "Today", "Tomorrow", "Nov 12 (in 2 days)"
  - Relative date helpers for better UX
  - Journey preview showing lesson count, start date, and estimated completion
- **Database Migration** (2025-11-10)
  - `20250113_flexible_scheduling.sql` (run on 2025-11-10)
  - Added `schedule_mode` column to plans table
  - Added `custom_start_date` column to user_plan_enrollments
  - Created `get_effective_date()` database function
  - Backfilled existing plans with appropriate schedule modes
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
- **Plan Enrollment Architecture** (2025-11-10)
  - Joining public plans now creates enrollment records instead of duplicating plans
  - Plan detail page uses service client to bypass RLS for lesson data access
  - AI wizard plans default to `schedule_mode: 'self-guided'`
  - Fort Worth import sets `schedule_mode: 'synchronized'`
- **Date Display in Plan Details** (2025-11-10)
  - Lesson dates now show effective dates based on custom start date
  - Human-friendly labels: "Today", "Tomorrow" instead of always showing dates
  - Added relative context: "(3 days overdue)", "(in 5 days)"
- Dashboard header now shows "Welcome back, [First Name]" instead of email
- Welcome modal uses actual first name with graceful fallback
- Improved mobile layout for story pages with better text legibility
- Button text changed from "Import Plan" to "Add to My Reading Plans"

### Fixed
- **Timezone parsing issue** (2025-11-10)
  - Fixed "Invalid time value" error in date calculations
  - Explicit date parsing to avoid timezone issues
  - Added validation for date calculations
- **RLS Permission Issue** (2025-11-10)
  - Fixed enrolled users unable to see lesson data
  - Service client now used for all plan queries to bypass RLS for public content
- **Missing Function Error** (2025-11-10)
  - Fixed `getItemEffectiveDate is not defined` error
  - Added function as prop to all LessonSection components
- **Next.js 15+ async params** (2025-11-10)
  - Fixed library plan preview page to await params
  - Prevents "params is a Promise" error
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
- `20250113_flexible_scheduling.sql` (run 2025-11-10) - Flexible scheduling system

### Key Features Timeline
1. **Week 1 (Jan 6)**: Core platform, plans, lessons, AI generation
2. **Week 2 (Jan 9)**: User profiles, admin panel, personalization, mobile improvements
3. **Nov 10, 2025**: Flexible scheduling, public library enrollment, date improvements

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
