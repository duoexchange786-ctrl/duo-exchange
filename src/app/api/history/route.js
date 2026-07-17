import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await dbConnect();

    // Fetch last 20 transactions for this user
    const history = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return new Response(
      JSON.stringify({ history }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching history:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}
