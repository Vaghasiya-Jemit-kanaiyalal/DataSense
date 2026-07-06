# 🚀 ML SERVICE DEPLOYMENT GUIDE - RAILWAY

## 📋 Overview

Your ML Service uses **FastAPI** (Python) and needs to be deployed on **Railway** with a **new email account**.

---

## 🔧 FILES CREATED FOR DEPLOYMENT

### ✅ 1. **Procfile**
```
web: python main.py
```
**Why:** Tells Railway how to start your application
- `web:` = type of process
- `python main.py` = command to run

---

### ✅ 2. **runtime.txt**
```
python-3.10.15
```
**Why:** Specifies which Python version to use
- Ensures consistency between local and production
- 3.10 is stable and widely supported

---

### ✅ 3. **Updated main.py**
Added these critical features:
```python
- PORT environment variable support
- Health check endpoint (/health)
- Root endpoint (/)
- Uvicorn server configuration
```

**Why:** Railway assigns dynamic PORT, so we must listen on it
```python
port = int(os.getenv("PORT", 8000))  # Gets PORT from Railway
```

---

### ✅ 4. **Updated requirements.txt**
Added missing dependencies:
- `pydantic` - Data validation
- `numpy` - Numerical operations
- `scikit-learn` - ML models
- `scipy` - Scientific computing
- `requests` - HTTP calls to backend

**Why:** FastAPI needs all these to function properly

---

## 📝 STEPS TO DEPLOY ON RAILWAY (NEW EMAIL)

### **STEP 1: Create New Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click "Sign Up"
3. Use your **new email**
4. Sign in with GitHub (**important!**)

---

### **STEP 2: Push Code to GitHub**
```bash
cd MLService
git add .
git commit -m "feat: Add ML service deployment configuration (Procfile, runtime.txt, requirements.txt, updated main.py)"
git push
```

Make sure the following files are committed:
- ✅ Procfile
- ✅ runtime.txt
- ✅ requirements.txt
- ✅ main.py (updated)

---

### **STEP 3: Create Railway Project**
1. Login to [railway.app](https://railway.app) with new account
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Select your **DataSense repository**
5. Authorize GitHub access

---

### **STEP 4: Configure Deployment**
1. Railway will auto-detect Python
2. Select **MLService folder** as root directory
3. Click **"Deploy"**

Wait for deployment (2-5 minutes)...

---

### **STEP 5: Set Environment Variables**
After deployment, go to your Railway project:

1. Click on **"ML Service"** from services list
2. Go to **"Variables"** tab
3. Add these variables:

```
BACKEND_URL=https://your-backend-url.railway.app/api
CORS_ORIGIN=https://your-frontend.netlify.app
```

**Why each variable:**
- `BACKEND_URL` - Where ML Service calls backend
- `CORS_ORIGIN` - Allows frontend to call ML Service

---

### **STEP 6: Get Your ML Service URL**
1. In Railway dashboard, find your ML Service
2. Click **"Deployments"**
3. Copy the **Domain URL** (looks like: `ml-service-xxxxx.railway.app`)
4. Test it in browser: `https://ml-service-xxxxx.railway.app/health`
   - Should return: `{"status":"healthy"}`

---

## 🔗 UPDATE YOUR BACKEND

Your backend needs to know about ML Service URL. Update `Backend/.env`:

```bash
ML_SERVICE_URL=https://ml-service-xxxxx.railway.app
```

Then update `Backend/server.js` to use it:
```javascript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
```

---

## 🔗 UPDATE YOUR FRONTEND

Update `Frontend/.env.local`:

```bash
NEXT_PUBLIC_ML_SERVICE_URL=https://ml-service-xxxxx.railway.app
```

Then in your frontend code, use it:
```javascript
const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL;
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Created new Railway account with different email
- [ ] Pushed code to GitHub with all new files
- [ ] Railway deployment completed successfully
- [ ] ML Service URL is working (`/health` endpoint)
- [ ] Environment variables added to Railway
- [ ] Backend `.env` updated with ML_SERVICE_URL
- [ ] Frontend `.env.local` updated with NEXT_PUBLIC_ML_SERVICE_URL
- [ ] All services connected and working

---

## 🐛 TROUBLESHOOTING

### **Issue: Build fails**
- Check **Deployment logs** in Railway
- Make sure `Procfile` and `runtime.txt` exist
- Verify `requirements.txt` has all dependencies

### **Issue: Server crashes**
- Check **Logs** tab in Railway
- Look for Python errors
- Restart deployment from Railway dashboard

### **Issue: ML Service URL not responding**
- Wait 2-3 minutes after deployment
- Test with `/health` endpoint first
- Check if CORS middleware is enabled in `main.py`

### **Issue: Connection to backend fails**
- Verify `BACKEND_URL` environment variable
- Ensure backend is running and accessible
- Check backend CORS settings include ML Service URL

---

## 📊 SERVICE ARCHITECTURE

```
┌─────────────┐
│  Frontend   │ (Netlify)
│  Next.js    │
└──────┬──────┘
       │
       ├─────► Backend (Your Friend's Railway)
       │       Node.js/Express
       │       
       └─────► ML Service (Your Railway)
               FastAPI/Python
```

---

## 🎯 FINAL STEPS

1. **Commit and push all changes**
   ```bash
   git add .
   git commit -m "Deploy: ML Service with Railway configuration"
   git push
   ```

2. **Get your ML Service URL from Railway**

3. **Share this URL with anyone who needs it**

4. **Test all endpoints:**
   - Frontend: Works?
   - Backend: Works?
   - ML Service: `/health` returns healthy?

---

## ❓ QUESTIONS?

Ask me:
- "What's my ML Service URL?" (Check Railway dashboard)
- "How to restart ML Service?" (Click restart in Railway)
- "How to update ML Service?" (Push to GitHub, Railway auto-redeploys)

Good luck! 🚀
