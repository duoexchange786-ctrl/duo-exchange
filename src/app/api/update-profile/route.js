import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const body = await req.json();
    const { fullName, mobile } = body;

    if (!fullName || !mobile) {
      return new Response(JSON.stringify({ error: 'Full name and mobile are required' }), { status: 400 });
    }

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      payload.id,
      { fullName, mobile },
      { new: true }
    ).lean();

    return new Response(
      JSON.stringify({ message: 'Profile updated successfully', user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
