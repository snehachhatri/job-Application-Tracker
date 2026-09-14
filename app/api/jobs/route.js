import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJobsCollection } from '../../../models/JobApplication';

function getUserFromToken(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company, role, status, appliedDate, notes, resume } = await request.json();

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role required' }, { status: 400 });
    }

    if (resume) {
      const isValidType = resume.startsWith('data:application/pdf');
      if (!isValidType) {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
      }

      const sizeInBytes = (resume.length * 3) / 4;
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (sizeInBytes > maxSize) {
        return NextResponse.json({ error: 'Resume must be under 2MB' }, { status: 400 });
      }
    }

    const jobs = await getJobsCollection();

    const newJob = {
      userId: user.userId,
      company,
      role,
      status: status || 'Applied',
      appliedDate: appliedDate || new Date(),
      notes: notes || '',
      resume: resume || null,
      createdAt: new Date(),
    };

    const result = await jobs.insertOne(newJob);

    return NextResponse.json({ message: 'Job added successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await getJobsCollection();
    const userJobs = await jobs.find({ userId: user.userId }).toArray();

    return NextResponse.json({ jobs: userJobs }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}