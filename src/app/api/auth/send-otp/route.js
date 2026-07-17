import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/mailer';
import crypto from 'crypto';

const generateOtp = () => crypto.randomInt(1000, 9999).toString();
const generateReferralCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await dbConnect();

    // Check if user already exists (to know if we need a referral code)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Existing user — just update OTP
      await User.updateOne({ email }, { $set: { otp, otpExpiry } });

      // Backfill referralCode if missing (for users created before referral system)
      if (!existingUser.referralCode) {
        let code = generateReferralCode();
        // Ensure uniqueness
        while (await User.findOne({ referralCode: code })) {
          code = generateReferralCode();
        }
        await User.updateOne({ email }, { $set: { referralCode: code } });
      }
    } else {
      // New user — create with referral code
      let referralCode = generateReferralCode();
      while (await User.findOne({ referralCode })) {
        referralCode = generateReferralCode();
      }
      await User.create({ email, otp, otpExpiry, referralCode });
    }

    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send OTP email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'OTP sent to your email' }), { status: 200 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

// Optional: prevent 405 for GET (helpful for debugging)
export async function GET() {
  return new Response(JSON.stringify({ message: "Use POST to send OTP" }), { status: 200 });
}

