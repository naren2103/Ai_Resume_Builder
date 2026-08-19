// ============================================
// db.config.js - MongoDB Connection
// ============================================

import mongoose from 'mongoose'; // Mongoose ODM (MongoDB: Database Connection)

// Using async/await pattern (JS Essentials: Async/Await)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI?.trim();

    if (!mongoURI) {
      console.warn('MONGODB_URI is not defined in your .env file');
      return;
    }

    const conn = await mongoose.connect(mongoURI); // Mongoose connection (MongoDB: Database Connection)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Continuing without database connection...');
    // process.exit(1); // Commented out to allow server to run without DB
  }
};

export default connectDB;
