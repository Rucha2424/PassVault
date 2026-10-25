import mongoose from 'mongoose';

let memoryServer = null;

// Disable MD5 check on cached binary downloads in development
process.env.MONGOMS_MD5_CHECK = '0';

/**
 * Connect to MongoDB database
 * Falls back automatically to embedded MongoDB if local MongoDB/Docker is not running
 */
export const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/passvault';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[PassVault DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If not running in production Docker, attempt automatic embedded MongoDB fallback
    if (process.env.NODE_ENV !== 'production' || !process.env.DOCKER_CONTAINER) {
      console.log('[PassVault DB] Local MongoDB not detected on port 27017.');
      console.log('[PassVault DB] Starting embedded zero-config MongoDB instance...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          binary: { checkMD5: false },
        });
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[PassVault DB] Connected to Embedded MongoDB: ${memUri}`);
        console.log('[PassVault DB] Running seamlessly without Docker or local MongoDB installation.');
        return conn;
      } catch (memErr) {
        console.error(`[PassVault DB Error] Failed to start embedded MongoDB: ${memErr.message}`);
      }
    }

    console.error(`[PassVault DB Error] MongoDB Connection Failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
