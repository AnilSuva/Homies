# Testing & Troubleshooting Guide

## ✅ Pre-Flight Checklist

Before running the app, ensure:
- [ ] MongoDB is running (or MongoDB Atlas connected)
- [ ] `.env` files are configured in both backend and frontend
- [ ] Node modules installed (`npm install` ran in both folders)
- [ ] Port 5000 and 3000 are available
- [ ] Google and GitHub OAuth credentials are set (if testing OAuth)

## 🚀 Quick Test Run

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
# Expected output:
# Server running on http://localhost:5000
# MongoDB Connected: cluster0.aap1dxu.mongodb.net (or localhost:27017)
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm start
# Browser will open http://localhost:3000
```

## 🧪 Test Scenarios

### Test 1: Create First Project (Buyer)
```
1. Login with Google/GitHub
2. Select "Buyer Mode"
3. Click "+ Post a New Project"
4. Fill form:
   - Title: "Build me a website"
   - Description: "I need a modern React website"
   - Budget: 1000
   - Category: Web Development
   - Skills: React, Node.js
5. Click "Create"
6. Check "Your Projects" - should show the project
7. Check stats - "Total Projects" should be 1, "Total Spent" should be $0
```

### Test 2: Create First Gig (Seller)
```
1. Logout and login again (or use different browser/incognito)
2. Select "Seller Mode"
3. Click "+ Create New Gig"
4. Fill form:
   - Title: "React Development"
   - Description: "I create modern React apps"
   - Price: 500
   - Category: Web Development
   - Skills: React, Node.js
5. Click "Create"
6. Check "Your Gigs" - should show the gig
7. Check stats - "Active Gigs" should be 1
```

### Test 3: View Gigs as Buyer
```
1. Switch to Buyer mode (or buyer account)
2. Scroll down to "Available Gigs from Sellers"
3. Should see the gig created in Test 2
4. Verify: Title, Description, Price, Seller Name, Rating
```

### Test 4: Test Data Persistence
```
1. Refresh page (F5)
2. Projects/Gigs should still be visible
3. Stats should persist
4. Reload backend server - data should still be in MongoDB
```

## 🔍 Debugging Checklist

### Issue: Projects not showing after creation
**Possible causes:**
- [ ] Backend not running
- [ ] MongoDB connection failed
- [ ] Check browser console for API errors
- [ ] Check backend console for error logs

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check MongoDB connection
# Look for "MongoDB Connected" in backend console

# 3. Clear browser cache
# Ctrl+Shift+Delete → Clear all
```

### Issue: Create button not working
**Possible causes:**
- [ ] Frontend not connected to backend
- [ ] CORS error
- [ ] Modal not properly imported

**Solution:**
```bash
# Check browser console (F12)
# Look for CORS errors or import errors
# Ensure Modal.js is in src/components/
```

### Issue: Stats showing 0 after creating project
**This is NORMAL for first-time users!**
- New accounts start with 0 stats
- Stats update as they create more projects/gigs
- Spending calculation only includes completed projects

**Expected behavior:**
- First project created: `totalProjects: 1, totalSpent: $0`
- Stats will increase as you create more projects

### Issue: Modal not opening when clicking "+ Post Project"
**Possible causes:**
- [ ] State management issue
- [ ] Modal component not imported
- [ ] JavaScript error in browser console

**Solution:**
```bash
# Check browser console (F12 → Console tab)
# Look for red errors
# Common error: "Module not found: Can't resolve './Modal'"
# If so, verify Modal.js exists in src/components/
```

### Issue: "Cannot POST /api/projects"
**Possible causes:**
- [ ] Backend routes not added
- [ ] Wrong endpoint URL in frontend
- [ ] Backend crashed

**Solution:**
```bash
# 1. Restart backend
cd backend
npm run dev

# 2. Verify endpoint exists
curl -X GET http://localhost:5000/api/health

# 3. Check FRONTEND_URL in backend .env
# Should be: http://localhost:3000
```

## 📊 API Testing with cURL

### Create a Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Test Description",
    "budget": 1000,
    "category": "Web Dev",
    "skills": ["React"]
  }'
```

### Get All Projects
```bash
curl http://localhost:5000/api/projects
```

### Get User Stats (Buyer)
```bash
curl "http://localhost:5000/api/user/stats?role=buyer"
```

### Get All Gigs
```bash
curl http://localhost:5000/api/gigs
```

## 📝 Browser Console Debugging

1. Open DevTools: `F12`
2. Go to "Console" tab
3. Look for errors (red text)
4. Go to "Network" tab
5. Create a project
6. Look for POST request to `/api/projects`
7. Check response status (should be 201)
8. Check response body for success message

## 🐛 Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `CORS error` | Backend CORS not configured | Check FRONTEND_URL in backend/.env |
| `Cannot POST /api/projects` | Backend route doesn't exist | Restart backend with `npm run dev` |
| `Modal not found` | Import missing | Add `import Modal from './Modal'` |
| `MongoDB Connected failed` | No MongoDB running | Start MongoDB or check connection string |
| `Port 5000 already in use` | Another process using port | Change PORT in .env to 5001 |
| `Credentials not included` | Session/CORS issue | Check `credentials: 'include'` in fetch |

## ✨ Success Indicators

When everything works correctly, you should see:
1. ✅ Backend console: `MongoDB Connected`
2. ✅ Backend console: `Server running on http://localhost:5000`
3. ✅ Frontend loads without errors
4. ✅ Can click "+ Post Project" and modal opens
5. ✅ Can submit form and see project appear
6. ✅ Stats update correctly
7. ✅ Can see seller gigs in buyer mode
8. ✅ No red errors in browser console

## 📞 Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check frontend console** - Press F12, go to Console tab
3. **Verify database** - Is MongoDB actually running?
4. **Check .env files** - Are all required variables set?
5. **Restart servers** - Kill and restart both backend and frontend
6. **Clear cache** - Ctrl+Shift+Delete in browser
7. **Check ports** - Are 5000 and 3000 available?

## 🎯 Next Steps

Once basic functionality works:
1. Test with multiple projects/gigs
2. Test switching between buyer and seller modes
3. Test logout and login again
4. Test with different browser/incognito for multiple users
5. Monitor MongoDB to see data being saved
