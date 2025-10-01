const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not provided - running without database');
      console.log('⚠️  Authentication features will not work!');
      return;
    }

    console.log('🔄 Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('connect')) {
      console.error('   Check your connection string and network access settings in MongoDB Atlas');
    }
    if (error.message.includes('authentication failed')) {
      console.error('   Check your database username and password');
    }

    // Don't continue without database in production
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start server without database in production');
      process.exit(1);
    }

    console.log('⚠️  Continuing without database (development only)...');
  }
};

module.exports = connectDB;