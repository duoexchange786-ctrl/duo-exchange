import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    await dbConnect();

    // If wallet missing, fallback to zeros
    const wallet = user.wallet || {
      usdtAvailable: 0,
      usdtDeposited: 0,
      usdtWithdrawn: 0,
    };

    // Calculate pending stats
    const sellPendingTx = await Transaction.aggregate([
      { $match: { userId: user._id, type: { $in: ['SELL', 'WITHDRAW'] }, status: 'PENDING' } },
      { $group: { _id: null, amount: { $sum: '$amount' } } }
    ]);

    const depositPendingTx = await Transaction.aggregate([
      { $match: { userId: user._id, type: 'DEPOSIT', status: 'PENDING' } },
      { $group: { _id: null, amount: { $sum: '$amount' } } }
    ]);

    const sellPending = sellPendingTx[0]?.amount || 0;
    const depositPending = depositPendingTx[0]?.amount || 0;

    return new Response(
      JSON.stringify({
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          mobile: user.mobile,
          referralCode: user.referralCode || null,
          wallet: {
            total: wallet.usdtDeposited,
            available: wallet.usdtAvailable,
            withdrawn: wallet.usdtWithdrawn,
            progressing: sellPending + depositPending,
            sellPending: sellPending,
            depositPending: depositPending,
          },
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}
