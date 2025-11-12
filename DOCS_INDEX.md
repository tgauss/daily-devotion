# Documentation Index

Quick reference to all project documentation.

---

## 📋 Session Logs

### SESSION_LOG_2025-01-11.md
**Comprehensive log of authentication system fixes**
- Database trigger error resolution
- TypeScript build fix
- Email integration with Resend
- Complete change history and reasoning
- Testing results and pending actions

**When to read:** When resuming work or debugging auth issues

---

## 🔧 Setup Guides

### SIGNUP_EMAIL_SETUP.md
**Complete setup guide for custom signup flow**
- What was fixed and why
- How the signup flow works
- Configuration checklist (local & production)
- Step-by-step testing instructions
- Comprehensive troubleshooting guide

**When to read:** Setting up auth for first time or troubleshooting signup

### DISABLE_SUPABASE_EMAILS.md
**Guide for using Resend instead of Supabase emails**
- Custom email flow implementation
- Disabling Supabase email confirmations
- Email templates and styling
- Troubleshooting email delivery

**When to read:** Configuring email system or fixing email issues

### DISABLE_AUTH_TRIGGER.md
**Instructions for managing database triggers**
- SQL queries to check for triggers
- Methods to disable/drop triggers
- Alternative approaches

**When to read:** When dealing with database trigger conflicts

---

## 🗂️ Architecture Docs

### AUTH_SETUP.md
**Authentication architecture overview**
- Supabase integration
- OAuth setup
- Session management

**When to read:** Understanding overall auth architecture

### DATABASE.md
**Database schema and migrations**
- Table structures
- Relationships
- Migration process

**When to read:** Making database changes or debugging data issues

### ARCHITECTURE.md
**Overall application architecture**
- Tech stack
- Folder structure
- Key patterns

**When to read:** Getting started or making architectural decisions

---

## 🐛 Diagnostic Scripts

Location: `/scripts/`

### test-signup.ts
Tests user creation via Admin API
```bash
npx tsx scripts/test-signup.ts
```

### check-trigger.ts
Verifies trigger and function status
```bash
npx tsx scripts/check-trigger.ts
```

### list-triggers.ts
Lists all triggers and tests signup methods
```bash
npx tsx scripts/list-triggers.ts
```

### check-lessons-schema.ts
Inspects lessons table structure
```bash
npx tsx scripts/check-lessons-schema.ts
```

---

## 📝 Quick References

### Environment Variables

**Local (.env.local):**
```bash
RESEND_API_KEY=re_xxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Production (Vercel):**
- Same as above, with production URL

### Common Commands

**Development:**
```bash
npm run dev          # Start dev server
npm run build        # Test production build
npm run start        # Run production build locally
```

**Testing:**
```bash
npx tsx scripts/test-signup.ts    # Test signup
npx tsx scripts/check-trigger.ts  # Check triggers
```

**Database:**
```bash
# View triggers (in Supabase SQL Editor)
SELECT t.tgname, p.proname FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';
```

---

## 🚨 Troubleshooting Quick Links

| Issue | Document | Section |
|-------|----------|---------|
| Signup failing | SESSION_LOG_2025-01-11.md | Solution 1 |
| Build errors | SESSION_LOG_2025-01-11.md | Solution 2 |
| Email not sending | SIGNUP_EMAIL_SETUP.md | Testing the Flow |
| Trigger errors | DISABLE_AUTH_TRIGGER.md | Full document |
| Database issues | DATABASE.md | Schema section |

---

## 📊 File Organization

```
/Users/tgauss/Projects/Claude Code/daily devotion/
│
├── docs/                           # Feature-specific docs
│   ├── DISABLE_SUPABASE_EMAILS.md
│   └── ... (other docs)
│
├── scripts/                        # Diagnostic scripts
│   ├── test-signup.ts
│   ├── check-trigger.ts
│   └── ...
│
├── SESSION_LOG_2025-01-11.md       # Session logs
├── SIGNUP_EMAIL_SETUP.md           # Setup guides
├── DISABLE_AUTH_TRIGGER.md         # Specific guides
├── AUTH_SETUP.md                   # Architecture docs
├── DATABASE.md
├── ARCHITECTURE.md
└── DOCS_INDEX.md                   # This file
```

---

## 🔄 Document Update Cadence

- **Session Logs:** Created at end of each major work session
- **Setup Guides:** Updated when features change
- **Architecture Docs:** Updated quarterly or with major changes
- **This Index:** Updated when new docs are added

---

## 📞 Getting Help

1. **Check this index** for relevant documentation
2. **Read the specific doc** for detailed information
3. **Run diagnostic scripts** to gather data
4. **Review session logs** for recent changes

---

**Last Updated:** January 11, 2025
**Total Documents:** 9
**Total Scripts:** 5
