# Step-by-Step GitHub + Vercel Deployment Guide

This guide provides detailed instructions for deploying your MLB Prediction Tool to Vercel using GitHub integration - the most reliable deployment method.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free)
3. Git installed on your local machine

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "mlb-prediction-tool")
4. Set it to Public (or Private if you prefer)
5. Click "Create repository"
6. Follow the instructions to push your code:

```bash
# Navigate to your project directory
cd /home/ubuntu/mlb-prediction-nextjs

# Initialize git (if not already done)
git init

# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/mlb-prediction-tool.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Select "Continue with GitHub" and authorize Vercel if prompted
4. Select your "mlb-prediction-tool" repository from the list
5. Vercel will automatically detect it's a Next.js project

## Step 3: Configure Deployment Settings

1. In the Vercel project setup screen:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: Leave as `.` (the project root)
   - **Build Command**: Leave as default (`next build`)
   - **Output Directory**: Leave as default (`.next`)
   - **Install Command**: Leave as default (`npm install`)

2. No environment variables are needed for this project

3. Click "Deploy"

## Step 4: Wait for Deployment

1. Vercel will now build and deploy your application
2. This process typically takes 1-3 minutes
3. You'll see a progress indicator showing the build status

## Step 5: Verify Deployment

1. Once deployment is complete, Vercel will provide a URL (e.g., `mlb-prediction-tool.vercel.app`)
2. Click the URL to open your deployed application
3. Verify that:
   - The MLB Prediction Tool loads correctly
   - The date navigation works
   - Game predictions are displayed
   - Different prediction types can be selected

## Step 6: Set Up Automatic Deployments (Optional)

Your project is now set up for automatic deployments:
- Any changes pushed to your GitHub repository will trigger a new deployment
- Vercel will automatically build and deploy the updated version

## Step 7: Add a Custom Domain (Optional)

1. In your Vercel dashboard, select your project
2. Go to "Settings" → "Domains"
3. Add your custom domain (e.g., `mlb.yourdomain.com`)
4. Follow Vercel's instructions to configure DNS settings

## Troubleshooting

If you encounter any issues during deployment:

1. **Build Errors**:
   - Check the build logs in the Vercel dashboard
   - Look for any error messages or warnings
   - Verify that all dependencies are correctly listed in package.json

2. **Runtime Errors**:
   - Open browser developer tools (F12) to check for JavaScript errors
   - Check the Network tab for failed API requests

3. **Blank Screen**:
   - Ensure that the "use client" directive is added to all client components
   - Verify that the API routes are correctly configured

4. **API Errors**:
   - Check that the API routes are properly implemented
   - Verify that the MLB Stats API is accessible from Vercel

## Support

If you need further assistance:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- GitHub Documentation: [docs.github.com](https://docs.github.com)
