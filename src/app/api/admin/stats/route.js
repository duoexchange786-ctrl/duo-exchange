import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Block moderators from dashboard stats
  if (auth.role === 'moderator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    const [userCount, pendingDeposits, pendingSells, recentTxns] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments({ type: 'DEPOSIT', status: 'PENDING' }),
      Transaction.countDocuments({ type: 'SELL', status: 'PENDING' }),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: 'userId', select: 'fullName email' })
        .lean()
    ]);

    // Map `userId` to `user`
    const formattedRecent = recentTxns.map(t => {
      const { userId, ...rest } = t;
      return { ...rest, user: userId };
    });

    return NextResponse.json({
      users: userCount,
      deposits: pendingDeposits,
      sells: pendingSells,
      recentActivity: formattedRecent,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
