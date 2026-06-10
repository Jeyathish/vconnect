const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const trackVisitor = require('./middleware/tracker');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploaded files (profile pics, background images, QR codes)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Track landing page requests
app.get('/api/track-visit', trackVisitor, (req, res) => {
  res.json({ success: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

module.exports = app;
