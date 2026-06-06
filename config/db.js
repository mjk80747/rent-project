import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const isLocalMongoUri = (uri) => /mongodb(\+srv)?:\/\/(localhost|127\.0\.0\.1)/i.test(uri);

export const isDatabaseConfigured = () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return false;
  if (process.env.VERCEL && isLocalMongoUri(uri)) return false;
  return true;
};

export const getMongoUri = () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (uri) {
    if (process.env.VERCEL && isLocalMongoUri(uri)) {
      throw new Error(
        'MONGODB_URI points to localhost. Set a MongoDB Atlas connection string in Vercel environment variables.'
      );
    }
    return uri;
  }

  if (process.env.VERCEL) {
    throw new Error(
      'MONGODB_URI is not configured in Vercel. Add your MongoDB Atlas connection string in Project Settings > Environment Variables.'
    );
  }

  return 'mongodb://localhost:27017/rent-project';
};

export const getDatabaseErrorMessage = (error) => {
  const message = error?.message || 'Database connection failed';

  if (message.includes('MONGODB_URI')) {
    return message;
  }

  if (message.includes('authentication failed') || message.includes('bad auth')) {
    return 'MongoDB authentication failed. Check your database username and password in MONGODB_URI.';
  }

  if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
    return 'MongoDB cluster not found. Verify your Atlas connection string in MONGODB_URI.';
  }

  if (message.includes('timed out') || message.includes('Server selection')) {
    return 'Could not reach MongoDB. In Atlas, allow network access from 0.0.0.0/0 for Vercel deployments.';
  }

  return 'Database connection failed. Please try again later.';
};

const connectDB = async () => {
  if (cached.conn?.connection?.readyState === 1) {
    return cached.conn;
  }

  const uri = getMongoUri();

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
