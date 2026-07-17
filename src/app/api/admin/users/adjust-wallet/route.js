import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import Transaction from '@/lib/models/Transaction';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function POST(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, amount, type, reason } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const wallet = await Wallet.findOne({ userId }).lean();

    // Calculate new balance
    let newBalance;
    if (type === 'CREDIT') {
      newBalance = (wallet?.usdtAvailable || 0) + numAmount;
    } else {
      newBalance = (wallet?.usdtAvailable || 0) - numAmount;
    }

    // Update wallet — MongoDB shared clusters don't support multi-document transactions,
    // so we do sequential operations
    await Wallet.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
            userId: userId,
            usdtDeposited: wallet?.usdtDeposited || 0,
            usdtWithdrawn: wallet?.usdtWithdrawn || 0
        },
        $set: {
            usdtAvailable: newBalance
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Transaction.create({
      userId: userId,
      depositId: `ADJ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
      amount: numAmount,
      currency: 'USDT',
      status: 'COMPLETED',
      description: reason || `Admin ${type} adjustment`
    });

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error('Wallet adjustment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
