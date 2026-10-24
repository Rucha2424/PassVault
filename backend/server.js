import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[PassVault Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('[PassVault Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[PassVault Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`[PassVault Server Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
