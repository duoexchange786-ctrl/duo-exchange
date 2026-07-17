import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body.email?.toString().trim();
    const otp = body.otp?.toString().trim();
    const referralCode = body.referralCode?.toString().trim() || null;

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400 });
    }

    await dbConnect();

    // Find user in DB
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
    }

    // Compare trimmed strings to avoid whitespace/type issues
    if (user.otp?.toString().trim() !== otp) {
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Clear OTP
    await User.updateOne({ email }, { $unset: { otp: 1, otpExpiry: 1 } });

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

    // Apply referral code for new users (no profile completed yet, no existing referrer)
    if (referralCode && !user.referredBy && !user.fullName && !user.mobile) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        await User.updateOne({ _id: user._id }, { $set: { referredBy: referrer._id } });
        console.log(`User ${user.email} referred by ${referrer.email} (code: ${referralCode})`);
      }
    }

    // Redirect logic: if profile is complete (fullName and mobile) go to home, else complete profile
    const redirectTo = user.fullName && user.mobile ? '/home' : '/complete-profile';

    // Include wallet and token; helpful debug logs
    console.log(`User ${user.email} verified via OTP. Redirecting to ${redirectTo}`);

    return new Response(
      JSON.stringify({
        token,
        redirectTo,
        message: 'OTP verified successfully',
        wallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

