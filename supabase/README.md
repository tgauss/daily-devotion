# Database Setup

## Prerequisites
- Create a Supabase project at https://supabase.com
- Get your project URL and anon key from Settings > API

## Setup Instructions

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

2. Run the migration SQL in your Supabase project:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/20250106_initial_schema.sql`
   - Paste and run the SQL

3. The migration will create:
   - All necessary tables (users, plans, plan_items, lessons, progress, nudges)
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Automatic user profile creation trigger

## Database Schema

### Tables
- **users**: Extended user profiles
- **plans**: User's Bible study plans
- **plan_items**: Individual lessons in a plan
- **lessons**: Generated lesson content with Web Stories
- **progress**: User progress tracking
- **nudges**: In-app reminders and encouragement

### Security
All tables have Row Level Security (RLS) enabled. Users can only:
- View and manage their own data
- View public plans and published lessons
- Service role (backend) can manage lessons and nudges
