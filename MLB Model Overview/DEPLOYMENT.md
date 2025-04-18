# MLB Prediction Tool - Vercel Deployment Guide

This guide will walk you through deploying your MLB Prediction Tool to Vercel for permanent hosting.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. Git installed on your local machine (optional, but recommended)

## Deployment Steps

### Option 1: Deploy directly from GitHub

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push the mlb-prediction-nextjs directory to your repository

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to your project directory**
   ```bash
   cd mlb-prediction-nextjs
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

5. **Follow the prompts**
   - Confirm deployment settings
   - Vercel will build and deploy your application

### Option 3: Deploy using the Vercel Deploy Button

1. **Create a Deploy Button**
   - Add a deploy button to your README.md:
   ```markdown
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mlb-prediction-nextjs)
   ```

2. **Share the link**
   - Anyone can click this button to deploy their own instance

## After Deployment

- Vercel will provide you with a unique URL (e.g., mlb-prediction-tool.vercel.app)
- You can add a custom domain in the Vercel dashboard under "Domains"
- Your application will automatically rebuild when you push changes to your repository

## Environment Variables

No environment variables are required for this application as all API calls are made server-side.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in the Vercel dashboard
2. Ensure all dependencies are correctly listed in package.json
3. Verify that the vercel.json configuration is correct
4. Make sure the API routes are properly configured

## Support

If you need further assistance, you can:
- Check Vercel's documentation at [vercel.com/docs](https://vercel.com/docs)
- Contact Vercel support through their dashboard
