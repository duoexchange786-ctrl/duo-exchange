// POST /api/admin/confirm-selling-request
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
    // admin guard
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, remark } = await req.json();
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

    const wallet = await Wallet.findOneAndUpdate(
      { userId: tx.userId },
      {
        $inc: {
          usdtAvailable: -tx.amount,
          usdtWithdrawn: tx.amount,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    tx.status = "SUCCESS";
    if (remark) tx.description = remark;
    await tx.save();

    // Distribute referral commissions
    await distributeReferralCommission(tx.userId, tx._id, tx.amount);

    // Log moderator action
    if (admin.role === 'moderator') {
      await ModeratorLog.create({
        moderatorId: admin.id,
        moderatorEmail: admin.email,
        action: 'CONFIRM_WITHDRAWAL',
        targetId: transactionId,
        details: `Confirmed withdrawal of $${tx.amount} USDT`,
      });
    }

    return NextResponse.json({ success: true, wallet });
  } catch (err) {
    console.error("Error confirming selling request:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
