import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function getJobsCollection() {
  await client.connect();
  const db = client.db('jobtracker');
  return db.collection('jobs');
}