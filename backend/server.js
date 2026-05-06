require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { connectDB, User, Project, Contract, Message } = require('./db');

// Initialize Express
const app = express();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.set('trust proxy', 1); // Trust first proxy (required for Render)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth2 Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profileImage: profile.photos[0]?.value,
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// GitHub OAuth2 Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      
      if (!user) {
        user = new User({
          githubId: profile.id,
          email: profile.emails?.[0]?.value || `${profile.login}@github.com`,
          name: profile.displayName || profile.login,
          profileImage: profile.photos[0]?.value,
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Authentication Routes

// Email OTP Auth
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not exists
      user = new User({ email, name: email.split('@')[0] });
    }
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Homies Verification Code',
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      };
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } else {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Log the user in
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login error' });
      res.json({ message: 'Logged in successfully', user });
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Google Auth
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
}), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?user=${req.user._id}`);
});

// GitHub Auth
app.get('/auth/github', passport.authenticate('github', {
  scope: ['user:email'],
}));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
}), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?user=${req.user._id}`);
});

// Get Current User
app.get('/api/user/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user);
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// PROJECT ROUTES (BUYER)
// Create a new project
app.post('/api/projects', isAuthenticated, async (req, res) => {
  try {
    const { title, description, budget, category, skills } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'Title, description, and budget are required' });
    }

    const project = new Project({
      title,
      description,
      budget,
      category: category || 'General',
      skills: skills || [],
      buyerId: req.user._id,
      status: 'open',
    });

    await project.save();
    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// Get all projects (for buyers to browse or manage their own)
app.get('/api/projects', isAuthenticated, async (req, res) => {
  try {
    const { filter } = req.query; // 'my' for user's projects, undefined for all

    let query = { buyerId: { $ne: null } };
    if (filter === 'my') {
      query.buyerId = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('buyerId', 'name email profileImage')
      .populate('sellerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Delete a project (buyer)
app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.buyerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// Get user statistics
app.get('/api/user/stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.query.role; // 'buyer' or 'seller'

    let stats = {};

    if (role === 'buyer') {
      const totalProjects = await Project.countDocuments({ buyerId: userId });
      const activeProjects = await Project.countDocuments({
        buyerId: userId,
        status: 'open',
      });
      const completedProjects = await Project.countDocuments({
        buyerId: userId,
        status: 'completed',
      });

      const projectsSpent = await Project.aggregate([
        { $match: { buyerId: userId, status: 'completed' } },
        { $group: { _id: null, totalSpent: { $sum: '$budget' } } },
      ]);

      const completedContracts = await Contract.countDocuments({
        buyerId: userId,
        status: 'completed',
      });

      const contractsSpent = await Contract.aggregate([
        { $match: { buyerId: userId, status: 'completed' } },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
      ]);

      const totalSpentProject = projectsSpent[0]?.totalSpent || 0;
      const totalSpentContract = contractsSpent[0]?.totalSpent || 0;

      stats = {
        totalProjects: totalProjects + await Contract.countDocuments({ buyerId: userId }),
        activeProjects: activeProjects + await Contract.countDocuments({ buyerId: userId, status: 'active' }),
        completedProjects: completedProjects + completedContracts,
        totalSpent: totalSpentProject + totalSpentContract,
      };
    } else if (role === 'seller') {
      const activeGigs = await Project.countDocuments({
        sellerId: userId,
        status: { $in: ['open', 'in-progress'] },
      });

      const totalOrders = await Project.countDocuments({ sellerId: userId });

      const earnings = await Project.aggregate([
        { $match: { sellerId: userId, status: 'completed' } },
        { $group: { _id: null, totalEarnings: { $sum: '$budget' } } },
      ]);

      const totalContractOrders = await Contract.countDocuments({ sellerId: userId });

      const contractEarnings = await Contract.aggregate([
        { $match: { sellerId: userId, status: 'completed' } },
        { $group: { _id: null, totalEarnings: { $sum: '$amount' } } },
      ]);

      const totalEarningsProject = earnings[0]?.totalEarnings || 0;
      const totalEarningsContract = contractEarnings[0]?.totalEarnings || 0;

      stats = {
        activeGigs,
        totalOrders: totalOrders + totalContractOrders,
        earnings: totalEarningsProject + totalEarningsContract,
        rating: req.user.rating ?? 0,
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// GIG/SERVICE ROUTES (SELLER)
// Get all gigs/services (visible to both buyers and sellers)
app.get('/api/gigs', isAuthenticated, async (req, res) => {
  try {
    const { filter } = req.query; // 'my' for user's gigs, undefined for all

    let query = { status: 'open', buyerId: null };
    if (filter === 'my') {
      query.sellerId = req.user._id;
    } else {
      query.isActive = { $ne: false };
    }

    const gigs = await Project.find(query)
      .populate('sellerId', 'name email profileImage rating')
      .populate('buyerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gigs', error: error.message });
  }
});

// Create a gig/service (seller)
app.post('/api/gigs', isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, category, skills } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ message: 'Title, description, and price are required' });
    }

    const gig = new Project({
      title,
      description,
      budget: price,
      category: category || 'General',
      skills: skills || [],
      sellerId: req.user._id,
      status: 'open',
    });

    await gig.save();
    res.status(201).json({
      message: 'Gig created successfully',
      gig,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating gig', error: error.message });
  }
});

// Toggle active status of a gig
app.put('/api/gigs/:id/toggle-active', isAuthenticated, async (req, res) => {
  try {
    const gig = await Project.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    
    if (gig.sellerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this gig' });
    }

    // Default isActive to true if undefined
    if (gig.isActive === undefined) gig.isActive = true;
    
    gig.isActive = !gig.isActive;
    await gig.save();
    res.json({ message: 'Gig status updated', gig });
  } catch (error) {
    res.status(500).json({ message: 'Error updating gig status', error: error.message });
  }
});

// Delete a gig
app.delete('/api/gigs/:id', isAuthenticated, async (req, res) => {
  try {
    const gig = await Project.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    if (gig.sellerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gig', error: error.message });
  }
});

// CONTRACT/ORDER ROUTES
// Book a gig (Buyer)
app.post('/api/contracts/book', isAuthenticated, async (req, res) => {
  try {
    const { gigId } = req.body;
    if (!gigId) return res.status(400).json({ message: 'Gig ID is required' });

    const gig = await Project.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own gig' });
    }

    const contract = new Contract({
      projectId: gig._id,
      buyerId: req.user._id,
      sellerId: gig.sellerId,
      amount: gig.budget,
      status: 'pending',
    });

    await contract.save();
    res.status(201).json({ message: 'Gig booked successfully', contract });
  } catch (error) {
    res.status(500).json({ message: 'Error booking gig', error: error.message });
  }
});

// Get all contracts for a user
app.get('/api/contracts', isAuthenticated, async (req, res) => {
  try {
    const { role } = req.query; // 'buyer' or 'seller'
    let query = {};
    if (role === 'buyer') query.buyerId = req.user._id;
    else if (role === 'seller') query.sellerId = req.user._id;
    else {
      // Default to returning all related to user if role not specified
      query = { $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] };
    }

    const contracts = await Contract.find(query)
      .populate('projectId')
      .populate('buyerId', 'name email profileImage')
      .populate('sellerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error: error.message });
  }
});

// Accept a contract (Seller)
app.put('/api/contracts/:id/accept', isAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this order' });
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({ message: 'Contract is not in pending state' });
    }

    contract.status = 'active';
    await contract.save();

    res.json({ message: 'Order accepted successfully', contract });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting order', error: error.message });
  }
});

// Complete a contract (Seller)
app.put('/api/contracts/:id/complete', isAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    console.log("COMPLETE ORDER DEBUG:");
    console.log("contract.sellerId:", contract.sellerId, "Type:", typeof contract.sellerId);
    console.log("req.user._id:", req.user._id, "Type:", typeof req.user._id);
    console.log("contract.sellerId.toString():", contract.sellerId?.toString());
    console.log("req.user._id.toString():", req.user?._id?.toString());

    if (contract.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this order' });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ message: 'Only active contracts can be completed' });
    }

    contract.status = 'completed';
    await contract.save();

    res.json({ message: 'Order marked as completed', contract });
  } catch (error) {
    res.status(500).json({ message: 'Error completing order', error: error.message });
  }
});

