const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const newsRoutes = require('./routes/newsRoutes');
const quizRoutes = require('./routes/quizRoutes');
const coachRoutes = require('./routes/coachRoutes');
const profileRoutes = require('./routes/profile');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Metrics counter
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  next();
});

app.get('/', (req, res) => {
  res.send('✅ EcoTrack Backend is Running!');
});

// Liveness/readiness probe. Reports 503 while mongoose is not connected so
// container orchestrators do not route traffic to an instance that cannot
// serve a single database-backed route.
app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: mongoose.STATES[mongoose.connection.readyState],
    uptime: process.uptime()
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    requestCount
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
