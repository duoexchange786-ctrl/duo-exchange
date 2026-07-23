import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized or invalid token' }), { status: 401 });
    }

    const { mpin } = await req.json();

    if (!mpin || mpin.length !== 4) {
      return new Response(JSON.stringify({ error: '4-digit MPIN is required' }), { status: 400 });
    }

    const hashedMpin = await bcrypt.hash(mpin.toString(), 10);
    
    await dbConnect();
    await User.updateOne({ _id: user._id }, { $set: { mpin: hashedMpin } });

    const redirectTo = user.fullName && user.mobile ? '/home' : '/complete-profile';

    return new Response(JSON.stringify({ message: 'MPIN set successfully', redirectTo }), { status: 200 });
  } catch (error) {
    console.error('Error setting MPIN:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
