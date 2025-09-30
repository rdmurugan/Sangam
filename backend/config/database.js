const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided - running without database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database...');
  }
};

module.exports = connectDB;