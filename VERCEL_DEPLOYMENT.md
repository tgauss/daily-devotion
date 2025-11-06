# Deploying Daily Devotion to Vercel

This guide will walk you through deploying your Daily Devotion app to Vercel with the custom domain **mydailybread.faith**.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free or Pro)
- [GitHub Account](https://github.com) (to connect your repository)
- Domain access to **mydailybread.faith**
- Supabase project (already set up)
- OpenAI API key (already configured)
- ESV API key (already configured)

---

## Step 1: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Daily Devotion app"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Name it `daily-devotion` (or your preferred name)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/daily-devotion.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Your GitHub Repository**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository `daily-devotion`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables**:
   Click "Environment Variables" and add the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
   ESV_API_KEY=<your-esv-api-key>
   OPENAI_API_KEY=<your-openai-api-key>
   NEXT_PUBLIC_APP_URL=https://mydailybread.faith
   ```

   **Note:** Get your actual keys from your `.env.local` file and paste them in Vercel.

   **Important**: Make sure to select "All Environments" (Production, Preview, Development) for each variable.

5. **Click "Deploy"**:
   - Vercel will build and deploy your app
   - Wait 2-3 minutes for the build to complete
   - You'll get a deployment URL like: `https://daily-devotion.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to link your project
```

---

## Step 3: Configure Custom Domain (mydailybread.faith)

1. **Go to Your Project Settings**:
   - Open your project in Vercel dashboard
   - Click "Settings" → "Domains"

2. **Add Custom Domain**:
   - Click "Add"
   - Enter: `mydailybread.faith`
   - Click "Add"

3. **Configure DNS Records**:

   Vercel will show you DNS records to add. You'll need to add these to your domain registrar:

   **For Root Domain (mydailybread.faith):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For WWW Subdomain (optional):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Verify Domain**:
   - After adding DNS records, click "Verify"
   - DNS propagation can take 1-24 hours
   - Vercel will automatically provision an SSL certificate

5. **Set as Primary Domain**:
   - Once verified, click the three dots next to `mydailybread.faith`
   - Select "Set as Primary Domain"
   - All traffic will redirect to this domain

---

## Step 4: Update Supabase Configuration

Your Supabase project needs to allow requests from your production domain:

1. **Go to Supabase Dashboard**: https://zeuhfxlpscrwoqqvsxny.supabase.co

2. **Update Site URL**:
   - Navigate to: Authentication → URL Configuration
   - **Site URL**: `https://mydailybread.faith`
   - Click "Save"

3. **Add Redirect URLs**:
   - **Redirect URLs** (add all):
     ```
     https://mydailybread.faith/**
     https://mydailybread.faith/auth/callback
     https://www.mydailybread.faith/**
     ```
   - This allows authentication to work on your domain

---

## Step 5: Post-Deployment Testing

1. **Test Authentication**:
   - Visit: https://mydailybread.faith/auth
   - Try signing in with your account
   - Verify redirect works

2. **Test Lesson Viewing**:
   - Navigate to a lesson (if you have any generated)
   - Example: https://mydailybread.faith/s/[share-slug]
   - Verify story pages load correctly

3. **Test Dashboard**:
   - Go to: https://mydailybread.faith/dashboard
   - Check that your plans load
   - Verify progress tracking works

4. **Test Quiz**:
   - Complete a story and start the quiz
   - Verify quiz submission works
   - Check results are saved

---

## Important: Lesson Generation Timeout Issue ⚠️

**Problem**: Vercel serverless functions have a **10-second timeout** on the Hobby plan (60 seconds on Pro). Generating 244 lessons will exceed this limit.

**Current Status**: The "Generate All Lessons" button will timeout in production.

**Solutions**:

### Option 1: Upgrade to Vercel Pro ($20/month)
- 60-second function timeout
- Still may not be enough for 244 lessons

### Option 2: Generate Lessons Locally (Recommended for Now)
1. Keep your local dev server running
2. Generate lessons locally at http://localhost:3002
3. Lessons are stored in Supabase and will appear in production
4. This works because database is shared

### Option 3: Implement Background Job Processing (Future Enhancement)
- Requires a job queue system (e.g., Vercel Cron, Inngest, or BullMQ)
- Processes lessons in batches
- Can run for hours without timeout
- I can implement this if needed (let me know!)

**For now**, I recommend:
1. Deploy the app to Vercel
2. Generate lessons locally via localhost:3002
3. Users can view lessons on mydailybread.faith

---

## Continuous Deployment

Once deployed, Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main

# Vercel automatically builds and deploys (takes 2-3 minutes)
```

You can view deployment logs in the Vercel dashboard.

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbGci...` |
| `ESV_API_KEY` | ESV Bible API key | `320cff...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://mydailybread.faith` |

**Security Note**: Never commit `.env.local` to Git. The `.gitignore` file already excludes it.

---

## Monitoring & Logs

1. **View Logs**:
   - Go to your project in Vercel
   - Click "Logs" tab
   - See real-time function execution logs

2. **Monitor Performance**:
   - Click "Analytics" tab
   - View page views, performance metrics
   - Track Web Vitals

3. **Error Tracking**:
   - Consider adding error tracking (e.g., Sentry)
   - Vercel has built-in error reporting

---

## Cost Estimates

**Vercel Hobby (Free)**:
- ✅ Free hosting
- ✅ Unlimited bandwidth
- ✅ 100 GB build time/month
- ⚠️ 10-second function timeout (problematic for lesson generation)

**Vercel Pro ($20/month)**:
- ✅ 60-second function timeout
- ✅ Priority support
- ✅ Team collaboration
- ⚠️ Still may timeout for 244 lessons

**Supabase (Current Usage)**:
- Free tier: 500 MB database, 2 GB bandwidth
- Should be fine for small study groups
- Monitor usage at: https://zeuhfxlpscrwoqqvsxny.supabase.co

**OpenAI API**:
- GPT-4o: ~$0.01-0.02 per lesson
- 244 lessons × $0.015 = ~$3.66 one-time
- Ongoing: depends on new lesson creation

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### 500 Internal Server Error
- Check function logs
- Verify environment variables are set correctly
- Check Supabase connection

### Authentication Issues
- Verify Site URL in Supabase matches your domain
- Check redirect URLs include your domain
- Ensure cookies are enabled

### Domain Not Resolving
- Wait 1-24 hours for DNS propagation
- Use DNS checker: https://dnschecker.org
- Verify DNS records are correct

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain
3. ✅ Update Supabase URLs
4. ✅ Test authentication and core features
5. 🔄 Generate lessons locally (until background jobs are implemented)
6. 📢 Share with your study group!

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

If you encounter issues during deployment, let me know and I'll help troubleshoot!
