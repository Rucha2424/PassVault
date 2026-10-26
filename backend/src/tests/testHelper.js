import mongoose from 'mongoose';

let mongoServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    // 1. If CI or environment provides a dedicated test database, use it directly
    if (process.env.TEST_MONGODB_URI) {
      await mongoose.connect(process.env.TEST_MONGODB_URI);
      return;
    }

    // 2. Check if a local MongoDB service is already running on port 27017
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/passvault_test', {
        serverSelectionTimeoutMS: 2000,
      });
      return;
    } catch {
      // 3. Fallback to in-memory MongoDB server with 120s timeout for binary download
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        binary: { checkMD5: false },
      });
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
    }
  }, 120000); // 120s timeout so downloads on fresh runners never exceed timeout

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};
