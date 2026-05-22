const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustpulse';

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(MONGODB_URI, options);
      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries -= 1;
      logger.error(`❌ MongoDB connection failed. Retries left: ${retries}. Error: ${error.message}`);
      if (retries === 0) {
        logger.error('MongoDB connection failed after maximum retries. Exiting...');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected successfully');
});

module.exports = connectDB;
