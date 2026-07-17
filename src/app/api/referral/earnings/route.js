import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Referral from '@/lib/models/Referral';
import User from '@/lib/models/User';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await dbConnect();

    // Fetch all referral earnings for this user, sorted newest first
    const earnings = await Referral.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Populate fromUser info
    const fromUserIds = [...new Set(earnings.map((e) => e.fromUserId.toString()))];
    const fromUsers = await User.find({ _id: { $in: fromUserIds } })
      .select('email fullName')
      .lean();
    const userMap = {};
    fromUsers.forEach((u) => {
      userMap[u._id.toString()] = { email: u.email, fullName: u.fullName };
    });

    const result = earnings.map((e) => ({
      id: e._id,
      fromUser: userMap[e.fromUserId.toString()] || { email: 'Unknown' },
      level: e.level,
      commissionPercent: e.commissionPercent,
      amount: e.amount,
      createdAt: e.createdAt,
    }));

    // Summary by level
    const levelSummary = await Referral.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$level',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return new Response(
      JSON.stringify({
        earnings: result,
        levelSummary: levelSummary.map((ls) => ({
          level: ls._id,
          total: ls.total,
          count: ls.count,
        })),
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching referral earnings:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
