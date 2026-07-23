import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, mpin } = await req.json();

    if (!email || !mpin) {
      return new Response(JSON.stringify({ error: 'Email and MPIN are required' }), { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.trim() });

    if (!user || !user.mpin) {
      return new Response(JSON.stringify({ error: 'Invalid MPIN or User' }), { status: 401 });
    }

    const isMatch = await bcrypt.compare(mpin.toString(), user.mpin);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Incorrect MPIN' }), { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Ensure wallet exists
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        usdtAvailable: 0,
        usdtDeposited: 0,
        usdtWithdrawn: 0,
      });
    }

    const redirectTo = user.fullName && user.mobile ? '/home' : '/complete-profile';

    return new Response(
      JSON.stringify({
        token,
        redirectTo,
        message: 'Login successful',
        wallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying MPIN:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
