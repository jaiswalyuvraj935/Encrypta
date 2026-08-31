# 🚀 Complete Deployment Guide — Chat Application

This is a step-by-step guide to deploy your chat app for **free**. No prior deployment experience needed.

You will deploy:
- **Backend** (Node.js + Socket.IO) → **Render.com**
- **Frontend** (React + Vite) → **Vercel.com**
- **Database** (MongoDB) → You already have MongoDB Atlas ✅
- **Images** (Cloudinary) → Already configured ✅

---

## 📋 Prerequisites

Before we start, make sure you have:
- [x] A **GitHub account** — [Sign up here](https://github.com/join) if you don't have one
- [x] **Git** installed on your computer — [Download here](https://git-scm.com/downloads)
- [x] Your project code (you have this already)

---

## PHASE 1: Prepare Your Code for Deployment

### Step 1.1 — Add a `start` script to backend

Your backend currently only has a `dev` script using nodemon. Deployment services need a `start` script.

Open [backend/package.json](file:///c:/Users/jaisw/Downloads/projects/chat_application/backend/package.json) and change the `scripts` section to:

```json
"scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
}
```

> [!IMPORTANT]
> The `start` script uses `node` (not `nodemon`). Render will use this to run your app in production.

---

### Step 1.2 — Make the backend URL dynamic in the frontend

Right now your frontend has `localhost:5001` hardcoded. We need to make it use an environment variable so it works in production too.

#### File 1: [frontend/src/lib/axios.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/frontend/src/lib/axios.js)

Change it to:

```js
import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
    withCredentials: true,
})
```

#### File 2: [frontend/src/store/useAuthStore.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/frontend/src/store/useAuthStore.js)

Change line 6 from:
```js
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
```

To:
```js
const BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
```

---

### Step 1.3 — Update CORS & cookie settings in the backend

The backend needs to accept requests from your deployed frontend URL (not just localhost).

#### File 1: [backend/src/index.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/backend/src/index.js)

Change the CORS config from:
```js
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));
```

To:
```js
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"]
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
```

#### File 2: [backend/src/lib/socket.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/backend/src/lib/socket.js)

Change the Socket.IO CORS from:
```js
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});
```

To:
```js
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"]
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
```

#### File 3: [backend/src/lib/utils.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/backend/src/lib/utils.js)

Change the cookie settings from:
```js
res.cookie("jwt", token, {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
})
```

To:
```js
res.cookie("jwt", token, {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production"
})
```

> [!IMPORTANT]
> This is **critical**! Since your frontend (Vercel) and backend (Render) will be on different domains, cookies require `sameSite: "none"` and `secure: true` to work across domains in production.

---

### Step 1.4 — Update the logout cookie too

#### File: [backend/src/controllers/auth.controler.js](file:///c:/Users/jaisw/Downloads/projects/chat_application/backend/src/controllers/auth.controler.js)

Change the logout cookie (around line 84-89) from:
```js
res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
});
```

To:
```js
res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
});
```

---

### Step 1.5 — Change your JWT secret

> [!CAUTION]
> Your current JWT secret is `mykey` — this is extremely insecure for production. Change it to a long random string when setting up Render environment variables. For example: `a7f2k9x4m1p8q3w6z0b5n2v9c7j4h8t`

---

## PHASE 2: Push Code to GitHub

### Step 2.1 — Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `chat-application` (or whatever you like)
3. **Visibility**: Choose **Public** or **Private** (both work)
4. **Do NOT** check "Add a README file" (you already have code)
5. Click **Create repository**

### Step 2.2 — Push your code

Open a terminal in your project folder (`c:\Users\jaisw\Downloads\projects\chat_application`) and run these commands **one by one**:

```bash
# Make sure you're in the project root
# If you already have a .git folder (you do), skip "git init"

# Add a root .gitignore to exclude node_modules and .env
# (Your subfolders already have .gitignore files, but let's be safe)

# Stage all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chat-application.git

# If remote 'origin' already exists, use this instead:
# git remote set-url origin https://github.com/YOUR_USERNAME/chat-application.git

# Push to GitHub
git branch -M main
git push -u origin main
```

> [!NOTE]
> After pushing, go to your GitHub repo and verify that the `.env` file is **NOT** visible. Your `.gitignore` should be preventing it from being uploaded. If you see it, delete it from GitHub immediately and rotate your credentials.

---

## PHASE 3: Deploy Backend on Render

### Step 3.1 — Create a Render account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (easiest option — it links your repos automatically)

### Step 3.2 — Create a new Web Service

1. From the Render Dashboard, click **"New +"** → **"Web Service"**
2. **Connect your GitHub repo**: Select the `chat-application` repo you just pushed
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Name** | `chat-app-backend` (or any name you like) |
| **Region** | Choose the closest to you (e.g., Singapore for India) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### Step 3.3 — Add Environment Variables

Scroll down to **"Environment Variables"** and add these **one by one**:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://jaiswalyuvraj935_db_user:jONTNFY9Gyn0ixKd@cluster0.piklld9.mongodb.net/chat_db?appName=Cluster0` |
| `JWT_SECRET` | `a7f2k9x4m1p8q3w6z0b5n2v9c7j4h8t` (use a long random string!) |
| `NODE_ENV` | `production` |
| `CLOUDINARY_NAME` | `b4u0mqav` |
| `CLOUDINARY_API_KEY` | `179255451375844` |
| `CLOUDINARY_API_SECRET` | `9FcDFUgTmfSzQ6Sx0LV7HWX0dDM` |
| `CLIENT_URL` | (leave empty for now — we'll fill this after deploying frontend) |
| `PORT` | `5001` |

### Step 3.4 — Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait for the build to complete (2-5 minutes)
4. Once deployed, you'll see a URL like: `https://chat-app-backend-xxxx.onrender.com`
5. **Copy this URL** — you'll need it for the frontend

### Step 3.5 — Verify backend is running

Open your browser and go to:
```
https://chat-app-backend-xxxx.onrender.com/health
```
You should see: `{"status":"ok","message":"server is up"}`

> [!NOTE]
> The free tier **spins down after 15 minutes of inactivity**. The first request after being idle takes ~30 seconds. This is normal and expected on the free plan.

---

## PHASE 4: Deploy Frontend on Vercel

### Step 4.1 — Create a Vercel account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. **Sign up with GitHub** (same as Render — easiest option)

### Step 4.2 — Import your project

1. From the Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find and select your `chat-application` repo
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Project Name** | `chat-app-frontend` |
| **Framework Preset** | `Vite` (Vercel should auto-detect this) |
| **Root Directory** | Click **"Edit"** → type `frontend` → click **"Continue"** |
| **Build Command** | `npm run build` (should be auto-filled) |
| **Output Directory** | `dist` (should be auto-filled) |

### Step 4.3 — Add Environment Variables

Expand **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://chat-app-backend-xxxx.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://chat-app-backend-xxxx.onrender.com` |

> [!IMPORTANT]
> Replace `chat-app-backend-xxxx.onrender.com` with your **actual** Render backend URL from Phase 3, Step 3.4.
> 
> - `VITE_API_URL` must end with `/api`
> - `VITE_SOCKET_URL` must **NOT** end with `/api`

### Step 4.4 — Deploy

1. Click **"Deploy"**
2. Wait for the build (1-3 minutes)
3. Once deployed, you'll get a URL like: `https://chat-app-frontend.vercel.app`
4. **Copy this URL**

---

## PHASE 5: Connect Frontend & Backend

### Step 5.1 — Update the CLIENT_URL on Render

1. Go back to [render.com](https://render.com) → your `chat-app-backend` service
2. Click **"Environment"** tab on the left
3. Find the `CLIENT_URL` variable (you left it empty earlier)
4. Set its value to your Vercel frontend URL: `https://chat-app-frontend.vercel.app`
5. Click **"Save Changes"**
6. Render will **automatically redeploy** your backend with the new URL

### Step 5.2 — Test everything!

1. Open your Vercel URL: `https://chat-app-frontend.vercel.app`
2. Sign up with a new account
3. Open the same URL in a **different browser** (or incognito window)
4. Sign up with another account
5. You should see each other in the sidebar
6. Try sending messages between the two accounts!

---

## 🛠️ Troubleshooting

### "Login/Signup doesn't work" or "Network Error"
- Check that `VITE_API_URL` on Vercel ends with `/api`
- Check that `CLIENT_URL` on Render matches your exact Vercel URL (no trailing slash)
- Check the Render logs (Dashboard → your service → "Logs" tab)

### "Cookies not being set" / "Keeps redirecting to login"
- Make sure the `sameSite: "none"` and `secure: true` changes were made in `utils.js` and `auth.controler.js`
- Verify `NODE_ENV` is set to `production` on Render

### "Online status not working"
- Make sure `VITE_SOCKET_URL` is set correctly on Vercel (no `/api` at the end)
- Check browser console for WebSocket connection errors

### "Backend is slow / takes 30 seconds"
- This is normal on Render's free tier (cold start). The backend spins down after 15 min of inactivity.
- Upgrade to Render's paid plan ($7/month) to avoid this, or use [Koyeb](https://koyeb.com) as an alternative.

### Need to redeploy after code changes?
- Just push to GitHub: `git add . && git commit -m "fix" && git push`
- Both Render and Vercel will **auto-redeploy** when they detect new commits on the `main` branch

---

## 📝 Quick Reference — Your Environment Variables

### Render (Backend)
| Variable | Example Value |
|----------|---------------|
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your-long-random-string` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_NAME` | `b4u0mqav` |
| `CLOUDINARY_API_KEY` | `179255451375844` |
| `CLOUDINARY_API_SECRET` | `9FcDFUgTmfSzQ6Sx0LV7HWX0dDM` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `PORT` | `5001` |

### Vercel (Frontend)
| Variable | Example Value |
|----------|---------------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |

---

> [!TIP]
> **After deployment**, I also recommend fixing the two bugs you mentioned earlier:
> 1. **Online status showing offline** — this is caused by duplicate `connectSocket()` calls in login/signup
> 2. **Messages on wrong side** — needs investigation into how `authUser._id` is compared with `message.senderId`
> 
> Let me know if you'd like me to fix those bugs too!
