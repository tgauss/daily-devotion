# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] **Test Locally**: Ensure the app runs without errors
  ```bash
  npm run dev
  # Visit http://localhost:3002 and test all features
  ```

- [ ] **Build Test**: Verify the production build works
  ```bash
  npm run build
  npm start
  ```

- [ ] **Environment Variables**: Confirm all keys are working
  - [ ] Supabase connection (check auth)
  - [ ] OpenAI API (generate a test lesson)
  - [ ] ESV API (view a passage)

- [ ] **Database Migrations**: Apply all migrations in Supabase
  - [ ] Initial schema (`20250106_initial_schema.sql`)
  - [ ] Category field (`20250107_add_category_to_plan_items.sql`)

- [ ] **Git Repository**: Push code to GitHub
  ```bash
  git add .
  git commit -m "Prepare for Vercel deployment"
  git push origin main
  ```

---

## Deployment Steps

- [ ] **Create Vercel Project**
  - Go to https://vercel.com/new
  - Import GitHub repository
  - Framework: Next.js (auto-detected)

- [ ] **Add Environment Variables in Vercel**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ESV_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` = `https://mydailybread.faith`

- [ ] **Deploy**: Click "Deploy" and wait for build to complete (~2-3 min)

- [ ] **Test Deployment**: Visit the Vercel URL
  - Example: `https://daily-devotion.vercel.app`
  - Test: Login, view a lesson, check dashboard

---

## Domain Configuration

- [ ] **Add Custom Domain in Vercel**
  - Go to Project Settings → Domains
  - Add: `mydailybread.faith`

- [ ] **Configure DNS Records** (at your domain registrar)
  - [ ] Add A Record: `@ → 76.76.21.21`
  - [ ] Add CNAME: `www → cname.vercel-dns.com`

- [ ] **Wait for DNS Propagation** (1-24 hours)
  - Check status: https://dnschecker.org

- [ ] **Verify Domain**: Click "Verify" in Vercel
  - SSL certificate will be auto-provisioned

- [ ] **Set as Primary Domain**
  - Click three dots → "Set as Primary Domain"

---

## Supabase Configuration

- [ ] **Update Site URL in Supabase**
  - Navigate to: Authentication → URL Configuration
  - Site URL: `https://mydailybread.faith`
  - Click "Save"

- [ ] **Add Redirect URLs**
  - Add:
    ```
    https://mydailybread.faith/**
    https://mydailybread.faith/auth/callback
    https://www.mydailybread.faith/**
    ```

---

## Post-Deployment Testing

- [ ] **Test Authentication**
  - Visit: https://mydailybread.faith/auth
  - Sign in with existing account
  - Verify redirect to dashboard

- [ ] **Test Story Viewing**
  - Navigate to an existing lesson
  - Example: https://mydailybread.faith/s/[share-slug]
  - Verify all pages load correctly

- [ ] **Test Quiz**
  - Complete a story
  - Take the quiz
  - Verify results are saved

- [ ] **Test Dashboard**
  - Check plans load
  - Verify progress tracking
  - Test creating a new plan (if needed)

- [ ] **Test Mobile**
  - Open on phone/tablet
  - Check responsive design
  - Test tap navigation in stories

---

## Lesson Generation (Important!)

⚠️ **The "Generate All Lessons" button will timeout on Vercel** (10-second limit on free tier).

**Recommended Approach**:
- [ ] Generate lessons locally via `http://localhost:3002`
- [ ] Lessons are stored in Supabase
- [ ] They will automatically appear on production site

**Alternative** (if you need production generation):
- [ ] Upgrade to Vercel Pro ($20/month) for 60-second timeout
- [ ] Or: Implement background job processing (requires code changes)

---

## Monitoring & Maintenance

- [ ] **Set Up Error Alerts**
  - Go to Vercel project → Integrations
  - Consider adding Sentry or similar

- [ ] **Monitor Analytics**
  - Check Vercel Analytics tab
  - Monitor page views and performance

- [ ] **Review Logs Regularly**
  - Go to Vercel project → Logs
  - Watch for errors or timeouts

- [ ] **Monitor Costs**
  - [ ] Vercel usage (free tier limits)
  - [ ] Supabase database size
  - [ ] OpenAI API usage

---

## Troubleshooting

### Build Fails
1. Check build logs in Vercel
2. Run `npm run build` locally to reproduce
3. Verify all dependencies are in `package.json`

### Authentication Not Working
1. Check Supabase Site URL matches your domain
2. Verify redirect URLs are correct
3. Clear cookies and try again

### Lessons Not Loading
1. Check function logs in Vercel
2. Verify Supabase connection
3. Check that lessons exist in database

### Domain Not Resolving
1. Wait 24 hours for DNS propagation
2. Use https://dnschecker.org to verify
3. Double-check DNS records

---

## Rollback Plan

If something goes wrong:

1. **Vercel**: Roll back to previous deployment
   - Go to Deployments tab
   - Click "..." on a previous deployment
   - Select "Promote to Production"

2. **Database**: Restore from Supabase backup
   - Go to Supabase → Database → Backups
   - Click "Restore" on a backup point

3. **Code**: Revert Git commit
   ```bash
   git log  # Find commit hash
   git revert <commit-hash>
   git push origin main
   ```

---

## Success Criteria

✅ Deployment is successful when:
- Site loads at https://mydailybread.faith
- Users can sign in and access their dashboard
- Existing lessons are viewable
- Quizzes work and save progress
- No console errors in browser
- Mobile experience is smooth

---

## Next Steps After Deployment

1. **Share with Study Group**:
   - Send link: https://mydailybread.faith
   - Provide sign-up instructions
   - Share Fort Worth Bible plan (if imported)

2. **Generate Remaining Lessons** (if needed):
   - Run locally via localhost:3002
   - Or implement background processing

3. **Monitor Usage**:
   - Watch Vercel analytics
   - Check OpenAI API costs
   - Monitor Supabase database size

4. **Gather Feedback**:
   - Ask study group for input
   - Track bugs or feature requests
   - Iterate and improve

---

**Ready to deploy? Follow this checklist step by step!** 🚀

If you encounter any issues, refer to `VERCEL_DEPLOYMENT.md` for detailed instructions or ask for help.
