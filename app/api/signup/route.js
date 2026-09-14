import { checkRateLimit } from '../../../lib/rateLimit';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsersCollection } from '../../../models/User';

export async function POST(request) {

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const allowed = checkRateLimit(`signup_${ip}`);

  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again in a minute.' }, { status: 429 });
  }
    const users = await getUsersCollection();

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({ email, password: hashedPassword, createdAt: new Date() });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}