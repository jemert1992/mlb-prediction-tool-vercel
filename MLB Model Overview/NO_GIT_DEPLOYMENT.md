# No-Git Vercel Deployment Guide

This guide provides detailed instructions for deploying your MLB Prediction Tool to Vercel without requiring Git installation.

## Prerequisites

1. A Vercel account (free)
2. The MLB prediction tool files (from mlb-prediction-nextjs directory)

## Step 1: Prepare Your Deployment Package

1. **Download the project files**:
   - Download the entire mlb-prediction-nextjs directory
   - Remove the following directories to reduce size:
     - node_modules/ (if present)
     - .next/ (if present)
     - .git/ (if present)

2. **Create a ZIP file** (optional):
   - Select all files in the mlb-prediction-nextjs directory
   - Create a ZIP archive (right-click → Compress/Create Archive)
   - Name it something like "mlb-prediction-tool.zip"

## Step 2: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose to sign up with:
   - Email
   - GitHub (doesn't require Git locally)
   - GitLab
   - Bitbucket
   - Google

## Step 3: Deploy to Vercel

1. **Access the Vercel Dashboard**:
   - After signing in, you'll be taken to your dashboard
   - Click "Add New" → "Project"

2. **Upload Your Project**:
   - In the "Import Git Repository" screen, look for "Upload" option
   - Click "Upload" to bypass Git repository requirement
   - Drag and drop your project folder or ZIP file
   - Alternatively, use the file browser to select your files

3. **Configure Project Settings**:
   - Vercel will automatically detect it's a Next.js project
   - **Project Name**: Enter a name (e.g., "mlb-prediction-tool")
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: Leave as `.` (the project root)
   - **Build Command**: Leave as default (`next build`)
   - **Output Directory**: Leave as default (`.next`)
   - **Install Command**: Leave as default (`npm install`)

4. **Environment Variables**:
   - No environment variables are needed for this project

5. **Deploy**:
   - Click "Deploy" button
   - Vercel will start building and deploying your application
   - This process typically takes 1-3 minutes

## Step 4: Access Your Deployed Application

1. Once deployment is complete, Vercel will provide a URL
   - Example: `mlb-prediction-tool.vercel.app`

2. Click the URL to open your deployed application

## Step 5: Verify Functionality

Verify that your MLB Prediction Tool is working correctly:

1. **Check the main page loads**:
   - MLB Prediction Tool title and description should appear
   - Date navigation should be visible

2. **Test date navigation**:
   - Click "Previous Day" and "Next Day" buttons
   - Dates should change correctly

3. **Check game predictions**:
   - Game cards should display with team matchups
   - Prediction percentages should be visible
   - Pitcher information should be displayed

4. **Test prediction types**:
   - Click different prediction type options
   - Prediction values should update accordingly

## Step 6: Add a Custom Domain (Optional)

1. In your Vercel dashboard, select your project
2. Go to "Settings" → "Domains"
3. Add your custom domain (e.g., `mlb.yourdomain.com`)
4. Follow Vercel's instructions to configure DNS settings

## Updating Your Application

Since you're not using Git, to update your application in the future:

1. Make changes to your local files
2. Create a new deployment package
3. In your Vercel dashboard, select your project
4. Click "Deployments" tab
5. Click "New Deployment" button
6. Upload your updated files
7. Vercel will build and deploy the new version

## Troubleshooting

If you encounter any issues during deployment:

1. **Build Errors**:
   - Check the build logs in the Vercel dashboard
   - Look for any error messages or warnings

2. **Runtime Errors**:
   - Open browser developer tools (F12) to check for JavaScript errors
   - Check the Network tab for failed API requests

3. **Blank Screen**:
   - Ensure that the "use client" directive is added to all client components
   - Verify that the API routes are correctly configured

## Support

If you need further assistance:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
