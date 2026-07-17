import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Block moderators from full transaction history
  if (auth.role === 'moderator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  try {
    await dbConnect();
    const [transactions, total] = await Promise.all([
      Transaction.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'userId',
          select: 'fullName email'
        })
        .lean(),
      Transaction.countDocuments()
    ]);

    // Map userId to user for the frontend
    const formattedTransactions = transactions.map(t => {
        const { userId, ...rest } = t;
        return { ...rest, user: userId };
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
