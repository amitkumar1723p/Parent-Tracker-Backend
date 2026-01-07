import mongoose from 'mongoose';
import { env } from './env';



export async function connectDB() {
  if (!env.MONGO_URI) throw new Error('MONGO_URI missing');
  console.log('Monog Connected .............');
  await mongoose.connect(env.MONGO_URI);
  console.log('🗄️  Mongo connected');
}
