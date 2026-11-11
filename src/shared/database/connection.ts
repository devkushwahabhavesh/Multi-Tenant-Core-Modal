import mongoose from 'mongoose';
import { config } from '../../config/env.js';

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      autoIndex: config.env !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`MongoDB Connected successfully to: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB initial connection warning (server will still operate with memory/offline fallback):`, (error as Error).message);
    return mongoose;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB Disconnected.');
}

