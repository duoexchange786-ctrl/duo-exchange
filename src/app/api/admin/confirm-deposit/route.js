import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import Wallet from "@/lib/models/Wallet";
import Settings from "@/lib/models/Settings";
import ModeratorLog from "@/lib/models/ModeratorLog";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { distributeReferralCommission } from "@/lib/referralCommission";

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    await dbConnect();

    const tx = await Transaction.findById(transactionId);

    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    // Moderator amount guard
    if (admin.role === 'moderator') {
      const settings = await Settings.findOne().lean();
      const limit = settings?.moderatorAmountLimit || 500;
      if (tx.amount > limit) {
        return NextResponse.json({ error: "You don't have permission to approve this amount" }, { status: 403 });
      }
    }

    // update wallet balances
    const wallet = await Wallet.findOneAndUpdate(
      { userId: tx.userId },
      {
        $inc: {
          usdtAvailable: tx.amount,
          usdtDeposited: tx.amount,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // mark transaction success
    tx.status = "SUCCESS";
    await tx.save();

    // Distribute referral commissions
    await distributeReferralCommission(tx.userId, tx._id, tx.amount);

    // Log moderator action
    if (admin.role === 'moderator') {
      await ModeratorLog.create({
        moderatorId: admin.id,
        moderatorEmail: admin.email,
        action: 'CONFIRM_DEPOSIT',
        targetId: transactionId,
        details: `Confirmed deposit of $${tx.amount} USDT`,
      });
    }

    return NextResponse.json({ success: true, wallet });
  } catch (err) {
    console.error("Admin confirm error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
