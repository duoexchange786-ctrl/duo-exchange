import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Referral from '@/lib/models/Referral';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await dbConnect();

    // Get the user's referral code
    const fullUser = await User.findById(user._id).lean();
    const referralCode = fullUser?.referralCode || null;

    // Build the referral link
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const referralLink = referralCode
      ? `${protocol}://${host}/login-account?ref=${referralCode}`
      : null;

    // Count direct referrals (Level 1)
    const directReferrals = await User.countDocuments({ referredBy: user._id });

    // Get total earnings
    const earningsAgg = await Referral.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalEarnings = earningsAgg[0]?.total || 0;

    // Get list of referred users (Level 1 only, for display)
    const referredUsers = await User.find({ referredBy: user._id })
      .select('email fullName createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return new Response(
      JSON.stringify({
        referralCode,
        referralLink,
        directReferrals,
        totalEarnings,
        accountCreatedAt: fullUser?.createdAt,
        referredUsers: referredUsers.map((u) => ({
          email: u.email,
          fullName: u.fullName,
          joinedAt: u.createdAt,
        })),
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching referral data:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
