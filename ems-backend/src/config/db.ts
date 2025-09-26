import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Please configure it in .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
}
