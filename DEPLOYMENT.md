# Deployment Guide - Vercel

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier works)
- Firebase project credentials
- Groq API key

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .   
   git commit -m "Initial commit - AI Bid Evaluation Platform"
   ```

2. **Create GitHub repository** and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-bid-platform.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose "yes" for setup and build
   - Framework will auto-detect as "Vite"

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. **Go to** [vercel.com](https://vercel.com) and sign in

2. **Click "Add New Project"**

3. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**

2. Add the following variables:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyC...your-key
VITE_FIREBASE_AUTH_DOMAIN=ai-bid-4a338.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-bid-4a338
VITE_FIREBASE_STORAGE_BUCKET=ai-bid-4a338.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=766982479036
VITE_FIREBASE_APP_ID=1:766982479036:web:...
```

### Groq API
```
VITE_GROQ_API_KEY=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
```

> **Note**: Make sure all environment variables start with `VITE_` to be accessible in the browser

## Step 4: Verify Deployment

1. **Check Build Logs**:
   - Vercel will show real-time build logs
   - Ensure no errors during build

2. **Test Your App**:
   - Visit the deployment URL (e.g., `your-app.vercel.app`)
   - Test all features:
     - Registration/Login
     - Tender creation
     - Bid submission
     - Evaluation
     - PDF generation

3. **Check Browser Console**:
   - Ensure no Firebase connection errors
   - Verify API keys are loaded

## Step 5: Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

## Deployment Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

## Automatic Deployments

Once connected to Git:
- **Every push to `main`** → Production deployment
- **Every push to other branches** → Preview deployment
- **Every pull request** → Preview deployment

## Performance Optimization

The `vercel.json` file includes:
- ✅ SPA routing (all routes → index.html)
- ✅ Optimized build settings
- ✅ Framework auto-detection

## Troubleshooting

### Build Fails
- Check package.json scripts
- Ensure all dependencies are in `dependencies` not `devDependencies`
- Review build logs for specific errors

### Environment Variables Not Working
- Ensure they start with `VITE_`
- Redeploy after adding env vars
- Check capitalization matches exactly

### Routes Return 404
- Verify `vercel.json` is in root directory
- Check rewrites configuration

### Firebase Connection Issues
- Verify Firebase credentials
- Check Firebase console for API restrictions
- Ensure domain is authorized in Firebase console

## Production Checklist

- [ ] All environment variables added
- [ ] Firebase authentication enabled
- [ ] Firebase domain authorized (your-app.vercel.app)
- [ ] Groq API key has sufficient quota
- [ ] `.env` file NOT committed to Git
- [ ] Build completes successfully
- [ ] All routes work correctly
- [ ] Login/Registration functional
- [ ] Tender CRUD operations work
- [ ] Bid submission works
- [ ] Evaluation flow complete
- [ ] PDF generation works

## Monitoring

### Vercel Analytics (Optional)
1. Enable in Project Settings
2. Get insights on:
   - Page views
   - Performance metrics
   - Geographic distribution

### Firebase Monitoring
- Check Firebase Console for usage
- Monitor Firestore operations
- Review authentication logs

## Rollback

If deployment has issues:
```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [previous-deployment-url]
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Firebase Docs**: https://firebase.google.com/docs

---

**Deployment URL Example**: `https://ai-bid-platform.vercel.app`

**Estimated Build Time**: 1-2 minutes

**Cost**: Free tier supports unlimited deployments!
