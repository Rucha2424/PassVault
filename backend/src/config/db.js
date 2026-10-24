import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[PassVault DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[PassVault DB Error] MongoDB Connection Failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
