import { connectDB } from '../lib/mongodb';

export default async function Home() {
  await connectDB();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-blue-500">
        Check terminal for MongoDB connection status
      </h1>
    </div>
  );
}