# Disable Auth Trigger - Quick Fix

The signup error is caused by a database trigger that's failing when creating users. Since we can't modify triggers on the `auth` schema due to Supabase permissions, we need to disable it.

## Option 1: Disable the Trigger (Recommended)

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Disable any triggers on auth.users that might be causing issues
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth'
        AND c.relname = 'users'
        AND tgname LIKE '%handle_new_user%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.tgname);
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;
```

## Option 2: Check for Email Confirmation Trigger

There might also be a trigger for the email queue. Try disabling it:

```sql
-- Drop triggers related to email confirmations
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

## Option 3: Full Reset (if above don't work)

If the triggers are deeply integrated, you may need to contact Supabase support or check the Supabase Dashboard under:

**Settings → Database → Extensions & Triggers**

Look for any custom triggers on the `auth.users` table and disable them.

## After Disabling

Once the trigger is disabled, the signup API will handle creating the `public.users` record manually (already implemented in the code).

Test by creating a new account at: `/signup`
