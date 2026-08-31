const mongoose = require('mongoose');

// Single place the app opens its MongoDB connection. Kept out of app.js so
// the Express app can be imported by tests without touching a database.
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
