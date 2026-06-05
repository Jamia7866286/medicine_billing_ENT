# 🚀 Deployment Guide - Medicine Billing App

## Part 1: GitHub Setup (✅ Already Done!)
Your code is already pushed to GitHub!

---

## Part 2: Frontend Deployment (React + Netlify)

### Step 1: Connect Netlify to GitHub
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click **"New site from Git"**
4. Select your **medicine-app** repository
5. Choose **branch**: `main`

### Step 2: Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### Step 3: Environment Variables
In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variable:
   ```
   VITE_API_URL = https://your-backend-url.com/api
   ```

### Step 4: Deploy
Click **Deploy** - Netlify will automatically build and deploy! 🎉

---

## Part 3: Backend Deployment

Your backend needs a server. Choose one:

### Option A: Render (Recommended - Free tier available)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repo
5. Configure:
   - **Name**: `medicine-app-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` (or `node index.js`)
   - **Root Directory**: `backend`

6. Add Environment Variables:
   ```
   MONGO_URI = your-mongodb-connection-string
   PORT = 5000
   NODE_ENV = production
   CORS_ORIGIN = https://your-netlify-frontend-url
   ```

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Select your repo
4. Add environment variables same as above

### Option C: Heroku (Limited free tier)
1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect to GitHub repo
4. Deploy from main branch

---

## Part 4: Update API URL

After backend deployment, update:

### frontend/src/apis/api.tsx
```typescript
const API = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:5000/api",
});
```

### Environment Variable (.env files)
**Development**: `http://localhost:5000/api`
**Production**: `https://your-backend-url.com/api`

---

## Part 5: Database (MongoDB)

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Sign up and create cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/medicine-app`
4. Use this as `MONGO_URI`

### Option 2: Local MongoDB
For production, you'll need a managed database. MongoDB Atlas is easiest.

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify connected to GitHub repo (frontend folder selected)
- [ ] Backend deployed (Render/Railway/Heroku)
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in Netlify
- [ ] Environment variables set in backend hosting
- [ ] CORS_ORIGIN updated in backend
- [ ] VITE_API_URL updated in frontend
- [ ] Test API calls from frontend

---

## Testing After Deployment

1. Visit your Netlify URL
2. Try adding a medicine
3. Try creating a bill
4. Check if data saves to database
5. Check History page

If issues, check browser console (F12) for errors.

---

## Important Links

- Netlify: https://netlify.com
- Render: https://render.com
- MongoDB Atlas: https://mongodb.com/cloud
- GitHub: https://github.com

---

**Questions?** Check your browser console for error messages!
