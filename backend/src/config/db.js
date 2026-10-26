import mongoose from 'mongoose';

let memoryServer = null;

// Disable MD5 check on cached binary downloads in development
process.env.MONGOMS_MD5_CHECK = '0';

/**
 * Connect to MongoDB database
 * Attempts cloud MongoDB first, and automatically falls back to embedded MongoDB
 * if the remote connection fails or is not configured.
 */
export const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI;

  // 1. If an explicit MONGODB_URI is provided, try connecting to it first
  if (mongoURI) {
    try {
      console.log('[PassVault DB] Attempting connection to cloud MongoDB...');
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5s timeout before falling back
      });
      console.log(`[PassVault DB] Connected to Cloud MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`⚠️ [PassVault DB] Cloud MongoDB Connection Failed: ${error.message}`);
      console.log('🔄 [PassVault DB] Falling back to embedded zero-config MongoDB instance...');
    }
  } else {
    console.log('ℹ️ [PassVault DB] No MONGODB_URI configured. Starting embedded zero-config MongoDB...');
  }

  // 2. Fallback: Start embedded in-memory MongoDB instance
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      binary: { checkMD5: false },
    });
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ [PassVault DB] Connected to Embedded MongoDB: ${memUri}`);
    console.log('🚀 [PassVault DB] Backend database is online and fully operational!');
    return conn;
  } catch (memErr) {
    console.error(`❌ [PassVault DB Fatal] Failed to start embedded MongoDB: ${memErr.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw memErr;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
