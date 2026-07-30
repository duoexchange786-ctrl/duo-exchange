import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body.email?.toString().trim();
    const otp = body.otp?.toString().trim();
    const fullName = body.fullName?.toString().trim();
    const mobile = body.mobile?.toString().trim();
    const mpin = body.mpin?.toString().trim();
    const referralCode = body.referralCode?.toString().trim() || null;

    if (!email || !otp || !fullName || !mobile || !mpin) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    if (mpin.length !== 4) {
      return new Response(JSON.stringify({ error: 'MPIN must be 4 digits' }), { status: 400 });
    }

    await dbConnect();

    // Find user in DB
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found or OTP expired' }), { status: 401 });
    }

    // Compare OTP
    if (user.otp?.toString().trim() !== otp) {
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 401 });
    }

    // Process MPIN
    const salt = await bcrypt.genSalt(10);
    const hashedMpin = await bcrypt.hash(mpin, salt);

    // Apply referral code if provided and valid
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        referredBy = referrer._id;
        console.log(`User ${email} referred by ${referrer.email} (code: ${referralCode})`);
      }
    }

    // Update user profile
    user.fullName = fullName;
    user.mobile = mobile;
    user.mpin = hashedMpin;
    if (referredBy) {
      user.referredBy = referredBy;
    }
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // Ensure wallet exists
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        usdtAvailable: 0,
        usdtDeposited: 0,
        usdtWithdrawn: 0,
      });
      console.log(`Wallet created for userId: ${user._id}`);
    }

    // Generate JWT token
    const token = generateToken(user);

    return new Response(
      JSON.stringify({
        token,
        redirectTo: '/home',
        message: 'Registration successful',
        wallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP and registering:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
