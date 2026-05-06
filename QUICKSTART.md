# Quick Start Guide - Homies Platform

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)
- Google and GitHub OAuth2 credentials

## Step-by-Step Setup

### 1. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
# Edit .env and replace placeholder values:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - SESSION_SECRET (any random string)
```

**Frontend (.env):**
```bash
cd frontend
# Already configured for localhost development
# Update if using different ports
```

### 2. Start MongoDB

**Local:**
```bash
mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Update MONGODB_URI in backend/.env

### 3. Start Backend Server

```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
```

### 4. Start Frontend (in another terminal)

```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

## Obtaining OAuth2 Credentials

### Google OAuth2 (5 min)
1. Go to https://console.cloud.google.com/
2. Create project → "Homies-App"
3. Enable Google+ API
4. Credentials → OAuth 2.0 Client IDs (Web)
5. Add URI: `http://localhost:5000/auth/google/callback`
6. Copy ID and Secret

### GitHub OAuth2 (3 min)
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Callback: `http://localhost:5000/auth/github/callback`
4. Copy ID and Secret

## Project Flow

```
User lands on http://localhost:3000
    ↓
Login Page (Google/GitHub OAuth)
    ↓
Mode Selection (Buyer/Seller)
    ↓
Dashboard (Buyer or Seller view)
```

## Key Files

- **Backend**
  - `server.js` - OAuth2 setup & routes
  - `db.js` - MongoDB models (User, Project, Contract, Review)
  - `.env` - Configuration

- **Frontend**
  - `App.js` - Route management
  - `components/Login.js` - OAuth login
  - `components/ModeSelection.js` - Role selection
  - `components/BuyerDashboard.js` - Buyer interface
  - `components/SellerDashboard.js` - Seller interface

## Testing

1. Open http://localhost:3000
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Select Buyer or Seller mode
4. View dashboard

## Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB error | Ensure MongoDB is running: `mongod` |
| OAuth fails | Verify Client IDs/Secrets in .env |
| CORS error | Check FRONTEND_URL in backend/.env |
| Port 5000 in use | Change PORT in backend/.env |
| React components not found | Run `npm install` in frontend folder |

## Next Steps

1. Add project posting feature
2. Implement bidding system
3. Create messaging system
4. Add payment integration
5. Deploy to production

## File Structure Reference

```
DE-Project/
├── backend/
│   ├── server.js        (Express + OAuth2)
│   ├── db.js            (MongoDB schemas)
│   ├── .env             (Config)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── ModeSelection.js
│   │   │   ├── BuyerDashboard.js
│   │   │   └── SellerDashboard.js
│   │   └── App.js       (Routing)
│   ├── .env
│   └── package.json
├── README.md
└── .gitignore
```

---

**Ready to start?** Run the commands in Step 2-4 above! 🚀
