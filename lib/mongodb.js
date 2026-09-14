import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");
    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}