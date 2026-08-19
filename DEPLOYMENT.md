# AI Resume Builder - Deployment Guide

## Prerequisites
- GitHub account
- MongoDB Atlas account (or your MongoDB connection string)
- Google OAuth credentials (for Google login)
- Gemini AI API key

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Ensure `.gitignore` excludes sensitive files**:
   - `node_modules/`
   - `.env` files
   - `dist/` or `build/` folders

## Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-resume-builder-server`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: `Node`

5. **Add Environment Variables** (Advanced section):
   - `MONGODB_URI`: Your MongoDB connection string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `GEMINI_API_KEY`: Your Gemini AI API key
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
   - `PORT`: `5000`

6. Click **"Deploy Web Service"**
7. Wait for deployment to complete (2-3 minutes)
8. Copy the backend URL (e.g., `https://ai-resume-builder-server.onrender.com`)

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://ai-resume-builder-server.onrender.com`)

6. Click **"Deploy"**
7. Wait for deployment to complete (1-2 minutes)
8. Copy the frontend URL

## Step 4: Update Frontend API URL

In your client code, ensure API calls use the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test resume creation and AI features
4. Verify all API endpoints are working

## Environment Variables Reference

### Backend (Render)
- `MONGODB_URI`: MongoDB connection string
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GEMINI_API_KEY`: Gemini AI API key
- `JWT_SECRET`: Secret for JWT tokens
- `NODE_ENV`: production
- `PORT`: 5000

### Frontend (Vercel)
- `VITE_API_URL`: Backend URL from Render

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend Issues
- Check Vercel deployment logs
- Verify `VITE_API_URL` is set correctly
- Ensure CORS is configured on backend

### Database Connection
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify database user has correct permissions
- Check connection string format

## Cost
- **Render**: Free tier available (spins down after inactivity)
- **Vercel**: Free tier available
- **MongoDB Atlas**: Free tier (512MB storage)

## Alternative: Railway

If you prefer a single platform, Railway can host both frontend and backend:
1. Create a Railway account
2. Deploy backend as a service
3. Deploy frontend as a service
4. Set environment variables for both
5. Railway provides automatic SSL and domain
