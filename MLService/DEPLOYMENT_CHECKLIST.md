# ✅ ML SERVICE DEPLOYMENT CHECKLIST

## 📝 PRE-DEPLOYMENT (DO NOW)

### Step 1: Commit & Push
```bash
cd MLService
git add .
git commit -m "Deploy: ML Service with Railway configuration (Procfile, runtime.txt, requirements.txt, main.py updates)"
git push origin main
```

**Verify:**
- [ ] No errors during git push
- [ ] Code appears on GitHub in `MLService/` folder

---

### Step 2: Verify Files Exist
Check that these files are in `MLService/` folder:

- [ ] `Procfile` - Contains: `web: python main.py`
- [ ] `runtime.txt` - Contains: `python-3.10.15`
- [ ] `requirements.txt` - Updated with all dependencies
- [ ] `main.py` - Updated with PORT support and endpoints
- [ ] `DEPLOYMENT_GUIDE.md` - Reference guide
- [ ] `CHANGES_EXPLAINED.md` - Explains all changes

---

## 🚀 DEPLOYMENT (FOLLOW THESE STEPS)

### Step 1: Create New Railway Account
- [ ] Go to https://railway.app
- [ ] Click "Sign Up"
- [ ] Use **NEW EMAIL** (different from old Railway account)
- [ ] Sign in with GitHub
- [ ] Authorize GitHub access

### Step 2: Create New Project
- [ ] Click "New Project" button
- [ ] Select "Deploy from GitHub"
- [ ] Choose your DataSense repository
- [ ] Click "Deploy"

### Step 3: Wait for Deployment
- [ ] Watch deployment logs (should say "Building...")
- [ ] Wait 2-5 minutes for completion
- [ ] Look for "✅ Deployment successful" message

### Step 4: Get Your ML Service URL
- [ ] Click on "Deployments" tab
- [ ] Copy the **Domain URL** (example: `ml-service-prod-abcd1234.railway.app`)
- [ ] **Save this URL** - you'll need it!

### Step 5: Test Your Deployment
Open in browser:
```
https://YOUR_ML_SERVICE_URL/health
```

- [ ] Page loads
- [ ] Shows: `{"status":"healthy"}`
- [ ] **If not working:** Check "Logs" tab in Railway for errors

### Step 6: Add Environment Variables (Optional but Recommended)
In Railway dashboard → Your Project → Variables:

- [ ] Add `BACKEND_URL=https://your-backend-url.railway.app/api`
- [ ] Add `CORS_ORIGIN=https://your-frontend.netlify.app`
- [ ] Click "Save"
- [ ] Railway auto-redeploys with new variables

---

## 🔗 CONNECT TO FRONTEND & BACKEND

### Update Backend `.env`
```bash
ML_SERVICE_URL=https://YOUR_ML_SERVICE_URL
```

### Update Frontend `.env.local`
```bash
NEXT_PUBLIC_ML_SERVICE_URL=https://YOUR_ML_SERVICE_URL
```

---

## 🧪 TEST EVERYTHING

### Test 1: ML Service Health
```
GET https://YOUR_ML_SERVICE_URL/health
Expected: {"status":"healthy"}
```

### Test 2: ML Service Root
```
GET https://YOUR_ML_SERVICE_URL/
Expected: {"message":"DataSense ML Service Running ✅"}
```

### Test 3: From Frontend
- [ ] Frontend loads (Netlify)
- [ ] Can upload dataset
- [ ] ML Service processes data

### Test 4: From Backend
- [ ] Backend can call ML Service
- [ ] ML Service endpoints respond

---

## 🎯 WHAT HAPPENS AT EACH STEP

| Step | What Railway Does | Result |
|------|------------------|--------|
| Code pushed to GitHub | Webhook triggered | Railway detects changes |
| New project created | Reads repository | Downloads your code |
| Procfile found | Knows how to start app | Runs `python main.py` |
| runtime.txt found | Installs Python 3.10.15 | Right version ready |
| requirements.txt found | Installs all packages | FastAPI, pandas, etc. |
| main.py runs | Reads PORT env var | App binds to dynamic port |
| App starts | FastAPI initializes | `/health` endpoint ready |
| Domain assigned | Public URL created | You get: `ml-service-xxxx.railway.app` |

---

## 🐛 TROUBLESHOOTING

### ❌ "Deployment Failed"
1. Check **Logs** tab in Railway
2. Look for error message (usually Python or dependency issue)
3. Common fixes:
   - Add missing package to `requirements.txt`
   - Fix Python syntax error in `main.py`
   - Restart deployment

### ❌ "Connection refused"
1. Is Procfile in root of MLService folder?
2. Does `main.py` have the port listening code?
3. Try restarting deployment from Railway dashboard

### ❌ "404 Not Found on /health"
1. Wait 1-2 minutes after deployment
2. Check if service is running (should show green in Railway)
3. Try `/` endpoint instead

### ❌ "Import error: No module named 'app'"
1. Make sure `app/` folder exists in MLService/
2. Make sure all files have `__init__.py`
3. Restart deployment

---

## 📊 FINAL CHECKLIST

- [ ] All files created/updated ✅
- [ ] Code pushed to GitHub ✅
- [ ] Railway account created (new email) ✅
- [ ] Project created on Railway ✅
- [ ] Deployment completed ✅
- [ ] ML Service URL obtained ✅
- [ ] `/health` endpoint tested ✅
- [ ] Environment variables set ✅
- [ ] Backend updated with ML URL ✅
- [ ] Frontend updated with ML URL ✅
- [ ] All 3 services connected ✅

---

## 🎉 YOU'RE DONE!

Your full stack is now deployed:
- ✅ Frontend on Netlify
- ✅ Backend on Railway (friend's account)
- ✅ ML Service on Railway (your new account)

All connected and working! 🚀

