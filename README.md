# Homies - Freelance Platform

A modern full-stack freelance platform built with React, Express, MongoDB, and OAuth2 authentication.

## Project Structure

```
DE-Project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── ModeSelection.js
│   │   │   ├── ModeSelection.css
│   │   │   ├── BuyerDashboard.js
│   │   │   ├── SellerDashboard.js
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── .env
│   └── public/
├── backend/                  # Express backend application
│   ├── server.js            # Main server file with OAuth2 setup
│   ├── db.js                # MongoDB schemas and models
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── node_modules/
└── README.md
```

## Features

- **OAuth2 Authentication**: Sign in with Google or GitHub
- **Role-Based Access**: Buyer and Seller modes
- **Dashboard**: Separate dashboards for buyers and sellers
- **Project Management**: Create, browse, and manage projects
- **Responsive Design**: Mobile-friendly UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google OAuth2 credentials
- GitHub OAuth2 credentials

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Create .env file (already created)
# Edit .env and add your OAuth2 credentials
```

**Edit `/backend/.env` with your credentials:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/homies
NODE_ENV=development

# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Get these from GitHub Developer Settings
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

SESSION_SECRET=your_session_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Environment variables are in .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Update MONGODB_URI in backend/.env with your connection string

## Running the Application

### Terminal 1 - Start Backend Server

```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### Terminal 2 - Start Frontend Development Server

```bash
cd frontend
npm start
# App will open at http://localhost:3000
```

## OAuth2 Setup Guide

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth2

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Authorization callback URL: `http://localhost:5000/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## API Endpoints

### Authentication
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github` - Start GitHub OAuth flow
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get current user profile

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### User Model
- googleId, githubId (OAuth identifiers)
- email, name, profileImage
- role (buyer/seller/both)
- skills, rating, totalReviews
- timestamps

### Project Model
- title, description, budget, status
- buyerId, sellerId
- category, skills
- bids array
- timestamps

### Contract Model
- projectId, buyerId, sellerId
- amount, status, dates
- milestones

### Review Model
- contractId, reviewerId, recipientId
- rating, comment
- timestamp

## Development

### Useful npm Commands

**Backend:**
```bash
npm run dev      # Run with nodemon (hot-reload)
npm start        # Run production server
```

**Frontend:**
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB service is accessible

### OAuth2 Errors
- Verify credentials are correct in `.env`
- Check redirect URIs match exactly
- Ensure frontend and backend URLs are correct

### CORS Issues
- Backend CORS is configured for `http://localhost:3000`
- For production, update FRONTEND_URL in `.env`

### Port Already in Use
- Change PORT in `.env` (e.g., 5001)
- Or kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Next Steps

1. Configure OAuth2 credentials
2. Set up MongoDB
3. Run backend and frontend servers
4. Test OAuth login flow
5. Implement project and bidding features
6. Add payment integration
7. Deploy to production

## Technologies Used

**Frontend:**
- React 18
- React Router v6
- Axios
- CSS3

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js (OAuth2)
- Express-session

**Authentication:**
- Google OAuth2
- GitHub OAuth2
- Session-based authentication

## License

ISC

## Support

For issues or questions, please check the troubleshooting section or review the code comments.