// Review a contract (Buyer)
app.post('/api/contracts/:id/review', isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot review an incomplete contract' });
    }

    if (contract.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the buyer can review this order' });
    }

    // Check if review already exists
    const { Review } = require('./db');
    const existingReview = await Review.findOne({ contractId: contract._id, reviewerId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    const review = new Review({
      contractId: contract._id,
      reviewerId: req.user._id,
      recipientId: contract.sellerId,
      rating,
      comment,
    });

    await review.save();

    // Update seller's rating
    const seller = await User.findById(contract.sellerId);
    const newTotalReviews = seller.totalReviews + 1;
    const currentTotalRating = seller.rating * seller.totalReviews;
    const newRating = (currentTotalRating + rating) / newTotalReviews;

    seller.totalReviews = newTotalReviews;
    seller.rating = parseFloat(newRating.toFixed(1));
    await seller.save();

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

// MESSAGING ROUTES
// Get messages for a contract
app.get('/api/messages/:contractId', isAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    if (contract.buyerId.toString() !== req.user._id.toString() && contract.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ contractId: req.params.contractId })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message
app.post('/api/messages/:contractId', isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text is required' });

    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (contract.buyerId.toString() !== req.user._id.toString() && contract.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const receiverId = contract.buyerId.toString() === req.user._id.toString() ? contract.sellerId : contract.buyerId;

    const message = new Message({
      contractId: contract._id,
      senderId: req.user._id,
      receiverId,
      text,
    });

    await message.save();
    await message.populate('senderId', 'name profileImage');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
